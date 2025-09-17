import React, { useState } from 'react';

interface MessageItem {
  id: number;
  title: string;
  sender: string;
  time: string;
  read: boolean;
}

const MessageManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: 1, title: '연구 프로젝트 회의 일정 조율', sender: '박매니저', time: '10분 전', read: false },
    { id: 2, title: '디자인 시안 확인 요청', sender: '이디자인', time: '1시간 전', read: true },
    { id: 3, title: 'API 변경사항 안내', sender: '최분석', time: '어제', read: false },
  ]);

  // 메시지 보내기 UI 상태 (UI만 구성, 동작은 추후 구현)
  const [composeOpen, setComposeOpen] = useState(true);
  const [sendMode, setSendMode] = useState<'all' | 'project' | 'individual'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  type MockProject = { id: string; name: string };
  type MockUser = { id: string; name: string; role: string };

  const mockProjects: MockProject[] = [
    { id: 'p1', name: 'Alpha 연구 프로젝트' },
    { id: 'p2', name: 'Beta 연구 프로젝트' },
    { id: 'p3', name: 'Gamma 연구 프로젝트' },
  ];

  const mockUsers: MockUser[] = [
    { id: 'u1', name: '김관리', role: 'Admin' },
    { id: 'u2', name: '이개발', role: 'Developer' },
    { id: 'u3', name: '박기획', role: 'PM' },
    { id: 'u4', name: '최디자인', role: 'Designer' },
    { id: 'u5', name: '정QA', role: 'QA' },
    { id: 'u6', name: '오데브옵스', role: 'DevOps' },
    { id: 'u7', name: '문데이터', role: 'Data' },
    { id: 'u8', name: '류인턴', role: 'Intern' },
  ];

  // 사용자 선택 셀렉터 상태 및 핸들러
  const [userSelectValue, setUserSelectValue] = useState('');
  const handleSelectUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedUserIds(prev => (prev.includes(val) ? prev : [...prev, val]));
    setUserSelectValue('');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 전송 기능은 추후 구현 예정
    alert('메시지 전송 UI만 구성되었습니다. 실제 전송 기능은 추후 구현됩니다.');
  };
  const toggleRead = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  const deleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">✉️ 메세지 관리</h1>
        <p className="text-gray-500">받은 메시지, 보낸 메시지, 보관함을 관리하세요</p>
      </div>

      {/* 메시지 보내기 (UI 전용) */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">메시지 작성</h2>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setComposeOpen((o) => !o)}
          >
            {composeOpen ? '접기' : '펼치기'}
          </button>
        </div>

        {composeOpen && (
          <form onSubmit={handleSend} className="space-y-4">
            {/* 대상 선택 탭 */}
            <div>
              <div className="inline-flex rounded-md shadow-sm overflow-hidden border">
                <button
                  type="button"
                  onClick={() => setSendMode('all')}
                  className={`px-4 py-2 text-sm font-medium ${
                    sendMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('project')}
                  className={`px-4 py-2 text-sm font-medium border-l ${
                    sendMode === 'project'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  연구 프로젝트
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('individual')}
                  className={`px-4 py-2 text-sm font-medium border-l ${
                    sendMode === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  개별
                </button>
              </div>
            </div>

            {/* 대상 상세 UI */}
            <div>
              {sendMode === 'all' && (
                <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  모든 사용자에게 전송됩니다.
                </div>
              )}

              {sendMode === 'project' && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">연구 프로젝트 선택</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">연구 프로젝트 선택</option>
                      {mockProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500 self-end">
                    연구 프로젝트 전체 정보를 불러와 선택하는 기능은 추후 구현됩니다.
                  </div>
                </div>
              )}

              {sendMode === 'individual' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">받는 사람 선택</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setSelectedUserIds(mockUsers.map((u) => u.id))}
                      >
                        전체 선택
                      </button>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setSelectedUserIds([])}
                      >
                        전체 해제
                      </button>
                    </div>
                  </div>

                  {/* 셀렉터로 사용자 추가 */}
                  <div className="mb-2">
                    <select
                      value={userSelectValue}
                      onChange={handleSelectUser}
                      className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">사용자 선택...</option>
                      {mockUsers
                        .filter((u) => !selectedUserIds.includes(u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 선택된 사용자 칩 표시 */}
                  <div>
                    {selectedUserIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUserIds.map((id) => {
                          const u = mockUsers.find((x) => x.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                            >
                              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                                {(u?.name && u.name[0]) || '?'}
                              </span>
                              <span className="text-sm">{u?.name || id}</span>
                              <button
                                type="button"
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-700 hover:text-white hover:bg-blue-600 transition-colors text-[10px] leading-none"
                                onClick={() => setSelectedUserIds((prev) => prev.filter((x) => x !== id))}
                                aria-label="remove-user"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        선택된 사용자가 없습니다. 위 셀렉터에서 추가하세요.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 제목/내용 */}
            <div className="grid gap-3">
              {/* 제목 필드는 요구사항에 따라 제거되었습니다. */}
              <div>
                <label className="block text-sm font-medium text-gray-700">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="메시지 내용을 입력하세요"
                  className="mt-1 w-full border rounded px-3 py-2 h-32 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 액션 */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  // setSubject(''); // 제목 제거됨
                  setContent('');
                  setSelectedProject('');
                  setSelectedUserIds([]);
                  setUserSelectValue('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                초기화
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                보내기
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200 bg-gray-100">
          <div 
            className={`px-6 py-4 cursor-pointer font-medium transition-colors ${
              activeTab === 'inbox' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            받은 메시지
          </div>
          <div 
            className={`px-6 py-4 cursor-pointer font-medium transition-colors ${
              activeTab === 'sent' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            보낸 메시지
          </div>
          <div 
            className={`px-6 py-4 cursor-pointer font-medium transition-colors ${
              activeTab === 'archived' 
                ? 'bg-white border-b-2 border-blue-500 text-blue-500' 
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('archived')}
          >
            보관함
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-700">총 {messages.length}개</div>
          </div>

          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`p-4 border rounded-lg flex justify-between items-center ${msg.read ? 'bg-white' : 'bg-blue-50'}`}>
                <div>
                  <div className="font-semibold text-gray-800">{msg.title}</div>
                  <div className="text-sm text-gray-500">보낸사람: {msg.sender} • {msg.time}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleRead(msg.id)} className="px-3 py-1 border rounded text-sm">
                    {msg.read ? '읽지 않음' : '읽음 처리'}
                  </button>
                  <button onClick={() => deleteMessage(msg.id)} className="px-3 py-1 border rounded text-sm text-red-600">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageManagementPage;