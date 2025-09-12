import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiBaseUrl, getAuthHeaders } from '../services/api';

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
import Highlight from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';
import { PaginationPlus } from 'tiptap-pagination-plus';

// 커스텀 확장 프로그램
import { CustomParagraph } from '../extensions/CustomParagraph';
import { FileAttachmentNode } from '../extensions/FileAttachmentNode';
import { EquationNode } from '../extensions/EquationNode';
import { DataTag } from '../extensions/DataTag';

// 컴포넌트
import LeftPanel from './editeComponents/LeftPanel';
import TopMenuBar from './editeComponents/TopMenuBar';
import StatusBar from './editeComponents/StatusBar';
import TiptapEditor from './editeComponents/TiptapEditor';
import RightSidebar from './editeComponents/RightSidebar';

// 데이터 및 타입
import { allDocumentDetails, treeData, findParentProject, TreeNodeData, DocumentDetailsData, ReferenceItem } from '../data/mockData';

// 전역 CSS
import 'prosemirror-view/style/prosemirror.css';
import 'katex/dist/katex.min.css';
import '../styles/TopMenuBar.css';

// 페이지네이션 스타일 추가
import '../styles/pagination.css';

interface ProjectData {
  prjID: string;
  title: string;
  description: string;
  visibility: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  update_at: string;
}

interface UserData {
  uid: string;
  uemail: string;
  urole: string;
  uname: string;
  uavatar: string | null;
  uisdel: boolean;
  uactive: boolean;
  ucreate_at: string;
  ulast_login: string | null;
  uupdated_at: string | null;
}

const useEditorBodyStyle = () => {
  useEffect(() => {
    document.body.classList.add('editor-body');
    return () => {
      document.body.classList.remove('editor-body');
    };
  }, []);
};

