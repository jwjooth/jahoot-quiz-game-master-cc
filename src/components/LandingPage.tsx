import { motion } from 'motion/react';
import { Users, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6">
            <Zap className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-white mb-3">
            JAHOOT!
          </h1>
          <p className="text-blue-100 text-xl max-w-md mx-auto">
            The Ultimate Computer Science Quiz Battle
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Link to="/host">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all h-full cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">Host a Game</h3>
                <p className="text-gray-600">
                  Create and manage quiz sessions for your students
                </p>
              </div>
            </motion.div>
          </Link>

          <Link to="/join">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all h-full cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">Join a Game</h3>
                <p className="text-gray-600">
                  Enter a PIN code to participate in a quiz
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-white"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Real-time Multiplayer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Computer Science Topics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Leaderboards</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}