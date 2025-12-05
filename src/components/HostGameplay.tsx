import { doc, onSnapshot } from 'firebase/firestore';
import { Clock, Check, BarChart } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Question, Player } from '../types'; // Import from types
import { db } from '../firebase/config';
import { startIntermesso } from '../firebase/gameService';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface HostGameplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  gamePin: string;
  gameDocId: string; // Add gameDocId for startIntermesso function
  players: Player[]; // Need players data for stats
  onTimeUp: () => void; // Trigger to move to Intermission
}

const ANSWER_COLORS = [
  '#ef4444', // Red-500
  '#3b82f6', // Blue-500
  '#eab308', // Yellow-500
  '#22c55e', // Green-500
];

const ANSWER_LABELS = ['▲', '◆', '○', '□'];

export function HostGameplay({
  question,
  questionNumber,
  totalQuestions,
  gamePin,
  gameDocId,
  players,
  onTimeUp
}: HostGameplayProps) {
  // ✅ ADD MISSING STATE VARIABLES
  const [timeLeft, setTimeLeft] = useState<number>(question.time);
  const [showResults, setShowResults] = useState(false);
  const [answerStats, setAnswerStats] = useState<{ name: string; count: number; color: string }[]>([]);

  useEffect(() => {
    // Reset state per question
    setShowResults(false);
    setTimeLeft(question.time);
  }, [questionNumber]);

  // 1. Timer Logic (Client-side sync)
  useEffect(() => {
    // Find current game document to get startTime
    const gameRef = doc(db, 'games', gamePin); // NOTE: This assumes gamePin is DocID in previous logic, 
                                               // BUT we changed it to be separate. 
                                               // However, HostPage passes 'gamePin' which is actually 'pin'.
                                               // We should use subscribeToGame in HostPage and pass startTime as prop to avoid read here.
                                               // FOR NOW: Let's rely on props or simple local countdown triggered by parent mount
                                               // because HostPage re-mounts this component on status change.
                                               
    // BETTER APPROACH: Parent passes 'startTime'. But to keep changes minimal:
    // Let's assume this component mounts exactly when question starts.
    
    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                clearInterval(timer);
                handleTimeUp();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [question]);

  const handleTimeUp = async () => {
    setShowResults(true);
    calculateStats();
    
    // Tunggu 2 detik kemudian trigger intermesso di Firestore
    setTimeout(async () => {
      try {
        await startIntermesso(gamePin, 15); // 15 detik intermesso
        onTimeUp();
      } catch (error) {
        console.error("Error starting intermesso:", error);
        onTimeUp();
      }
    }, 2000);
  };

  const calculateStats = () => {
    const stats = [0, 0, 0, 0];
    players.forEach(p => {
        const lastAns = p.answers.find(a => a.questionIndex === questionNumber - 1);
        if (lastAns) {
            stats[lastAns.answerIndex]++;
        }
    });

    setAnswerStats(stats.map((count, idx) => ({
        name: ANSWER_LABELS[idx],
        count: count,
        color: ANSWER_COLORS[idx]
    })));
  };

  const progress = (timeLeft / question.time) * 100;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg">
          <span className="text-purple-600 font-bold text-xl">
            {questionNumber} / {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg">
           <Clock className="w-6 h-6 text-purple-600" />
           <span className="text-3xl font-bold text-purple-600">{timeLeft}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 text-center min-h-[200px] flex items-center justify-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Content Area: Answers OR Bar Chart */}
      <div className="flex-1 relative">
        {!showResults ? (
          // SHOW ANSWER OPTIONS
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {question.options.map((opt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-2xl p-8 flex items-center gap-6 shadow-xl transition-transform hover:scale-[1.01]`}
                style={{ backgroundColor: ANSWER_COLORS[idx] }} // Using style for dynamic colors
              >
                 <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {ANSWER_LABELS[idx]}
                 </div>
                 <span className="text-white text-2xl md:text-3xl font-bold">{opt}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          // SHOW BAR CHART RESULTS
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur rounded-3xl p-8 h-full shadow-2xl flex flex-col"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                <BarChart className="w-6 h-6" />
                Answer Distribution
            </h3>
            
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={answerStats}>
                        <XAxis dataKey="name" tick={{fontSize: 20, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                            {answerStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} opacity={index === question.correctAnswer ? 1 : 0.3} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>

            {/* Correct Answer Indicator */}
            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-2xl flex items-center justify-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Check className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-green-700 uppercase font-bold tracking-wider">Correct Answer</p>
                    <p className="text-xl font-bold text-green-900">{question.options[question.correctAnswer]}</p>
                </div>
            </div>

          </motion.div>
        )}
      </div>

      {/* Progress Bar (Timer Visual) */}
      {!showResults && (
        <div className="w-full h-4 bg-white/20 rounded-full mt-8 overflow-hidden">
            <motion.div 
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
                className="h-full bg-yellow-400"
            />
        </div>
      )}
    </div>
  );
}