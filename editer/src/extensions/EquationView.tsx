// src/extensions/EquationView.tsx

import { useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';

export const EquationView = ({ node }: { node: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { latex } = node.attrs;
  
  console.log('EquationView is rendering with LaTeX:', latex);
  
  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: true, // 블록 레벨 수식으로 렌더링
        });
      } catch (error) {
        console.error(error);
        containerRef.current.textContent = `Error rendering KaTeX: ${latex}`;
      }
    }
  }, [latex]);

  return (
    <NodeViewWrapper className="equation-wrapper">
      <div ref={containerRef} />
    </NodeViewWrapper>
  );
};