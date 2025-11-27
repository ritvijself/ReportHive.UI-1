import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import { $createLinkNode } from "@lexical/link";

// Enhanced Google Drive link paste plugin with automatic spacing and new line insertion
export default function GoogleDrivePastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handlePaste = (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text');
      
      // Check if pasted text is a Google Drive link
      const driveLinkRegex = /^https:\/\/(docs\.google\.com|drive\.google\.com)\//;
      if (driveLinkRegex.test(pastedText.trim())) {
        event.preventDefault();
        
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();
            
            // Check if we're in the middle of a paragraph with content
            if (parent && parent.getType() === 'paragraph') {
              const textContent = parent.getTextContent();
              const caretOffset = selection.anchor.offset;
              
              // If there's text before the caret, add space and new line
              if (textContent.substring(0, caretOffset).trim() !== '') {
                // Insert space before if there's content before caret
                if (caretOffset > 0 && textContent.charAt(caretOffset - 1) !== ' ') {
                  parent.splice(caretOffset, 0, [$createTextNode(' ')]);
                  selection.anchor.offset += 1;
                }
                
                // Move to end of current paragraph and insert new line
                parent.selectEnd();
                
                // Create a new paragraph with the link
                const newParagraph = $createParagraphNode();
                const linkNode = $createLinkNode(pastedText);
                linkNode.append($createTextNode(pastedText));
                newParagraph.append(linkNode);
                
                // Insert the new paragraph after current one
                const root = $getRoot();
                const currentIndex = parent.getIndexWithinParent();
                root.splice(currentIndex + 1, 0, [newParagraph]);
                
                // Select the end of the new paragraph
                newParagraph.selectEnd();
              } else {
                // No content before caret, just insert the link on current line
                const linkNode = $createLinkNode(pastedText);
                linkNode.append($createTextNode(pastedText));
                parent.append(linkNode);
                
                // Add space after the link if needed
                parent.append($createTextNode(' '));
              }
            } else {
              // Not in a paragraph, create new paragraph with link
              const newParagraph = $createParagraphNode();
              const linkNode = $createLinkNode(pastedText);
              linkNode.append($createTextNode(pastedText));
              newParagraph.append(linkNode);
              
              // Add space after the link
              newParagraph.append($createTextNode(' '));
              
              selection.insertNodes([newParagraph]);
            }
          }
        });
        
        return true;
      }
      
      return false;
    };

    // Register paste event listener
    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste, true);
      
      return () => {
        editorElement.removeEventListener('paste', handlePaste, true);
      };
    }
  }, [editor]);

  return null;
}
