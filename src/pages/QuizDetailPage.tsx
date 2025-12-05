import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, CheckCircle, Trash2, Edit, HelpCircle } from 'lucide-react';
import { getQuizById, createGame, checkActiveGame } from '../firebase/gameService'; 
import { Quiz, GameData } from '../types'; // Import GameData juga
import { auth } from '../firebase/config';

export default function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (quizId) {
      getQuizById(quizId)
        .then(data => {
          setQuiz(data as Quiz);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [quizId]);

  const handleHostGame = async () => {
    if (!quiz) return;

    const user = auth.currentUser;
    if (!user) {
        alert("Please login first.");
        return;
    }

    setCreating(true);
    try {
        // 1. Cek apakah host sudah punya game aktif
        // Kita beri tipe 'any' sementara atau 'GameData' jika return valuenya konsisten
        const activeGame: any = await checkActiveGame(user.uid);
        
        if (activeGame && activeGame.pin) { // Pastikan cek properti pin
            // Jika ada, konfirmasi untuk rejoin
            const shouldRejoin = window.confirm(
                `You have an active game running (PIN: ${activeGame.pin}). \nDo you want to rejoin it instead of creating a new one?`
            );

            if (shouldRejoin) {
                navigate(`/host/${activeGame.pin}`);
                return;
            } else {
                // Jika user pilih Cancel (ingin buat baru)
                // Peringatkan lagi atau izinkan override (tergantung kebijakan app)
                // Di sini kita izinkan override tapi beri peringatan
                const forceNew = window.confirm("Starting a new game will finish the previous one. Continue?");
                if (!forceNew) {
                    setCreating(false);
                    return;
                }
            }
        }

        // 2. Buat baru (createGame akan handle override jika ada tabrakan PIN, tapi kita sudah handle activeGame di atas)
        const gamePin = await createGame(quiz, user.uid);
        navigate(`/host/${gamePin}`);
        
    } catch (error) {
        console.error("Failed to create game:", error);
        alert("Gagal membuat room. Silakan coba lagi.");
    } finally {
        setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 animate-pulse">Loading quiz details...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz not found</h2>
        <button 
          onClick={() => navigate('/home')}
          className="text-purple-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Quiz</span>
            </button>
            <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Quiz Info Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-500 text-lg max-w-2xl">{quiz.description}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 font-medium">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {quiz.category || 'General'}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <HelpCircle className="w-4 h-4" />
                {quiz.questions.length} Questions
              </span>
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                ~{Math.ceil(quiz.questions.reduce((acc, q) => acc + (q.time || 20), 0) / 60)} min
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHostGame}
            disabled={creating}
            className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all font-bold text-lg flex items-center gap-3 shrink-0 ${
                creating ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {creating ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                </>
            ) : (
                <>
                    <Play className="w-6 h-6 fill-current" />
                    Host This Show
                </>
            )}
          </motion.button>
        </div>

        {/* Questions List Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Questions Preview
          </h2>
          
          {quiz.questions.map((q, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-purple-200 transition-colors"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex gap-3">
                  <span className="text-gray-400 font-mono">#{idx + 1}</span>
                  {q.questionText}
                </h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold h-fit flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3" /> {q.time || 20}s
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => (
                  <div 
                    key={optIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      optIdx === q.correctAnswer 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-white border-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="font-medium">{opt}</span>
                    {optIdx === q.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}