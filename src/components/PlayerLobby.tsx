// src/components/PlayerLobby.tsx
import { motion } from 'framer-motion';
import { Users, Wifi } from 'lucide-react';

interface PlayerLobbyProps {
  gamePin: string;
  playerName: string;
  // HAPUS onGameStart! Player tidak boleh start sendiri!
}

export function PlayerLobby({ gamePin, playerName }: PlayerLobbyProps) {
  // HAPUS SEMUA useEffect setTimeout! Player harus nunggu host!

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center"
      >
        {/* Connection Status */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full mb-8 shadow-xl"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <Wifi className="w-5 h-5" />
          <span>Connected</span>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <span className="text-white text-5xl">{playerName.charAt(0).toUpperCase()}</span>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {playerName}!</h2>
          <p className="text-gray-600 mb-6">
            You're in game: <span className="text-purple-600 font-bold">{gamePin}</span>
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-full">
            <Users className="w-5 h-5" />
            <span>Waiting for host to start...</span>
          </div>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-4 h-4 bg-white rounded-full shadow-lg"
            />
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.div className="text-center text-white">
          <p className="text-xl font-medium">Game will start soon...</p>
          <p className="text-blue-200 text-sm mt-2">Get ready! Your host is preparing the quiz</p>
        </motion.div>

        {/* Background Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full -z-10 blur-3xl"
        />
      </motion.div>
    </div>
  );
}