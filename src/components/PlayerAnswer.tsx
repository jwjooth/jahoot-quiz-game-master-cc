import { doc, onSnapshot } from 'firebase/firestore';
import { Check, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Question } from '../App';
import { db } from '../firebase/config';
import { submitAnswer } from '../firebase/gameService';
import { PlayerIntermesso } from './PlayerIntermesso';

interface PlayerAnswerProps {
  playerId: string;
  gamePin: string;
  gameDocId: string; // Add gameDocId for submitAnswer
  question: Question;
  questionIndex: number;
  timeLimit: number;
  onAnswer: (answerIndex: number, timeLeft: number) => void;
}

const ANSWER_OPTIONS = [
  {
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    shape: '△',
    label: 'Red Triangle'
  },
  {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    shape: '◇',
    label: 'Blue Diamond'
  },
  {
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    shape: '○',
    label: 'Yellow Circle'
  },
  {
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    shape: '□',
    label: 'Green Square'
  },
];


export function PlayerAnswer({ question, gamePin, gameDocId, playerId, timeLimit, questionIndex, onAnswer }: PlayerAnswerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isIntermesso, setIsIntermesso] = useState(false);
  const [intermessoData, setIntermessoData] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswerText: string;
  } | null>(null);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading question...</div>
      </div>
    );
  }

  useEffect(() => {
    setTimeLeft(timeLimit);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setIsIntermesso(false);
    setIntermessoData(null);
  }, [questionIndex, timeLimit]);

  // Monitor game status untuk intermesso
  useEffect(() => {
    const gameRef = doc(db, 'games', gameDocId);
    const unsubscribe = onSnapshot(gameRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      if (data.status === 'intermesso' && data.intermessoStartTime) {
        // Intermesso dimulai
        if (hasAnswered && selectedAnswer !== null) {
          // Hitung apakah jawaban benar
          const isCorrect = selectedAnswer === question.correctAnswer;
          const points = isCorrect
            ? 1000 + Math.round((timeLeft / timeLimit) * 500)
            : 0;

          setIntermessoData({
            isCorrect,
            pointsEarned: points,
            correctAnswerText: question.options[question.correctAnswer],
          });
          setIsIntermesso(true);
        } else if (!hasAnswered) {
          // Player belum jawab, tapi intermesso sudah mulai
          setIntermessoData({
            isCorrect: false,
            pointsEarned: 0,
            correctAnswerText: question.options[question.correctAnswer],
          });
          setIsIntermesso(true);
        }
      }
    });

    return () => unsubscribe();
  }, [gameDocId, hasAnswered, selectedAnswer, question, timeLeft, timeLimit]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const gameRef = doc(db, 'games', gameDocId);

    const unsubscribe = onSnapshot(gameRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const startTime = data?.questionStartTime as number | undefined;
      const duration = data?.questionDuration as number | undefined;
      const serverQuestionIndex = data?.currentQuestionIndex as number | undefined;

      // Timer hanya berjalan jika ini soal yang sekarang dan status playing
      if (startTime && duration && serverQuestionIndex === questionIndex && data.status === 'playing') {
        // Clear interval lama
        if (intervalId) clearInterval(intervalId);

        // Setup interval untuk update timer setiap 100ms
        intervalId = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);

          if (remaining <= 0 && !hasAnswered) {
            clearInterval(intervalId!);
          }
        }, 100);
      } else if (data.status !== 'playing' || serverQuestionIndex !== questionIndex) {
        // Jika soal berubah atau status berubah, clear interval
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      unsubscribe();
    };
  }, [gameDocId, questionIndex, hasAnswered]);

  const handleAnswer = async (index: number) => {
    if (hasAnswered || timeLeft <= 0 || selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setHasAnswered(true);
    setLoading(true);

    try {
      const isCorrect = index === question.correctAnswer;
      const points = isCorrect
        ? 1000 + Math.round((timeLeft / timeLimit) * 500)
        : 0;

      await submitAnswer(
        gameDocId,
        playerId,
        questionIndex,
        index,
        timeLeft,
        isCorrect,
        points
      );

      onAnswer(index, timeLeft);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } finally {
      setLoading(false);
    }
  };

  const progress = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;

  // Tampilkan intermesso jika dimulai
  if (isIntermesso && intermessoData) {
    return (
      <PlayerIntermesso
        isCorrect={intermessoData.isCorrect}
        pointsEarned={intermessoData.pointsEarned}
        correctAnswerText={intermessoData.correctAnswerText}
        playerAnswer={selectedAnswer !== null ? question.options[selectedAnswer] : 'Tidak Menjawab'}
        intermessoDuration={15}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Timer Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <motion.div
          animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl ${timeLeft <= 5 ? 'bg-red-500' : 'bg-white'
            }`}
        >
          <Clock className={`w-8 h-8 ${timeLeft <= 5 ? 'text-white' : 'text-purple-600'}`} />
          <span className={`text-5xl ${timeLeft <= 5 ? 'text-white' : 'text-purple-600'}`}>
            {timeLeft}
          </span>
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-2 bg-white/30 rounded-full mb-8 overflow-hidden"
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-green-400'} rounded-full`}
        />
      </motion.div>

      {/* Answer Buttons */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <h2 className="text-white text-2xl md:text-3xl">
              {selectedAnswer !== null ? 'Answer Submitted!' : 'Choose your answer'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <AnimatePresence>
              {ANSWER_OPTIONS.map((option, index) => {
                const isSelected = selectedAnswer === index;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={selectedAnswer === null ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`relative aspect-square rounded-3xl shadow-2xl transition-all ${option.color
                      } ${selectedAnswer === null ? option.hoverColor : ''
                      } ${isSelected ? 'ring-8 ring-white' : ''
                      } ${selectedAnswer !== null && !isSelected ? 'opacity-40' : ''
                      }`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-white text-8xl md:text-9xl"
                        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {option.shape}
                      </motion.span>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-7 h-7 text-green-500" />
                        </motion.div>
                      )}
                    </div>

                    {/* Ripple effect on selection */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-white rounded-3xl"
                      />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-full shadow-xl">
                <Check className="w-5 h-5" />
                <span className="text-lg">Waiting for other players...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Instructions */}
      {selectedAnswer === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white pb-4"
        >
          <p className="text-sm md:text-base text-blue-100">
            Tap a shape to submit your answer
          </p>
        </motion.div>
      )}
    </div>
  );
}