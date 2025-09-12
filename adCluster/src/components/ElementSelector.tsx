import React, { useState, useEffect, useRef } from 'react';

export interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  content: string; // 요소의 내용 (HTML 포함)
  attributes: { [key: string]: string };
  styles: { [key: string]: string };
}

interface ElementSelectorProps {
  onElementSelect?: (elementInfo: ElementInfo) => void;
  isActive: boolean;
}

const ElementSelector: React.FC<ElementSelectorProps> = ({ onElementSelect, isActive }) => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedInfo, setEditedInfo] = useState<ElementInfo | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // 요소 선택 모드 활성화/비활성화 처리
  useEffect(() => {
    if (isActive) {
      document.body.style.cursor = 'crosshair';
      document.addEventListener('mouseover', handleMouseOver, true);
      document.addEventListener('mouseout', handleMouseOut, true);
      document.addEventListener('click', handleElementClick, true);
    } else {
      document.body.style.cursor = 'default';
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleElementClick, true);
      setHoveredElement(null);
    }
    
    return () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleElementClick, true);
    };
  }, [isActive]);
  
  // 요소 위에 마우스 올렸을 때 처리
  const handleMouseOver = (e: MouseEvent) => {
    if (!isActive) return;
    
    e.stopPropagation();
    const target = e.target as HTMLElement;
    
    // 자기 자신이나 편집 패널은 선택하지 않음
    if (target === overlayRef.current || overlayRef.current?.contains(target)) {
      return;
    }
    
    setHoveredElement(target);
    
    // 호버 효과 적용
    const originalOutline = target.style.outline;
    const originalOutlineOffset = target.style.outlineOffset;
    
    target.style.outline = '2px dashed #3498db';
    target.style.outlineOffset = '1px';
    
    // 원래 스타일로 복원하기 위한 데이터 저장
    target.dataset.originalOutline = originalOutline;
    target.dataset.originalOutlineOffset = originalOutlineOffset;
  };
  
  // 요소에서 마우스 나갔을 때 처리
  const handleMouseOut = (e: MouseEvent) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    
    // 호버 효과 제거
    if (target.dataset.originalOutline !== undefined) {
      target.style.outline = target.dataset.originalOutline;
      target.style.outlineOffset = target.dataset.originalOutlineOffset || '';
      delete target.dataset.originalOutline;
      delete target.dataset.originalOutlineOffset;
    }
    
    setHoveredElement(null);
  };
  
  // 요소 클릭 시 처리
  const handleElementClick = (e: MouseEvent) => {
    if (!isActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // 자기 자신이나 편집 패널은 선택하지 않음
    if (target === overlayRef.current || overlayRef.current?.contains(target)) {
      return;
    }
    
    // 요소 정보 추출
    const elementInfo = extractElementInfo(target);
    setSelectedElement(elementInfo);
    setEditedInfo(elementInfo);
    setIsEditing(true);
    
    // 콜백 호출
    if (onElementSelect) {
      onElementSelect(elementInfo);
    }
  };
  
  // 요소 정보 추출 함수
  const extractElementInfo = (element: HTMLElement): ElementInfo => {
    // 스타일 정보 추출
    const computedStyle = window.getComputedStyle(element);
    const styles: { [key: string]: string } = {};
    
    // 중요 스타일 속성만 추출
    ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'padding', 'margin', 'border', 'borderRadius', 'width', 'height', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap'].forEach(prop => {
      styles[prop] = computedStyle.getPropertyValue(prop);
    });
    
    // 속성 정보 추출
    const attributes: { [key: string]: string } = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      textContent: element.textContent || '',
      content: element.innerHTML || '',
      attributes,
      styles
    };
  };
  
  // 수정된 정보// 변경 사항 적용
  const applyChanges = () => {
    if (!hoveredElement || !editedInfo) return;
    
    // HTML 내용 변경 (우선 적용)
    if (hoveredElement.innerHTML !== editedInfo.content) {
      hoveredElement.innerHTML = editedInfo.content;
      // innerHTML을 변경하면 textContent도 변경되므로 textContent 변경 로직은 건너뜀
      return;
    }
    
    // 텍스트 내용 변경 (HTML 내용이 변경되지 않은 경우에만 적용)
    if (hoveredElement.textContent !== editedInfo.textContent) {
      hoveredElement.textContent = editedInfo.textContent;
    }
    
    // 클래스 변경
    if (hoveredElement.className !== editedInfo.className) {
      hoveredElement.className = editedInfo.className;
    }
    
    // ID 변경
    if (hoveredElement.id !== editedInfo.id) {
      hoveredElement.id = editedInfo.id;
    }
    
    // 스타일 변경
    Object.entries(editedInfo.styles).forEach(([prop, value]) => {
      if (value) {
        (hoveredElement.style as any)[prop] = value;
      }
    });
    
    setIsEditing(false);
    setSelectedElement(null);
    setHoveredElement(null);
  };
  
  // 편집 취소
  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedElement(null);
  };
  
  // 스타일 속성 변경 핸들러
  const handleStyleChange = (property: string, value: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      styles: {
        ...editedInfo.styles,
        [property]: value
      }
    });
  };
  
  // 텍스트 내용 변경 핸들러
  const handleTextChange = (value: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      textContent: value
    });
  };
  
  // HTML 내용 변경 핸들러
  const handleContentChange = (value: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      content: value
    });
  };
  
  // 클래스 변경 핸들러
  const handleClassChange = (value: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      className: value
    });
  };
  
  // ID 변경 핸들러
  const handleIdChange = (value: string) => {
    if (!editedInfo) return;
    
    setEditedInfo({
      ...editedInfo,
      id: value
    });
  };
  
  return (
    <div ref={overlayRef} className="element-selector">
      {isEditing && editedInfo && (
        <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
          <h3 className="text-lg font-semibold mb-3">요소 편집</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
              {editedInfo.tagName}
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedInfo.id}
              onChange={(e) => handleIdChange(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">클래스</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedInfo.className}
              onChange={(e) => handleClassChange(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">텍스트</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedInfo.textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML 내용</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedInfo.content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">스타일</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(editedInfo.styles).map(([prop, value]) => (
                <div key={prop} className="flex items-center">
                  <span className="w-1/3 text-sm">{prop}:</span>
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={value}
                    onChange={(e) => handleStyleChange(prop, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={cancelEditing}
            >
              취소
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={applyChanges}
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementSelector;