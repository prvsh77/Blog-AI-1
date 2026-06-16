import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddBlog from './pages/admin/AddBlog';
import ListBlog from './pages/admin/ListBlog';
import Comments from './pages/admin/Comments';
import Login from './components/admin/Login';
import 'quill/dist/quill.snow.css';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';

// PrivateRoute component: protects specific routes
const PrivateRoute = ({ children }) => {
  const { token } = useAppContext();
  return token ? children : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <div className="relative min-h-screen overflow-hidden app-bg">
      <Toaster />

      {/* Animated Liquid Background Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Blob 1 */}
        <div className="liquid-blob-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-400/28 blur-[120px]"></div>
        {/* Blob 2 */}
        <div className="liquid-blob-2 absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-pink-400/28 blur-[100px]"></div>
        {/* Blob 3 */}
        <div className="liquid-blob-3 absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-orange-400/28 blur-[130px]"></div>
      </div>

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<Blog />} />

          {/* Login page */}
          <Route path="/admin/login" element={<Login />} />

          {/* All admin routes use the same Layout (with Sidebar always visible) */}
          <Route path="/admin" element={<Layout />}>
            {/* Public route - anyone can access */}
            <Route path="addBlog" element={<AddBlog />} />

            {/* Protected routes - require login */}
            <Route
              index
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="listBlog"
              element={
                <PrivateRoute>
                  <ListBlog />
                </PrivateRoute>
              }
            />
            <Route
              path="comments"
              element={
                <PrivateRoute>
                  <Comments />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Optional: Catch-all redirect for unknown admin routes */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;