import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
  limit,
  deleteField
} from "firebase/firestore";
import { db, auth } from "./config"; // Import auth untuk ambil UID saat join

// ... (saveQuiz, getUserQuizzes, getQuizById TETAP SAMA) ...
export const saveQuiz = async (quizData, ownerId) => {
  try {
    const quizzesRef = collection(db, "quizzes");
    const docRef = await addDoc(quizzesRef, {
      title: quizData.title,
      description: quizData.description || "Custom Quiz",
      category: "Custom",
      questions: quizData.questions,
      ownerId: ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving quiz:", error);
    throw error;
  }
};

export const getUserQuizzes = async (ownerId) => {
  try {
    const q = query(collection(db, "quizzes"), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user quizzes:", error);
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
  } catch (error) {
    console.error("Error getting quiz:", error);
    throw error;
  }
};

// ==================== GAME FUNCTIONS ====================

const getGameDocSnapshot = async (gamePin) => {
  const q = query(collection(db, "games"), where("pin", "==", gamePin), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0];
};

export const generateGamePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const checkActiveGame = async (hostId) => {
  try {
    const q = query(
      collection(db, "games"),
      where("hostId", "==", hostId),
      where("status", "in", ["waiting", "playing"])
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.status === 'waiting' && data.expiresAt && Date.now() > data.expiresAt) {
        console.log(`Game ${data.pin} expired. Updating status...`);
        await updateDoc(docSnap.ref, {
          status: 'expired',
          updatedAt: serverTimestamp()
        });
        continue; 
      }
      return { id: docSnap.id, ...data };
    }
    return null;
  } catch (error) {
    console.error("Error checking active game:", error);
    return null;
  }
};

export const createGame = async (quiz, hostId) => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const gamePin = generateGamePin();
      const existingGame = await getGameDocSnapshot(gamePin);
      
      if (existingGame) {
        const data = existingGame.data();
        if (data.status !== 'finished' && data.status !== 'expired' && (!data.expiresAt || Date.now() < data.expiresAt)) {
            attempts++;
            continue;
        }
      }

      const gamesRef = collection(db, "games");
      await addDoc(gamesRef, {
        pin: gamePin,
        quiz: quiz,
        status: "waiting",
        currentQuestionIndex: 0,
        hostId: hostId,
        createdAt: serverTimestamp(),
        expiresAt: Date.now() + (10 * 60 * 1000), 
        updatedAt: serverTimestamp(),
      });

      console.log("Game created. PIN:", gamePin);
      return gamePin;
    } catch (error) {
      console.error(error);
      attempts++;
    }
  }
  throw new Error("Gagal membuat game, coba lagi.");
};

export const getGame = async (gamePin) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (gameDoc) {
      return { id: gameDoc.id, ...gameDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};

// ✅ NEW FUNCTION: Cek apakah user (uid) sudah ada di game ini
export const getExistingPlayer = async (gamePin, playerId) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) return null;

    const playerRef = doc(db, "games", gameDoc.id, "players", playerId);
    const playerSnap = await getDoc(playerRef);

    if (playerSnap.exists()) {
      return playerSnap.data(); // Mengembalikan data player (termasuk nama)
    }
    return null;
  } catch (error) {
    console.error("Error checking existing player:", error);
    return null;
  }
};

// ✅ UPDATED: Join Game dengan Return Data yang Benar
export const joinGame = async (gamePin, playerName) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) throw new Error("Game tidak ditemukan");
    
    const gameData = gameDoc.data();

    if (gameData.status === "expired") throw new Error("Sesi game telah berakhir (Expired).");
    if (gameData.status !== "waiting" && gameData.status !== "playing") throw new Error("Game sudah selesai"); 
    if (gameData.expiresAt && Date.now() > gameData.expiresAt) throw new Error("Sesi game telah berakhir.");

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Auth required");

    const playerId = currentUser.uid; 
    const playerRef = doc(db, "games", gameDoc.id, "players", playerId);
    
    const playerSnap = await getDoc(playerRef);
    let playerData;

    if (playerSnap.exists()) {
        console.log("Player rejoining, updating name...");
        // ✅ UPDATE nama dengan input terbaru dari user
        // Ini memperbaiki masalah "Host lihat Gavriel, Player lihat Darren"
        // Kita paksa update nama di DB sesuai input baru
        await updateDoc(playerRef, { name: playerName });
        
        // Ambil data terbaru setelah update
        const updatedSnap = await getDoc(playerRef);
        playerData = updatedSnap.data();
    } else {
        console.log("New player joining...");
        playerData = {
            id: playerId,
            name: playerName.trim(),
            gamePin,
            score: 0,
            answers: [],
            joinedAt: serverTimestamp(),
        };
        await setDoc(playerRef, playerData);
    }

    // Kembalikan data yang sudah diupdate
    return { ...playerData, gameDocId: gameDoc.id };
  } catch (error) {
    console.error("Error join game:", error);
    throw error;
  }
};

