// src/components/TiptapEditor.tsx

import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { PaginationPlus } from 'tiptap-pagination-plus';
import React from 'react';

interface TiptapEditorProps {
  editor: any;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ editor }) => {
  if (!editor) {
    return <div className="border rounded-md p-4 bg-gray-50">
      <div className="text-gray-500">에디터 로딩 중...</div>
    </div>;
  }

  return (
    <div className="bg-gray-100 p-4 flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-4 flex-1">
            <EditorContent 
              editor={editor} 
              className="tiptap-pagination-editor h-full"
            />
          </div>
        </div>
        
        <style>{`
          .tiptap-pagination-editor {
            max-width: 210mm;
            margin: 0 auto;
          }
          
          .tiptap-pagination-editor .tiptap-page {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            position: relative;
            min-height: 297mm;
            width: 210mm;
          }
          
          .tiptap-pagination-editor .page-header {
            position: absolute;
            top: 10mm;
            left: 25mm;
            right: 25mm;
            height: 20mm;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .tiptap-pagination-editor .page-footer {
            position: absolute;
            bottom: 10mm;
            left: 25mm;
            right: 25mm;
            height: 20mm;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .tiptap-pagination-editor .page-content {
            padding: 30mm 25mm 30mm 25mm;
            min-height: 247mm;
          }
        `}</style>
        
        {/* 페이지 제어 버튼 */}
        <div className="mt-4 flex gap-2">
          {/* <button 
            onClick={() => editor.commands.addPage?.()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새 페이지 추가
          </button>
          <button 
            onClick={() => editor.commands.editHeader?.()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            헤더 편집
          </button>
          <button 
            onClick={() => editor.commands.editFooter?.()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            푸터 편집
          </button>
          <button 
            onClick={() => editor.commands.editContent?.()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            콘텐츠 편집
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;