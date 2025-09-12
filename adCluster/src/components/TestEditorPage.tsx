import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestEditorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToEditor = () => {
    // Navigate to the editor page
    navigate('/editor');
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Test Editor Page Navigation</h1>
      <p className="mb-4">Click the button below to navigate to the editor page and test if the parent sidebar is hidden.</p>
      <button
        onClick={handleNavigateToEditor}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
      >
        Go to Editor Page
      </button>
    </div>
  );
};

export default TestEditorPage;