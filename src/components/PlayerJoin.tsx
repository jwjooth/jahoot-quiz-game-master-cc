import { Hash, LogIn, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { getGame, getExistingPlayer } from '../firebase/gameService'; // Import getExistingPlayer
import { auth } from '../firebase/config';

interface PlayerJoinProps {
  onJoin: (pin: string, name: string) => void;
  initialPin?: string;
}

export function PlayerJoin({ onJoin, initialPin = '' }: PlayerJoinProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pin, setPin] = useState(initialPin);
  const [name, setName] = useState('');
  const [step, setStep] = useState<'pin' | 'name'>(initialPin && initialPin.length === 6 ? 'name' : 'pin');

  // Update local state if prop changes
  useEffect(() => {
    if (initialPin && initialPin.length === 6) {
        setPin(initialPin);
        setStep('name');
        checkExistingName(initialPin); // ✅ Cek nama otomatis
    }
  }, [initialPin]);

  // ✅ Helper: Cek apakah user ini sudah punya nama di game ini
  const checkExistingName = async (gamePin: string) => {
    const user = auth.currentUser;
    if (user && gamePin.length === 6) {
        // Cek ke DB
        const existingData = await getExistingPlayer(gamePin, user.uid);
        if (existingData && existingData.name) {
            console.log("Auto-filling name:", existingData.name);
            setName(existingData.name);
        }
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const game = await getGame(pin);
      if (!game) {
        setError('❌ Game not found. Check your PIN.');
        setLoading(false);
        return;
      }
      setStep('name');
      checkExistingName(pin); // ✅ Cek nama saat pindah step
    } catch (err) {
      setError('Error checking game');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(pin, name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {step === 'pin' ? (
          <motion.div
            key="pin-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6"
              >
                <Hash className="w-10 h-10 text-purple-600" />
              </motion.div>
              <h1 className="text-white mb-2">Join Game</h1>
              <p className="text-blue-100 text-xl">Enter the game PIN</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <label htmlFor="pin" className="block text-gray-700 mb-3">
                  Game PIN
                </label>
                <input
                  id="pin"
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-6 py-4 bg-gray-100 rounded-xl text-center text-3xl tracking-widest focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
                  maxLength={6}
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={pin.length !== 6 || loading}
                whileHover={pin.length === 6 ? { scale: 1.05 } : {}}
                whileTap={pin.length === 6 ? { scale: 0.95 } : {}}
                className={`w-full py-4 rounded-2xl shadow-xl transition-all ${pin.length === 6
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <span className="text-xl">{loading ? 'Checking...' : 'Continue'}</span>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="name-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6"
              >
                <User className="w-10 h-10 text-blue-600" />
              </motion.div>
              <h1 className="text-white mb-2">What's your name?</h1>
              <p className="text-blue-100 text-xl">Make it memorable!</p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <label htmlFor="name" className="block text-gray-700 mb-3">
                  Your Nickname
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  placeholder="Enter your name"
                  className="w-full px-6 py-4 bg-gray-100 rounded-xl text-center text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
                  maxLength={20}
                  autoFocus // Fokus di sini
                />
                <p className="text-gray-500 text-sm text-center mt-2">
                  Max 20 characters
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('pin')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-4 bg-white/20 text-white rounded-2xl backdrop-blur"
                >
                  Back
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={!name.trim()}
                  whileHover={name.trim() ? { scale: 1.05 } : {}}
                  whileTap={name.trim() ? { scale: 0.95 } : {}}
                  className={`flex-1 py-4 rounded-2xl shadow-xl transition-all ${name.trim()
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-2xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-6 h-6" />
                    <span className="text-xl">
                        {/* Jika nama sudah terisi (dari DB), tulisannya 'Update & Join' biar user tau */}
                        {name ? 'Join Game' : 'Join Game'}
                    </span>
                  </div>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}