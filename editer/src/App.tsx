// src/App.tsx

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useEditor } from '@tiptap/react';

// 컴포넌트
import TiptapEditor from './components/TiptapEditor';
import TopMenuBar from './components/TopMenuBar';
import StatusBar from './components/StatusBar';
import Sidebar  from './components/Sidebar';
import RightSidebar from './components/RightSidebar';

// 데이터 및 타입
import { allDocumentDetails, treeData, findParentProject } from './data/mockData';
import type { TreeNodeData, DocumentDetailsData, ReferenceItem } from './data/mockData';

// Tiptap 확장 프로그램
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import History from '@tiptap/extension-history';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-font-size';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import { FileAttachmentNode } from './extensions/FileAttachmentNode';
import { EquationNode } from './extensions/EquationNode';
import type { CommandProps } from '@tiptap/core';

import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

import { DataTag } from './extensions/DataTag'; 

import { Database } from './db';
import type { MutationResponse, SelectResponse } from './db';

// 전역 CSS
import 'prosemirror-view/style/prosemirror.css';
import 'katex/dist/katex.min.css';


// --- [수정] CustomParagraph 명령어 로직 강화 ---
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      indent: {
        default: 0,
        parseHTML: element => Number(element.getAttribute('data-indent')) || 0,
        renderHTML: attributes => {
          if (!attributes.indent) {
            return {};
          }
          return { 'data-indent': attributes.indent };
        },
      },
    };
  },

  addCommands() {
    return {
      indent: () => ({ commands, editor }) => {
        const type = this.name; // 'paragraph'
        const currentIndent = editor.getAttributes(type).indent || 0;
        
        // 최대 들여쓰기 레벨을 초과하지 않는 경우에만 실행
        if (currentIndent >= 4) {
          return false;
        }
        
        const newIndent = currentIndent + 1;
        // 'paragraph' 타입에만 속성 업데이트를 시도하도록 명시합니다.
        // 이 방식이 editor.can()과 가장 잘 연동됩니다.
        return commands.updateAttributes(type, { indent: newIndent });
      },
      outdent: () => ({ commands, editor }) => {
        const type = this.name;
        const currentIndent = editor.getAttributes(type).indent || 0;

        // 더 이상 내어쓸 수 없는 경우 실행하지 않음
        if (currentIndent <= 0) {
          return false;
        }

        const newIndent = currentIndent - 1;
        return commands.updateAttributes(type, { indent: newIndent });
      },
    };
  },
});


const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      cite: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.cite) {
            return {};
          }
          return { cite: attributes.cite };
        },
        parseHTML: element => element.getAttribute('cite'),
      },
    };
  },
});

