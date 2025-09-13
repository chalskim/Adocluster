import React from 'react';

const DocumentMnagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">문서 관리</h1>
        <p className="text-gray-500 mt-1">프로젝트 문서를 조회하고 관리합니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="문서 제목, 내용, 태그 검색..."
                className="pl-9 pr-3 py-2 w-72 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-md px-2 py-2 text-sm">
              <option>전체 프로젝트</option>
              <option>내 프로젝트</option>
            </select>
            <select className="border rounded-md px-2 py-2 text-sm">
              <option>정렬: 최신순</option>
              <option>정렬: 가나다순</option>
            </select>
          </div>
          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
            새 문서 만들기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((id) => (
            <div key={id} className="border rounded-lg p-4 hover:shadow transition bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate">샘플 문서 제목 {id}</h3>
                <span className="text-xs text-gray-400">2025-09-13</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                이곳은 문서 설명 프리뷰 영역입니다. 실제 구현에서는 문서의 요약 내용이나 최근 편집 내용을 보여줄 수 있습니다.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <i className="fas fa-folder text-gray-400"></i>
                  <span>프로젝트 A</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    열기
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">
                    더보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentMnagement;