import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createImageNode, $isImageNode } from "./CompareImageNode";
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

export default function ImagePlugin({ onImageRemove, summarySeq, apibaseurl, token }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        editor.update(() => {
          const selection = $getSelection();
          const imageNode = $createImageNode(
            payload.src, 
            payload.alt, 
            undefined, 
            onImageRemove,
            summarySeq,
            apibaseurl,
            token
          );
          
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            const root = $getRoot();
            root.append(imageNode);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, onImageRemove, summarySeq, apibaseurl, token]);

  return null;
}
