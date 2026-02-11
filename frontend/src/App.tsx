import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import TodoListPage from './pages/TodoListPage';
import TodoNewPage from './pages/TodoNewPage';
import TodoEditPage from './pages/TodoEditPage';
import { getToken } from './services/authService';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TodoListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todos/new"
          element={
            <ProtectedRoute>
              <TodoNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todos/:id/edit"
          element={
            <ProtectedRoute>
              <TodoEditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
