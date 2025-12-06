import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowRight, Crown, Medal, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Player, Question } from '../types';
import { db } from '../firebase/config';

interface HostLeaderboardProps {
  question?: Question;
  players: Player[];
  gamePin: string;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  onPlayersUpdate: (updatedPlayers: Player[]) => void;
}

export function HostLeaderboard({
  players,
  gamePin,
  onNext,
  question,
  questionNumber,
  totalQuestions,
  onPlayersUpdate
}: HostLeaderboardProps) {
  const [answeredCount, setAnsweredCount] = useState(0);
  const [autoNextTriggered, setAutoNextTriggered] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topPlayers = sortedPlayers.slice(0, 5);

  const RANK_COLORS = [
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-gray-300 to-gray-400',
    'bg-gradient-to-br from-amber-600 to-amber-700',
  ];

  // ✅ FIXED: Monitor player answers for auto-next logic
  useEffect(() => {
    if (!gamePin || questionNumber === undefined) return;

    // ✅ FIXED: Listen to all players and count who answered current question
    const gameRef = doc(db, 'games', gamePin);
    const unsubscribe = onSnapshot(gameRef, (snap) => {
      if (!snap.exists()) return;

      const gameData = snap.data();
      const allPlayers = gameData?.players || [];

      // Count how many players answered the current question
      const answered = allPlayers.filter((p: Player) => {
        return (
          p.answers &&
          Array.isArray(p.answers) &&
          p.answers.some((a: any) => a.questionIndex === questionNumber - 1)
        );
      }).length;

      setAnsweredCount(answered);

      // ✅ Auto-next when >80% of players answered
      const threshold = Math.ceil(allPlayers.length * 0.8);
      if (answered >= threshold && !autoNextTriggered) {
        console.log(`✅ ${answered}/${allPlayers.length} players answered. Auto-triggering next...`);
        setAutoNextTriggered(true);
        setTimeout(() => {
          onNext();
        }, 1000); // 1 second delay to show the result
      }
    });

    return () => {
      unsubscribe();
      setAutoNextTriggered(false);
    };
  }, [gamePin, questionNumber, onNext, autoNextTriggered]);

  // ✅ Reset auto-next flag when question changes
  useEffect(() => {
    setAutoNextTriggered(false);
    setAnsweredCount(0);
  }, [questionNumber]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* ==================== HEADER ==================== */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Trophy className="w-8 h-8 text-yellow-900" />
            </motion.div>
            <h1 className="text-white text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-blue-100 text-xl">
            After Question {questionNumber} of {totalQuestions}
          </p>
        </motion.div>

        {/* ==================== ANSWER STATUS ==================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 text-white text-center"
        >
          <div className="text-lg font-semibold">
            📊 {answeredCount} / {players.length} players answered
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-2">
            <motion.div
              animate={{ width: `${(answeredCount / players.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-green-400 rounded-full"
            />
          </div>
          {answeredCount / players.length > 0.8 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mt-2 text-yellow-300 font-semibold"
            >
              ⏭️ Auto-advancing soon... ({Math.ceil(players.length * 0.8)} / {players.length} reached)
            </motion.p>
          )}
        </motion.div>

        {/* ==================== LEADERBOARD TABLE ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl mb-8"
        >
          <div className="space-y-4">
            {topPlayers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-500 text-lg">No players yet...</p>
              </motion.div>
            ) : (
              topPlayers.map((player, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isTopThree
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 ring-2 ring-purple-200'
                        : 'bg-gray-50'
                      }`}
                  >
                    {/* ==================== RANK BADGE ==================== */}
                    <div className="relative">
                      {isTopThree ? (
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          className={`w-14 h-14 ${RANK_COLORS[index]} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          {rank === 1 && <Crown className="w-7 h-7 text-white" />}
                          {rank === 2 && <Medal className="w-7 h-7 text-white" />}
                          {rank === 3 && <Medal className="w-6 h-6 text-white" />}
                        </motion.div>
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-gray-600 text-xl font-bold">{rank}</span>
                        </div>
                      )}
                    </div>

                    {/* ==================== PLAYER INFO ==================== */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`truncate text-lg font-semibold ${isTopThree ? 'text-purple-900' : 'text-gray-900'
                          }`}
                      >
                        {player.name}
                      </h3>
                      {player.lastAnswer !== undefined && question && (
                        <p className="text-sm text-gray-500">
                          Last answer:{' '}
                          {player.lastAnswer === question.correctAnswer ? (
                            <span className="text-green-600 font-semibold">✓ Correct</span>
                          ) : (
                            <span className="text-red-600 font-semibold">✗ Wrong</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* ==================== SCORE ==================== */}
                    <div className="text-right">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                        className={`px-4 py-2 rounded-xl ${isTopThree ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`text-xl font-bold ${isTopThree ? 'text-white' : 'text-gray-700'
                            }`}
                        >
                          {player.score.toLocaleString()}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {players.length > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center text-gray-500"
            >
              +{players.length - 5} more player{players.length - 5 !== 1 ? 's' : ''}
            </motion.div>
          )}
        </motion.div>

        {/* ==================== NEXT BUTTON ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAutoNextTriggered(false);
              onNext();
            }}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold text-lg"
          >
            <span>
              {questionNumber < totalQuestions
                ? 'Next Question'
                : 'View Final Results'}
            </span>
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}