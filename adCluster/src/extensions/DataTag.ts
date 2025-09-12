// src/extensions/DataTag.ts
import { Node, mergeAttributes } from '@tiptap/core';

export interface DataTagOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dataTag: {
      setDataTag: (options: { tagType: string, tagValue: string }) => ReturnType;
    };
  }
}

export const DataTag = Node.create<DataTagOptions>({
  name: 'dataTag',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      tagType: {
        default: '',
      },
      tagValue: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="data-tag"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-type': 'data-tag' }, HTMLAttributes), `{{${HTMLAttributes.tagType}: ${HTMLAttributes.tagValue}}}`];
  },

  addCommands() {
    return {
      setDataTag:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});