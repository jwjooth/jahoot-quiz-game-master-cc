import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, Code, Network, Database, Brain, Clock, Plus, CheckCircle, Trash2, Save, ArrowLeft, Pencil } from 'lucide-react';
import { Quiz, Question } from '../types';
import { createGame, saveQuiz } from '../firebase/gameService'; // Import saveQuiz
import { auth } from '../firebase/config'; // Import auth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface HostCreateGameProps {
  onCreateGame: (quiz: Quiz) => void;
}

// Mock quiz data (Templates)
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Data Structures Fundamentals',
    description: 'Arrays, Linked Lists, Stacks, Queues, and Trees',
    category: 'Data Structures',
    questions: [
      {
        questionText: 'What is the time complexity of accessing an element in an array by index?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        time: 20
      },
      {
        questionText: 'Which data structure uses LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctAnswer: 1,
        time: 20
      }
    ]
  },
  {
    id: '2',
    title: 'Web Development Essentials',
    description: 'HTML, CSS, JavaScript, and React',
    category: 'Web Dev',
    questions: [
      {
        questionText: 'What is React primarily used for?',
        options: ['Backend', 'Database', 'UI', 'DevOps'],
        correctAnswer: 2,
        time: 20
      }
    ]
  },
  {
    id: '3',
    title: 'Networking Basics',
    description: 'IP Addressing, OSI Model, and Protocols',
    category: 'Networking',
    questions: [
        {
            questionText: 'What does HTTP stand for?',
            options: ['HyperText Transfer Protocol', 'HyperText Transmission Protocol', 'HyperText Transfer Program', 'HyperText Transmission Program'],
            correctAnswer: 0,
            time: 20
        }
    ]
  }
];

const categoryIcons: Record<string, any> = {
  'Data Structures': Database,
  'Networking': Network,
  'Web Dev': Code,
  'Algorithms': Brain
};

