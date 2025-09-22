import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import DeleteConfirmModal from './DeleteConfirmModal';
import DocumentFormModal from './DocumentFormModal';
import DocumentPreview from './DocumentPreview';

interface Project {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  projectId: string;
  parentId?: string;
  children?: Folder[];
}

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
  documentInfo?: string;
  pageNumber?: number;
}

interface ImageDocument extends BaseDocument {
  type: 'image';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface TableDocument extends BaseDocument {
  type: 'table';
  data: any[][];
  headers?: string[];
  tableType: 'excel' | 'css';
  styles?: any;
}

interface FormulaDocument extends BaseDocument {
  type: 'formula';
  latex: string;
  rendered?: string;
}

interface VideoDocument extends BaseDocument {
  type: 'video';
  url: string;
  duration?: number;
  thumbnail?: string;
}

interface AudioDocument extends BaseDocument {
  type: 'audio';
  url: string;
  duration?: number;
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

// Review/Feedback data structures
interface Review {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  section?: string; // Document section this review refers to
}

interface Comment {
  id: string;
  reviewId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  section?: string; // Document section this comment refers to
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

const DocumentMnagement: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'filename' | 'project' | 'keyword'>('filename');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedDocumentForAdd, setSelectedDocumentForAdd] = useState<Document | null>(null);
  
  // New states for document form and preview
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDocumentForReview, setSelectedDocumentForReview] = useState<Document | null>(null);

  // Mock data for projects
  const [projects] = useState<Project[]>([
    { id: '1', name: '연구 프로젝트 A' },
    { id: '2', name: '연구 프로젝트 B' },
    { id: '3', name: '연구 프로젝트 C' },
  ]);

  // Mock data for reviews
  const reviews: Review[] = [
    {
      id: 'r1',
      documentId: 'd1',
      reviewerId: 'user1',
      reviewerName: '김개발',
      status: 'completed',
      createdAt: '2023-11-20T10:30:00Z',
      updatedAt: '2023-11-21T14:15:00Z',
      comments: [
        {
          id: 'c1',
          reviewId: 'r1',
          content: '기술 아키텍처 부분에서 AWS 서비스 선택 근거를 더 명확히 설명해 주세요.',
          authorId: 'user1',
          authorName: '김개발',
          createdAt: '2023-11-20T10:30:00Z',
          updatedAt: '2023-11-20T10:30:00Z',
          section: '3. 기술 아키텍처'
        }
      ],
      section: '3. 기술 아키텍처'
    },
    {
      id: 'r2',
      documentId: 'd2',
      reviewerId: 'user2',
      reviewerName: '이디자인',
      status: 'in-progress',
      createdAt: '2023-11-18T09:15:00Z',
      updatedAt: '2023-11-18T09:15:00Z',
      comments: [],
      section: '2. 프로젝트 범위'
    }
  ];

  // Mock data for feedback
  const feedbacks: Feedback[] = [
    {
      id: 'f1',
      documentId: 'd1',
      content: '전반적으로 잘 구성되었으나, 기술 스택 선택 근거를 더 구체적으로 설명해주시면 좋겠습니다.',
      authorId: 'user1',
      authorName: '김개발',
      status: 'implemented',
      createdAt: '2023-11-20T10:30:00Z',
      updatedAt: '2023-11-21T14:15:00Z'
    },
    {
      id: 'f2',
      documentId: 'd2',
      content: '사용자 인터뷰 질문지의 구성이 다소 단순합니다. 더 심층적인 질문이 필요해 보입니다.',
      authorId: 'user2',
      authorName: '이디자인',
      status: 'reviewed',
      createdAt: '2023-11-18T09:15:00Z',
      updatedAt: '2023-11-18T09:15:00Z'
    }
  ];

