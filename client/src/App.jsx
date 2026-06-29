import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Common Components
import Navbar from './components/common/Navbar';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import CreateComplaint from './pages/resident/CreateComplaint';
import ComplaintList from './pages/resident/ComplaintList';
import ComplaintDetail from './pages/resident/ComplaintDetail';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTasks from './pages/worker/WorkerTasks';
import WorkerTaskDetail from './pages/worker/WorkerTaskDetail';
import WorkerReviews from './pages/worker/WorkerReviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import ManageWorkers from './pages/admin/ManageWorkers';
import ManageResidents from './pages/admin/ManageResidents';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Resident Protected Routes */}
              <Route
                path="/resident/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <ResidentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resident/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <CreateComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resident/complaints"
                element={
                  <ProtectedRoute allowedRoles={['resident']}>
                    <ComplaintList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resident/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['resident', 'admin']}>
                    <ComplaintDetail />
                  </ProtectedRoute>
                }
              />

              {/* Worker Protected Routes */}
              <Route
                path="/worker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/complaints"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerTaskDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/reviews"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerReviews />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageWorkers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/residents"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageResidents />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
