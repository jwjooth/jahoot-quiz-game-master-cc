import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Question, Player } from '../types';
import { Check } from 'lucide-react';

interface HostIntermessoProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  players: Player[];
  intermessoStartTime: number;
  intermessoDuration: number;
  onIntermessoEnd: () => void;
}

const ANSWER_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']; // Red, Blue, Yellow, Green (Kahoot colors)
const ANSWER_SHAPES = ['▲', '◆', '●', '■'];

export function HostIntermesso({
  question,
  questionNumber,
  totalQuestions,
  players,
  intermessoStartTime,
  intermessoDuration = 15,
  onIntermessoEnd,
}: HostIntermessoProps) {
  const [timeLeft, setTimeLeft] = useState<number>(intermessoDuration);
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0]);

  // Hitung statistik jawaban
  useEffect(() => {
    const stats = [0, 0, 0, 0];
    players.forEach((p) => {
      const lastAns = p.answers.find((a) => a.questionIndex === questionNumber - 1);
      if (lastAns !== undefined && lastAns.answerIndex >= 0 && lastAns.answerIndex <= 3) {
        stats[lastAns.answerIndex]++;
      }
    });
    setAnswerStats(stats);
  }, [players, questionNumber]);

  // Timer untuk intermesso
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onIntermessoEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onIntermessoEnd]);

  const maxAnswers = Math.max(...answerStats, 1); // Minimum 1 untuk avoid division by 0

  return (
    <div className="min-h-screen flex flex-col bg-[#46178f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-white font-bold text-lg">
            {questionNumber} / {totalQuestions}
          </span>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
          Next
        </button>
      </div>

      {/* Question */}
      <div className="px-6 mb-4">
        <div className="bg-white rounded-lg p-6 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {question.questionText}
          </h2>
        </div>
      </div>

      {/* Bar Chart Section - Kahoot Style */}
      <div className="flex-1 px-6 flex items-end justify-center pb-4">
        <div className="w-full max-w-4xl flex items-end justify-center gap-4 h-64">
          {answerStats.map((count, idx) => {
            const heightPercent = maxAnswers > 0 ? (count / maxAnswers) * 100 : 0;
            const isCorrect = idx === question.correctAnswer;
            
            return (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPercent, 10)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex-1 flex flex-col items-center"
              >
                {/* Checkmark for correct answer */}
                {isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-red-500 mb-1"
                  >
                    <Check className="w-8 h-8" strokeWidth={3} style={{ color: ANSWER_COLORS[idx] }} />
                  </motion.div>
                )}
                
                {/* Count number */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-2xl md:text-3xl font-bold mb-2"
                  style={{ color: ANSWER_COLORS[idx] }}
                >
                  {count}
                </motion.span>
                
                {/* Bar */}
                <div
                  className="w-full rounded-t-lg flex items-end justify-center relative"
                  style={{ 
                    backgroundColor: ANSWER_COLORS[idx],
                    height: '100%',
                    minHeight: '40px'
                  }}
                >
                  {/* Shape icon at bottom of bar */}
                  <span className="absolute bottom-2 text-white text-2xl">
                    {ANSWER_SHAPES[idx]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Answer Options - Bottom Section */}
      <div className="grid grid-cols-2 gap-2 p-2">
        {question.options.map((option, idx) => {
          const isCorrect = idx === question.correctAnswer;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${isCorrect ? 'ring-4 ring-white' : ''}`}
              style={{ backgroundColor: ANSWER_COLORS[idx] }}
            >
              <span className="text-white text-2xl">{ANSWER_SHAPES[idx]}</span>
              <span className="text-white font-bold text-lg flex-1">{option}</span>
              {isCorrect && (
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Timer bar at bottom */}
      <div className="px-2 pb-2">
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / intermessoDuration) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
        <p className="text-white/80 text-center text-sm mt-2">
          Soal berikutnya dalam {timeLeft} detik
        </p>
      </div>
    </div>
  );
}