export const updateGameStatus = async (gamePin, status, quizData = null) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) throw new Error("Game not found");

    const updates = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "playing") {
      updates.questionStartTime = Date.now();
      updates.currentQuestionIndex = 0;
      updates.expiresAt = deleteField();
      // Set questionDuration dari soal pertama
      const gameData = gameDoc.data();
      const quiz = quizData || gameData.quiz;
      if (quiz && quiz.questions && quiz.questions[0]) {
        updates.questionDuration = quiz.questions[0].time || 20;
      } else {
        updates.questionDuration = 20;
      }
    }

    await updateDoc(gameDoc.ref, updates);
  } catch (error) {
    console.error("Error update status:", error);
    throw error;
  }
};

export const updateCurrentQuestion = async (gamePin, questionIndex, questionDuration) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) return;

    await updateDoc(gameDoc.ref, {
      currentQuestionIndex: questionIndex,
      questionStartTime: Date.now(),
      questionDuration: questionDuration || 20, // Duration soal dalam detik
      status: "playing",
      intermessoStartTime: null, // Clear intermesso saat soal baru dimulai
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error update question:", error);
    throw error;
  }
};

// ✅ NEW FUNCTION: Mulai intermesso
export const startIntermesso = async (gamePin, intermessoDuration = 15) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) throw new Error("Game not found");

    await updateDoc(gameDoc.ref, {
      status: "intermesso",
      intermessoStartTime: Date.now(),
      intermessoDuration: intermessoDuration,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error starting intermesso:", error);
    throw error;
  }
};

// ✅ NEW FUNCTION: Lanjut ke soal berikutnya setelah intermesso
export const nextQuestion = async (gamePin, nextQuestionIndex) => {
  try {
    const gameDoc = await getGameDocSnapshot(gamePin);
    if (!gameDoc) throw new Error("Game not found");

    const quiz = gameDoc.data().quiz;
    const currentQuestion = quiz.questions[nextQuestionIndex];

    await updateDoc(gameDoc.ref, {
      currentQuestionIndex: nextQuestionIndex,
      questionStartTime: Date.now(),
      questionDuration: currentQuestion?.time || 20,
      status: "playing",
      intermessoStartTime: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error moving to next question:", error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS (UPDATED) ====================

// ✅ UPDATED: Subscribe ke sub-collection players
// Menerima gameDocId (ID Dokumen Games), BUKAN PIN
export const subscribeToPlayers = (gameDocId, callback) => {
  // Query ke sub-collection
  const playersRef = collection(db, "games", gameDocId, "players");
  
  return onSnapshot(playersRef, (snapshot) => {
    const players = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(players);
  });
};

export const subscribeToGame = (gamePin, callback) => {
  const q = query(collection(db, "games"), where("pin", "==", gamePin), limit(1));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// ✅ UPDATED: Submit answer ke sub-collection
// Membutuhkan gameDocId untuk tahu lokasi sub-collection
export const submitAnswer = async (gameDocId, playerId, questionIndex, answerIndex, timeLeft, isCorrect, pointsEarned) => {
    const playerRef = doc(db, "games", gameDocId, "players", playerId);
    
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) throw new Error("Player tidak ditemukan");

    const data = playerSnap.data();
    const newScore = data.score + (isCorrect ? pointsEarned : 0);
    const answerData = {
      questionIndex, answerIndex, timeLeft, isCorrect, pointsEarned,
      answeredAt: new Date(),
    };

    await updateDoc(playerRef, {
      score: newScore,
      answers: [...(data.answers || []), answerData],
      lastAnswer: answerIndex,
      lastAnswerTime: timeLeft,
    });
    return newScore;
};

export const deleteGame = async () => {};
export const endGame = async () => {};