import { useState, useEffect, useRef, useCallback } from "react";

export const useDragScroll = () => {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [hasScroll, setHasScroll] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Check if container has scrollable content
  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setHasScroll(scrollWidth > clientWidth);
    }
  }, []);

  // Scroll to end function - only if auto-scroll is enabled
  const scrollToEnd = useCallback(() => {
    if (scrollContainerRef.current && shouldAutoScroll && !userHasScrolled) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
      });
    }
  }, [shouldAutoScroll, userHasScrolled]);

  // Check if user is at the end of scroll
  const isAtEnd = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    return scrollLeft >= scrollWidth - clientWidth - 10; // 10px tolerance
  }, []);

  // Handle manual scroll events
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isDragging) return;

    setUserHasScrolled(true);

    // If user scrolls back to the end, re-enable auto-scroll
    if (isAtEnd()) {
      setShouldAutoScroll(true);
      setUserHasScrolled(false);
    } else {
      setShouldAutoScroll(false);
    }
  }, [isDragging, isAtEnd]);

  // Drag scrolling handlers
  const handleMouseDown = (e) => {
    // Only start drag if clicking on empty area (not on TaskList or other elements)
    if (e.target === scrollContainerRef.current && hasScroll) {
      setIsDragging(true);
      setDragStart({
        x: e.pageX,
        scrollLeft: scrollContainerRef.current.scrollLeft,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();

    const x = e.pageX;
    const walkX = (x - dragStart.x) * 2; // Adjust scroll speed
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Function to trigger auto-scroll for new items
  const triggerAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
    setUserHasScrolled(false);
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
        });
      }
    }, 50);
  }, []);

  // Check scrollability on mount and resize
  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Global mouse events for drag scrolling
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging && scrollContainerRef.current) {
        e.preventDefault();
        const x = e.pageX;
        const walkX = (x - dragStart.x) * 2;
        scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  return {
    scrollContainerRef,
    isDragging,
    hasScroll,
    scrollToEnd,
    checkScrollability,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    triggerAutoScroll, // New function to manually trigger auto-scroll
    shouldAutoScroll,
    userHasScrolled,
  };
};
