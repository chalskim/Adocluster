// src/components/GraphModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import functionPlot from 'function-plot';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertGraph: (imageDataUrl: string) => void;
}

const GraphModal = ({ isOpen, onClose, onInsertGraph }: GraphModalProps) => {
  const [funcString, setFuncString] = useState('x^2');
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');
  const [yMin, setYMin] = useState('-10');
  const [yMax, setYMax] = useState('10');
  const [error, setError] = useState('');
  const graphPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && graphPreviewRef.current) {
      try {
        graphPreviewRef.current.innerHTML = ''; // 이전 그래프 초기화
        
        functionPlot({
          target: graphPreviewRef.current,
          width: 350,
          height: 250,
          grid: true,
          xAxis: { domain: [Number(xMin), Number(xMax)] },
          yAxis: { domain: [Number(yMin), Number(yMax)] },
          data: [{ fn: funcString }]
        });
        setError('');
      } catch (e) {
        setError('유효하지 않은 함수식 또는 범위입니다.');
        console.error(e);
      }
    }
  }, [isOpen, funcString, xMin, xMax, yMin, yMax]);

  if (!isOpen) {
    return null;
  }

  const handleInsert = () => {
    const svgElement = graphPreviewRef.current?.querySelector('svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const imageDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      onInsertGraph(imageDataUrl);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>그래프 삽입</h2>
        <div className="modal-field">
          <label htmlFor="func">함수 f(x):</label>
          <input type="text" id="func" value={funcString} onChange={(e) => setFuncString(e.target.value)} placeholder="예: sin(x)" />
        </div>

        {/* --- [수정] X축과 Y축 입력 필드를 별도의 div로 분리 --- */}
        <div className="graph-domain-inputs">
          <div className="modal-field">
            <label htmlFor="xMin">X 최소값:</label>
            <input type="number" id="xMin" value={xMin} onChange={(e) => setXMin(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="xMax">X 최대값:</label>
            <input type="number" id="xMax" value={xMax} onChange={(e) => setXMax(e.target.value)} />
          </div>
        </div>
        <div className="graph-domain-inputs">
          <div className="modal-field">
            <label htmlFor="yMin">Y 최소값:</label>
            <input type="number" id="yMin" value={yMin} onChange={(e) => setYMin(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="yMax">Y 최대값:</label>
            <input type="number" id="yMax" value={yMax} onChange={(e) => setYMax(e.target.value)} />
          </div>
        </div>
        {/* --- 여기까지 수정 --- */}

        <div className="graph-preview-container" ref={graphPreviewRef} />
        {error && <p className="graph-error-message">{error}</p>}
        <div className="modal-actions">
          <button className="modal-button" onClick={handleInsert}>삽입</button>
          <button className="modal-button cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default GraphModal;