const EditorPage: React.FC = () => {
  useEditorBodyStyle();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we should hide UI elements based on query parameters
  const queryParams = new URLSearchParams(location.search);
  const hideSidebar = queryParams.get('hideSidebar') === 'true';
  const projectId = queryParams.get('projectId');
  
  // Get project data from location state if available
  const locationState = location.state as { project?: ProjectData, user?: UserData } | null;
  const [projectData, setProjectData] = useState<ProjectData | null>(locationState?.project || null);
  const [userData, setUserData] = useState<UserData | null>(locationState?.user || null);
  
  // For simple view, we want to show all components by default
  // Only hide when explicitly requested via hideSidebar parameter
  const shouldShowLeftPanel = !hideSidebar;
  const shouldShowTopMenuBar = !hideSidebar;
  const shouldShowRightSidebar = !hideSidebar;

  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [documents, setDocuments] = useState(allDocumentDetails);
  const [currentDetails, setCurrentDetails] = useState<DocumentDetailsData | null>(null);

  // If we have a projectId but no project data, fetch it from the backend
  useEffect(() => {
    if (projectId && !projectData) {
      // Check if projectId is valid
      if (projectId === 'undefined' || projectId === 'null' || projectId === '') {
        console.error('Invalid projectId received:', projectId);
        return;
      }
      fetchProjectData(projectId);
    }
  }, [projectId, projectData]);

  const fetchProjectData = async (id: string) => {
    try {
      // Validate the project ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid project ID provided:', id);
        return;
      }
      
      // Fetch project data from the backend
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch project data: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const projectData: ProjectData = await response.json();
      console.log('Project data fetched successfully:', projectData);
      setProjectData(projectData);
    } catch (error) {
      console.error('Error fetching project data:', error);
      // Show user-friendly error message
      alert('프로젝트 데이터를 가져오는 중 오류가 발생했습니다. 콘솔에서 자세한 정보를 확인하세요.');
    }
  };

  const editor = useEditor({
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
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
      HorizontalRule,
      CodeBlock,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow, 
      TableHeader, 
      TableCell,
      Image,
      FileAttachmentNode,
      EquationNode,
      DataTag,
      CharacterCount.configure({
        limit: 10000,
      }),
      PaginationPlus.configure({
        pageSize: {
          width: '210mm',
          height: '297mm'
        },
        margins: { 
          top: '25mm', 
          bottom: '25mm', 
          left: '25mm', 
          right: '25mm' 
        },
        showPageNumbers: true,
        
        // 자동 페이지 넘김 설정
        autoPageBreak: true,
        overflow: 'auto-break',
        
        // 페이지 브레이크 규칙
        pageBreakBehavior: {
          avoidOrphans: true,
          avoidWidows: true,
          minLines: 2
        },
        
        // 콘텐츠 영역 높이 계산
        contentHeight: '247mm', // 297mm - 25mm(top) - 25mm(bottom)
        
        // 자동 헤더/푸터
        header: {
          text: projectData?.title || '문서 제목',
          fontSize: 12,
          color: '#6b7280',
          height: '20mm',
          editable: true
        },
        footer: {
          text: '페이지 {page} / {total}',
          fontSize: 12,
          color: '#6b7280',
          height: '20mm',
          editable: true
        },
        
        // 자동 페이지 브레이크 임계값
        autoPageBreakThreshold: 0.95,
        
        showHeaderFooter: true,
        headerFooterStyle: {
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 16px'
        }
      }),
    ],
    content: `<h2>${projectData?.title || '환영합니다!'}</h2><p>왼쪽 트리에서 노트를 선택해주세요.</p>`,
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: ({ editor }) => {
      // 실시간 페이지 오버플로우 체크
      checkPageOverflow(editor);
    },
    onCreate: ({ editor }) => {
      // 초기 페이지 설정
      setupAutoPageBreak(editor);
    }
  }, [projectData]);

  useEffect(() => {
    if (treeData.length > 0) {
      setCurrentDetails(documents[treeData[0].id] || null);
    }
  }, []);

  const handleNodeSelect = useCallback((node: TreeNodeData) => {
    if (!editor) return;

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

    if (node.type === 'note' && node.content) {
      editor.commands.setContent(node.content);
    }
  }, [editor, documents]);

  const handleAddReference = useCallback((projectId: string) => {
    const author = window.prompt("저자 (예: 홍길동 (2024))") || "";
    if (!author) return;
    const title = window.prompt("제목") || "";
    if (!title) return;
    const publication = window.prompt("출판 정보 (예: 학술지, 권(호), 페이지)") || "";
    if (!publication) return;

    const newReference: ReferenceItem = {
      id: `ref-${Date.now()}`,
      author: author.match(/(.+)\s\((\d{4})\)/)?.[1] || author,
      year: parseInt(author.match(/(.+)\s\((\d{4})\)/)?.[2] || new Date().getFullYear().toString()),
      title: title,
      publication: publication,
    };

    setDocuments(prevDocs => {
      const targetDoc = prevDocs[projectId];
      if (!targetDoc) return prevDocs;
      const updatedDoc = { ...targetDoc, references: [...targetDoc.references, newReference] };
      return { ...prevDocs, [projectId]: updatedDoc };
    });
  }, []);

  const handleDeleteReference = useCallback((projectId: string, referenceId: string) => {
    if (!window.confirm("이 참고문헌을 삭제하시겠습니까?")) return;
    
    setDocuments(prevDocs => {
      const targetDoc = prevDocs[projectId];
      if (!targetDoc) return prevDocs;
      const updatedReferences = targetDoc.references.filter(ref => ref.id !== referenceId);
      const updatedDoc = { ...targetDoc, references: updatedReferences };
      return { ...prevDocs, [projectId]: updatedDoc };
    });
  }, []);

  // 실시간 페이지 오버플로우 체크 함수
  const checkPageOverflow = useCallback((editor: any) => {
    if (!editor) return;
    
    // 페이지 오버플로우 체크를 위한 지연 실행
    setTimeout(() => {
      const pages = document.querySelectorAll('.tiptap-page');
      
      pages.forEach((page, index) => {
        const contentElement = page.querySelector('.page-content');
        if (contentElement) {
          const contentHeight = contentElement.scrollHeight;
          const maxHeight = 247 * 3.779527559; // mm to px (247mm)
          
          if (contentHeight > maxHeight) {
            // 오버플로우 발생시 자동으로 새 페이지 생성
            console.log(`페이지 ${index + 1} 오버플로우 감지: ${contentHeight}px > ${maxHeight}px`);
            // PaginationPlus가 자동으로 처리하므로 추가 작업 불필요
          }
        }
      });
    }, 100);
  }, []);

  // 초기 자동 페이지 브레이크 설정
  const setupAutoPageBreak = useCallback((editor: any) => {
    if (!editor) return;
    
    // 초기 페이지 설정 확인
    console.log('자동 페이지 브레이크 설정 완료');
    
    // ResizeObserver를 사용한 실시간 높이 감지
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const contentElement = entry.target;
        const contentHeight = entry.contentRect.height;
        const maxHeight = 247 * 3.779527559; // mm to px
        
        if (contentHeight > maxHeight) {
          console.log('콘텐츠 오버플로우 감지:', contentHeight, '>', maxHeight);
        }
      });
    });
    
    // 모든 페이지 콘텐츠 영역 관찰
    document.querySelectorAll('.page-content').forEach(content => {
      observer.observe(content);
    });
    
    // cleanup 함수 저장
    return () => {
      observer.disconnect();
    };
  }, []);

  // 선택된 노드가 변경될 때마다 현재 문서 상세 정보 업데이트
  useEffect(() => {
    if (currentDetails) {
      setCurrentDetails(documents[currentDetails.id] || null);
    }
  }, [documents, currentDetails?.id]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      {shouldShowLeftPanel && <LeftPanel onNodeSelect={handleNodeSelect} />}
      <div className="editor-container">
        {shouldShowTopMenuBar && <TopMenuBar editor={editor} />}
        <TiptapEditor 
          editor={editor}
        />
        <StatusBar editor={editor} />
      </div>
      {shouldShowRightSidebar && (
        <RightSidebar
          details={currentDetails}
          onAddReference={handleAddReference}
          onDeleteReference={handleDeleteReference}
        />
      )}
    </div>
  );
};

export default EditorPage;