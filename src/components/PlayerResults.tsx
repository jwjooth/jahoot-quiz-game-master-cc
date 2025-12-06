import { Award, Star, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player } from '../types';

interface PlayerResultsProps {
  player: Player;
  players: Player[];
  gamePin: string;
  onNext: () => void;
  currentQuestionIndex: number; // ← Pastikan ini ada
  totalQuestions: number;
  onPlayersUpdate: (updatedPlayers: Player[]) => void;
}

export function PlayerResults({ player, players, gamePin, onNext, currentQuestionIndex, totalQuestions, onPlayersUpdate }: PlayerResultsProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const playerRank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
  const totalPlayers = players.length;

  // Calculate if player moved up or down (mock for demo)
  const previousRank = playerRank; // In real app, track previous rank
  const rankChange = previousRank - playerRank;

  // Determine rank badge
  let rankBadge = null;
  if (playerRank === 1) {
    rankBadge = { icon: Trophy, color: 'from-yellow-400 to-orange-500', label: '1st Place!' };
  } else if (playerRank === 2) {
    rankBadge = { icon: Award, color: 'from-gray-300 to-gray-400', label: '2nd Place!' };
  } else if (playerRank === 3) {
    rankBadge = { icon: Award, color: 'from-amber-600 to-amber-700', label: '3rd Place!' };
  }

  // Auto-advance after 5 seconds
  setTimeout(() => onNext(), 5000);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Rank Badge */}
        {rankBadge && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${rankBadge.color} rounded-full shadow-2xl`}>
              <rankBadge.icon className="w-8 h-8 text-white" />
              <span className="text-white text-2xl">{rankBadge.label}</span>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-2xl mb-6"
        >
          {/* Player Avatar */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <span className="text-white text-5xl">{player.name.charAt(0).toUpperCase()}</span>
          </motion.div>

          <h2 className="text-gray-900 text-center mb-8">{player.name}</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Rank */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <p className="text-purple-600 text-sm">Rank</p>
              </div>
              <p className="text-gray-900 text-3xl">
                {playerRank}
                <span className="text-xl text-gray-500">/{totalPlayers}</span>
              </p>
              {rankChange !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-center gap-1 mt-2 ${rankChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{rankChange > 0 ? '+' : ''}{rankChange}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Total Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-600 text-sm">Total Score</p>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-gray-900 text-3xl"
              >
                {player.score.toLocaleString()}
              </motion.p>
            </motion.div>
          </div>

          {/* Answer Status */}
          {player.lastAnswer !== undefined && (
            <motion.div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${typeof player.lastAnswer === 'number' && player.lastAnswer >= 0 && player.lastAnswer <= 3
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}
            >
              <span>Last Answer: Submitted</span>
            </motion.div>
          )}
        </motion.div>

        {/* Top 3 Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur rounded-2xl p-6"
        >
          <h3 className="text-gray-900 mb-4 text-center">Top 3 Players</h3>
          <div className="space-y-3">
            {sortedPlayers.slice(0, 3).map((p, index) => {
              const isCurrentPlayer = p.id === player.id;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${isCurrentPlayer
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 ring-2 ring-purple-400'
                      : 'bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medals[index]}</span>
                    <span className={`${isCurrentPlayer ? 'text-purple-900' : 'text-gray-900'}`}>
                      {p.name}
                      {isCurrentPlayer && ' (You)'}
                    </span>
                  </div>
                  <span className={`${isCurrentPlayer ? 'text-purple-600' : 'text-gray-600'}`}>
                    {p.score.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Next Question Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-white rounded-full"
              />
            ))}
          </div>
          <p className="text-white mt-2">Next question coming up...</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
