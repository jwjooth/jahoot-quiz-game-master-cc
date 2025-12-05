import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Copy, Check, QrCode, X } from 'lucide-react';
import QRCode from "react-qr-code"; // Pastikan pakai library asli
import type { Player } from '../types'; 

interface HostLobbyProps {
  gamePin: string;
  players: Player[];
  onStartGame: () => void;
  // onPlayersUpdate sebenernya tidak dipakai di UI ini karena data players 
  // datang dari props parent (HostPage), tapi kita biarkan agar tidak error di parent
  onPlayersUpdate?: (players: Player[]) => void; 
}

const AVATAR_COLORS = [
  'bg-gradient-to-br from-red-400 to-pink-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-green-400 to-emerald-500',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-cyan-400 to-blue-500',
];

export function HostLobby({ gamePin, players, onStartGame }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // URL Asli dinamis
  const joinUrl = `${window.location.origin}/join/${gamePin}`;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(gamePin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (players.length === 0) {
      alert('Wait for at least 1 player to join!');
      return;
    }
    
    setIsStarting(true);
    // Panggil fungsi dari parent (HostPage) yang akan update ke Firebase
    onStartGame(); 
    // Note: setIsStarting(false) tidak perlu dipanggil manual disini 
    // karena component akan unmount/pindah halaman saat game mulai
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* QR CODE POPUP MODAL */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQRCode(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-red-100 rounded-full transition-colors group"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </motion.button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan to Join!</h2>
                <p className="text-gray-500 mb-6">Players can scan this QR code to join instantly</p>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 inline-block mb-6 shadow-inner">
                  {/* Gunakan Library QR Code Asli */}
                  <QRCode
                    value={joinUrl}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>

                <div className="bg-gray-50 py-3 px-4 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Join URL</p>
                  <p className="text-sm text-gray-700 font-mono break-all font-semibold">
                    {joinUrl}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* PIN Display */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-4"
          >
            <p className="text-blue-100 text-xl mb-4">
              Join at: <span className="text-white font-bold">jahoot.app</span>
            </p>
            <div className="inline-block relative">
              <div className="bg-white rounded-3xl px-12 py-6 shadow-2xl">
                <p className="text-gray-500 text-sm mb-1">Game PIN</p>
                <div className="flex items-center gap-4">
                  {/* TAMPILKAN PIN DARI PROPS */}
                  <h1 className="text-6xl font-black text-purple-600 tracking-wider">
                    {gamePin}
                  </h1>
                  
                  <div className="flex flex-col gap-2">
                    {/* QR Code Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowQRCode(true)}
                      className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors group"
                      title="Show QR Code"
                    >
                      <QrCode className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    </motion.button>
                    
                    {/* Copy Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopyPin}
                      className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors"
                      title="Copy PIN"
                    >
                      {copied ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <Copy className="w-6 h-6 text-purple-600" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm shadow-lg font-bold"
              >
                Share this!
              </motion.div>
            </div>
          </motion.div>

          {/* Player Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-white"
          >
            <Users className="w-5 h-5" />
            <span className="text-xl">
              {players.length} {players.length === 1 ? 'Player' : 'Players'} Waiting
            </span>
          </motion.div>
        </div>

        {/* Players Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl mb-8"
        >
          {players.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Users className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Waiting for players...</h3>
              <p className="text-gray-500">Share the PIN code above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 ${AVATAR_COLORS[index % AVATAR_COLORS.length]} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
                        <span className="text-white text-2xl font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium text-center truncate w-full">
                        {player.name}
                      </p>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mt-2 w-2 h-2 bg-green-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Start Button */}
        {players.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: isStarting ? 1 : 1.05 }}
              whileTap={{ scale: isStarting ? 1 : 0.95 }}
              onClick={handleStartGame}
              disabled={isStarting}
              className={`inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all font-bold text-xl ${
                isStarting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-7 h-7 fill-current" />
              <span className="text-2xl">
                {isStarting ? 'Starting...' : 'Start Game'}
              </span>
            </motion.button>
            <p className="text-blue-100 mt-4">
              Make sure all players are ready before starting
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}