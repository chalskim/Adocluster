import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectSetting from './components/ProjectSetting';
import SearchPage from './components/SearchPage';
import ImportExportPage from './components/ImportExportPage';
import GeneralSettingsPage from './components/GeneralSettingsPage';
import AdminSettingsPage from './components/AdminSettingsPage';
import ElementEditorPage from './components/ElementEditorPage';
import EditorPage from './components/EditorPage';
import ProtectedRoute from './components/ProtectedRoute';
import useUserActivityTracker from './hooks/useUserActivityTracker';
import './App.css';
import DocumentMnagement from './components/DocumentMnagement';
import MessageManagementPage from './components/MessageManagementPage';

function App() {
  // Track user activity
  useUserActivityTracker();
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project-setting" element={<ProjectSetting />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
            <Route path="document-management" element={<DocumentMnagement />} />
            <Route path="message-management" element={<MessageManagementPage />} />
            <Route path="general-settings" element={<GeneralSettingsPage />} />
            <Route path="admin-settings" element={<AdminSettingsPage />} />
            <Route path="element-editor" element={<ElementEditorPage />} />
            <Route path="editor" element={<EditorPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;