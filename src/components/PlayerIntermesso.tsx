import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface PlayerIntermessoProps {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswerText: string;
  playerAnswer: string;
  intermessoDuration: number;
}

export function PlayerIntermesso({
  isCorrect,
  pointsEarned,
  correctAnswerText,
  playerAnswer,
  intermessoDuration = 15,
}: PlayerIntermessoProps) {
  const [timeLeft, setTimeLeft] = useState<number>(intermessoDuration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';
  const Icon = isCorrect ? Check : X;

  return (
    <div className={`min-h-screen w-full flex flex-col p-6 ${bgColor}`}>
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className="mb-6"
        >
          <Icon className="w-24 h-24 md:w-32 md:h-32 text-white" strokeWidth={2} />
        </motion.div>

        {/* Main message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black text-white text-center mb-4"
        >
          {isCorrect ? 'Anda Benar!' : 'Anda Salah'}
        </motion.h1>

        {/* Points (if correct) */}
        {isCorrect && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-black text-white"
          >
            +{pointsEarned}
          </motion.p>
        )}

        {/* Answer details (if wrong) */}
        {!isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-sm w-full text-center"
          >
            <p className="text-white/80 text-xs font-semibold mb-1">JAWABAN YANG BENAR</p>
            <p className="text-white text-xl md:text-2xl font-bold">{correctAnswerText}</p>
          </motion.div>
        )}
      </div>

      {/* Timer at bottom - Fixed position */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pb-4"
      >
        <p className="text-white/80 text-sm font-semibold mb-2">Soal berikutnya dalam</p>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-4xl md:text-5xl font-black text-white"
        >
          {timeLeft}
        </motion.span>
      </motion.div>
    </div>
  );
}
