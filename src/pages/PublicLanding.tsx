import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hash, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase/authService';
import { auth } from '../firebase/config';
import { getGame } from '../firebase/gameService';

export default function PublicLanding() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(auth.currentUser);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    setLoading(true);
    setError('');
    
    try {
      const game = await getGame(pin);
      if (!game) {
        setError('Game not found. Check your PIN.');
        setLoading(false);
        return;
      }
      // Navigate to join page with PIN filled
      navigate(`/join/${pin}`);
    } catch (err) {
      setError('Error checking game');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/home');
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ LOGIC PERBAIKAN TOMBOL LOGIN
  // Tampilkan tombol Dashboard JIKA user ada DAN BUKAN Anonymous
  const isHostLoggedIn = user && !user.isAnonymous;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
            <Zap className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">JAHOOT!</h1>
        </motion.div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-2 shadow-2xl overflow-hidden">
          <div className="p-6 pb-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Hash className="w-6 h-6 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Join Game</h2>
              <p className="text-gray-500 text-sm">Enter the PIN to start playing</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Game PIN"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 ${
                    error 
                      ? 'border-red-300 focus:border-red-500 text-red-600' 
                      : 'border-gray-200 focus:border-purple-500 text-gray-800'
                  }`}
                  maxLength={6}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pin.length !== 6 || loading}
                className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  pin.length === 6
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>

          {/* Conditional Footer (Login / Dashboard) */}
          <div className="bg-gray-50 border-t border-gray-100 p-4">
            {!isHostLoggedIn ? (
              // Jika BELUM Login (atau Anonymous): Tampilkan opsi Login
              <>
                <div className="relative py-2 mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-gray-500 font-medium">or host a game</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="w-5 h-5" 
                  />
                  Log in with Google
                </button>
              </>
            ) : (
              // Jika SUDAH Login HOST: Tampilkan tombol ke Dashboard
              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Host Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-white/60 text-xs mt-8">
          &copy; 2025 Jahoot! Quiz Platform. Cloud Computing Project.
        </p>
      </motion.div>
    </div>
  );
}