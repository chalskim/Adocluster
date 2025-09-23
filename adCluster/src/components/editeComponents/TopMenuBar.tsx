import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DocumentSelector from '../DocumentSelector';

// Document 타입 정의 추가
type DocumentType = 'citation' | 'image' | 'table' | 'formula' | 'video' | 'audio' | 'code' | 'text';

interface BaseDocument {
  id: string;
  name: string;
  projectId: string;
  folderId: string;
  date: string;
  type: DocumentType;
  title: string;
  description?: string;
  source?: string;
  tags?: string[];
}

interface CitationDocument extends BaseDocument {
  type: 'citation';
  content: string;
  originalText: string;
  documentInfo: string;
  pageNumber: number;
}

interface ImageDocument extends BaseDocument {
  type: 'image';
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface TableDocument extends BaseDocument {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

interface FormulaDocument extends BaseDocument {
  type: 'formula';
  latex: string;
  rendered: string;
}

interface VideoDocument extends BaseDocument {
  type: 'video';
  url: string;
  duration: number;
  thumbnail?: string;
}

interface AudioDocument extends BaseDocument {
  type: 'audio';
  url: string;
  duration: number;
}

interface CodeDocument extends BaseDocument {
  type: 'code';
  code: string;
  language: string;
  framework?: string;
}

interface TextDocument extends BaseDocument {
  type: 'text';
  content: string;
}

type Document = CitationDocument | ImageDocument | TableDocument | FormulaDocument | VideoDocument | AudioDocument | CodeDocument | TextDocument;

interface TopMenuBarProps {
  editor: Editor | null;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onToggleReadOnly: () => void;
  isReadOnly: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightSidebar?: () => void;
}

// SVG 아이콘 컴포넌트
const SvgIcon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  return (
    <img 
      src={`/img/icon/material-symbols/${name}.svg`} 
      alt={name}
      className={`svg-icon ${className}`}
      width="20"
      height="20"
    />
  );
};

const TopMenuBar: React.FC<TopMenuBarProps> = ({ 
  editor, 
  onTabChange, 
  activeTab, 
  onToggleReadOnly, 
  isReadOnly,
  onToggleLeftPanel,
  onToggleRightSidebar
}) => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editor) {
      const updateHandler = () => {
        setForceUpdate(prev => prev + 1);
      };
      
      editor.on('selectionUpdate', updateHandler);
      editor.on('transaction', updateHandler);
      
      return () => {
        editor.off('selectionUpdate', updateHandler);
        editor.off('transaction', updateHandler);
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  const handleExportToPDF = async () => {
    const element = document.querySelector('.ProseMirror');
    if (element) {
      const canvas = await html2canvas(element as HTMLElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('document.pdf');
    }
  };

  const handleToggleReadOnly = () => {
    onToggleReadOnly();
  };

  // 문서 선택 핸들러
  const handleDocumentSelect = (document: any) => {
    if (editor) {
      let content = '';
      
      switch (document.type) {
        case 'citation':
          content = `<blockquote>${document.content}</blockquote>`;
          break;
        case 'image':
          content = `<img src="${document.url}" alt="${document.alt}" />`;
          break;
        case 'table':
          const tableRows = document.rows.map((row: string[]) => 
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('');
          content = `<table><thead><tr>${document.headers.map((h: string) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>`;
          break;
        case 'formula':
          content = `<span class="formula">${document.rendered}</span>`;
          break;
        case 'text':
          content = document.content;
          break;
        default:
          content = `<p>문서: ${document.title}</p>`;
      }
      
      editor.chain().focus().insertContent(content).run();
    }
    setShowDocumentSelector(false);
  };

  return (
    <div className="editor-ribbon">
      {/* Tab Navigation */}
      <div className="ribbon-tabs">
        <button 
          className={`ribbon-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleTabClick('home')}
        >
          홈
        </button>
        <button 
          className={`ribbon-tab ${activeTab === 'insert' ? 'active' : ''}`}
          onClick={() => handleTabClick('insert')}
        >
          삽입
        </button>
        <button 
          className={`ribbon-tab ${activeTab === 'research' ? 'active' : ''}`}
          onClick={() => handleTabClick('research')}
        >
          연구
        </button>
        <button 
          className={`ribbon-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => handleTabClick('view')}
        >
          보기
        </button>
        <button 
          className={`ribbon-tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => handleTabClick('output')}
        >
          출력
        </button>
        <button 
          className={`ribbon-tab ${activeTab === 'convenience' ? 'active' : ''}`}
          onClick={() => handleTabClick('convenience')}
        >
          편의기능
        </button>
      </div>

      {/* Tab Content */}
      <div className="ribbon-content">
        {activeTab === 'home' && (
          <div className="ribbon-groups">
            {/* 편집 기록 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">편집</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (editor) {
                      editor.chain().focus().undo().run();
                    }
                  }}
                >
                  <SvgIcon name="undo" />
                  <span>실행취소</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (editor) {
                      editor.chain().focus().redo().run();
                    }
                  }}
                >
                  <SvgIcon name="redo" />
                  <span>다시실행</span>
                </button>
              </div>
            </div>

            {/* 텍스트 서식 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">서식</div>
              <div className="ribbon-controls">
                {/* 폰트 패밀리 선택 */}
                <div className="ribbon-dropdown">
                  <select 
                    className="ribbon-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        editor.chain().focus().setFontFamily(e.target.value).run();
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">폰트 선택</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Malgun Gothic', sans-serif">맑은 고딕</option>
                    <option value="'Nanum Gothic', sans-serif">나눔고딕</option>
                    <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
                  </select>
                </div>

                {/* 글자 크기 선택 */}
                <div className="ribbon-dropdown">
                  <select 
                    className="ribbon-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        editor.chain().focus().setFontSize(e.target.value).run();
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">크기</option>
                    <option value="8px">8</option>
                    <option value="9px">9</option>
                    <option value="10px">10</option>
                    <option value="11px">11</option>
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                    <option value="20px">20</option>
                    <option value="24px">24</option>
                    <option value="28px">28</option>
                    <option value="32px">32</option>
                    <option value="36px">36</option>
                    <option value="48px">48</option>
                    <option value="72px">72</option>
                  </select>
                </div>

                {/* 텍스트 색상 선택 */}
                <div className="ribbon-color-picker">
                  <input
                    type="color"
                    className="ribbon-color-input"
                    onChange={(e) => {
                      editor.chain().focus().setColor(e.target.value).run();
                    }}
                    title="글자색"
                  />
                  <SvgIcon name="format_color_text" className="color-icon" />
                </div>

                <button 
                  className={`ribbon-button ${editor.isActive('bold') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <SvgIcon name="format_bold" />
                  <span>굵게</span>
                </button>
                <button 
                  className={`ribbon-button ${editor.isActive('italic') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <SvgIcon name="format_italic" />
                  <span>기울임</span>
                </button>
                <button 
                  className={`ribbon-button ${editor.isActive('underline') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <SvgIcon name="format_underlined" />
                  <span>밑줄</span>
                </button>
                <button 
                  className={`ribbon-button ${editor.isActive('strike') ? 'active' : ''}`}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <SvgIcon name="format_strikethrough" />
                  <span>취소선</span>
                </button>
              </div>
            </div>


            {/* 리스트 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">리스트</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    editor?.chain().focus().toggleBulletList().run();
                  }}
                >
                  <SvgIcon name="format_list_bulleted" />
                  <span>문자 리스트</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    editor?.chain().focus().toggleOrderedList().run();
                  }}
                >
                  <SvgIcon name="format_list_numbered" />
                  <span>숫자 리스트</span>
                </button>
              </div>
            </div>

            {/* 취소 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">취소</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    // 특정 서식들만 취소: 굵게, 기울임, 밑줄, 취소선, 리스트
                    editor?.chain().focus()
                      .unsetBold()
                      .unsetItalic()
                      .unsetUnderline()
                      .unsetStrike()
                      .liftListItem('listItem')
                      .run();
                  }}
                >
                  <SvgIcon name="format_clear" />
                  <span>취소</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="ribbon-groups">
            {/* 연구 문서 요소 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">문서</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => setShowDocumentSelector(true)}
                >
                  <SvgIcon name="description" />
                  <span>문서 삽입</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const url = prompt('이미지 URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                >
                  <SvgIcon name="image" />
                  <span>이미지</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const url = prompt('링크 URL을 입력하세요:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  <SvgIcon name="link" />
                  <span>링크</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    editor.chain().focus().insertContent('<blockquote><p>인용문을 입력하세요</p></blockquote>').run();
                  }}
                >
                  <SvgIcon name="format_quote" />
                  <span>인용</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    editor.chain().focus().insertContent('<pre><code>코드를 입력하세요</code></pre>').run();
                  }}
                >
                  <SvgIcon name="code" />
                  <span>코드</span>
                </button>
              </div>
            </div>

            {/* 표 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">표</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('표 삽입');
                  }}
                >
                  <SvgIcon name="table_chart" />
                  <span>표 삽입</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('열 추가');
                  }}
                >
                  <SvgIcon name="view_column" />
                  <span>열 추가</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('행 추가');
                  }}
                >
                  <SvgIcon name="table_rows" />
                  <span>행 추가</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('표 삭제');
                  }}
                >
                  <SvgIcon name="delete_outline" />
                  <span>표 삭제</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'research' && (
          <div className="ribbon-groups">
            {/* 문서 관리 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">문서 관리</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => setShowDocumentSelector(true)}
                >
                  <SvgIcon name="library_books" />
                  <span>문서 선택</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('새 연구 문서 생성');
                  }}
                >
                  <SvgIcon name="note_add" />
                  <span>새 문서</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('문서 가져오기');
                  }}
                >
                  <SvgIcon name="upload_file" />
                  <span>가져오기</span>
                </button>
              </div>
            </div>

            {/* 검색 및 분석 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">검색 및 분석</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('문헌 검색');
                  }}
                >
                  <SvgIcon name="search" />
                  <span>문헌 검색</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('키워드 분석');
                  }}
                >
                  <SvgIcon name="analytics" />
                  <span>키워드 분석</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    console.log('인용 분석');
                  }}
                >
                  <SvgIcon name="format_quote" />
                  <span>인용 분석</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="ribbon-groups">
            {/* 화면보기 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">화면보기</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (onToggleLeftPanel) {
                      onToggleLeftPanel();
                    }
                  }}
                >
                  <SvgIcon name="view_sidebar" />
                  <span>좌측 슬라이드</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (onToggleRightSidebar) {
                      onToggleRightSidebar();
                    }
                  }}
                >
                  <SvgIcon name="view_sidebar" />
                  <span>우측 슬라이드</span>
                </button>
              </div>
            </div>

            {/* 표시 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">표시</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
                    if (editorElement) {
                      const currentZoom = parseFloat(editorElement.style.zoom || '1');
                      editorElement.style.zoom = (currentZoom + 0.1).toString();
                    }
                  }}
                >
                  <SvgIcon name="zoom_in" />
                  <span>확대</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
                    if (editorElement) {
                      const currentZoom = parseFloat(editorElement.style.zoom || '1');
                      editorElement.style.zoom = (currentZoom - 0.1).toString();
                    }
                  }}
                >
                  <SvgIcon name="zoom_out" />
                  <span>축소</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      // 현재 전체화면 상태라면 전체화면 해제
                      if (document.exitFullscreen) {
                        document.exitFullscreen();
                      }
                    } else {
                      // 전체화면이 아니라면 전체화면으로 전환
                      const element = document.documentElement;
                      if (element.requestFullscreen) {
                        element.requestFullscreen();
                      }
                    }
                  }}
                >
                  <SvgIcon name="fullscreen" />
                  <span>전체화면</span>
                </button>
                <button 
                  className={`ribbon-button ${isReadOnly ? 'active' : ''}`}
                  onClick={onToggleReadOnly}
                >
                  <SvgIcon name={isReadOnly ? 'lock' : 'edit'} />
                  <span>{isReadOnly ? '읽기전용' : '편집모드'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="ribbon-groups">
            {/* 문서 내보내기 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">내보내기</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={handleExportToPDF}
                >
                  <SvgIcon name="picture_as_pdf" />
                  <span>PDF</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const content = editor.getHTML();
                    const blob = new Blob([content], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.html';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <SvgIcon name="code" />
                  <span>HTML</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const content = editor.getText();
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <SvgIcon name="description" />
                  <span>설명</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const password = prompt('문서 암호를 입력하세요:');
                    if (password) {
                      const content = editor.getHTML();
                      const encryptedContent = btoa(content); // 간단한 base64 인코딩
                      const blob = new Blob([encryptedContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'document-encrypted.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                      alert('암호화된 문서가 다운로드되었습니다.');
                    }
                  }}
                >
                  <SvgIcon name="lock" />
                  <span>암호</span>
                </button>
              </div>
            </div>

            {/* 인쇄 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">인쇄</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>문서 미리보기</title>
                            <style>
                              body { font-family: Arial, sans-serif; margin: 20px; }
                              @media print { body { margin: 0; } }
                            </style>
                          </head>
                          <body>
                            ${editor.getHTML()}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                >
                  <SvgIcon name="preview" />
                  <span>미리보기</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    // TipTap 에디터 내용만 인쇄하도록 설정
                    const editorContent = document.querySelector('.ProseMirror');
                    if (editorContent) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>문서 인쇄</title>
                              <style>
                                body { 
                                  font-family: Arial, sans-serif; 
                                  margin: 20px; 
                                  line-height: 1.6;
                                }
                                @media print { 
                                  body { margin: 0; }
                                  @page { margin: 2cm; }
                                }
                                /* TipTap 에디터 스타일 복사 */
                                .ProseMirror {
                                  outline: none;
                                }
                                h1, h2, h3, h4, h5, h6 {
                                  margin-top: 1em;
                                  margin-bottom: 0.5em;
                                }
                                p {
                                  margin: 0.5em 0;
                                }
                                ul, ol {
                                  margin: 0.5em 0;
                                  padding-left: 2em;
                                }
                                blockquote {
                                  border-left: 4px solid #ddd;
                                  margin: 1em 0;
                                  padding-left: 1em;
                                  color: #666;
                                }
                                code {
                                  background-color: #f5f5f5;
                                  padding: 2px 4px;
                                  border-radius: 3px;
                                  font-family: monospace;
                                }
                                pre {
                                  background-color: #f5f5f5;
                                  padding: 1em;
                                  border-radius: 5px;
                                  overflow-x: auto;
                                }
                                table {
                                  border-collapse: collapse;
                                  width: 100%;
                                  margin: 1em 0;
                                }
                                th, td {
                                  border: 1px solid #ddd;
                                  padding: 8px;
                                  text-align: left;
                                }
                                th {
                                  background-color: #f2f2f2;
                                  font-weight: bold;
                                }
                              </style>
                            </head>
                            <body>
                              <div class="ProseMirror">
                                ${editorContent.innerHTML}
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      }
                    }
                  }}
                >
                  <SvgIcon name="local_printshop" />
                  <span>인쇄</span>
                </button>
              </div>
            </div>

            {/* 문서 설정 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">설정</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const pageSetup = {
                      orientation: 'portrait',
                      paperSize: 'A4',
                      margins: { top: 20, right: 20, bottom: 20, left: 20 }
                    };
                    console.log('페이지 설정:', pageSetup);
                    alert('페이지 설정이 적용되었습니다.');
                  }}
                >
                  <SvgIcon name="settings" />
                  <span>페이지 설정</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const wordCount = editor.getText().split(/\s+/).filter(word => word.length > 0).length;
                    const charCount = editor.getText().length;
                    alert(`단어 수: ${wordCount}\n문자 수: ${charCount}`);
                  }}
                >
                  <SvgIcon name="analytics" />
                  <span>통계</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 편의기능 탭 */}
        {activeTab === 'convenience' && (
          <div className="ribbon-content">
            {/* AI 도구 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">AI 도구</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const text = editor?.getText() || '';
                    if (text.trim()) {
                      // 간단한 요약 로직 (실제로는 AI API 호출)
                      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
                      const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
                      alert(`문서 요약:\n${summary}`);
                    } else {
                      alert('요약할 텍스트가 없습니다.');
                    }
                  }}
                >
                  <SvgIcon name="auto_awesome" />
                  <span>문서 요약</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const text = editor?.getText() || '';
                    if (text.trim()) {
                      // 간단한 맞춤법 검사 로직
                      const commonErrors = [
                        { wrong: '되요', correct: '돼요' },
                        { wrong: '안되', correct: '안 돼' },
                        { wrong: '할께', correct: '할게' },
                        { wrong: '갔다가', correct: '갔다 가' }
                      ];
                      let errorCount = 0;
                      commonErrors.forEach(error => {
                        if (text.includes(error.wrong)) {
                          errorCount++;
                        }
                      });
                      alert(`맞춤법 검사 완료\n발견된 오류: ${errorCount}개`);
                    } else {
                      alert('검사할 텍스트가 없습니다.');
                    }
                  }}
                >
                  <SvgIcon name="spellcheck" />
                  <span>맞춤법 검사</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const text = editor?.getText() || '';
                    if (text.trim()) {
                      // 간단한 키워드 추출 로직
                      const words = text.split(/\s+/).filter(word => word.length > 2);
                      const wordCount: { [key: string]: number } = {};
                      words.forEach(word => {
                        const cleanWord = word.replace(/[^\w가-힣]/g, '').toLowerCase();
                        if (cleanWord.length > 2) {
                          wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
                        }
                      });
                      const keywords = Object.entries(wordCount)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([word]) => word);
                      alert(`주요 키워드:\n${keywords.join(', ')}`);
                    } else {
                      alert('분석할 텍스트가 없습니다.');
                    }
                  }}
                >
                  <SvgIcon name="analytics" />
                  <span>키워드 추출</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const selectedText = editor?.state.doc.textBetween(
                      editor.state.selection.from,
                      editor.state.selection.to
                    ) || '';
                    if (selectedText.trim()) {
                      // 간단한 번역 시뮬레이션
                      alert(`번역 결과:\n${selectedText} → [번역된 텍스트]`);
                    } else {
                      alert('번역할 텍스트를 선택해주세요.');
                    }
                  }}
                >
                  <SvgIcon name="translate" />
                  <span>번역</span>
                </button>
              </div>
            </div>

            {/* 편의 기능 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">편의 기능</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const text = editor?.getText() || '';
                    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
                    const charCount = text.length;
                    const charCountNoSpaces = text.replace(/\s/g, '').length;
                    const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
                    alert(`문서 통계:\n단어 수: ${wordCount}\n문자 수 (공백 포함): ${charCount}\n문자 수 (공백 제외): ${charCountNoSpaces}\n문단 수: ${paragraphCount}`);
                  }}
                >
                  <SvgIcon name="analytics" />
                  <span>단어 수 세기</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const searchTerm = prompt('찾을 단어를 입력하세요:');
                    if (searchTerm) {
                      const text = editor?.getText() || '';
                      const count = (text.match(new RegExp(searchTerm, 'gi')) || []).length;
                      if (count > 0) {
                        alert(`"${searchTerm}"을(를) ${count}개 찾았습니다.`);
                      } else {
                        alert(`"${searchTerm}"을(를) 찾을 수 없습니다.`);
                      }
                    }
                  }}
                >
                  <SvgIcon name="search" />
                  <span>찾기</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const searchTerm = prompt('찾을 단어를 입력하세요:');
                    if (searchTerm) {
                      const replaceTerm = prompt('바꿀 단어를 입력하세요:');
                      if (replaceTerm !== null) {
                        const currentContent = editor?.getHTML() || '';
                        const newContent = currentContent.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
                        editor?.commands.setContent(newContent);
                        alert(`"${searchTerm}"을(를) "${replaceTerm}"으(로) 바꿨습니다.`);
                      }
                    }
                  }}
                >
                  <SvgIcon name="find_replace" />
                  <span>바꾸기</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    // 자동 저장 기능 시뮬레이션
                    const content = editor?.getHTML() || '';
                    localStorage.setItem('auto_saved_content', content);
                    localStorage.setItem('auto_saved_time', new Date().toLocaleString());
                    alert('문서가 자동 저장되었습니다.');
                  }}
                >
                  <SvgIcon name="save" />
                  <span>자동 저장</span>
                </button>
              </div>
            </div>

            {/* 문서 도구 그룹 */}
            <div className="ribbon-group">
              <div className="ribbon-group-title">문서 도구</div>
              <div className="ribbon-controls">
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    editor?.commands.selectAll();
                    alert('전체 텍스트가 선택되었습니다.');
                  }}
                >
                  <SvgIcon name="select_all" />
                  <span>전체 선택</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const content = editor?.getHTML() || '';
                    navigator.clipboard.writeText(content).then(() => {
                      alert('문서 내용이 클립보드에 복사되었습니다.');
                    });
                  }}
                >
                  <SvgIcon name="content_copy" />
                  <span>전체 복사</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    if (confirm('문서의 모든 내용을 삭제하시겠습니까?')) {
                      editor?.commands.clearContent();
                      alert('문서 내용이 삭제되었습니다.');
                    }
                  }}
                >
                  <SvgIcon name="clear" />
                  <span>전체 삭제</span>
                </button>
                <button 
                  className="ribbon-button"
                  onClick={() => {
                    const savedContent = localStorage.getItem('auto_saved_content');
                    const savedTime = localStorage.getItem('auto_saved_time');
                    if (savedContent && savedTime) {
                      if (confirm(`${savedTime}에 저장된 내용을 복원하시겠습니까?`)) {
                        editor?.commands.setContent(savedContent);
                        alert('문서가 복원되었습니다.');
                      }
                    } else {
                      alert('복원할 저장된 내용이 없습니다.');
                    }
                  }}
                >
                  <SvgIcon name="restore" />
                  <span>복원</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 문서 선택 모달 */}
      {showDocumentSelector && (
        <DocumentSelector
          isOpen={showDocumentSelector}
          onClose={() => setShowDocumentSelector(false)}
          onSelect={handleDocumentSelect}
          title="연구 문서 선택"
        />
      )}
    </div>
  );
};

export default TopMenuBar;