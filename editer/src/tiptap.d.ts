import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    // 단락 들여쓰기/내어쓰기
    indent: () => ReturnType;
    outdent: () => ReturnType;
    
    // 파일 첨부
    setFileAttachment: (options: { src: string; fileName: string; fileType: string }) => ReturnType;
    
    // 수식
    setEquation: (options: { latex: string }) => ReturnType;

    // 인용문 (cite 속성 포함)
    setBlockquote: (attributes?: { cite?: string; class?: string }) => ReturnType;

    // 폰트 크기
    setFontSize: (size: string) => ReturnType;
    unsetFontSize: () => ReturnType;
  }
  
  interface ChainedCommands {
    // 단락 들여쓰기/내어쓰기
    indent: () => ChainedCommands;
    outdent: () => ChainedCommands;
    
    // 파일 첨부
    setFileAttachment: (options: { src: string; fileName: string; fileType: string }) => ChainedCommands;
    
    // 수식
    setEquation: (options: { latex: string }) => ChainedCommands;

    // 인용문 (cite 속성 포함)
    setBlockquote: (attributes?: { cite?: string; class?: string }) => ChainedCommands;
    
    // 폰트 크기
    setFontSize: (size: string) => ChainedCommands;
    unsetFontSize: () => ChainedCommands;
  }
}