// src/components/TopMenuBar.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';

// Modal 컴포넌트
import TableModal from './TableModal';
import GraphModal from './GraphModal';

// Tab 컴포넌트
import HomeTab from './menu-tabs/HomeTab';
import InsertTab from './menu-tabs/InsertTab';
import AiTab from './menu-tabs/AiTab';

// PDF 내보내기 라이브러리
import html2pdf from 'html2pdf.js';

interface TopMenuBarProps {
  editor: Editor | null;
}

const TopMenuBar = ({ editor }: TopMenuBarProps) => {
  // 1. 상태 및 참조(ref) 관리
  const [activeTab, setActiveTab] = useState('tab-home');
  const [isTableModalOpen, setTableModalOpen] = useState(false);
  const [isDateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [dateTimeMode, setDateTimeMode] = useState<'date' | 'time'>('date');
  const [isGraphModalOpen, setGraphModalOpen] = useState(false);
  const [_, setForceUpdate] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileAttachmentInputRef = useRef<HTMLInputElement>(null);

  // 2. 에디터 상태 변경 시 UI 강제 업데이트를 위한 useEffect
  const forceUpdate = useCallback(() => {
    setForceUpdate(val => val + 1);
  }, []);

  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', forceUpdate);
    return () => {
      editor.off('transaction', forceUpdate);
    };
  }, [editor, forceUpdate]);

  // 3. Early Return (에디터가 없을 경우)
  if (!editor) {
    return null;
  }
  const showPositionInfo = () => {
    if (!editor) return;

    // 1. 선택한 텍스트 위치 정보 가져오기
    const { from, to, empty } = editor.state.selection;
    let selectionInfo = '';

    if (empty) {
      // 선택 영역이 없을 경우 (커서만 있을 경우)
      selectionInfo = "현재 선택된 텍스트가 없습니다.";
    } else {
      // Tiptap의 view.coordsAtPos()를 사용하여 에디터 내의 절대 위치를
      // 화면의 픽셀 좌표(x, y)로 변환합니다.
      const startPosCoords = editor.view.coordsAtPos(from);
      const endPosCoords = editor.view.coordsAtPos(to);
      
      selectionInfo = `
        **선택 영역 정보:**
        - 시작 위치 (문자 인덱스): ${from}
        - 끝 위치 (문자 인덱스): ${to}
        - 선택된 텍스트: "${editor.state.doc.textBetween(from, to)}"
        - 화면 좌표 (시작): X=${Math.round(startPosCoords.left)}, Y=${Math.round(startPosCoords.top)}
        - 화면 좌표 (끝): X=${Math.round(endPosCoords.right)}, Y=${Math.round(endPosCoords.bottom)}
      `;
    }

    // 2. 현재 커서 위치 정보 가져오기
    // 커서의 위치는 선택 영역의 'head' 부분입니다.
    const cursorPos = editor.state.selection.head;
    const cursorPosCoords = editor.view.coordsAtPos(cursorPos);
    
    const cursorInfo = `
      **현재 커서 정보:**
      - 위치 (문자 인덱스): ${cursorPos}
      - 화면 좌표: X=${Math.round(cursorPosCoords.left)}, Y=${Math.round(cursorPosCoords.top)}
    `;

    // 3. 팝업(alert)으로 정보 표시
    alert(selectionInfo + "\n\n" + cursorInfo);
  };
  
  const selectTextByPosition = () => {
    if (!editor) return;

    const fromStr = window.prompt("선택을 시작할 문자 인덱스를 입력하세요:", "10");
    const toStr = window.prompt("선택을 끝낼 문자 인덱스를 입력하세요:", "20");

    const from = parseInt(fromStr || '0', 10);
    const to = parseInt(toStr || '0', 10);

    if (isNaN(from) || isNaN(to)) {
      alert("유효한 숫자를 입력해주세요.");
      return;
    }
    
    // 문서의 전체 길이를 벗어나지 않도록 범위를 제한합니다. (안정성 추가)
    const docSize = editor.state.doc.content.size;
    const resolvedFrom = Math.min(Math.max(1, from), docSize);
    const resolvedTo = Math.min(Math.max(1, to), docSize);

    editor.chain().focus().setTextSelection({ from: resolvedFrom, to: resolvedTo }).run();
  };
  
  // 2. 특정 인덱스로 커서를 이동하는 함수
  const setCursorByPosition = () => {
    if (!editor) return;

    // 사용자로부터 이동할 위치를 입력받습니다.
    const posStr = window.prompt("커서를 이동할 문자 인덱스를 입력하세요:", "30");
    const pos = parseInt(posStr || '0', 10);
    
    if (isNaN(pos)) {
      alert("유효한 숫자를 입력해주세요.");
      return;
    }
    
    // 문서 범위를 벗어나지 않도록 위치 보정
    const docSize = editor.state.doc.content.size;
    const resolvedPos = Math.min(Math.max(1, pos), docSize);

    // Tiptap에서 커서 이동은 시작과 끝 위치가 같은 선택입니다.
    editor.chain().focus().setTextSelection(resolvedPos).run();
  };

  // 4. 핸들러 함수 (Modal 및 파일 입력 관련)
  const handleCreateTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    }
    if(event.target) event.target.value = '';
  };
  
  const handleFileAttachmentClick = () => {
    fileAttachmentInputRef.current?.click();
  };

  const handleFileAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor.chain().focus().setFileAttachment({
          src,
          fileName: file.name,
          fileType: file.type,
        }).run();
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = '';
  };
  

  const handlePdfExport = async () => {
    if (!editor) return;

    // --- [수정 1] 캡처 대상을 .ProseMirror에서 .tiptap-wrapper로 변경 ---
    const contentElement = document.querySelector('.tiptap-wrapper') as HTMLElement | null;
    if (!contentElement) {
      alert("PDF로 변환할 A4 페이지 요소를 찾을 수 없습니다.");
      return;
    }

    const fontHref = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nanum+Barun+Gothic&family=Nanum+Gothic&family=Nanum+Myeongjo&family=Noto+Sans+KR:wght@400;500;700&display=swap";
    await new Promise<void>((resolve) => {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = fontHref;
      fontLink.onload = () => resolve();
      fontLink.onerror = () => resolve();
      document.head.appendChild(fontLink);
    });
    if ('fonts' in document) {
      try { await (document as any).fonts.ready; } catch {}
    }

    // --- [수정 2] PDF 레이아웃을 위한 CSS 스타일 보강 ---
    const commonCss = `
      /* A4 페이지 전체 레이아웃 */
      .tiptap-wrapper { 
        display: flex !important; 
        flex-direction: column !important; 
        width: 21cm !important; 
        height: 29.7cm !important;
        box-sizing: border-box !important;
      }
      .page-header, .page-footer {
        flex-shrink: 0 !important;
        height: 2.5cm !important;
        box-sizing: border-box !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 2.54cm !important;
      }
      .page-header { border-bottom: 1px solid #e5e7eb !important; }
      .page-footer { border-top: 1px solid #e5e7eb !important; }
      .page-main {
        flex-grow: 1 !important;
        overflow: hidden !important; /* PDF에서는 스크롤이 없으므로 hidden 처리 */
        box-sizing: border-box !important;
      }

      /* 모든 에디터의 공통 스타일 */
      .ProseMirror {
        width: 100% !important;
        height: 100% !important;
        font-family: 'Noto Sans KR', sans-serif !important;
        line-height: 1.7 !important;
        color: #1f2937 !important;
        padding: 0 !important; /* 개별 패딩은 각 영역에서 제어 */
      }
      .ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5 { margin: 0; }

      /* 본문 에디터에만 패딩 적용 */
      .page-main .ProseMirror { padding: 2.54cm !important; }
      
      /* ProseMirror 기본 스타일 (h1, strong 등) */
      .ProseMirror h1,.ProseMirror h2,.ProseMirror h3,.ProseMirror h4,.ProseMirror h5,.ProseMirror h6{
        display:block !important; font-weight:700 !important; color:#111827;
        margin-top:1.25em !important; margin-bottom:0.5em !important;
      }
      .ProseMirror h1{font-size:2.25em !important;} .ProseMirror h2{font-size:1.875em !important;}
      .ProseMirror h3{font-size:1.5em !important;} .ProseMirror h4{font-size:1.25em !important;}
      .ProseMirror h5{font-size:1.125em !important;}
      .ProseMirror p{margin:1em 0;}
      .ProseMirror strong{font-weight:700;}
      .ProseMirror p[data-indent="1"] { margin-left: 2em; }
      .ProseMirror p[data-indent="2"] { margin-left: 4em; }
      .ProseMirror p[data-indent="3"] { margin-left: 6em; }
      .ProseMirror p[data-indent="4"] { margin-left: 8em; }
    `;

    const options = {
      margin: 0, // A4 컨테이너 자체를 캡처하므로 여백은 0으로 설정
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement('style');
          style.textContent = commonCss;
          clonedDoc.head.appendChild(style);

          // --- [수정 3] A4 너비 설정 대상을 .tiptap-wrapper로 변경 ---
          const el = clonedDoc.querySelector('.tiptap-wrapper') as HTMLElement | null;
          if (el) {
            el.style.width = '21cm';
            el.style.height = '29.7cm';
          }

          const link = clonedDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = fontHref;
          clonedDoc.head.appendChild(link);
        }
      },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().from(contentElement).set(options).save();
  };
  
  const handleInsertGraph = (imageDataUrl: string) => {
    editor.chain().focus().setImage({ src: imageDataUrl }).run();
  };

  const handleSetDataTag = () => {
    // 먼저 현재 선택 영역에 적용된 태그가 있는지 확인합니다.
    const existingTag = editor.getAttributes('dataTag').tagData;
    
    // 사용자에게 태그 값을 입력받습니다. 기본값으로 기존 태그를 보여줍니다.
    const tagValue = window.prompt("텍스트에 저장할 데이터 태그를 입력하세요:", existingTag || "");

    // 사용자가 '취소'를 누르면 아무것도 하지 않습니다.
    if (tagValue === null) {
      return;
    }

    // 사용자가 값을 비우고 '확인'을 누르면 태그를 제거합니다.
    if (tagValue === "") {
      editor.chain().focus().unsetDataTag().run();
      return;
    }

    // 사용자가 새 값을 입력하면 태그를 설정(또는 업데이트)합니다.
    editor.chain().focus().setDataTag({ tagData: tagValue }).run();
  };

  // 5. 렌더링
  return (
    <>
      <div className="editor-ribbon">
        {/* 탭 네비게이션 */}
        <nav className="ribbon-tabs">
          <button className={`ribbon-tab ${activeTab === 'tab-home' ? 'active' : ''}`} onClick={() => setActiveTab('tab-home')}>홈</button>
          <button className={`ribbon-tab ${activeTab === 'tab-insert' ? 'active' : ''}`} onClick={() => setActiveTab('tab-insert')}>삽입</button>
          <button className={`ribbon-tab ${activeTab === 'tab-ai' ? 'active' : ''}`} onClick={() => setActiveTab('tab-ai')}>AI 도구</button>
        </nav>

        {/* 탭 콘텐츠 영역 */}
        <div className="ribbon-content">
          {activeTab === 'tab-home' && <HomeTab editor={editor} />}
          
          {activeTab === 'tab-insert' && (
            <InsertTab
              editor={editor}
              onTableClick={() => setTableModalOpen(true)}
              onFileAttachmentClick={handleFileAttachmentClick}
              onImageClick={handleImageClick}
              onGraphClick={() => setGraphModalOpen(true)}
              onPdfExportClick={handlePdfExport}
              onShowPositionInfoClick={showPositionInfo}
              // --- [수정 2] InsertTab에 새로운 함수들 전달 ---
              onSelectTextByPositionClick={selectTextByPosition}
              onSetCursorByPositionClick={setCursorByPosition}
              onSetDataTagClick={handleSetDataTag}
            />
          )}

          {activeTab === 'tab-ai' && <AiTab editor={editor} />}
        </div>
      </div>
      
      {/* Modal 및 파일 입력 요소 */}
      <TableModal isOpen={isTableModalOpen} onClose={() => setTableModalOpen(false)} onCreateTable={handleCreateTable} />
      <GraphModal isOpen={isGraphModalOpen} onClose={() => setGraphModalOpen(false)} onInsertGraph={handleInsertGraph} />
      
      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
      <input type="file" ref={fileAttachmentInputRef} onChange={handleFileAttachmentChange} style={{ display: 'none' }} />
    </>
  );
};

export default TopMenuBar;