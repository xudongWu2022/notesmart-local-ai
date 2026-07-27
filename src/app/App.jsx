import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from '../shared/components/layout/Layout';
import ErrorBoundary from '../shared/components/ui/ErrorBoundary';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { ThemeProvider } from '../shared/lib/ThemeContext';

// Lazy-loaded route components
const Dashboard = lazy(() => import('./Dashboard'));
const Home = lazy(() => import('./Home'));
const MainView = lazy(() => import('./MainView'));
const Login = lazy(() => import('../features/auth/Login'));
const Notes = lazy(() => import('../features/notes/components/Notes'));
const NoteDetail = lazy(() => import('../features/notes/components/NoteDetail'));
const FolderPage = lazy(() => import('../features/folders/components/FolderPage'));
const TranscriptionPage = lazy(() => import('../features/transcription/components/TranscriptionPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
  </div>
);

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <Notes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes/:noteId"
                  element={
                    <ProtectedRoute>
                      <NoteDetail />
                    </ProtectedRoute>
                  }
                />
                <Route path="/mainview" element={<MainView />} />
                <Route
                  path="/folders/:folderId"
                  element={
                    <ProtectedRoute>
                      <FolderPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/transcription" element={<TranscriptionPage />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
