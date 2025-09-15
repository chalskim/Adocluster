/**
 * Tiptap 에디터 설정 패널 컴포넌트
 * .edit 파일의 설정값을 UI로 관리할 수 있는 패널입니다.
 */

import React, { useState } from 'react';
import { useEditorSettings, useEditorTheme, useEditorTypography, useEditorPageLayout } from '../hooks/useEditorSettings';
import type { EditorSettings } from '../utils/editorSettings';

interface EditorSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditorSettingsPanel: React.FC<EditorSettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'typography' | 'theme' | 'layout' | 'advanced'>('typography');
  
  const {
    settings,
    loading,
    error,
    saveSettings,
    resetToDefaults
  } = useEditorSettings();
  
  const {
    typography,
    setFontFamily,
    setFontSize,
    setLineHeight,
    updateTypography
  } = useEditorTypography(false);
  
  const {
    currentMode,
    toggleTheme,
    themeSettings,
    colorSettings,
    updateThemeColors
  } = useEditorTheme(false);
  
  const {
    pageSettings,
    spacingSettings,
    setPageSize,
    setOrientation,
    setMargins,
    updateSpacingSettings
  } = useEditorPageLayout(false);

  const handleSave = async () => {
    try {
      await saveSettings();
      alert('설정이 저장되었습니다!');
    } catch (error) {
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  const handleReset = () => {
    if (confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
      resetToDefaults();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-4/5 max-w-4xl h-4/5 max-h-screen overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            에디터 설정
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              저장
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* 사이드바 탭 */}
          <div className="w-1/4 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
            <nav className="p-4 space-y-2">
              {[
                { id: 'typography', label: '타이포그래피', icon: '🔤' },
                { id: 'theme', label: '테마', icon: '🎨' },
                { id: 'layout', label: '레이아웃', icon: '📄' },
                { id: 'advanced', label: '고급 설정', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-500">설정을 불러오는 중...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                오류: {error}
              </div>
            )}

            {/* 타이포그래피 탭 */}
            {activeTab === 'typography' && typography && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  타이포그래피 설정
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      폰트 패밀리
                    </label>
                    <select
                      value={typography.fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Noto Sans KR, sans-serif">Noto Sans KR</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      폰트 크기
                    </label>
                    <select
                      value={typography.fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      줄간격: {typography.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={typography.lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      텍스트 정렬
                    </label>
                    <select
                      value={typography.textAlign}
                      onChange={(e) => updateTypography({ textAlign: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="left">왼쪽 정렬</option>
                      <option value="center">가운데 정렬</option>
                      <option value="right">오른쪽 정렬</option>
                      <option value="justify">양쪽 정렬</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 테마 탭 */}
            {activeTab === 'theme' && themeSettings && colorSettings && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  테마 설정
                </h3>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    다크 모드
                  </span>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentMode === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentMode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    현재: {currentMode === 'dark' ? '다크' : '라이트'} 모드
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(colorSettings).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{
                          textColor: '텍스트 색상',
                          backgroundColor: '배경 색상',
                          selectionColor: '선택 색상',
                          linkColor: '링크 색상',
                          highlightColor: '하이라이트 색상',
                          borderColor: '테두리 색상'
                        }[key] || key}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateThemeColors({ [key]: e.target.value } as any)}
                          className="w-12 h-8 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateThemeColors({ [key]: e.target.value } as any)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 레이아웃 탭 */}
            {activeTab === 'layout' && pageSettings && spacingSettings && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  페이지 레이아웃
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      페이지 크기
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={pageSettings.width}
                        onChange={(e) => setPageSize(e.target.value, pageSettings.height)}
                        placeholder="너비"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <span className="self-center text-gray-500">×</span>
                      <input
                        type="text"
                        value={pageSettings.height}
                        onChange={(e) => setPageSize(pageSettings.width, e.target.value)}
                        placeholder="높이"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      방향
                    </label>
                    <select
                      value={pageSettings.orientation}
                      onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="portrait">세로</option>
                      <option value="landscape">가로</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    여백 설정
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(pageSettings.margins).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {{
                            top: '상단',
                            bottom: '하단',
                            left: '왼쪽',
                            right: '오른쪽'
                          }[key]}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setMargins({ [key]: e.target.value } as any)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    패딩 설정
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'paddingTop', label: '상단' },
                      { key: 'paddingBottom', label: '하단' },
                      { key: 'paddingLeft', label: '왼쪽' },
                      { key: 'paddingRight', label: '오른쪽' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={spacingSettings[key as keyof typeof spacingSettings]}
                          onChange={(e) => updateSpacingSettings({ [key]: e.target.value } as any)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 고급 설정 탭 */}
            {activeTab === 'advanced' && settings && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  고급 설정
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    현재 설정 정보
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>버전: {settings.editor.version}</div>
                    <div>언어: {settings.metadata.language}</div>
                    <div>테마 모드: {settings.theme.mode}</div>
                    <div>폰트: {settings.typography.fontFamily}</div>
                    <div>줄간격: {settings.typography.lineHeight}</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ 주의사항
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• 설정 변경 후 반드시 저장 버튼을 클릭하세요.</li>
                    <li>• 일부 설정은 페이지 새로고침 후 적용됩니다.</li>
                    <li>• 초기화 시 모든 사용자 설정이 삭제됩니다.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSettingsPanel;