# 🚀 Setup Guide - Jahoot Final Project

## 📦 Prerequisites

Pastikan kamu sudah install:
- ✅ **Node.js** v18+ ([Download](https://nodejs.org))
- ✅ **npm** atau **yarn**
- ✅ **Git** ([Download](https://git-scm.com))
- ✅ **Firebase Account** ([Sign up](https://firebase.google.com))

Cek versi:
```bash
node --version  # v18+
npm --version   # 9+
```

---

## 🔧 Step-by-Step Setup

### 1️⃣ Clone/Download Project

```bash
# If using Git
git clone <your-repo-url>
cd jahoot

# Or download ZIP and extract
```

### 2️⃣ Install Dependencies

```bash
npm install
```

Ini akan menginstall semua packages di `package.json`:
- React 18
- Firebase SDK
- Framer Motion
- Tailwind CSS
- Vite
- dan lainnya...

**Expected output:**
```
added 347 packages in 23s
```

### 3️⃣ Setup Firebase Project

#### A. Create Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **"Add Project"** atau pilih project `jahoott`
3. Ikuti wizard setup (bisa skip Analytics)

#### B. Enable Firestore Database
1. Di sidebar, klik **"Firestore Database"**
2. Klik **"Create Database"**
3. Pilih **"Start in test mode"** (untuk development)
4. Pilih location: `asia-southeast2 (Jakarta)` atau terdekat
5. Klik **"Enable"**

#### C. Get Firebase Config
1. Di Project Overview, klik **⚙️ Settings** → **Project Settings**
2. Scroll ke **"Your apps"** section
3. Klik **Web icon** (</>) untuk add web app
4. Register app dengan nickname: `Jahoot Web`
5. **COPY** Firebase config object

### 4️⃣ Configure Environment Variables

Buat file `.env` di root project:

```bash
# Copy template
cp .env.example .env

# Edit dengan text editor
nano .env  # atau gunakan VSCode
```

Isi dengan Firebase config kamu:

```env
VITE_FIREBASE_API_KEY=AIzaSyCaqTlgyxvXiHwMTtgcXsEM1bSNbr1xqJc
VITE_FIREBASE_AUTH_DOMAIN=jahoott.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jahoott
VITE_FIREBASE_STORAGE_BUCKET=jahoott.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=684751920554
VITE_FIREBASE_APP_ID=1:684751920554:web:b861192a48717db0bf5fd3
VITE_FIREBASE_MEASUREMENT_ID=G-W2DX64EYQN
```

**⚠️ IMPORTANT**: Jangan commit `.env` ke Git!

### 5️⃣ Setup Firestore Rules

Di Firebase Console:
1. **Firestore Database** → **Rules** tab
2. Copy-paste rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Games collection
    match /games/{gamePin} {
      allow read: if true;  // Anyone can read to join
      allow create, update, delete: if true;  // Simplified for testing
    }
    
    // Players collection
    match /players/{playerId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if true;
    }
  }
}
```

3. Klik **"Publish"**

**🔒 Note**: Rules ini untuk testing. Di production, perlu lebih strict!

### 6️⃣ Setup Firestore Indexes

Di Firebase Console:
1. **Firestore Database** → **Indexes** tab
2. **Composite** → **Create Index**
3. Collection: `players`
4. Fields:
   - `gamePin`: Ascending
   - `score`: Descending
5. Status: Enable
6. Klik **Create Index**

Wait 2-5 minutes untuk index selesai dibuild.

### 7️⃣ Run Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v6.3.5  ready in 823 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.10:3000/
```

Buka browser di `http://localhost:3000`

---

## ✅ Verify Setup

### Test Checklist

1. **Landing Page Loads** ✓
   - Logo muncul
   - "Host a Game" dan "Join a Game" buttons ada

2. **Create Game Works** ✓
   - Klik "Host a Game"
   - Pilih quiz
   - Klik "Create Game Room"
   - PIN 6-digit muncul

3. **Join Game Works** ✓
   - Buka tab baru (Incognito mode recommended)
   - Klik "Join a Game"
   - Masukkan PIN dari host
   - Masukkan nama
   - Player muncul di host's lobby

4. **Game Flow** ✓
   - Host klik "Start Game"
   - Question muncul
   - Player bisa answer
   - Leaderboard muncul
   - Next question works

### Debug Console

Buka **Developer Tools** (F12) → **Console**

Expected logs:
```
✅ Firebase initialized successfully
📊 Project: jahoott
🔔 Setting up game subscription for: 123456
👥 Players updated: [...]
```

Jika ada **RED errors**, cek [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## 🧪 Run Tests

Test Firebase functions:

```bash
# Test di browser console
# 1. Buka http://localhost:3000
# 2. Buka DevTools Console (F12)
# 3. Run:
import('./src/firebase/gameService.test.js').then(m => m.runAllTests())
```

Expected output:
```
🚀 Starting Firebase Service Tests...

🧪 TEST 1: Create Game
✅ Game created with PIN: 123456
✅ TEST PASSED

🧪 TEST 2: Join Game
✅ Player 1 joined: Alice
✅ Player 2 joined: Bob
✅ TEST PASSED

...

🏁 All tests completed!
```

---

## 🏗️ Build for Production

```bash
# Build
npm run build

# Preview build locally
npm run preview
```

Check `dist/` folder:
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── ...
```

---

## 🚀 Deploy to Firebase Hosting

### First Time Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init
```

Pilih:
- ✅ Hosting
- ✅ Firestore
- Public directory: `dist`
- Single-page app: `Yes`

### Deploy

```bash
# Option 1: Full deploy
npm run deploy

# Option 2: Hosting only
npm run deploy:hosting

# Option 3: Manual
npm run build
firebase deploy
```

**Expected output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/jahoott
Hosting URL: https://jahoott.web.app
```

🎉 **DONE!** Aplikasi kamu sudah live!

---

## 📱 Test di Multiple Devices

1. **Get hosting URL**: https://jahoott.web.app
2. **Host device**: Buka di laptop/PC
3. **Player devices**: 
   - Buka di HP (gunakan WiFi yang sama)
   - Atau share URL ke teman
4. **Test multiplayer**:
   - Host create game
   - Players join dengan PIN
   - Play game bersama

---

## 🐛 Common Issues

### Issue: `npm install` gagal
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Issue: Firebase connection error
1. Check internet connection
2. Verify `.env` file exists dan isinya benar
3. Check Firebase project status: https://status.firebase.google.com

### Issue: "Permission denied" di Firestore
1. Check Firestore Rules di console
2. Deploy rules: `firebase deploy --only firestore:rules`

**More help**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Project Structure

```
jahoot/
├── src/
│   ├── components/        # React components
│   │   ├── LandingPage.tsx
│   │   ├── HostCreateGame.tsx
│   │   ├── HostLobby.tsx
│   │   ├── PlayerJoin.tsx
│   │   └── ...
│   ├── firebase/          # Firebase logic
│   │   ├── config.js      # Firebase initialization
│   │   ├── gameService.js # Firestore operations
│   │   └── gameService.test.js
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind styles
├── public/                # Static assets
├── dist/                  # Build output
├── .env                   # Environment variables (GITIGNORED)
├── .env.example           # Template
├── package.json           # Dependencies
├── vite.config.ts         # Vite config
├── firebase.json          # Firebase config
├── firestore.rules        # Firestore security
└── firestore.indexes.json # Firestore indexes
```

---

## 📖 Next Steps

1. ✅ **Complete setup** (you're here!)
2. 📝 **Read documentation** in `DOCUMENTATION_EXTENDED.md`
3. 🧪 **Test all features** thoroughly
4. 🎨 **Customize UI** (colors, text, images)
5. 🚀 **Deploy to production**
6. 📊 **Monitor usage** in Firebase Console
7. 🎓 **Prepare presentation** for final project

---

## 🎓 Submission Checklist

For final project submission:

- [ ] Project runs without errors
- [ ] Multiplayer works (tested with 2+ devices)
- [ ] All 5 quizzes functional
- [ ] Leaderboard updates correctly
- [ ] Deployed to Firebase Hosting (live URL)
- [ ] Code commented dan rapi
- [ ] README.md complete dengan screenshot
- [ ] Video demo (optional but recommended)
- [ ] Documentation lengkap
- [ ] Presentation slides siap

---

## 🆘 Need Help?

1. Check **TROUBLESHOOTING.md** first
2. Search error di Google/StackOverflow
3. Check Firebase docs: https://firebase.google.com/docs
4. Ask di forum/Discord server

---

Good luck with your final project! 🚀✨
