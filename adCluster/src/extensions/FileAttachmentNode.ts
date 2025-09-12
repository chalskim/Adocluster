// src/extensions/FileAttachmentNode.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FileAttachmentView } from './FileAttachmentView';

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: { fileName: string, fileSize: number, fileType: string }) => ReturnType;
    };
  }
}

export const FileAttachmentNode = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',
  group: 'block',
  content: 'inline*',
  atom: true,

  addAttributes() {
    return {
      fileName: {
        default: '',
      },
      fileSize: {
        default: 0,
      },
      fileType: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'file-attachment' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },

  addCommands() {
    return {
      setFileAttachment:
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