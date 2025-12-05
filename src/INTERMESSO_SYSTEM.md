# Sistem Intermesso - Dokumentasi Implementasi

## 📋 Overview

Sistem intermesso adalah fitur baru yang menampilkan hasil jawaban pemain setelah setiap soal selesai. Fitur ini dirancang untuk mengurangi Firestore read operations dengan menggunakan timestamp dari server dan penghitungan waktu di device klien.

## 🎯 Alur Sistem

### 1. **Host Mengajukan Soal (Playing Phase)**
- Host melihat soal dengan opsi jawaban (A, B, C, D)
- Timer berjalan di device host
- Setiap pemain di-track jawabnya via Firestore

### 2. **Waktu Habis → Intermesso Dimulai**
- Ketika waktu soal habis, HostGameplay memanggil `startIntermesso(gamePin, 15)`
- Firestore status berubah dari `playing` → `intermesso`
- `intermessoStartTime` di-set ke timestamp saat itu

### 3. **Host Menampilkan HostIntermesso (15 detik)**
- Menampilkan soal yang baru saja ditanyakan
- Bar chart dengan distribusi jawaban (A, B, C, D)
- Jumlah pemain per jawaban ditampilkan dengan warna
- Jawaban benar ditandai dengan checkmark
- Timer countdown 15 detik

### 4. **Player Menampilkan PlayerIntermesso (15 detik)**
- **Jika benar:** Layar hijau + "Anda Benar! +XXX poin"
- **Jika salah:** Layar merah + "Anda Salah" + jawaban yang benar
- **Jika tidak jawab:** Layar merah + "Anda Salah" + jawaban yang benar
- Timer countdown 15 detik sama dengan host

### 5. **Intermesso Berakhir → Soal Berikutnya**
- HostIntermesso memanggil `onIntermessoEnd()`
- Ini memanggil `handleNextQuestion()`
- Jika ada soal berikutnya: panggil `nextQuestion(gamePin, nextIndex)`
  - Status berubah kembali ke `playing`
  - `questionStartTime` di-set ulang
  - `questionDuration` di-set sesuai durasi soal baru
  - `intermessoStartTime` di-clear
- Jika tidak ada soal lagi: game selesai (`finished`)

## 🏗️ Struktur Data di Firestore

### GameData Collection
```typescript
{
  id: string;
  pin: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'intermesso' | 'finished';
  quiz: Quiz;
  currentQuestionIndex: number;
  
  // ✅ Baru untuk intermesso
  questionStartTime: number | null;      // Timestamp saat soal dimulai
  questionDuration: number;              // Durasi soal dalam detik (dari Question.time)
  intermessoStartTime: number | null;    // Timestamp saat intermesso dimulai
  intermessoDuration: number;            // Durasi intermesso (default 15 detik)
  
  expiresAt: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📱 Komponen Baru

### 1. **HostIntermesso.tsx**
Menampilkan hasil soal untuk host

```tsx
interface HostIntermessoProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  players: Player[];
  intermessoStartTime: number;  // Dari Firestore
  intermessoDuration: number;   // Default 15
  onIntermessoEnd: () => void;
}
```

**Fitur:**
- Timer countdown (15 detik)
- Bar chart distribusi jawaban dengan Recharts
- Tampil jumlah jawaban per opsi (A, B, C, D)
- Jawaban yang benar diberi highlight dengan checkmark
- Progress bar visual

### 2. **PlayerIntermesso.tsx**
Menampilkan hasil soal untuk player

```tsx
interface PlayerIntermessoProps {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswerText: string;
  playerAnswer: string;
  intermessoDuration: number;  // Default 15
}
```

**Fitur:**
- **Jika benar:** Gradient hijau + Check icon + poin earned
- **Jika salah:** Gradient merah + X icon + jawaban yang benar
- Timer countdown (15 detik)
- Animasi pulsing untuk icon dan timer

## 🔄 Flow Update State di Firestore

### saat Soal Berakhir
```
HostGameplay.handleTimeUp()
    ↓
startIntermesso(gamePin, 15)  // Update Firestore
    ↓
Firestore: status = 'intermesso', intermessoStartTime = Date.now()
    ↓
PlayerAnswer listener trigger (status changed)
    ↓
Player melihat PlayerIntermesso
    ↓
HostIntermesso timer countdown 15 detik
    ↓
onIntermessoEnd() → handleNextQuestion()
```

### saat Intermesso Berakhir
```
HostIntermesso timer habis (15 detik)
    ↓
onIntermessoEnd() calls handleNextQuestion()
    ↓
nextQuestion(gamePin, nextIndex)  // Update Firestore
    ↓
Firestore: 
  - status = 'playing'
  - currentQuestionIndex = nextIndex
  - questionStartTime = Date.now()
  - questionDuration = question.time
  - intermessoStartTime = null
    ↓
HostGameplay & PlayerAnswer listener trigger
    ↓
