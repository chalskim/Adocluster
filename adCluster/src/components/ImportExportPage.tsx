import React, { useState } from 'react';

interface DocumentItem {
  id: number;
  name: string;
  type: 'document' | 'pdf' | 'image' | 'book';
  checked: boolean;
}

interface FormatOption {
  id: number;
  name: string;
  icon: string;
  selected: boolean;
}

const ImportExportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'document' | 'citation' | 'template' | 'data'>('document');

  // Document tab data
  const [selectedProject, setSelectedProject] = useState<string>('웹사이트 리디자인 연구 프로젝트');
  const projects = [
    '웹사이트 리디자인 연구 프로젝트',
    '모바일 앱 개발 연구 프로젝트',
    '데이터 분석 대시보드 연구 프로젝트',
    '마케팅 전략 문서'
  ];

  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([
    { id: 1, name: '연구 프로젝트 계획서', type: 'document', checked: true },
    { id: 2, name: '요구사항 명세서', type: 'document', checked: true },
    { id: 3, name: '디자인 가이드', type: 'document', checked: false },
    { id: 4, name: '진행 보고서.pdf', type: 'pdf', checked: true },
    { id: 5, name: '와이어프레임.png', type: 'image', checked: false }
  ]);

  const [documentFormats, setDocumentFormats] = useState<FormatOption[]>([
    { id: 1, name: 'PDF', icon: 'fas fa-file-pdf', selected: true },
    { id: 2, name: 'Markdown', icon: 'fab fa-markdown', selected: false },
    { id: 3, name: 'Word', icon: 'fas fa-file-word', selected: false },
    { id: 4, name: 'HTML', icon: 'fas fa-file-code', selected: false }
  ]);

  // Citation tab data
  const [citationItems, setCitationItems] = useState<DocumentItem[]>([
    { id: 1, name: 'Smith, J. (2023). Web Design Principles. Journal of UX...', type: 'book', checked: true },
    { id: 2, name: 'Johnson, A. (2022). Mobile App Development Guide...', type: 'book', checked: true },
    { id: 3, name: 'Brown, M. (2023). Data Visualization Techniques...', type: 'book', checked: false }
  ]);

  const [citationFormats, setCitationFormats] = useState<FormatOption[]>([
    { id: 1, name: 'BibTeX', icon: 'fas fa-code', selected: true },
    { id: 2, name: 'APA', icon: 'fas fa-font', selected: false },
    { id: 3, name: 'MLA', icon: 'fas fa-font', selected: false },
    { id: 4, name: 'Chicago', icon: 'fas fa-font', selected: false }
  ]);

  const citationPreview = `@article{smith2023web,
  title={Web Design Principles},
  author={Smith, John},
  journal={Journal of UX},
  year={2023},
  publisher={UX Press}
}`;

  // Template tab data
  const [templateItems, setTemplateItems] = useState<DocumentItem[]>([
    { id: 1, name: '연구 프로젝트 계획서 템플릿', type: 'document', checked: true },
    { id: 2, name: '회의록 템플릿', type: 'document', checked: false },
    { id: 3, name: '보고서 템플릿', type: 'document', checked: true },
    { id: 4, name: '요구사항 명세서 템플릿', type: 'document', checked: false }
  ]);

  const [templateFormats, setTemplateFormats] = useState<FormatOption[]>([
    { id: 1, name: '템플릿 파일', icon: 'fas fa-file', selected: true },
    { id: 2, name: 'BibTeX', icon: 'fas fa-code', selected: false },
    { id: 3, name: 'APA', icon: 'fas fa-font', selected: false },
    { id: 4, name: 'MLA', icon: 'fas fa-font', selected: false }
  ]);

  // Data tab data
  const [dataItems, setDataItems] = useState([
    { id: 1, name: '문서', checked: true },
    { id: 2, name: '그림', checked: true },
    { id: 3, name: '표', checked: false },
    { id: 4, name: '웹사이트 주소', checked: true },
    { id: 5, name: '수식', checked: false },
    { id: 6, name: '동영상', checked: false },
    { id: 7, name: '음성', checked: false },
    { id: 8, name: '코드 스니펫', checked: true },
    { id: 9, name: '인용/발췌', checked: true }
  ]);

  const [dataFormats, setDataFormats] = useState<FormatOption[]>([
    { id: 1, name: 'ZIP', icon: 'far fa-file-archive', selected: true },
    { id: 2, name: 'TAR.GZ', icon: 'far fa-file-archive', selected: false },
    { id: 3, name: '폴더', icon: 'fas fa-folder', selected: false }
  ]);

  // Toggle document item selection
  const toggleDocumentItem = (id: number, tab: 'document' | 'citation' | 'template') => {
    if (tab === 'document') {
      setDocumentItems(documentItems.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    } else if (tab === 'citation') {
      setCitationItems(citationItems.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    } else if (tab === 'template') {
      setTemplateItems(templateItems.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    }
  };

  // Toggle data item selection
  const toggleDataItem = (id: number) => {
    setDataItems(dataItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Select format option
  const selectFormat = (id: number, tab: 'document' | 'citation' | 'template' | 'data') => {
    if (tab === 'document') {
      setDocumentFormats(documentFormats.map(format => 
        format.id === id 
          ? { ...format, selected: true } 
          : { ...format, selected: false }
      ));
    } else if (tab === 'citation') {
      setCitationFormats(citationFormats.map(format => 
        format.id === id 
          ? { ...format, selected: true } 
          : { ...format, selected: false }
      ));
    } else if (tab === 'template') {
      setTemplateFormats(templateFormats.map(format => 
        format.id === id 
          ? { ...format, selected: true } 
          : { ...format, selected: false }
      ));
    } else if (tab === 'data') {
      setDataFormats(dataFormats.map(format => 
        format.id === id 
          ? { ...format, selected: true } 
          : { ...format, selected: false }
      ));
    }
  };

  // Get icon for document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document': return 'fas fa-file-alt';
      case 'pdf': return 'fas fa-file-pdf';
      case 'image': return 'fas fa-file-image';
      case 'book': return 'fas fa-book';
      default: return 'fas fa-file';
    }
  };

  // Handle file selection for template import
  const handleFileSelect = () => {
    alert('파일 선택 기능은 실제 구현 시 파일 선택 다이얼로그가 열립니다.');
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('active');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      alert(`${files.length}개의 파일이 선택되었습니다.`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1">📥 가져오기 / 내보내기</h1>
        <p className="text-gray-500 text-sm">문서, 참고문헌, 템플릿, 자료를 다양한 형식으로 가져오고 내보낼 수 있습니다</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200 bg-gray-100">
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'document' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('document')}
          >
            문서 
          </div>
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'citation' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('citation')}
          >
            참고문헌 
          </div>
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'template' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('template')}
          >
            템플릿 
          </div>
          <div 
            className={`px-4 py-3 cursor-pointer font-medium transition-colors text-sm ${
              activeTab === 'data' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('data')}
          >
            자료 
          </div>
        </div>

        {/* Document Tab */}
        {activeTab === 'document' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b-2 border-blue-500"> 문서 </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">연구 프로젝트 선택</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                {projects.map((project, index) => (
                  <option key={index} value={project}>{project}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">문서 선택</label>
              <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                {documentItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-2 p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-sm"
                  >
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={item.checked}
                      onChange={() => toggleDocumentItem(item.id, 'document')}
                    />
                    <i className={`${getDocumentIcon(item.type)} text-blue-500 text-sm`}></i>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1 text-sm">포맷 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                {documentFormats.map((format) => (
                  <div 
                    key={format.id}
                    className={`p-3 border-2 rounded-md text-center cursor-pointer transition-all ${
                      format.selected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => selectFormat(format.id, 'document')}
                  >
                    <div className="text-lg mb-1 text-blue-500">
                      <i className={format.icon}></i>
                    </div>
                    <div className="text-sm">{format.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-download"></i> 내보내기
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-upload"></i> 가져오기
              </button>
            </div>
          </div>
        )}

        {/* Citation Tab */}
        {activeTab === 'citation' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b-2 border-blue-500"> 참고문헌 </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">참고문헌 스타일 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                {citationFormats.map((format) => (
                  <div 
                    key={format.id}
                    className={`p-3 border-2 rounded-md text-center cursor-pointer transition-all ${
                      format.selected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => selectFormat(format.id, 'citation')}
                  >
                    <div className="text-lg mb-1 text-blue-500">
                      <i className={format.icon}></i>
                    </div>
                    <div className="text-sm">{format.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">참고문헌 목록</label>
              <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                {citationItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-2 p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-sm"
                  >
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={item.checked}
                      onChange={() => toggleDocumentItem(item.id, 'citation')}
                    />
                    <i className={`${getDocumentIcon(item.type)} text-blue-500 text-sm`}></i>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <button className="px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-copy"></i> 클립보드 복사
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-download"></i> 다운로드
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-upload"></i> 가져오기
              </button>
            </div>

            <div className="bg-gray-100 rounded-md p-3">
              <div className="font-medium text-gray-700 mb-2 text-sm">미리보기</div>
              <div className="bg-white rounded p-3 min-h-20 font-mono whitespace-pre-wrap text-xs">
                {citationPreview}
              </div>
            </div>
          </div>
        )}

        {/* Template Tab */}
        {activeTab === 'template' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b-2 border-blue-500"> 템플릿 </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">템플릿 선택</label>
              <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                {templateItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-2 p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-sm"
                  >
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={item.checked}
                      onChange={() => toggleDocumentItem(item.id, 'template')}
                    />
                    <i className={`${getDocumentIcon(item.type)} text-blue-500 text-sm`}></i>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1 text-sm">내보내기 포맷</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                {templateFormats.map((format) => (
                  <div 
                    key={format.id}
                    className={`p-3 border-2 rounded-md text-center cursor-pointer transition-all ${
                      format.selected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => selectFormat(format.id, 'template')}
                  >
                    <div className="text-lg mb-1 text-blue-500">
                      <i className={format.icon}></i>
                    </div>
                    <div className="text-sm">{format.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center mb-5 transition-colors hover:border-blue-500 hover:bg-gray-50"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-2xl text-gray-400 mb-2">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <h3 className="text-base font-semibold mb-1">템플릿 가져오기</h3>
              <p className="text-gray-500 mb-3 text-sm">여기에 템플릿 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
              <button 
                className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1 mx-auto text-sm"
                onClick={handleFileSelect}
              >
                <i className="fas fa-folder-open"></i> 파일 선택
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-download"></i> 내보내기
              </button>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b-2 border-blue-500"> 자료 </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">자료 선택</label>
              <div className="flex flex-wrap gap-3 mt-1">
                {dataItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={item.checked}
                      onChange={() => toggleDataItem(item.id)}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1 text-sm">압축 형식 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                {dataFormats.map((format) => (
                  <div 
                    key={format.id}
                    className={`p-3 border-2 rounded-md text-center cursor-pointer transition-all ${
                      format.selected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => selectFormat(format.id, 'data')}
                  >
                    <div className="text-lg mb-1 text-blue-500">
                      <i className={format.icon}></i>
                    </div>
                    <div className="text-sm">{format.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-download"></i> 내보내기
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm">
                <i className="fas fa-upload"></i> 가져오기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExportPage;