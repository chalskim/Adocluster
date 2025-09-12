// src/extensions/EquationNode.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EquationView } from './EquationView'; 

export interface EquationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    equation: {
      setEquation: (options: { latex: string }) => ReturnType;
    };
  }
}

export const EquationNode = Node.create<EquationOptions>({
  name: 'equation',
  group: 'block',
  content: 'inline*',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="equation"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // 실제 렌더링은 React NodeView에서 처리하므로, 여기서는 뼈대만 만듭니다.
    return ['div', mergeAttributes({ 'data-type': 'equation' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationView);
  },

  addCommands() {
    return {
      setEquation:
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