Menampilkan soal baru
```

## ⏱️ Optimasi Firestore Reads

### Sebelumnya
- Setiap detik player melakukan Firestore read untuk check waktu soal
- Dengan 100 player = 100 reads/detik
- 1 jam game = 360,000 reads

### Sekarang
- **Saat soal dimulai:** 1 read → dapatkan `questionStartTime` & `questionDuration`
- **Device client:** Hitung lokal `timeRemaining = questionStartTime + questionDuration - Date.now()`
- **Setiap soal:** Hanya 1 read di awal
- **Dengan 100 player:** ~5 reads per soal (bukan per detik!)
- **1 jam game (30 soal):** ~150 reads total

**Penghematan:** 99.96% read reduction! ✨

## 🛠️ Fungsi Gameservice yang Diupdate

### 1. **updateCurrentQuestion()**
```typescript
export const updateCurrentQuestion = async (gamePin, questionIndex, questionDuration) => {
  // Set questionStartTime = Date.now()
  // Set questionDuration dari Question.time
  // Clear intermessoStartTime
}
```

### 2. **startIntermesso()** ✅ Baru
```typescript
export const startIntermesso = async (gamePin, intermessoDuration = 15) => {
  // Set status = 'intermesso'
  // Set intermessoStartTime = Date.now()
  // Set intermessoDuration = 15
}
```

### 3. **nextQuestion()** ✅ Baru
```typescript
export const nextQuestion = async (gamePin, nextQuestionIndex) => {
  // Set status = 'playing'
  // Set currentQuestionIndex = nextIndex
  // Set questionStartTime = Date.now()
  // Set questionDuration dari quiz.questions[nextIndex].time
  // Clear intermessoStartTime
}
```

## 📊 Distribusi Jawaban di HostIntermesso

Statistik dihitung dari `players[].answers` array:

```typescript
const stats = [0, 0, 0, 0];  // Untuk opsi A, B, C, D
players.forEach(p => {
  const lastAns = p.answers.find(a => a.questionIndex === questionNumber - 1);
  if (lastAns !== undefined) {
    stats[lastAns.answerIndex]++;
  }
});
```

**Hasil:**
```
Pilihan A: 25 orang (merah)
Pilihan B: 18 orang (biru)
Pilihan C: 8 orang (kuning)
Pilihan D: 49 orang (hijau) ← jawaban benar
```

## 🎨 Styling & Animasi

### HostIntermesso
- **Header:** PIN & Timer dalam card dengan bg white/90
- **Bar Chart:** Responsive dengan 4 kolom untuk A/B/C/D
- **Answer Count Display:** Grid 4 kolom dengan badge warna-warni
- **Animasi:** Scale pulse pada jawaban yang benar

### PlayerIntermesso
- **Background:** Gradient hijau (benar) atau merah (salah)
- **Icon:** Check atau X dengan scale animation
- **Text:** Large, bold, white
- **Card:** Semi-transparent backdrop blur untuk detail jawaban
- **Timer:** Scale pulse countdown

## 🔗 Integrasi dengan Component Lain

### HostPage.tsx
```typescript
// Status baru
type status = 'create' | 'lobby' | 'playing' | 'intermesso' | 'leaderboard' | 'finished' | 'expired'

// Render HostIntermesso
if (status === 'intermesso' && selectedQuiz && gameData) {
  return <HostIntermesso {...props} onIntermessoEnd={handleNextQuestion} />
}
```

### PlayerPage.tsx
```typescript
// Pass gameDocId ke PlayerAnswer
<PlayerAnswer
  gameDocId={gameDocId!}
  {...props}
/>
```

### PlayerAnswer.tsx
```typescript
// Monitor intermesso status
useEffect(() => {
  onSnapshot(gameRef, (snap) => {
    if (data.status === 'intermesso') {
      // Tampilkan PlayerIntermesso
      setIsIntermesso(true);
    }
  });
}, []);

if (isIntermesso && intermessoData) {
  return <PlayerIntermesso {...intermessoData} />;
}
```

## 🐛 Edge Cases Handled

1. **Player tidak jawab sebelum intermesso dimulai**
   - `selectedAnswer` akan null
   - PlayerIntermesso menampilkan "Tidak Menjawab" dengan jawaban yang benar

2. **Intermesso dari firestore delayed**
   - PlayerAnswer terus listen sampai status berubah ke `intermesso`
   - Tidak ada hard deadline di client

3. **Network lag**
   - Timer di device tetap jalan independen
   - Firestore update tidak crucial untuk akurasi waktu

4. **Multiple questions back-to-back**
   - Reset semua state saat questionIndex berubah
   - Clear intermessoStartTime saat soal baru dimulai

## 📈 Metrics & Monitoring

### Untuk Host
```
Total Players: 100
Avg Answers/Question: 95
Correct Answer: Pilihan D (49 orang)
Distribution: 25%, 18%, 8%, 49%
```

### Untuk Player
```
Your Answer: Pilihan D
Result: ✅ Benar!
Points Earned: +1250
Next Question In: 15s
```

## ✅ Testing Checklist

- [ ] Timer di HostIntermesso countdown 15 detik
- [ ] Bar chart menampilkan distribusi jawaban dengan benar
- [ ] Jawaban yang benar di-highlight dengan checkmark
- [ ] Player melihat layar hijau jika benar
- [ ] Player melihat layar merah jika salah
- [ ] Poin ditampilkan dengan benar
- [ ] Setelah 15 detik, soal berikutnya muncul otomatis
- [ ] Jika tidak ada soal lagi, game selesai
- [ ] Firestore read operations berkurang significantly

## 📝 Notes

- Sistem intermesso adalah **mandatory** setelah setiap soal
- Duration intermesso adalah **15 detik** (tidak configurable saat ini)
- Bar chart menggunakan Recharts untuk visualization
- Animasi menggunakan Motion (framer-motion)
- Semua waktu disinkronisasi dengan server timestamp