function App() {
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [documents, setDocuments] = useState(allDocumentDetails);
  const [currentDetails, setCurrentDetails] = useState<DocumentDetailsData | null>(null);
  const isResizing = useRef(false);

  const sharedExtensions = [Document, Paragraph, Text, History];

  const db = useMemo(() => new Database(), []);
  const fetchDocuments = useCallback(async () => {
    const result: SelectResponse<DocumentDetailsData[]> = await db.query("SELECT * FROM documents");
    if(result.success && result.data) {
      // 실제로는 배열을 allDocumentDetails와 같은 객체 형태로 변환해야 합니다.
      // const docsObject = result.data.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {});
      // setDocuments(docsObject);
      console.log("서버로부터 문서를 성공적으로 불러왔습니다.", result.data);
    }
  }, [db]);


  const allReferences = useMemo(() => {
    return Object.values(documents).flatMap(doc => doc.references);
  }, [documents]);

  const masterReferenceList = useMemo(() => {
    // 1. 모든 문서의 모든 참고문헌을 하나의 배열로 펼칩니다.
    const allRefs = Object.values(allDocumentDetails).flatMap(doc => doc.references);
    
    // 2. (안전장치) ID를 기준으로 중복을 제거하여 순수한 마스터 목록을 만듭니다.
    const uniqueRefs = Array.from(new Map(allRefs.map(ref => [ref.id, ref])).values());
    
    return uniqueRefs;
  }, [])

  const getLastName = (author: string): string => {
    if (!author) return '';
    const firstAuthor = author.split(',')[0].trim();
    const koreanRegex = /^[\uAC00-\uD7A3]{2,4}$/;
    if (koreanRegex.test(firstAuthor)) {
      return firstAuthor.charAt(0);
    }
    return firstAuthor.split(' ')[0];
  };
  // --- [수정 3] 핵심 인용 핸들러 함수 구현 ---
  const handleCiteReference = async (reference: ReferenceItem) => {
    if (!mainEditor) return;

    // 1. 에디터에 (성, 연도) 텍스트 삽입 (이 부분은 동기적으로 실행되므로 그대로 둡니다)
    const lastName = getLastName(reference.author);
    const citationText = `(${lastName}, ${reference.year})`;
    mainEditor.chain().focus().insertContent(citationText).run();

    // 2. 현재 선택된 프로젝트의 참고문헌 목록에 추가
    if (!currentDetails) {
      alert("인용 정보를 추가할 프로젝트가 선택되지 않았습니다.");
      return;
    }

    const projectId = currentDetails.id;
    const query = `INSERT INTO references VALUES (${JSON.stringify(reference)}) WHERE projectId = '${projectId}'`;
    const result: MutationResponse = await db.query(query);

    if (result.success) {
      fetchDocuments(); // 성공 시 데이터 새로고침
    } else if (result.message !== '이미 존재하는 참고문헌이거나 프로젝트가 없습니다.') {
        alert(`인용 추가 중 오류 발생: ${result.message}`);
    }
  };

  const headerEditor = useEditor({
    extensions: sharedExtensions,
    content: '<p style="text-align: center">머리글 영역</p>',
    editorProps: { attributes: { class: 'page-header-editor' } },
  }, []);

  const mainEditor = useEditor({
    extensions: [
      Document,
      CustomParagraph,
      Text,
      History,
      HardBreak,
      Dropcursor,
      Gapcursor,
      Bold,
      Italic,
      Strike,
      Underline,
      Link,
      Code,
      TextStyle,
      FontFamily,
      FontSize,
      Heading,
      Highlight, 
      CustomBlockquote,
      BulletList,
      OrderedList,
      ListItem,
      HorizontalRule,
      CodeBlock,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Image,
      FileAttachmentNode,
      EquationNode,
      DataTag,
    ],
    content: '<h2>환영합니다!</h2><p>왼쪽 트리에서 노트를 선택해주세요.</p>',
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: ({ editor }) => {
      const doc = editor.state.doc;
      const lastNode = doc.lastChild;

      if (lastNode && lastNode.type.name !== 'paragraph') {
        editor.chain().insertContentAt(doc.content.size, '<p></p>').run();
      }
    },
  }, []);

  const footerEditor = useEditor({
    extensions: sharedExtensions,
    content: '<p style="text-align: center">바닥글 영역 / 페이지 번호</p>',
    editorProps: { attributes: { class: 'page-footer-editor' } },
  }, []);

  useEffect(() => {
    const initialWidth = window.innerWidth / 4;
    setSidebarWidth(Math.min(Math.max(initialWidth, 128), 500));
    if (treeData.length > 0) {
      setCurrentDetails(documents[treeData[0].id] || null);
    }
  }, []);

  useEffect(() => {
    if (currentDetails) {
      setCurrentDetails(documents[currentDetails.id] || null);
    }
  }, [documents, currentDetails?.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = Math.min(Math.max(e.clientX, 128), 500);
      setSidebarWidth(newWidth);
    }
  }, []);
  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleNodeSelect = useCallback((node: TreeNodeData) => {
    if (!mainEditor) return;

    setSelectedNode(node);

    let projectToShowDetails: TreeNodeData | null = null;
    
    if (node.type === 'folder') {
      projectToShowDetails = node;
    } else {
      projectToShowDetails = findParentProject(node.id);
    }

    if (projectToShowDetails) {
      setCurrentDetails(documents[projectToShowDetails.id] || null);
    } else {
      setCurrentDetails(null);
    }

    if (node.type === 'note') {
      mainEditor.commands.setContent(node.content || '');
    }
    
  }, [mainEditor, documents]);

  const handleAddReference = async (projectId: string) => {
    const author = window.prompt("저자 (예: 홍길동 (2024))");
    if (!author) return;
    const title = window.prompt("제목");
    if (!title) return;
    const publication = window.prompt("출판 정보 (예: 학술지, 권(호), 페이지)");
    if (!publication) return;

    const newReference: ReferenceItem = {
      id: `ref-${Date.now()}`,
      author: author.match(/(.+)\s\((\d{4})\)/)?.[1] || author,
      year: parseInt(author.match(/(.+)\s\((\d{4})\)/)?.[2] || new Date().getFullYear().toString()),
      title: title,
      publication: publication,
    };

    // --- [수정 3] 기존 setDocuments 로직을 db.query로 대체 ---
    const query = `INSERT INTO references VALUES (${JSON.stringify(newReference)}) WHERE projectId = '${projectId}'`;
    const result: MutationResponse = await db.query(query);

    if (!result.success) {
      alert(`참고문헌 추가 실패: ${result.message}`);
    };

    setDocuments(prevDocs => {
      const targetDoc = prevDocs[projectId];
      const updatedDoc = { ...targetDoc, references: [...targetDoc.references, newReference] };
      return { ...prevDocs, [projectId]: updatedDoc };
    });
  };

  const handleDeleteReference = async (projectId: string, referenceId: string) => {
    if (!window.confirm("이 참고문헌을 삭제하시겠습니까?")) return;
    
    const query = `DELETE FROM references WHERE id = '${referenceId}' AND projectId = '${projectId}'`;
    const result: MutationResponse = await db.query(query);

    if (result.success) {
      fetchDocuments(); // 성공 시 데이터 새로고침
    } else {
      alert(`참고문헌 삭제 실패: ${result.message}`);
    }
  };

  if (!mainEditor || !headerEditor || !footerEditor || sidebarWidth === null) {
    return <div>Loading...</div>; 
  }

   return (
    <div className="app-layout">
      
      <div className="sidebar-container" style={{ width: sidebarWidth }}>
        <Sidebar 
          selectedNode={selectedNode} 
          onNodeSelect={handleNodeSelect}
          allReferences={masterReferenceList} // props 이름은 그대로 allReferences 사용
          onCiteReference={handleCiteReference}
        />
      </div>
      
      <div className="resize-handle" onMouseDown={handleMouseDown} />
      
      <div className="main-content-wrapper">
        <div className="main-content">
          <TopMenuBar editor={mainEditor} />
          <div className="editor-container">
            <TiptapEditor 
              headerEditor={headerEditor}
              mainEditor={mainEditor}
              footerEditor={footerEditor}
            />
          </div>
          <StatusBar editor={mainEditor} />
        </div>
        <RightSidebar
          details={currentDetails}
          onAddReference={handleAddReference}
          onDeleteReference={handleDeleteReference}
        />
      </div>
      
    </div>
  );
}

export default App;