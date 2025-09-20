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

// Add review/feedback interfaces
interface Review {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  section?: string;
}

interface Comment {
  id: string;
  reviewId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  section?: string;
}

interface Feedback {
  id: string;
  documentId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'reviewed' | 'implemented';
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
  const tabId = queryParams.get('tabId') || `tab-${Date.now()}`; // Generate a tab ID if not provided
  
  // Tab management effect
  useEffect(() => {
    if (projectId) {
      // Register this tab as the active tab for this project
      const projectTabKey = `project-tab-${projectId}`;
      const tabInfo = {
        tabId: tabId,
        timestamp: new Date().getTime(),
        projectId: projectId
      };
      
      localStorage.setItem(projectTabKey, JSON.stringify(tabInfo));
      console.log('Registered tab for project:', projectId, tabInfo);
      
      // Clean up when the tab is closed
      const handleBeforeUnload = () => {
        console.log('Cleaning up tab for project:', projectId);
        const storedTabInfo = localStorage.getItem(projectTabKey);
        if (storedTabInfo) {
          try {
            const tabInfo = JSON.parse(storedTabInfo);
            if (tabInfo.tabId === tabId) {
              localStorage.removeItem(projectTabKey);
              console.log('Removed tab registration for project:', projectId);
            }
          } catch (e) {
            localStorage.removeItem(projectTabKey);
            console.log('Removed tab registration due to error for project:', projectId);
          }
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Clean up on component unmount as well
        const storedTabInfo = localStorage.getItem(projectTabKey);
        if (storedTabInfo) {
          try {
            const tabInfo = JSON.parse(storedTabInfo);
            if (tabInfo.tabId === tabId) {
              localStorage.removeItem(projectTabKey);
              console.log('Removed tab registration on unmount for project:', projectId);
            }
          } catch (e) {
            localStorage.removeItem(projectTabKey);
            console.log('Removed tab registration on unmount due to error for project:', projectId);
          }
        }
      };
    }
  }, [projectId, tabId]);
  
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
  
  // 좌측 패널 탭 가시성 상태
  const [leftPanelVisibleTabs, setLeftPanelVisibleTabs] = useState({
    project: true,
    library: true,
    references: true,
    todos: true
  });
  
  // 우측 패널 탭 가시성 상태
  const [rightSidebarVisibleTabs, setRightSidebarVisibleTabs] = useState({
    project: true,
    referenceInfo: true,
    tableOfContents: true,
    collaboration: true
  });

  // Add state for review/feedback functionality
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

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
      alert('연구 프로젝트 데이터를 가져오는 중 오류가 발생했습니다. 콘솔에서 자세한 정보를 확인하세요.');
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
        pageHeight: 842,
        pageGap: 20,
        pageBreakBackground: "#F7F7F8",
        pageHeaderHeight: 25,
        pageFooterHeight: 25,
        marginTop: 30,
        marginBottom: 50,
        marginLeft: 70,
        marginRight: 70,
        contentMarginTop: 30,
        contentMarginBottom: 30,
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
    
    // ResizeObserver를 사용한 실시간 높이 감지
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const contentElement = entry.target;
        const contentHeight = entry.contentRect.height;
        const maxHeight = 247 * 3.779527559; // mm to px
        
        if (contentHeight > maxHeight) {
          // 콘텐츠 오버플로우 처리
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

  // 좌측 패널 전체 가시성 결정: 모든 탭이 숨김 상태이면 패널 자체를 숨김
  const isLeftPanelCompletelyHidden = Object.values(leftPanelVisibleTabs).every(value => !value);
  const shouldShowLeftPanelFinal = !hideSidebar && !isLeftPanelCompletelyHidden;
  
  // 우측 사이드바 전체 가시성 결정: 모든 탭이 숨김 상태이면 패널 자체를 숨김
  const isRightSidebarCompletelyHidden = Object.values(rightSidebarVisibleTabs).every(value => !value);
  const shouldShowRightSidebarFinal = !hideSidebar && !isRightSidebarCompletelyHidden;
  
  return (
    <div className="main-container">
      {shouldShowLeftPanelFinal && (
        <LeftPanel 
          onNodeSelect={handleNodeSelect} 
          visibleTabs={leftPanelVisibleTabs}
        />
      )}
      <div className="editor-container flex flex-col">
        {shouldShowTopMenuBar && (
          <TopMenuBar 
            editor={editor}
            leftPanelVisibleTabs={leftPanelVisibleTabs}
            rightSidebarVisibleTabs={rightSidebarVisibleTabs}
            onLeftPanelVisibleTabsChange={setLeftPanelVisibleTabs}
            onRightSidebarVisibleTabsChange={setRightSidebarVisibleTabs}
            onShowReviewPanel={() => setShowReviewPanel(true)}
          />
        )}
        <div className="flex-1 overflow-auto">
          <TiptapEditor 
            editor={editor}
          />
        </div>
        <StatusBar editor={editor} />
      </div>
      {shouldShowRightSidebarFinal && (
        <RightSidebar
          details={currentDetails}
          onAddReference={handleAddReference}
          onDeleteReference={handleDeleteReference}
          visibleTabs={{
            info: rightSidebarVisibleTabs.project,
            references: rightSidebarVisibleTabs.referenceInfo,
            toc: rightSidebarVisibleTabs.tableOfContents,
            collaborate: rightSidebarVisibleTabs.collaboration,
          }}
        />
      )}
      
      {/* Review Panel */}
      {showReviewPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">리뷰/피드백 관리</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowReviewPanel(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reviews Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">리뷰</h3>
                    <button 
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => alert('리뷰 추가 기능 - 준비 중입니다.')}
                    >
                      리뷰 추가
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reviews.length > 0 ? (
                      reviews.map(review => (
                        <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-800">{review.reviewerName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.section && (
                            <div className="text-sm text-blue-600 mb-2">
                              <i className="fas fa-bookmark mr-1"></i>
                              {review.section}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              review.status === 'completed' ? 'bg-green-100 text-green-800' :
                              review.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {review.status === 'completed' ? '완료' :
                               review.status === 'in-progress' ? '진행중' : '대기중'}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {review.comments.map(comment => (
                              <div key={comment.id} className="p-3 bg-gray-50 rounded">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{comment.authorName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                                {comment.section && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    <i className="fas fa-bookmark mr-1"></i>
                                    {comment.section}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">등록된 리뷰가 없습니다.</p>
                    )}
                  </div>
                </div>
                
                {/* Feedback Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">피드백</h3>
                    <button 
                      className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => alert('피드백 추가 기능 - 준비 중입니다.')}
                    >
                      피드백 추가
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {feedbacks.length > 0 ? (
                      feedbacks.map(feedback => (
                        <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-800">{feedback.authorName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feedback.status === 'implemented' ? 'bg-green-100 text-green-800' :
                              feedback.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {feedback.status === 'implemented' ? '개선 완료' :
                               feedback.status === 'reviewed' ? '검토중' : '대기중'}
                            </span>
                          </div>
                          <p className="text-gray-700">{feedback.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">등록된 피드백이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  onClick={() => setShowReviewPanel(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;