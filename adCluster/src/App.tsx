import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectSetting from './components/ProjectSetting';
import ProjectDetailPage from './components/ProjectDetailPage';
import ReferenceDocumentManagementPage from './components/ReferenceDocumentManagement/ReferenceDocumentManagementPage';
import ImportExportPage from './components/ImportExportPage';
import GeneralSettingsPage from './components/GeneralSettingsPage';
import AdminSettingsPage from './components/AdminSettingsPage';
import ElementEditorPage from './components/ElementEditorPage';
import EditorPage from './components/EditorPage';
import ProtectedRoute from './components/ProtectedRoute';
import useUserActivityTracker from './hooks/useUserActivityTracker';
import './App.css';
import DocumentMnagement from './components/DocumentMnagement';
import VersionCollaborationManagementPage from './components/VersionCollaborationManagementPage';
import CalendarManagementPage from './components/CalendarManagementPage';
import SourceManagement from './components/SourceManagement';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { fetchCurrentUser } from './services/api';
import WebSocketTest from './components/WebSocketTest';
import IconTest from './components/editeComponents/IconTest';
import ResearchNodeManagement from './components/ResearchNodeManagement';
import EnhancedResourceManagementPage from './components/EnhancedResourceManagement/EnhancedResourceManagementPage';
import ReviewFeedbackPage from './components/ReviewFeedbackPage';

function App() {
  // Track user activity
  useUserActivityTracker();
  
  return (
    <WebSocketProvider>
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
              <Route path="project/:projectId" element={<ProjectDetailPage />} />
              <Route path="project-setting" element={<ProjectSetting />} />
              <Route path="search" element={<ReferenceDocumentManagementPage />} />
              <Route path="import-export" element={<ImportExportPage />} />
              <Route path="document-management" element={<DocumentMnagement />} />
              <Route path="source-management" element={<SourceManagement />} />
              <Route path="message-management" element={<VersionCollaborationManagementPage />} />
              <Route path="calendar-management" element={<CalendarManagementPage />} />
              <Route path="general-settings" element={<GeneralSettingsPage />} />
              <Route path="admin-settings" element={<AdminSettingsPage />} />
              <Route path="element-editor" element={<ElementEditorPage />} />
              <Route path="editor" element={<EditorPage />} />
              <Route path="research-node-management" element={<ResearchNodeManagement />} />
              <Route path="enhanced-resource-management" element={<EnhancedResourceManagementPage />} />
              <Route path="websocket-test" element={<WebSocketTest />} />
              <Route path="icon-test" element={<IconTest />} />
              <Route path="review-feedback" element={<ReviewFeedbackPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;