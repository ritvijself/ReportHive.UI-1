import { $createLinkNode } from "@lexical/link";
import { $createParagraphNode, $createTextNode } from "lexical";

// Regular expression to find our custom link format
const LINK_REGEX = /\[(G-DOC|G-DRIVE)\|([^\]]+)\]\(([^)]+)\)( \[NOTES\|(.*?)\])?/;

/**
 * Serialization: Checks if a Lexical node is our special link and converts it to a string.
 * @param {LexicalNode} node - The node to check.
 * @returns {string|null} - The string format or null.
 */
export function serializeLinkNode(node) {
    if (node.getType() === 'paragraph' && node.getChildren().length === 1 && node.getChildren()[0].getType() === 'link') {
        const linkNode = node.getChildren()[0];
        const url = linkNode.getURL();
        const text = linkNode.getTextContent();
        const notesRegex = / \[NOTES\|(.*)\]/;
        const notesMatch = text.match(notesRegex);

        let title = text;
        let notesContent = '';
        if (notesMatch) {
            title = text.replace(notesRegex, '');
            notesContent = ` [NOTES|${notesMatch[1]}]`;
        }
        
        const icon = title.startsWith('📄') ? 'G-DOC' : 'G-DRIVE';
        return `[${icon}|${title}](${url})${notesContent}`;
    }
    return null;
}

/**
 * Deserialization: Checks if a line of text is our special link and converts it to Lexical nodes.
 * @param {string} line - The line of text to check.
 * @returns {ParagraphNode|null} - A paragraph node with the link or null.
 */
export function deserializeLinkString(line) {
    const match = line.match(LINK_REGEX);
    if (match) {
        const [, type, title, url, notesBlock, notesContent] = match;
        const paragraph = $createParagraphNode();
        const linkNode = $createLinkNode(url);
        
        let linkText = `${title}`;
        if (notesContent) {
            linkText += ` [NOTES|${notesContent}]`;
        }
        
        linkNode.append($createTextNode(linkText));
        paragraph.append(linkNode);
        return paragraph;
    }
    return null;
}

/**
 * Render: Checks if a line of text is our special link and converts it to an HTML string for display.
 * @param {string} line - The line of text to check.
 * @returns {string|null} - The HTML string or null.
 */
export function renderLinkString(line) {
    const match = line.match(LINK_REGEX);
    if (match) {
        const [, type, title, url, notesBlock, notesContent] = match;
        const notesHtml = notesContent ? `<blockquote class="rendered-notes">${notesContent}</blockquote>` : '';
        return `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></p>${notesHtml}`;
    }
    return null;
}