// src/components/RightSidebar.tsx
import  { useState } from 'react';
import type { DocumentDetailsData } from '../data/mockData';

// --- [핵심] props 타입에 함수들이 정의되어 있어야 합니다 ---
interface RightSidebarProps {
  details: DocumentDetailsData | null;
  onAddReference: (projectId: string) => void;
  onDeleteReference: (projectId: string, referenceId: string) => void;
}

const RightSidebar = ({ details, onAddReference, onDeleteReference }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState('properties');

  if (!details) {
    return (
      <aside className="right-sidebar empty">
        <div className="p-4 text-center text-sm text-gray-500">
          프로젝트를 선택하여 상세 정보를 확인하세요.
        </div>
      </aside>
    );
  }

  const tabs = [
    { id: 'properties', label: '속성' },
    { id: 'references', label: '참고문헌' },
    { id: 'comments', label: '댓글' },
  ];

  return (
    <aside className="right-sidebar">
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sidebar-content">
        {activeTab === 'properties' && (
          <div className="properties-pane">
            <div className="property-item"><label>제목</label><input type="text" value={details.properties.title} readOnly /></div>
            <div className="property-item"><label>저자</label><input type="text" value={details.properties.author} readOnly /></div>
            <div className="property-item"><label>키워드</label><input type="text" value={details.properties.keywords.join(', ')} readOnly /></div>
            <div className="property-item"><label>태그</label><input type="text" value={details.properties.tags.join(' ')} readOnly /></div>
          </div>
        )}
        
        {activeTab === 'references' && (
          <div className="references-pane">
            <div className="references-header">
              <h3>참고문헌 목록</h3>
              {/* --- [핵심] props로 받은 함수를 onClick에서 호출합니다 --- */}
              <button className="add-reference-btn" onClick={() => onAddReference(details.id)}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            {details.references.map(ref => (
              <div key={ref.id} className="reference-card">
                <p><strong>{ref.author} ({ref.year})</strong></p>
                <p>{ref.title}</p>
                <p><em>{ref.publication}</em></p>
                <button className="delete-reference-btn" onClick={() => onDeleteReference(details.id, ref.id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="comments-pane">
            {details.comments.map(comment => (
              <div key={comment.id} className="comment-card">
                <p className="comment-author">{comment.author}</p>
                <p className="comment-text">{comment.text}</p>
                <p className="comment-timestamp">{comment.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;