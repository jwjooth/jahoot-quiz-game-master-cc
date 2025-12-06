import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, CheckCircle, Trash2, Edit, HelpCircle, Zap, Sparkles } from 'lucide-react';
import { getQuizById, createGame, checkActiveGame } from '../firebase/gameService'; 
import { Quiz, GameData } from '../types';
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
        const activeGame: any = await checkActiveGame(user.uid);
        
        if (activeGame && activeGame.pin) {
            const shouldRejoin = window.confirm(
                `You have an active game running (PIN: ${activeGame.pin}). \nDo you want to rejoin it instead of creating a new one?`
            );

            if (shouldRejoin) {
                navigate(`/host/${activeGame.pin}`);
                return;
            } else {
                const forceNew = window.confirm("Starting a new game will finish the previous one. Continue?");
                if (!forceNew) {
                    setCreating(false);
                    return;
                }
            }
        }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-600 font-semibold">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz not found</h2>
          <p className="text-gray-500 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 font-sans">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 hover:bg-purple-50 rounded-xl font-semibold"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            <span>Back</span>
          </button>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all flex items-center gap-2 border border-transparent hover:border-gray-200">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all flex items-center gap-2 border border-transparent hover:border-red-200">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Quiz Info Header - Enhanced */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 mb-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/40 to-blue-100/40 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg">
  <Zap className="w-6 h-6 text-white" />
</div>

                <h1 className="text-4xl font-bold text-gray-900">{quiz.title}</h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mb-4 leading-relaxed">{quiz.description}</p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-xl border border-purple-300 shadow-lg">
                  {quiz.category || 'General'}
                </span>
                <span className="flex items-center gap-2 bg-white border-2 border-gray-200 px-4 py-2 rounded-xl shadow-lg">
                  <HelpCircle className="w-4 h-4 text-gray-600" />
                  {quiz.questions.length} Questions
                </span>
                <span className="flex items-center gap-2 bg-white border-2 border-gray-200 px-4 py-2 rounded-xl shadow-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                  ~{Math.ceil(quiz.questions.reduce((acc, q) => acc + (q.time || 20), 0) / 60)} min
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHostGame}
              disabled={creating}
              className={`px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-300/50 transition-all font-bold text-lg flex items-center gap-3 shrink-0 border-2 border-purple-700 ${
                  creating ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {creating ? (
                  <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
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
        </div>

        {/* Questions List Preview - Enhanced */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Questions Preview
            </h2>
          </div>
          
          {quiz.questions.map((q, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-100/0 group-hover:from-purple-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <h3 className="font-bold text-gray-800 text-xl flex items-center gap-3">
                    <span className="w-10 h-10 bg-white border-2 border-gray-300 text-gray-800 rounded-xl flex items-center justify-center text-base font-bold shadow-lg shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{q.questionText}</span>
                  </h3>
                  <span className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold h-fit flex items-center gap-2 whitespace-nowrap border border-gray-300 shadow-md">
                    <Clock className="w-4 h-4" /> {q.time || 20}s
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <div 
                      key={optIdx}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        optIdx === q.correctAnswer 
                          ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-300 text-green-800 shadow-md shadow-green-200/50' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          optIdx === q.correctAnswer 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </span>
                      {optIdx === q.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}