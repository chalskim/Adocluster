// src/extensions/CustomParagraph.ts

import Paragraph from '@tiptap/extension-paragraph';
import type { CommandProps } from '@tiptap/core';

export const CustomParagraph = Paragraph.extend({
  name: 'paragraph',
  
  addAttributes() {
    return {
      indent: {
        default: 0,
        parseHTML: (element: HTMLElement) => Number(element.getAttribute('data-indent')) || 0,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.indent) {
            return {};
          }
          return { 'data-indent': attributes.indent };
        },
      },
    };
  },

  addCommands() {
    return {
      indent: () => ({ commands, editor }: CommandProps) => {
        const type = this.name;
        const currentIndent = editor.getAttributes(type).indent || 0;
        const newIndent = Math.min(currentIndent + 1, 4); // 최대 4단계
        return commands.updateAttributes(type, { indent: newIndent });
      },
      outdent: () => ({ commands, editor }: CommandProps) => {
        const type = this.name;
        const currentIndent = editor.getAttributes(type).indent || 0;
        const newIndent = Math.max(currentIndent - 1, 0); // 최소 0단계
        return commands.updateAttributes(type, { indent: newIndent });
      },
    };
  },
});