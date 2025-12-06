import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Star, RotateCcw } from 'lucide-react';
import type { Player } from '../types';

interface HostPodiumProps {
  players: Player[];
  onPlayAgain: () => void;
}

export function HostPodium({ players, onPlayAgain }: HostPodiumProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const runnerUp = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-6xl"
      >
        {/* Confetti Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{ 
                y: window.innerHeight + 100, 
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
              className={`absolute w-3 h-3 ${
                ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
              }`}
              style={{ 
                left: `${Math.random() * 100}%`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Trophy className="w-20 h-20 text-yellow-300" />
          </motion.div>
          <h1 className="text-white mb-2">Game Over!</h1>
          <p className="text-blue-100 text-2xl">Congratulations to all players!</p>
        </motion.div>

        {/* Podium */}
        <div className="relative mb-12">
          <div className="flex items-end justify-center gap-4 md:gap-8">
            {/* 2nd Place */}
            {runnerUp && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-white">
                    <Medal className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </motion.div>
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-3xl px-6 md:px-10 py-6 md:py-8 w-32 md:w-40 text-center shadow-xl">
                  <div className="bg-white rounded-2xl px-3 py-1 mb-3 inline-block">
                    <span className="text-gray-700 text-sm">2nd</span>
                  </div>
                  <h3 className="text-white mb-2 text-sm md:text-base truncate">{runnerUp.name}</h3>
                  <p className="text-white/90 text-xl md:text-2xl">{runnerUp.score.toLocaleString()}</p>
                  <p className="text-white/70 text-xs">points</p>
                </div>
                <div className="w-full h-12 md:h-16 bg-gradient-to-b from-gray-400 to-gray-500" />
              </motion.div>
            )}

            {/* 1st Place */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white">
                      <Crown className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-4 -right-4"
                    >
                      <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                  </div>
                </motion.div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-t-3xl px-8 md:px-12 py-8 md:py-10 w-40 md:w-48 text-center shadow-2xl">
                  <div className="bg-white rounded-2xl px-4 py-1 mb-3 inline-block">
                    <span className="text-yellow-700">WINNER</span>
                  </div>
                  <h3 className="text-white mb-2 truncate">{winner.name}</h3>
                  <p className="text-white/90 text-3xl md:text-4xl">{winner.score.toLocaleString()}</p>
                  <p className="text-white/80 text-sm">points</p>
                </div>
                <div className="w-full h-20 md:h-24 bg-gradient-to-b from-orange-500 to-orange-600" />
              </motion.div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  className="mb-4"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-white">
                    <Medal className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </motion.div>
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-t-3xl px-6 md:px-10 py-6 md:py-8 w-32 md:w-40 text-center shadow-xl">
                  <div className="bg-white rounded-2xl px-3 py-1 mb-3 inline-block">
                    <span className="text-amber-700 text-sm">3rd</span>
                  </div>
                  <h3 className="text-white mb-2 text-sm md:text-base truncate">{thirdPlace.name}</h3>
                  <p className="text-white/90 text-xl md:text-2xl">{thirdPlace.score.toLocaleString()}</p>
                  <p className="text-white/70 text-xs">points</p>
                </div>
                <div className="w-full h-8 md:h-12 bg-gradient-to-b from-amber-700 to-amber-800" />
              </motion.div>
            )}
          </div>
        </div>

        {/* All Players List */}
        {players.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/90 backdrop-blur rounded-3xl p-6 md:p-8 max-w-2xl mx-auto mb-8"
          >
            <h3 className="text-gray-900 mb-4 text-center">All Players</h3>
            <div className="space-y-2">
              {sortedPlayers.slice(3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-8">{index + 4}.</span>
                    <span className="text-gray-900">{player.name}</span>
                  </div>
                  <span className="text-purple-600">{player.score.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Play Again Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            <RotateCcw className="w-6 h-6" />
            <span className="text-xl">Play Again</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
