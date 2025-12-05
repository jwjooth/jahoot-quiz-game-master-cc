import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInAnonymously as firebaseSignInAnonymously 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Referensi ke dokumen user (Hanya untuk Host/Google User)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
    } else {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    }

    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// ✅ LOGIN ANONIM (Untuk Player)
export const signInAnonymously = async () => {
  try {
    const result = await firebaseSignInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};  