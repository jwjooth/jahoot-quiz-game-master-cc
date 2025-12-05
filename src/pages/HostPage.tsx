import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorHandling from '../components/ErrorHandling';
import { HostCreateGame } from '../components/HostCreateGame'; // ✅ Fixed: Tambah space & gunakan named import
import { HostGameplay } from '../components/HostGameplay';
import { HostIntermesso } from '../components/HostIntermesso';
import { HostLeaderboard } from '../components/HostLeaderboard';
import { HostLobby } from '../components/HostLobby';
import { HostPodium } from '../components/HostPodium';
import { auth } from '../firebase/config';
import { createGame, nextQuestion, subscribeToGame, subscribeToPlayers, updateGameStatus } from '../firebase/gameService';
import { GameData, Player, Quiz } from '../types';

export default function HostPage() {
  // State Management
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();

  const [gamePin, setGamePin] = useState<string>(pin || '');
  const [gameDocId, setGameDocId] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<'create' | 'lobby' | 'playing' | 'intermesso' | 'leaderboard' | 'finished' | 'expired'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameData, setGameData] = useState<GameData | null>(null);

  // 1. Initial Load & Realtime Listener untuk Game Data
  useEffect(() => {
    if (!pin) {
      setStatus('create');
      return;
    }

    setGamePin(pin);
    setLoading(true);

    const unsubGame = subscribeToGame(pin, (gameData: any) => {
      setLoading(false);
      if (gameData) {
        setGameData(gameData);
        setGameDocId(gameData.id);
        setSelectedQuiz(gameData.quiz);
        setCurrentQuestionIndex(gameData.currentQuestionIndex || 0);

        if (gameData.status === 'expired') {
          setStatus('expired');
          return;
        }

        if (gameData.status === 'waiting') setStatus('lobby');
        else if (gameData.status === 'playing') setStatus('playing');
        else if (gameData.status === 'intermesso') setStatus('intermesso');
        else if (gameData.status === 'finished') setStatus('finished');
      } else {
        setError('Game not found');
        setStatus('create');
      }
    });

    return () => unsubGame();
  }, [pin]);

  // 2. Effect Terpisah untuk Players
  useEffect(() => {
    if (!gameDocId) return;

    const unsubPlayers = subscribeToPlayers(gameDocId, (updatedPlayers: any[]) => {
      setPlayers(updatedPlayers);
    });

    return () => unsubPlayers();
  }, [gameDocId]);

  // 3. Handle Create Game
  const handleCreateGame = async (quiz: Quiz) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const hostId = user ? user.uid : 'anonymous';
      const newPin = await createGame(quiz, hostId);
      setGamePin(newPin);
      navigate(`/host/${newPin}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Start Game
  const handleStartGame = async () => {
    if (!gamePin || !selectedQuiz) return;
    try {
      await (updateGameStatus as any)(gamePin, 'playing', selectedQuiz);
      setStatus('playing');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 5. Handle Next Question
  const handleNextQuestion = async () => {
    if (!gamePin || !selectedQuiz) return;
    try {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < selectedQuiz.questions.length) {
        await nextQuestion(gamePin, nextIndex);
        setCurrentQuestionIndex(nextIndex);
        setStatus('playing');
      } else {
        await updateGameStatus(gamePin, 'finished');
        setStatus('finished');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 6. Handle Play Again
  const handlePlayAgain = () => {
    navigate('/host');
    window.location.reload();
  };

  // Loading State
  if (loading && pin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-purple-600">
        Loading Game...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <ErrorHandling
        onRetry={() => {
          setError('');
          navigate('/host');
        }}
      />
    );
  }

  // 1. Create Mode - Ketika user belum punya PIN
  if (!pin) {
    return <HostCreateGame onCreateGame={handleCreateGame} />; // ✅ Fixed: Gunakan HostCreateGame bukan createGame
  }

  // 2. Expired State
  if (status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Session Expired</h1>
        <p className="text-xl text-gray-300 mb-8">
          Maaf, sesi game ini telah berakhir karena batas waktu 10 menit telah terlewati.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  // 3. Lobby State
  if (status === 'lobby') {
    return (
      <HostLobby
        gamePin={gamePin}
        players={players}
        onStartGame={handleStartGame}
        onPlayersUpdate={setPlayers}
      />
    );
  }

  // 4. Gameplay State
  if (status === 'playing' && selectedQuiz) {
    return (
      <HostGameplay
        question={selectedQuiz.questions[currentQuestionIndex]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={selectedQuiz.questions.length}
        gamePin={gamePin}
        gameDocId={gameDocId!}
        players={players}
        onTimeUp={() => setStatus('intermesso')}
      />
    );
  }

  // 5. Intermesso State
  if (status === 'intermesso' && selectedQuiz && gameData) {
    return (
      <HostIntermesso
        question={selectedQuiz.questions[currentQuestionIndex]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={selectedQuiz.questions.length}
        players={players}
        intermessoStartTime={gameData.intermessoStartTime || Date.now()}
        intermessoDuration={gameData.intermessoDuration || 15}
        onIntermessoEnd={() => handleNextQuestion()}
      />
    );
  }

  // 6. Leaderboard State
  if (status === 'leaderboard' && selectedQuiz) {
    return (
      <HostLeaderboard
        question={selectedQuiz.questions[currentQuestionIndex]}
        players={players}
        gamePin={gamePin}
        onNext={handleNextQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={selectedQuiz.questions.length}
        onPlayersUpdate={setPlayers}
      />
    );
  }

  // 7. Finished State
  if (status === 'finished') {
    return <HostPodium players={players} onPlayAgain={handlePlayAgain} />;
  }

  // Fallback
  return <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">Unknown State</div>;
}