  // Mock data for folders with hierarchical structure
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'f1', name: '회의록', projectId: '1' },
    { id: 'f2', name: '기획서', projectId: '1' },
    { id: 'f3', name: '디자인', projectId: '1' },
    { id: 'f4', name: '개발문서', projectId: '1', parentId: 'f2' },
    { id: 'f5', name: 'UI/UX', projectId: '1', parentId: 'f3' },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    { 
      id: 'd1', 
      name: '2025년 9월 회의록', 
      projectId: '1', 
      folderId: 'f1', 
      date: '2025-09-13', 
      type: 'text',
      title: '2025년 9월 회의록',
      description: 'AI 연구 방향성 논의 회의록',
      content: '회의 내용: AI 연구 방향성 논의, 머신러닝 알고리즘 개선 방안, 데이터 수집 전략'
    },
    { 
      id: 'd2', 
      name: '연구 프로젝트 기획서 v1', 
      projectId: '1', 
      folderId: 'f2', 
      date: '2025-09-10', 
      type: 'text',
      title: '연구 프로젝트 기획서 v1',
      description: '자연어 처리 기술 개발 기획서',
      content: '프로젝트 목표: 자연어 처리 기술 개발, 딥러닝 모델 구축, 성능 최적화'
    },
    { 
      id: 'd3', 
      name: 'UI 디자인 초안', 
      projectId: '1', 
      folderId: 'f5', 
      date: '2025-09-08', 
      type: 'image',
      title: 'UI 디자인 초안',
      description: '사용자 인터페이스 설계 초안',
      url: '/images/ui-design-draft.png',
      alt: 'UI 디자인 초안 이미지'
    },
    { 
      id: 'd4', 
      name: '기술 요구사항 명세', 
      projectId: '1', 
      folderId: 'f4', 
      date: '2025-09-05', 
      type: 'text',
      title: '기술 요구사항 명세',
      description: 'React 개발환경 설정 가이드',
      content: 'React 개발환경, TypeScript 설정, 빌드 도구 구성, 테스트 프레임워크'
    },
    { 
      id: 'd5', 
      name: '데이터베이스 설계', 
      projectId: '2', 
      folderId: 'f1', 
      date: '2025-09-12', 
      type: 'text',
      title: '데이터베이스 설계',
      description: '실험 결과 분석 보고서',
      content: '실험 결과 분석, 통계적 유의성 검증, 향후 연구 방향, 논문 작성 계획'
    },
  ]);

  // Build folder tree structure
  const buildFolderTree = (projectId: string): Folder[] => {
    const projectFolders = folders.filter(f => f.projectId === projectId);
    const rootFolders = projectFolders.filter(f => !f.parentId);
    
    const buildChildren = (folder: Folder): Folder => {
      const children = projectFolders.filter(f => f.parentId === folder.id);
      return {
        ...folder,
        children: children.map(buildChildren)
      };
    };
    
    return rootFolders.map(buildChildren);
  };

  // Filter documents based on search criteria
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    if (searchType === 'filename') {
      return doc.name.toLowerCase().includes(query);
    } else if (searchType === 'project') {
      const project = projects.find(p => p.id === doc.projectId);
      return project && project.name.toLowerCase().includes(query);
    } else if (searchType === 'keyword') {
      // 키워드 검색: 파일명, 제목, 설명에서 검색
      const nameMatch = doc.name.toLowerCase().includes(query);
      const titleMatch = doc.title.toLowerCase().includes(query);
      const descriptionMatch = doc.description && doc.description.toLowerCase().includes(query);
      
      // 타입별 콘텐츠 검색
      let contentMatch = false;
      if (doc.type === 'text' || doc.type === 'citation') {
        contentMatch = doc.content.toLowerCase().includes(query);
      } else if (doc.type === 'code') {
        contentMatch = doc.code.toLowerCase().includes(query);
      } else if (doc.type === 'formula') {
        contentMatch = doc.latex.toLowerCase().includes(query);
      }
      
      return nameMatch || titleMatch || descriptionMatch || contentMatch;
    }
    
    return true;
  });

  const handleDocumentOpen = (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewer(true);
  };

  const handleViewerClose = () => {
    setShowViewer(false);
    setSelectedDocument(null);
  };

  const getDocumentContent = (docId: string) => {
    return `
      <h1>문서 내용</h1>
      <p>이것은 ${selectedDocument?.name}의 내용입니다.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <h2>주요 내용</h2>
      <ul>
        <li>첫 번째 항목</li>
        <li>두 번째 항목</li>
        <li>세 번째 항목</li>
      </ul>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    `;
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (deleteType: 'source' | 'document' | 'all') => {
    if (documentToDelete) {
      console.log(`Deleting ${deleteType} for document:`, documentToDelete.name);
      switch (deleteType) {
        case 'source':
          console.log('Deleting only source information');
          break;
        case 'document':
          console.log('Deleting only document file');
          break;
        case 'all':
          console.log('Deleting both source and document');
          // Actually remove the document from the list
          setDocuments(documents.filter(d => d.id !== documentToDelete.id));
          break;
      }
    }
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  // New document management functions
  const handleAddDocument = () => {
    if (!selectedProject) {
      alert('프로젝트를 먼저 선택해주세요.');
      return;
    }
    setEditingDocument(null);
    setShowDocumentForm(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowDocumentForm(true);
  };

  const handleSaveDocument = (document: Document) => {
    if (editingDocument) {
      // Update existing document
      setDocuments(documents.map(d => d.id === document.id ? document : d));
    } else {
      // Add new document
      setDocuments([...documents, document]);
    }
    setShowDocumentForm(false);
    setEditingDocument(null);
  };

  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setShowDocumentPreview(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  // Folder management functions
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const addFolder = (parentId?: string) => {
    if (!selectedProject) return;
    
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name: '새 폴더',
      projectId: selectedProject,
      parentId
    };
    
    setFolders([...folders, newFolder]);
    setEditingFolder(newFolder.id);
    setNewFolderName('새 폴더');
  };

  const saveFolder = (folderId: string) => {
    if (newFolderName.trim()) {
      setFolders(folders.map(f => 
        f.id === folderId ? { ...f, name: newFolderName.trim() } : f
      ));
    }
    setEditingFolder(null);
    setNewFolderName('');
  };

  const deleteFolder = (folderId: string) => {
    // Remove folder and its children
    const toDelete = new Set<string>();
    const findChildren = (id: string) => {
      toDelete.add(id);
      folders.filter(f => f.parentId === id).forEach(child => findChildren(child.id));
    };
    findChildren(folderId);
    
    setFolders(folders.filter(f => !toDelete.has(f.id)));
    // Also remove documents in deleted folders
    setDocuments(documents.filter(d => !toDelete.has(d.folderId)));
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, doc: Document) => {
    setDraggedDocument(doc);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (draggedDocument && draggedDocument.folderId !== targetFolderId) {
      setDocuments(documents.map(d => 
        d.id === draggedDocument.id ? { ...d, folderId: targetFolderId } : d
      ));
    }
    setDraggedDocument(null);
  };

  const addDocumentToProject = (doc: Document, targetFolderId: string) => {
    if (!selectedProject) return;
    
    const newDoc: Document = {
      ...doc,
      id: `d${Date.now()}`,
      projectId: selectedProject,
      folderId: targetFolderId
    };
    
    setDocuments([...documents, newDoc]);
    setShowFolderModal(false);
    setSelectedDocumentForAdd(null);
  };

  const handleAddToProject = (document: Document) => {
    setSelectedDocumentForAdd(document);
    setShowFolderModal(true);
  };

  // Review/Feedback functions
  const handleViewReviews = (document: Document) => {
    setSelectedDocumentForReview(document);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedDocumentForReview(null);
  };

  const handleAddReview = (document: Document) => {
    // In a real app, this would open a form to add a review
    console.log(`Adding review for document: ${document.name}`);
  };

  const handleAddFeedback = (document: Document) => {
    // In a real app, this would open a form to add feedback
    console.log(`Adding feedback for document: ${document.name}`);
  };

  // Render folder tree
  const renderFolderTree = (folderList: Folder[], level: number = 0) => {
    return folderList.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const folderDocuments = documents.filter(d => d.folderId === folder.id);
      const hasChildren = folder.children && folder.children.length > 0;
      
      return (
        <div key={folder.id} className="select-none">
          <div 
            className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, folder.id)}
          >
            {hasChildren && (
              <button
                onClick={() => toggleFolder(folder.id)}
                className="mr-1 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="mr-2">📁</span>
            {editingFolder === folder.id ? (
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => saveFolder(folder.id)}
                onKeyPress={(e) => e.key === 'Enter' && saveFolder(folder.id)}
                className="flex-1 px-1 border rounded text-sm"
                autoFocus
              />
            ) : (
              <span 
                className="flex-1 text-sm"
                onDoubleClick={() => {
                  setEditingFolder(folder.id);
                  setNewFolderName(folder.name);
                }}
              >
                {folder.name}
              </span>
            )}
            <div className="ml-2 opacity-0 group-hover:opacity-100 flex space-x-1">
              <button
                onClick={() => addFolder(folder.id)}
                className="text-xs text-blue-600 hover:text-blue-800 px-1 py-0.5 rounded hover:bg-blue-50"
                title="하위 폴더 추가"
              >
                +
              </button>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="text-xs text-white bg-red-500 hover:bg-red-600 px-1 py-0.5 rounded font-bold shadow-sm"
                title="폴더 삭제"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Render documents in this folder */}
          {folderDocuments.map(doc => (
            <div
              key={doc.id}
              className="flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-move"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
              draggable
              onDragStart={(e) => handleDragStart(e, doc)}
            >
              <span className="mr-2">📄</span>
              <span className="flex-1 text-sm text-gray-700">{doc.name}</span>
              <span className="text-xs text-gray-500">{doc.date}</span>
            </div>
          ))}
          
          {/* Render children folders */}
          {isExpanded && hasChildren && (
            <div>
              {renderFolderTree(folder.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">연구노트 관리</h1>
        <p className="text-gray-500 mt-1">연구 프로젝트 내 연구노트를 추가 및 관리할 수 있습니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Project selector and folder tree */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연구 프로젝트 선택
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">프로젝트를 선택하세요</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">폴더 구조</h3>
                  <button
                    onClick={() => addFolder()}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    폴더 추가
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {renderFolderTree(buildFolderTree(selectedProject))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Document search and list */}
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  문서 검색
                </label>
                <button
                  onClick={handleAddDocument}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  새 자료 추가
                </button>
              </div>
              <div className="flex space-x-2 mb-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'filename' | 'project' | 'keyword')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="filename">파일명</option>
                  <option value="project">프로젝트명</option>
                  <option value="keyword">키워드</option>
                </select>
                <input
                  type="text"
                  placeholder={
                    searchType === 'filename' ? '파일명으로 검색...' : 
                    searchType === 'project' ? '프로젝트명으로 검색...' : 
                    '키워드로 검색...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">검색 결과</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDocuments.map(doc => {
                  const project = projects.find(p => p.id === doc.projectId);
                  const folder = folders.find(f => f.id === doc.folderId);
                  
                  return (
                    <div key={doc.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            프로젝트: {project?.name} | 폴더: {folder?.name} | {doc.date}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          <button
                            onClick={() => handlePreviewDocument(doc)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            미리보기
                          </button>

                          {selectedProject && (
                            <button
                              onClick={() => handleAddToProject(doc)}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 rounded px-2 py-1 transition-colors"
                            >
                              프로젝트에 추가
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredDocuments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">검색 결과가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 폴더 선택 모달 */}
      {showFolderModal && selectedDocumentForAdd && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">폴더 선택</h3>
            <p className="text-sm text-gray-600 mb-4">
              "{selectedDocumentForAdd.name}" 문서를 추가할 폴더를 선택하세요.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {buildFolderTree(selectedProject).map(folder => (
                <button
                  key={folder.id}
                  onClick={() => addDocumentToProject(selectedDocumentForAdd, folder.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setSelectedDocumentForAdd(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          documentId={selectedDocument.id}
          documentTitle={selectedDocument.name}
          documentContent={getDocumentContent(selectedDocument.id)}
          onClose={handleViewerClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && documentToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDocumentToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          itemName={documentToDelete.name}
          itemType="document"
          hasReferences={true}
          hasDocuments={true}
        />
      )}

      {/* Document Form Modal */}
      {showDocumentForm && (
        <DocumentFormModal
          isOpen={showDocumentForm}
          onClose={() => {
            setShowDocumentForm(false);
            setEditingDocument(null);
          }}
          onSave={handleSaveDocument}
          document={editingDocument || undefined}
          projectId={selectedProject || ''}
          folderId={selectedProject ? folders.find(f => f.projectId === selectedProject)?.id || '' : ''}
        />
      )}

      {/* Document Preview Modal */}
      {showDocumentPreview && previewDocument && (
        <DocumentPreview
          isOpen={showDocumentPreview}
          onClose={() => {
            setShowDocumentPreview(false);
            setPreviewDocument(null);
          }}
          document={previewDocument}
        />
      )}

      {/* Review/Feedback Modal */}
      {showReviewModal && selectedDocumentForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">리뷰/피드백: {selectedDocumentForReview.name}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseReviewModal}
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
                      onClick={() => handleAddReview(selectedDocumentForReview)}
                    >
                      리뷰 추가
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reviews.filter(r => r.documentId === selectedDocumentForReview.id).length > 0 ? (
                      reviews.filter(r => r.documentId === selectedDocumentForReview.id).map(review => (
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
                      onClick={() => handleAddFeedback(selectedDocumentForReview)}
                    >
                      피드백 추가
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {feedbacks.filter(f => f.documentId === selectedDocumentForReview.id).length > 0 ? (
                      feedbacks.filter(f => f.documentId === selectedDocumentForReview.id).map(feedback => (
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
                  onClick={handleCloseReviewModal}
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

export default DocumentMnagement;