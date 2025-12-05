import { motion } from 'framer-motion';
import { Crown, LogOut, Plus, Gamepad2, ScrollText, ArrowRight, Library, LayoutDashboard, MoreVertical, Play, RotateCcw, Zap, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 flex flex-col font-sans">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-purple-200/50">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">JAHOOT!</h1>
            <p className="text-xs text-gray-500 font-medium">Host Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
        {/* Profile Container */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm pl-4 pr-3 py-2 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
          
          {/* Display Name */}
          <span className="text-sm font-semibold text-gray-700 hidden sm:block truncate max-w-[150px]">
            {user?.displayName || 'Host'}
          </span>

          {/* Photo or Initial */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-xl border border-gray-300 shadow-sm object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                            flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.displayName?.charAt(0) || 'H'}
            </div>
          )}
        </div>

          <button 
            onClick={handleLogout}
            className="p-2.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all hover:shadow-md border border-transparent hover:border-red-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
          
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            </div>

            <div className="grid gap-4">
              {/* 1. Create New Quiz - Enhanced */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/host')}
                className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-6 text-left shadow-xl shadow-purple-300/40 hover:shadow-2xl hover:shadow-purple-400/50 transition-all group"
              >
                {/* Animated background effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <Crown className="w-7 h-7 text-yellow-300 opacity-90 drop-shadow-lg" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Create New Quiz</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">Build a custom quiz for your audience from scratch.</p>
                </div>
              </motion.button>

              {/* 2. Return to Active Game - Enhanced */}
              {activeGamePin && (
                <motion.button
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/host/${activeGamePin}`)}
                  className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-3xl p-5 text-left shadow-md hover:shadow-xl hover:shadow-orange-200/50 transition-all group flex items-center gap-4 cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-3.5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                    <RotateCcw className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 text-sm">Return to Game</h3>
                    <p className="text-orange-600 text-xs mt-1 font-medium">Resume active session • {activeGamePin}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
                </motion.button>
              )}

              {/* 3. Join as Player - Enhanced */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="bg-white border-2 border-gray-200 rounded-3xl p-5 text-left shadow-md hover:shadow-xl hover:border-green-300 hover:shadow-green-100/50 transition-all group flex items-center gap-4"
              >
                <div className="bg-gradient-to-br from-green-400 to-green-500 p-3.5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Gamepad2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">Join as Player</h3>
                  <p className="text-gray-500 text-xs mt-1 font-medium">Enter a PIN code to play</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
              </motion.button>

              {/* buat di tengah <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="bg-white border-2 border-gray-200 rounded-3xl p-5 text-center shadow-md hover:shadow-xl hover:border-green-300 hover:shadow-green-100/50 transition-all group flex flex-col items-center gap-3"
              >
                <div className="bg-gradient-to-br from-green-400 to-green-500 p-3.5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Gamepad2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Join as Player</h3>
                  <p className="text-gray-500 text-xs mt-1 font-medium">Enter a PIN code to play</p>
                </div>
              </motion.button> */}

              {/* 4. Template Library - Enhanced */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-dashed border-gray-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-gray-400 min-h-[140px] hover:border-gray-400 transition-all">
                <div className="bg-white p-3.5 rounded-2xl mb-3 shadow-md border border-gray-200">
                  <Library className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-600 text-sm">Template Library</h3>
                <p className="text-xs mt-1.5 text-gray-500">Pre-made quizzes coming soon!</p>
              </div>
            </div>
          </div>

          {/* Right Content - Your Library */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ScrollText className="w-5 h-5 text-purple-600" />
                </div>
                Your Library
              </h2>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-purple-700 bg-purple-100 px-4 py-2 rounded-xl border border-purple-200 shadow-sm">
                    {myQuizzes.length} {myQuizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                 </span>
              </div>
            </div>

            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[2rem] border-2 border-gray-200/50 shadow-xl p-6 lg:p-8 min-h-[500px] flex flex-col relative overflow-hidden">
              {/* Enhanced background decoration */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 via-blue-100/30 to-transparent rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl animate-ping opacity-20"></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Loading your masterpieces...</p>
                </div>
              ) : myQuizzes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                  <div className="relative mb-6">
                    <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center border-2 border-gray-200 shadow-lg">
                      <ScrollText className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <Plus className="w-4 h-4 text-purple-600" strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">It's empty here</h3>
                  <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    You haven't created any quizzes yet. Create your first custom quiz to start hosting epic games!
                  </p>
                  <button 
                    onClick={() => navigate('/host')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl shadow-purple-300/50 hover:shadow-2xl hover:shadow-purple-400/50 flex items-center gap-3 hover:scale-105 transform"
                  >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Create First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 z-10 content-start w-full">
                  {myQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="group bg-white border-2 border-gray-200 rounded-3xl p-6 cursor-pointer transition-all hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/50 flex flex-col h-full relative overflow-hidden"
                    >
                      {/* Card gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-100/0 group-hover:from-purple-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-3xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-5">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-300/50 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <ScrollText className="w-5 h-5" strokeWidth={2.5} />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all">
                              <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                              </button>
                          </div>
                        </div>

                        <div className="mb-5 flex-1">
                          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 group-hover:text-purple-700 transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                            {quiz.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 mt-auto">
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                            {quiz.questions?.length || 0} Questions
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-lg">
                              <Play className="w-4 h-4 fill-current" />
                          </div>
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