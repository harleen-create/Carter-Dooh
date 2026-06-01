import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateSchedule from './pages/CreateSchedule';
import EditSchedule from './pages/EditSchedule';
import ApprovalDetail from './pages/ApprovalDetail';
import ApprovalsList from './pages/ApprovalsList';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-schedule" element={<CreateSchedule />} />
        <Route path="/edit-schedule" element={<EditSchedule />} />
        <Route path="/approvals" element={<ApprovalsList />} />
        <Route path="/approvals/:id" element={<ApprovalDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