export function HostCreateGame({ onCreateGame }: HostCreateGameProps) {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Custom Quiz State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customQuizTitle, setCustomQuizTitle] = useState('');
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  
  // Current Question Form State
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...qOptions];
    newOptions[index] = value;
    setQOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (!qText || qOptions.some(opt => !opt)) {
      alert("Mohon isi pertanyaan dan semua pilihan jawaban.");
      return;
    }

    const newQuestion: Question = {
      questionText: qText,
      options: [...qOptions],
      correctAnswer: qCorrect,
      time: 20 // Default time
    };

    if (editingIndex !== null) {
      // Update pertanyaan yang ada (Edit Mode)
      const updatedQuestions = [...customQuestions];
      updatedQuestions[editingIndex] = newQuestion;
      setCustomQuestions(updatedQuestions);
      setEditingIndex(null); // Keluar dari mode edit
    } else {
      // Tambah pertanyaan baru
      setCustomQuestions([...customQuestions, newQuestion]);
    }
    
    // Reset Form
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

  const handleEditQuestion = (index: number) => {
    const questionToEdit = customQuestions[index];
    
    // Load data ke form
    setQText(questionToEdit.questionText);
    setQOptions([...questionToEdit.options]);
    setQCorrect(questionToEdit.correctAnswer);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
    // Jika yang dihapus sedang diedit, reset form
    if (editingIndex === index) {
      setEditingIndex(null);
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrect(0);
    }
  };

  // ✅ NEW: LOGIC SIMPAN KUIS KE FIRESTORE
  const handleSaveQuiz = async () => {
    if (customQuestions.length === 0) {
      alert("Tambahkan minimal 1 pertanyaan sebelum menyimpan.");
      return;
    }
    if (!customQuizTitle.trim()) {
        alert("Mohon isi judul kuis.");
        return;
    }

    // Cek User Login
    const user = auth.currentUser;
    if (!user) {
        alert("Anda harus login untuk menyimpan kuis!");
        return;
    }

    setIsCreating(true);
    try {
        const quizData = {
            title: customQuizTitle,
            description: `Custom quiz by ${user.displayName}`,
            category: 'Custom',
            questions: customQuestions
        };

        await saveQuiz(quizData, user.uid);
        
        alert("Kuis berhasil disimpan ke Dashboard!");
        navigate('/home'); // Kembali ke Dashboard setelah simpan
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan kuis.");
    } finally {
        setIsCreating(false);
    }
  };

  const handleTemplateCreate = () => {
    if (selectedQuiz) {
        onCreateGame(selectedQuiz);
    }
  };

  // --- RENDER CUSTOM CREATOR MODE ---
  if (isCustomMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={() => setIsCustomMode(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Buat Kuis Baru</h2>
          </div>

          <div className="space-y-6">
            {/* Quiz Title Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kuis</label>
                <input 
                    type="text" 
                    value={customQuizTitle}
                    onChange={(e) => setCustomQuizTitle(e.target.value)}
                    placeholder="Contoh: Latihan Soal Algoritma"
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 shadow-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Question Form */}
            <div className={`p-6 rounded-2xl border ${editingIndex !== null ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    {editingIndex !== null ? (
                        <Pencil className="w-5 h-5 text-purple-600" />
                    ) : (
                        <Plus className="w-5 h-5 text-purple-600" />
                    )}
                    {editingIndex !== null ? `Edit Pertanyaan #${editingIndex + 1}` : `Tambah Pertanyaan (${customQuestions.length} tersimpan)`}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pertanyaan</label>
                        <input 
                            type="text" 
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            placeholder="Ketik pertanyaan di sini..."
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 shadow-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {qOptions.map((opt, idx) => (
                            <div key={idx} className="relative group">
                                <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${
                                    idx === 0 ? 'bg-red-500' : 
                                    idx === 1 ? 'bg-blue-500' : 
                                    idx === 2 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <input 
                                    type="text" 
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Pilihan ${idx + 1}`}
                                    className={`w-full pl-8 pr-14 py-3 rounded-xl border outline-none shadow-sm bg-white transition-all ${
  qCorrect === idx 
  ? 'border-green-500 ring-2 ring-green-100 bg-green-50' 
  : 'border-gray-300 focus:border-purple-500'
}`}

                                />
                                <button
                                    onClick={() => setQCorrect(idx)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                                        qCorrect === idx 
                                        ? 'bg-green-500 text-white shadow-md scale-110' 
                                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                    }`}
                                    title="Tandai sebagai jawaban benar"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    {editingIndex !== null && (
                        <button
                            onClick={() => {
                                setEditingIndex(null);
                                setQText('');
                                setQOptions(['', '', '', '']);
                                setQCorrect(0);
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Batal
                        </button>
                    )}
                    <button 
                        onClick={handleAddQuestion}
                        className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                    >
                        {editingIndex !== null ? (
                            <>
                                <Save className="w-5 h-5" /> Simpan Perubahan
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" /> Tambah Lagi
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* List of Added Questions Preview */}
            {customQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500 font-medium">Daftar Pertanyaan:</p>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                        {customQuestions.map((q, idx) => (
                            <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                                editingIndex === idx 
                                ? 'bg-purple-100 border-purple-300 ring-1 ring-purple-300' 
                                : 'bg-gray-50 border-gray-100 hover:border-purple-200'
                            }`}>
                                <span className="text-gray-700 truncate flex-1 font-medium mr-4">{idx + 1}. {q.questionText}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEditQuestion(idx)}
                                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit pertanyaan"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteQuestion(idx)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        title="Hapus pertanyaan"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Final Action Button - GANTI JADI SIMPAN KUIS */}
            <div className="pt-4">
                <button 
                    onClick={handleSaveQuiz}
                    disabled={customQuestions.length === 0 || isCreating}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                        customQuestions.length > 0 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-2xl hover:scale-[1.02]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isCreating ? (
                        <span>Menyimpan...</span>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Kuis ke Library
                        </>
                    )}
                </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- RENDER TEMPLATE SELECTOR MODE ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white mb-2"
          >
            Create a Game
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-xl"
          >
            Select a quiz to start your session
          </motion.p>
        </div>

        {/* Custom Quiz Button - Terpisah & Paling Atas */}
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCustomMode(true)}
            className="w-full bg-white/10 backdrop-blur-md border-2 border-dashed border-white/40 rounded-2xl p-6 text-left transition-all hover:bg-white/20 hover:border-white mb-8 group"
        >
            <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-white text-2xl font-bold mb-1">Buat Kuis Custom</h3>
                    <p className="text-blue-100">Bikin soal sendiri sesuai keinginanmu, bebas atur judul dan jawaban!</p>
                </div>
            </div>
        </motion.button>

        {/* Template Quizzes Grid - Di Bawahnya */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockQuizzes.map((quiz, index) => {
            const Icon = categoryIcons[quiz.category] || BookOpen;
            const isSelected = selectedQuiz?.id === quiz.id;
            
            return (
              <motion.button
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedQuiz(quiz)}
                disabled={isCreating}
                className={`group bg-white rounded-2xl p-6 text-left transition-all ${
                  isSelected 
                    ? 'ring-4 ring-yellow-400 shadow-2xl scale-[1.02]' 
                    : 'hover:shadow-xl hover:scale-105'
                } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-br from-purple-400 to-indigo-500'
                  }`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {quiz.category}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-2 font-bold">{quiz.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{quiz.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{quiz.questions.length} Qs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>~{Math.ceil(quiz.questions.reduce((acc, q) => acc + q.time, 0) / 60)} min</span>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-4 py-2 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center"
                  >
                    <span className="text-yellow-700 font-bold">Terpilih</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: isCreating ? 1 : 1.05 }}
              whileTap={{ scale: isCreating ? 1 : 0.95 }}
              onClick={handleTemplateCreate}
              disabled={isCreating}
              className={`inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-7 h-7" />
              <span className="text-2xl font-bold">
                {isCreating ? 'Creating Game...' : 'Create Game Room'}
              </span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}