import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createRemovableImageNode, $isRemovableImageNode } from "./RemovableImageNode";
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

export const INSERT_REMOVABLE_IMAGE_COMMAND = createCommand("INSERT_REMOVABLE_IMAGE_COMMAND");

export default function RemovableImagePlugin({ onImageRemove, summarySeq, apibaseurl, token }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_REMOVABLE_IMAGE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        const imageNode = $createRemovableImageNode(
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
          editor.update(() => {
            const root = $getRoot();
            root.append(imageNode);
          });
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, onImageRemove, summarySeq, apibaseurl, token]);

  return null;
}
