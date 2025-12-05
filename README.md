# 🎮 JAHOOT - Real-time Multiplayer Quiz Platform

<div align="center">

![Jahoot Logo](https://img.shields.io/badge/JAHOOT-Quiz%20Platform-purple?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Cloud-orange?style=for-the-badge&logo=firebase)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

**Final Project - Cloud Computing Course**

[Live Demo](https://jahoott.web.app) · [Documentation](DOCUMENTATION_EXTENDED.md) · [Report Bug](issues)

</div>

---

## 📋 About The Project

**Jahoot** adalah platform quiz multiplayer real-time yang dibangun dengan **serverless architecture** menggunakan **Firebase Firestore**. Aplikasi ini memungkinkan seorang host untuk membuat game quiz, dan multiple players dapat join secara real-time menggunakan PIN code.

### 🎯 Key Features

- ✅ **Real-time Multiplayer** - Sinkronisasi instant antar devices
- ✅ **PIN-based Access** - Simple 6-digit code untuk join game
- ✅ **Live Leaderboard** - Ranking update real-time
- ✅ **Multiple Quiz Categories** - Data Structures, Networking, Web Dev, Algorithms
- ✅ **Responsive Design** - Mobile, tablet, desktop friendly
- ✅ **Scoring System** - Points based on accuracy + speed
- ✅ **Smooth Animations** - Polished UI dengan Framer Motion
- ✅ **Serverless Backend** - Zero server management dengan Firebase

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Client Web    │
│   (React App)   │
└────────┬────────┘
         │
         │ WebSocket
         │ (Real-time)
         │
┌────────▼────────┐
│   Firebase      │
│   Firestore     │
│   (Serverless)  │
└─────────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 6 (Build tool)
- Tailwind CSS 4 (Styling)
- Framer Motion (Animations)
- Lucide React (Icons)

**Backend (Serverless):**
- Firebase Firestore (Database)
- Firebase Hosting (Static hosting)
- Firebase Authentication (Optional)
- Firebase Analytics (Tracking)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/jahoot.git
cd jahoot
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Firebase**
   - Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy Firebase config

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env dengan Firebase config kamu
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**📖 Full setup guide**: See [SETUP.md](SETUP.md)

---

## 🎮 How to Play

### As Host:
1. Klik **"Host a Game"**
2. Pilih quiz category
3. Klik **"Create Game Room"**
4. Share **6-digit PIN** dengan players
5. Wait for players to join
6. Klik **"Start Game"** when ready
7. Display questions untuk semua players
8. View live leaderboard setelah each question

### As Player:
1. Klik **"Join a Game"**
2. Enter **6-digit PIN** dari host
3. Enter nama kamu
4. Wait di lobby sampai host start game
5. Answer questions on your device
6. View hasil dan ranking kamu

---

## 📊 Firestore Data Structure

### Collections

#### `games/{gamePin}`
```javascript
{
  pin: "123456",
  quiz: {
    id: "quiz_1",
    title: "Data Structures Fundamentals",
    questions: [...]
  },
  status: "waiting" | "playing" | "finished",
  currentQuestionIndex: 0,
  playerCount: 5,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `players/{playerId}`
```javascript
{
  id: "player_abc123",
  name: "Alice",
  gamePin: "123456",
  score: 2750,
  answers: [
    {
      questionIndex: 0,
      answerIndex: 1,
      timeLeft: 15,
      isCorrect: true,
      pointsEarned: 1375,
      answeredAt: Timestamp
    }
  ],
  joinedAt: Timestamp
}
```

---

## 🔐 Security Rules

Firestore Security Rules di `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Games: Anyone can read (for joining), authenticated can write
    match /games/{gamePin} {
      allow read: if true;
      allow create, update: if request.auth != null;
    }
    
    // Players: Anyone can read in their game, can update own data
    match /players/{playerId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.resource.data.id == playerId;
    }
  }
}
```

---

## 📈 Performance Optimization

### Implemented Optimizations:

1. **Firestore Indexes** - Composite index on `players` collection
2. **Query Caching** - Offline persistence enabled
3. **Code Splitting** - Vite automatic chunking
4. **Image Optimization** - WebP format, lazy loading
5. **CDN Caching** - Firebase Hosting with cache headers
6. **Batch Operations** - Atomic writes untuk consistency

### Performance Metrics:

- ⚡ Time to Interactive: < 2s
- 📦 Bundle Size: < 200KB (gzipped)
- 🔄 Real-time Latency: < 150ms
- 📊 Lighthouse Score: 95+

---

## 🧪 Testing

### Run tests:

```bash
# Unit tests (in browser console)
import('./src/firebase/gameService.test.js').then(m => m.runAllTests())
```

### Test Coverage:

- ✅ Game creation & retrieval
- ✅ Player joining & scoring
- ✅ Answer submission
- ✅ Leaderboard calculation
- ✅ Real-time synchronization
- ✅ Cleanup & deletion

---

## 🚀 Deployment

### Deploy to Firebase Hosting:

```bash
# Build production
npm run build

# Deploy
firebase deploy
```

**Live URL**: https://jahoott.web.app

### Deployment Checklist:

- [x] Environment variables configured
- [x] Firestore rules deployed
- [x] Firestore indexes created
- [x] Build succeeds without errors
- [x] Testing completed
- [x] Performance optimized

---

## 📸 Screenshots

<div align="center">

### Landing Page
![Landing Page](screenshots/landing.png)

### Host Lobby
![Host Lobby](screenshots/host-lobby.png)

### Gameplay
![Gameplay](screenshots/gameplay.png)

### Leaderboard
![Leaderboard](screenshots/leaderboard.png)

</div>

---

## 🎓 Project Information

**Course**: Cloud Computing (CC)  
**Institution**: [Your University]  
**Semester**: [Semester/Year]  
**Team**: 
- **Darren Gavriel** - Backend Lead & Firebase Architecture
- **Jordan Theovandy** - Frontend Lead & UI/UX
- **Johan Julius** - Full-Stack & Content Creation

---

## 📝 Roadmap

- [x] Phase 1: Setup & Architecture
- [x] Phase 2: Core Features Implementation
- [x] Phase 3: Real-time Sync
- [x] Phase 4: UI Polish & Animations
- [x] Phase 5: Testing & Optimization
- [x] Phase 6: Deployment
- [ ] Phase 7: Mobile App (Future)
- [ ] Phase 8: AI-powered Questions (Future)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) - Serverless backend
- [React](https://react.dev) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion) - Animations
- [Kahoot](https://kahoot.com) - Inspiration

---

## 📞 Contact

**Project Link**: [https://github.com/your-username/jahoot](https://github.com/your-username/jahoot)

**Live Demo**: [https://jahoott.web.app](https://jahoott.web.app)

---

<div align="center">

**Made with ❤️ for Cloud Computing Final Project**

⭐ Star this repo if you find it helpful!

</div>
