// src/firebase/gameService.test.js
import { 
  createGame, 
  joinGame, 
  getGame, 
  getPlayers,
  updateGameStatus,
  submitAnswer,
  deleteGame,
  GAME_STATUS 
} from './gameService';

// ==================== TEST UTILITIES ====================

const mockQuiz = {
  id: 'test-quiz-1',
  title: 'Test Quiz',
  description: 'A test quiz for unit testing',
  category: 'Testing',
  questions: [
    {
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      time: 20
    },
    {
      questionText: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      time: 15
    }
  ]
};

// ==================== MANUAL TESTS ====================

/**
 * Test 1: Create Game
 */
export const testCreateGame = async () => {
  console.log('\n🧪 TEST 1: Create Game');
  try {
    const gamePin = await createGame(mockQuiz, 'host_test_123');
    console.log('✅ Game created with PIN:', gamePin);
    
    // Verify game was created
    const game = await getGame(gamePin);
    console.log('📊 Game data:', game);
    
    if (game && game.status === GAME_STATUS.WAITING) {
      console.log('✅ TEST PASSED');
      return gamePin;
    } else {
      console.log('❌ TEST FAILED: Game not created properly');
      return null;
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return null;
  }
};

/**
 * Test 2: Join Game
 */
export const testJoinGame = async (gamePin) => {
  console.log('\n🧪 TEST 2: Join Game');
  try {
    const player1 = await joinGame(gamePin, 'Alice');
    console.log('✅ Player 1 joined:', player1);
    
    const player2 = await joinGame(gamePin, 'Bob');
    console.log('✅ Player 2 joined:', player2);
    
    // Verify players were added
    const players = await getPlayers(gamePin);
    console.log('👥 Total players:', players.length);
    
    if (players.length === 2) {
      console.log('✅ TEST PASSED');
      return [player1.id, player2.id];
    } else {
      console.log('❌ TEST FAILED: Players not added properly');
      return null;
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return null;
  }
};

/**
 * Test 3: Start Game
 */
export const testStartGame = async (gamePin) => {
  console.log('\n🧪 TEST 3: Start Game');
  try {
    await updateGameStatus(gamePin, GAME_STATUS.PLAYING);
    
    const game = await getGame(gamePin);
    console.log('🎮 Game status:', game.status);
    
    if (game.status === GAME_STATUS.PLAYING) {
      console.log('✅ TEST PASSED');
      return true;
    } else {
      console.log('❌ TEST FAILED: Game status not updated');
      return false;
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
};

/**
 * Test 4: Submit Answers
 */
export const testSubmitAnswers = async (playerIds) => {
  console.log('\n🧪 TEST 4: Submit Answers');
  try {
    // Player 1 answers correctly with 15s left
    const score1 = await submitAnswer(
      playerIds[0], // playerId
      0,            // questionIndex
      1,            // answerIndex (correct)
      15,           // timeLeft
      true,         // isCorrect
      1375          // points (1000 + 375 time bonus)
    );
    console.log('✅ Player 1 score:', score1);
    
    // Player 2 answers incorrectly
    const score2 = await submitAnswer(
      playerIds[1],
      0,
      0,  // wrong answer
      10,
      false,
      0
    );
    console.log('✅ Player 2 score:', score2);
    
    // Verify scores
    const players = await getPlayers(await getGame(playerIds[0]).gamePin);
    console.log('📊 Leaderboard:', players.map(p => ({ name: p.name, score: p.score })));
    
    if (score1 > score2 && score1 === 1375) {
      console.log('✅ TEST PASSED');
      return true;
    } else {
      console.log('❌ TEST FAILED: Scores not calculated correctly');
      return false;
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
};

/**
 * Test 5: Cleanup
 */
export const testCleanup = async (gamePin) => {
  console.log('\n🧪 TEST 5: Cleanup');
  try {
    await deleteGame(gamePin);
    
    // Verify game was deleted
    const game = await getGame(gamePin);
    
    if (game === null) {
      console.log('✅ TEST PASSED: Game deleted');
      return true;
    } else {
      console.log('❌ TEST FAILED: Game still exists');
      return false;
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
};

// ==================== RUN ALL TESTS ====================

export const runAllTests = async () => {
  console.log('🚀 Starting Firebase Service Tests...\n');
  
  const gamePin = await testCreateGame();
  if (!gamePin) return;
  
  const playerIds = await testJoinGame(gamePin);
  if (!playerIds) return;
  
  await testStartGame(gamePin);
  await testSubmitAnswers(playerIds);
  await testCleanup(gamePin);
  
  console.log('\n🏁 All tests completed!');
};

// For manual testing in browser console:
// import { runAllTests } from './firebase/gameService.test.js';
// runAllTests();