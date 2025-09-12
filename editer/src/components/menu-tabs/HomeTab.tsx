// src/components/menu-tabs/HomeTab.tsx
import React from 'react';
import type { Editor } from '@tiptap/core';

interface HomeTabProps {
  editor: Editor;
}

const HomeTab = ({ editor }: HomeTabProps) => {
  const preventButtonBlur = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const handleCut = () => {
    editor.chain().focus().run();
    document.execCommand('cut');
  };

  const handleCopy = () => {
    editor.chain().focus().run();
    document.execCommand('copy');
  };

  const handlePaste = async () => {
    editor.chain().focus().run();
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.chain().insertContent(text).run();
      }
    } catch (err) {
      console.error('클립보드 붙여넣기 실패:', err);
      alert('붙여넣기 기능을 사용하려면 브라우저 권한을 허용하거나, 키보드 단축키(Ctrl+V 또는 Cmd+V)를 사용해주세요.');
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = e.target.value;
    if (newSize) {
      editor.chain().focus().setMark('textStyle', { fontSize: `${newSize}pt` }).run();
    } else {
      editor.chain().focus().unsetMark('textStyle').run();
    }
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fontFamily = e.target.value;
    if (fontFamily) {
        editor.chain().focus().setFontFamily(fontFamily).run();
    } else {
        editor.chain().focus().unsetFontFamily().run();
    }
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const chain = editor.chain().focus();
    switch(value) {
      case 'paragraph':
        chain.clearNodes().unsetAllMarks().setParagraph().run();
        break;
      case 'heading-1': chain.toggleHeading({ level: 1 }).run(); break;
      case 'heading-2': chain.toggleHeading({ level: 2 }).run(); break;
      case 'heading-3': chain.toggleHeading({ level: 3 }).run(); break;
      case 'heading-4': chain.toggleHeading({ level: 4 }).run(); break;
      case 'heading-5': chain.toggleHeading({ level: 5 }).run(); break;
      default: break;
    }
  };

  return (
    <div id="tab-home" className="ribbon-pane active">
      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="ribbon-button">
            <span className="material-symbols-outlined ribbon-icon">undo</span>
            <span className="ribbon-label">실행 취소</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="ribbon-button">
            <span className="material-symbols-outlined ribbon-icon">redo</span>
            <span className="ribbon-label">다시 실행</span>
          </button>
        </div>
      </div>

      <div className="ribbon-group group-clipboard">
        <button onMouseDown={preventButtonBlur} className="ribbon-button paste-button" onClick={handlePaste}>
          <span className="material-symbols-outlined ribbon-icon">content_paste</span>
          <span className="ribbon-label">붙여넣기</span>
        </button>
        <div className="clipboard-actions">
          <button className="ribbon-button" onMouseDown={preventButtonBlur} onClick={handleCut}>
            <span className="material-symbols-outlined ribbon-icon">content_cut</span>
            <span className="ribbon-label">잘라내기</span>
          </button>
          <button className="ribbon-button" onMouseDown={preventButtonBlur} onClick={handleCopy}>
            <span className="material-symbols-outlined ribbon-icon">content_copy</span>
            <span className="ribbon-label">복사</span>
          </button>
        </div>
      </div>

      <div className="ribbon-group">
        <div className="ribbon-controls-row">
          <select className="font-dropdown" value={editor.getAttributes('textStyle').fontFamily || ''} onChange={handleFontFamilyChange}>
              <option value="">기본 글꼴</option>
              <option value="Noto Sans KR">Noto Sans KR</option>
              <option value="Nanum Gothic">나눔고딕</option>
              <option value="Nanum Myeongjo">나눔명조</option>
              <option value="Black Han Sans">Black Han Sans</option>
          </select>
          <input type="number" placeholder="12" className="font-size-input" value={editor.getAttributes('textStyle').fontSize?.replace('pt','') || ''} onChange={handleFontSizeChange} />
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleBulletList().run()} className={`ribbon-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}>
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`ribbon-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}>
            <span className="material-symbols-outlined">format_list_numbered</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleBold().run()} className={`ribbon-button ${editor.isActive('bold') ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_bold</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleItalic().run()} className={`ribbon-button ${editor.isActive('italic') ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_italic</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleUnderline().run()} className={`ribbon-button ${editor.isActive('underline') ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_underlined</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().toggleStrike().run()} className={`ribbon-button ${editor.isActive('strike') ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_strikethrough</span>
          </button>
        </div>
      </div>

      <div className="ribbon-group">
        <div className="ribbon-controls-row">
        {/* --- [수정된 부분] disabled 로직 변경 --- */}
        <button
          onMouseDown={preventButtonBlur}
          onClick={() => editor.chain().focus().indent().run()}
          disabled={!editor.can().indent()}
          className="ribbon-button">
          <span className="material-symbols-outlined">format_indent_increase</span>
        </button>
        <button
          onMouseDown={preventButtonBlur}
          onClick={() => editor.chain().focus().outdent().run()}
          disabled={!editor.can().outdent()}
          className="ribbon-button" >
            <span className="material-symbols-outlined">format_indent_decrease</span>
        </button>
        {/* --- [여기까지 수정] --- */}
        </div>
        <div className="ribbon-controls-row">
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`ribbon-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_align_left</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`ribbon-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}>
            <span className="material-symbols-outlined">format_align_center</span>
          </button>
          <button onMouseDown={preventButtonBlur} onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`ribbon-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">format_align_right</span>
          </button>
        </div>
      </div>

      <div className="ribbon-group">
        <div className="ribbon-controls-row">
            <select className="style-dropdown" 
               value={ editor.isActive('heading', { level: 1 }) ? 'heading-1' : 
                       editor.isActive('heading', { level: 2 }) ? 'heading-2' : 
                       editor.isActive('heading', { level: 3 }) ? 'heading-3' : 
                       editor.isActive('heading', { level: 4 }) ? 'heading-4' : 
                       editor.isActive('heading', { level: 5 }) ? 'heading-5' : 
                       'paragraph' }
                       onChange={handleStyleChange}
            >
                <option value="paragraph">본문</option>
                <option value="heading-1">제목 1</option>
                <option value="heading-2">제목 2</option>
                <option value="heading-3">제목 3</option>
                <option value="heading-4">제목 4</option>
                <option value="heading-5">제목 5</option>
            </select>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;