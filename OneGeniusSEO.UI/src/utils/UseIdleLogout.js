import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useIdleLogout = (timeout = 60 * 60 * 1000) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("selectedClientSeq");
    localStorage.removeItem("daToken");
    navigate("/signin", { replace: true });
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, []);
};

export default useIdleLogout;
