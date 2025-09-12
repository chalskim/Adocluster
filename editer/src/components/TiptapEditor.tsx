import { EditorContent, type Editor } from '@tiptap/react';


interface TiptapEditorProps {
  headerEditor: Editor | null;
  mainEditor: Editor | null;
  footerEditor: Editor | null;
}

const TiptapEditor = ({ headerEditor, mainEditor, footerEditor }: TiptapEditorProps) => {
  return (
    <div className="tiptap-wrapper">
      {/* 1. 머리글 영역 */}
      <header className="page-header">
        <EditorContent editor={headerEditor} />
      </header>
      
      {/* 2. 본문 영역 */}
      <main className="page-main">
        <EditorContent editor={mainEditor} />
      </main>

      {/* 3. 바닥글 영역 */}
      <footer className="page-footer">
        <EditorContent editor={footerEditor} />
      </footer>
    </div>
  );
};


export default TiptapEditor;