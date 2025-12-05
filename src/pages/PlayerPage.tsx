// ... (imports remain same) ...
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToGame, joinGame, submitAnswer } from '../firebase/gameService'; 
import { signInAnonymously } from '../firebase/authService'; 
import { auth } from '../firebase/config';
import { PlayerJoin } from '../components/PlayerJoin';
import { PlayerLobby } from '../components/PlayerLobby';
import { PlayerAnswer } from '../components/PlayerAnswer';
import ErrorHandling from '../components/ErrorHandling';
import { Player, Quiz } from '../types';

export default function PlayerPage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();

  const [gamePin, setGamePin] = useState(pin || '');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameDocId, setGameDocId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [view, setView] = useState<'join' | 'lobby' | 'answer' | 'results' | 'expired'>('join');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Ensure PIN is synced
  useEffect(() => {
    if (pin && pin !== gamePin) {
      setGamePin(pin);
    }
  }, [pin]);

  // 2. Ensure User is Authenticated (Anonymous)
  useEffect(() => {
    const ensureAuth = async () => {
        if (!auth.currentUser) {
            try {
                await signInAnonymously();
                console.log("Auto-signed in anonymously");
            } catch (err) {
                console.error("Failed to sign in anon:", err);
                setError("Failed to initialize session");
            }
        }
    };
    ensureAuth();
  }, []);

  // 3. Listener for Game State
  useEffect(() => {
    if (!gamePin) return;

    const unsub = subscribeToGame(gamePin, (data: any) => {
      if (!data) {
        setError('Game ended or invalid');
        return;
      }
      
      if (!gameDocId) {
          setGameDocId(data.id);
      }

      if (data.status === 'expired') {
        setView('expired');
        return;
      }

      if (data.quiz && !quiz) {
        setQuiz(data.quiz as Quiz);
      }

      if (data.currentQuestionIndex !== undefined) {
        setCurrentQuestionIndex(data.currentQuestionIndex);
      }

      if (currentPlayer) {
          if (data.status === 'waiting') {
            setView('lobby');
          } else if (data.status === 'playing') {
            setView('answer'); 
          } else if (data.status === 'finished') {
            setView('results');
          }
      }
    });

    return () => unsub();
  }, [gamePin, currentPlayer, quiz, gameDocId]);

  const handleJoin = async (enteredPin: string, name: string) => {
    try {
      setLoading(true);
      // ✅ RESULT MENGANDUNG DATA TERBARU (Update Nama dari DB)
      const result: any = await joinGame(enteredPin, name);
      
      // ✅ SET STATE CURRENT PLAYER DENGAN DATA BARU
      setCurrentPlayer(result as unknown as Player);
      
      setGameDocId(result.gameDocId);
      setGamePin(enteredPin);
      
      if (!pin) {
        navigate(`/play/${enteredPin}`, { replace: true });
      }
      
      setView('lobby');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerIndex: number, timeLeft: number) => {
    if (!currentPlayer || !quiz || !gameDocId) return; 
    
    try {
      const question = quiz.questions[currentQuestionIndex];
      const isCorrect = answerIndex === question.correctAnswer;
      const points = isCorrect ? 1000 + Math.round((timeLeft / question.time) * 500) : 0;

      await submitAnswer(
        gameDocId,
        currentPlayer.id,
        currentQuestionIndex,
        answerIndex,
        timeLeft,
        isCorrect,
        points
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  if (error) return <ErrorHandling onRetry={() => { setError(''); setView('join'); navigate('/'); }} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-purple-600">Connecting...</div>;

  if (view === 'expired') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gray-900 p-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Game Expired</h1>
            <p className="text-gray-300 mb-8">Waktu sesi permainan telah habis.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors">Keluar</button>
        </div>
    );
  }

  if (view === 'join' || !currentPlayer) {
    return <PlayerJoin onJoin={handleJoin} initialPin={gamePin} />;
  }

  if (view === 'lobby') {
    return <PlayerLobby gamePin={gamePin} playerName={currentPlayer.name} />;
  }

  if (view === 'answer' && quiz) {
    return (
      <PlayerAnswer
        playerId={currentPlayer.id}
        gamePin={gamePin}
        gameDocId={gameDocId!}
        question={quiz.questions[currentQuestionIndex]}
        questionIndex={currentQuestionIndex}
        timeLimit={quiz.questions[currentQuestionIndex].time}
        onAnswer={handleSubmitAnswer}
      />
    );
  }

  if (view === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl font-bold bg-purple-600">
        <div className="text-center">
            <h1>Game Finished!</h1>
            <p>Your final score is being calculated by the host.</p>
        </div>
      </div>
    );
  }

  return <div>Loading Game...</div>;
}