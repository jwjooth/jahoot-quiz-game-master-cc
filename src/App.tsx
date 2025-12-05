import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import PublicLanding from './pages/PublicLanding';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';
import QuizDetailPage from './pages/QuizDetailPage';

// ✅ Tipe Protected Route yang lebih canggih
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: ('host' | 'player')[] }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-purple-600 flex items-center justify-center text-white">Loading auth...</div>;
  
  // 1. Belum Login sama sekali
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Cek Role
  // isAnonymous = true  -> Player
  // isAnonymous = false -> Host (Google Auth)
  const isHost = !user.isAnonymous;
  const isPlayer = user.isAnonymous;

  if (allowedRoles.includes('host') && !isHost) {
    // Player mencoba akses halaman Host -> Tendang ke index (atau halaman player)
    return <Navigate to="/" replace />;
  }

  // Opsional: Jika Host mencoba akses halaman khusus player, biarkan saja (Host boleh test main)
  
  return <>{children}</>;
};

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 font-sans">
      <Routes>
        {/* Public Landing (Join & Login) */}
        <Route path="/" element={<PublicLanding />} />

        {/* HOST ROUTES (Only Google Auth) */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <QuizDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/host" 
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/host/:pin" 
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostPage />
            </ProtectedRoute>
          } 
        />

        {/* PLAYER ROUTES (Public / Anonymous) */}
        {/* Tidak perlu diprotect ketat, karena PlayerPage akan handle login anonim sendiri */}
        <Route path="/join/:pin" element={<PlayerPage />} />
        <Route path="/play/:pin" element={<PlayerPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}