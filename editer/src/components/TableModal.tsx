// src/components/TableModal.tsx
import React, { useState } from 'react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (rows: number, cols: number) => void;
}

const TableModal = ({ isOpen, onClose, onCreateTable }: TableModalProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!isOpen) {
    return null;
  }

  const handleCreate = () => {
    onCreateTable(rows, cols);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>표 만들기</h2>
        <div className="modal-field">
          <label htmlFor="rows">줄 (Rows)</label>
          <input
            type="number"
            id="rows"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value, 10))}
            min="1"
          />
        </div>
        <div className="modal-field">
          <label htmlFor="cols">칸 (Columns)</label>
          <input
            type="number"
            id="cols"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value, 10))}
            min="1"
          />
        </div>
        <div className="modal-actions">
          <button className="modal-button" onClick={handleCreate}>생성</button>
          <button className="modal-button cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default TableModal;