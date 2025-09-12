// src/extensions/FileAttachmentNode.ts

import { Node, mergeAttributes } from '@tiptap/core';

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: { src: string; fileName: string; fileType: string }) => ReturnType;
    };
  }
}

export const FileAttachmentNode = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',
  group: 'block',
  atom: true, // 원자적 노드로, 내부를 편집할 수 없음

  addAttributes() {
    return {
      src: {
        default: null,
      },
      fileName: {
        default: 'Untitled',
      },
      fileType: {
        default: 'application/octet-stream',
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
    // a 태그를 사용해 다운로드 링크로 렌더링
    return [
      'div',
      mergeAttributes({ 'data-type': 'file-attachment' }),
      [
        'a',
        mergeAttributes(HTMLAttributes, {
          href: HTMLAttributes.src,
          download: HTMLAttributes.fileName,
        }),
        `Download ${HTMLAttributes.fileName}`,
      ],
    ];
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