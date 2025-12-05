# 🔧 Troubleshooting Guide - Jahoot

## ❌ Issue 1: "Permission Denied" di Firestore

**Error:**
```
FirebaseError: Missing or insufficient permissions
```

**Solusi:**
1. Cek Firestore Rules di Firebase Console
2. Pastikan rules allow read/write untuk testing:

```javascript
// DEVELOPMENT ONLY - JANGAN DI PRODUCTION!
match /{document=**} {
  allow read, write: if true;
}
```

3. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## ❌ Issue 2: Player Tidak Muncul di Lobby

**Kemungkinan Penyebab:**
- Real-time listener tidak ter-setup
- Network latency
- Firestore offline mode

**Solusi:**
1. Check console logs untuk errors
2. Verify subscription di `useEffect`:

```javascript
useEffect(() => {
  const unsubscribe = subscribeToPlayers(gamePin, (players) => {
    console.log('Players updated:', players);
    setPlayers(players);
  });
  
  return () => unsubscribe();
}, [gamePin]);
```

3. Test dengan Firebase Emulator:
```bash
firebase emulators:start
```

---

## ❌ Issue 3: "Game Not Found" saat Join

**Penyebab:**
- Game PIN salah
- Game sudah dihapus
- Network timeout

**Solusi:**
1. Validate PIN format (6 digits):
```javascript
if (!/^\d{6}$/.test(pin)) {
  throw new Error('Invalid PIN format');
}
```

2. Check game existence sebelum join:
```javascript
const game = await getGame(pin);
if (!game) {
  alert('Game not found. Please check your PIN.');
  return;
}
```

---

## ❌ Issue 4: Scores Tidak Update

**Penyebab:**
- submitAnswer() gagal
- Firestore transaction conflict
- Network issue

**Solusi:**
1. Add error handling:
```javascript
try {
  const newScore = await submitAnswer(
    playerId, questionIndex, answerIndex, timeLeft, isCorrect, points
  );
  console.log('Score updated:', newScore);
} catch (error) {
  console.error('Failed to submit answer:', error);
  // Retry logic or show error to user
}
```

2. Check Firestore usage limits (free tier: 50K reads/day)

---

## ❌ Issue 5: Build Failed

**Error:**
```
Failed to resolve entry for package "firebase"
```

**Solusi:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

---

## ❌ Issue 6: Deployment Failed

**Error:**
```
Error: HTTP Error: 403, Firebase project not found
```

**Solusi:**
1. Check Firebase project ID:
```bash
firebase projects:list
```

2. Select correct project:
```bash
firebase use <project-id>
```

3. Re-authenticate:
```bash
firebase login --reauth
```

---

## ❌ Issue 7: Real-time Sync Delay

**Penyebab:**
- Network latency
- Too many concurrent connections
- Firestore throttling

**Solusi:**
1. Optimize queries dengan indexes
2. Use batched writes untuk multiple updates
3. Implement optimistic UI updates:

```javascript
// Update UI immediately
setPlayers(prev => [...prev, newPlayer]);

// Then sync with server
await joinGame(gamePin, playerName);
```

---

## ❌ Issue 8: Memory Leaks (Listeners not cleaned)

**Symptom:**
- Console warnings: "Memory leak detected"
- App becomes slow over time

**Solusi:**
Always cleanup listeners in useEffect:

```javascript
useEffect(() => {
  const unsubscribe = subscribeToGame(gamePin, handleGameUpdate);
  
  return () => {
    console.log('Cleaning up listener');
    unsubscribe();
  };
}, [gamePin]);
```

---

## ❌ Issue 9: CORS Error in Development

**Error:**
```
Access to fetch blocked by CORS policy
```

**Solusi:**
1. Firebase Hosting automatically handles CORS
2. For local dev, use Vite proxy:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'https://firestore.googleapis.com'
    }
  }
}
```

---

## ❌ Issue 10: Firebase Quota Exceeded

**Error:**
```
Resource exhausted: Quota exceeded
```

**Solusi:**
1. Check Firebase Console → Usage
2. Optimize reads:
   - Use `onSnapshot` only when needed
   - Cache data locally
   - Use pagination for large datasets

3. Upgrade to Blaze plan if needed (pay-as-you-go)

---

## 🔍 Debug Checklist

Before asking for help, check:

- [ ] Firebase project configured correctly
- [ ] Environment variables set (.env file)
- [ ] Firestore rules allow your operations
- [ ] Network connection stable
- [ ] Console shows no errors
- [ ] Firebase CLI up to date (`npm i -g firebase-tools`)
- [ ] Node version >= 18 (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Build works locally (`npm run build`)

---

## 📞 Getting Help

1. **Check Console Logs**: Most errors show helpful messages
2. **Firebase Console**: Check Firestore data, rules, and usage
3. **Network Tab**: Look for failed API calls
4. **Firebase Status**: https://status.firebase.google.com
5. **Documentation**: https://firebase.google.com/docs

---

## 🎓 Learning Resources

- Firebase Firestore Docs: https://firebase.google.com/docs/firestore
- React + Firebase Guide: https://www.youtube.com/watch?v=PKwu15ldZ7k
- Firestore Security Rules: https://firebase.google.com/docs/rules
- Real-time Sync Best Practices: https://firebase.google.com/docs/firestore/best-practices
