import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createRemovableImageNode, $isRemovableImageNode } from "./CompareRemovableImageNode";
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
    console.log('RemovableImagePlugin registering command handler');
    return editor.registerCommand(
      INSERT_REMOVABLE_IMAGE_COMMAND,
      (payload) => {
        console.log('INSERT_REMOVABLE_IMAGE_COMMAND received in plugin:', payload);
        
        editor.update(() => {
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
          
          console.log('Created image node:', imageNode);
          
          if ($isRangeSelection(selection)) {
            console.log('Inserting at selection');
            selection.insertNodes([imageNode]);
          } else {
            console.log('Appending to root');
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
