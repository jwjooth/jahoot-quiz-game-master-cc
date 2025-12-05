import { motion } from 'framer-motion';
import { Crown, LogOut, Plus, Gamepad2, ScrollText, ArrowRight, Library, LayoutDashboard, MoreVertical, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../firebase/authService';
import { auth } from '../firebase/config';
import { getUserQuizzes, checkActiveGame } from '../firebase/gameService';
import { Quiz } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [activeGamePin, setActiveGamePin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const quizzes = await getUserQuizzes(user.uid);
          setMyQuizzes(quizzes as Quiz[]);

          // Cek Active Game (Sekalian update expired jika perlu)
          const activeGame: any = await checkActiveGame(user.uid);
          if (activeGame && activeGame.pin) {
            console.log("Found active game:", activeGame.pin);
            setActiveGamePin(activeGame.pin);
          } else {
            setActiveGamePin(null);
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl shadow-md">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block tracking-tight">Host Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-100 pl-4 pr-1.5 py-1.5 rounded-full border border-gray-200">
            <span className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[150px]">
              {user?.displayName || 'Host'}
            </span>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white shadow-sm" />
            ) : (
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.displayName?.charAt(0) || 'H'}
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-red-100"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 md:gap-8 h-full">
          
          <div className="sm:col-span-5 lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Gamepad2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            </div>

            <div className="grid gap-4">
              {/* 1. Host New Game */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/host')}
                className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl p-6 text-left shadow-lg hover:shadow-purple-200 transition-all group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <Crown className="w-6 h-6 text-yellow-300 opacity-80" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">Create New Quiz</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">Build a custom quiz for your audience from scratch.</p>
                </div>
              </motion.button>

              {/* 2. ✅ REJOIN BUTTON (Di Tengah) */}
              {activeGamePin && (
                <motion.button
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/host/${activeGamePin}`)}
                  className="bg-orange-50 border border-orange-200 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all group flex items-center gap-4 cursor-pointer"
                >
                  <div className="bg-orange-100 p-3 rounded-2xl group-hover:bg-orange-200 transition-colors">
                    <RotateCcw className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 text-sm">Return to Game</h3>
                    <p className="text-orange-600 text-xs mt-0.5">Resume active session ({activeGamePin})</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-300 group-hover:text-orange-600 transition-colors" />
                </motion.button>
              )}

              {/* 3. Join Game Shortcut */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="bg-white border border-gray-200 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all group flex items-center gap-4"
              >
                <div className="bg-green-100 p-3 rounded-2xl group-hover:bg-green-200 transition-colors">
                  <Gamepad2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">Join as Player</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Enter a PIN code to play</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors" />
              </motion.button>

              {/* 4. Template Library */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center text-gray-400 min-h-[160px]">
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <Library className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-600 text-sm">Template Library</h3>
                <p className="text-xs mt-1">Pre-made quizzes coming soon!</p>
              </div>
            </div>
          </div>

          <div className="sm:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-purple-600" />
                Your Library
              </h2>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    {myQuizzes.length} Items
                 </span>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6 lg:p-8 min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none"></div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 animate-pulse gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <p className="text-sm font-medium">Loading your masterpieces...</p>
                </div>
              ) : myQuizzes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                    <ScrollText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">It's empty here</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                    You haven't created any quizzes yet. Create your first custom quiz to start hosting games!
                  </p>
                  <button 
                    onClick={() => navigate('/host')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 z-10 content-start w-full">
                  {myQuizzes.map((quiz) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all hover:border-purple-300 hover:shadow-lg flex flex-col h-full relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                          <ScrollText className="w-5 h-5" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                      </div>

                      <div className="mb-4 flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}