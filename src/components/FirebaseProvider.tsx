import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { DevApiKey, ClientReview } from "../types";

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isFirebaseActive: boolean;
  totalScansCount: number;
  apiKeys: DevApiKey[];
  reviews: ClientReview[];
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  createApiKey: (name: string) => Promise<void>;
  revokeApiKey: (id: string) => Promise<void>;
  toggleApiKeyStatus: (id: string) => Promise<void>;
  incrementScanCount: () => Promise<void>;
  submitFeedbackReview: (review: Omit<ClientReview, "id">) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiKeys, setApiKeys] = useState<DevApiKey[]>([]);
  const [totalScansCount, setTotalScansCount] = useState<number>(0);
  const [reviews, setReviews] = useState<ClientReview[]>([]);

  // 1. Connection check on startup
  useEffect(() => {
    async function testFirestoreConnection() {
      try {
        // Quick connection test query
        await getDocs(collection(db, "reviews"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Please check your Firebase configuration: Firestore appears offline.");
        }
      }
    }
    testFirestoreConnection();
  }, []);

  // 2. Auth State Sync & User Init
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (srvUser) => {
      try {
        if (srvUser) {
          setUser(srvUser);
          
          // Initialise user profile document in Firestore if not already present
          const userDocRef = doc(db, "users", srvUser.uid);
          let userDocSnap;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${srvUser.uid}`);
          }

          if (!userDocSnap.exists()) {
            const newUserProfile = {
              userId: srvUser.uid,
              email: srvUser.email || "",
              displayName: srvUser.displayName || "Developer",
              photoURL: srvUser.photoURL || "",
              totalScansCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUserProfile);
              setTotalScansCount(0);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${srvUser.uid}`);
            }
          } else {
            const userData = userDocSnap.data();
            setTotalScansCount(userData?.totalScansCount || 0);
          }
        } else {
          setUser(null);
          setApiKeys([]);
          setTotalScansCount(0);
        }
      } catch (err) {
        console.error("Auth state listener error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 3. Realtime Listener for Signed-in User's own API Keys
  useEffect(() => {
    if (!user) return;

    const keysCollectionRef = collection(db, "users", user.uid, "apiKeys");
    const unsubscribe = onSnapshot(
      keysCollectionRef,
      (snapshot) => {
        const keysList: DevApiKey[] = [];
        snapshot.forEach((docSnap) => {
          keysList.push(docSnap.data() as DevApiKey);
        });
        setApiKeys(keysList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/apiKeys`);
      }
    );

    return unsubscribe;
  }, [user]);

  // 4. Realtime Listener for Reviews (Public reviews feed)
  useEffect(() => {
    const reviewsCollectionRef = collection(db, "reviews");
    const unsubscribe = onSnapshot(
      reviewsCollectionRef,
      (snapshot) => {
        const fetchedReviews: ClientReview[] = [];
        snapshot.forEach((docSnap) => {
          fetchedReviews.push(docSnap.data() as ClientReview);
        });
        // Sort reviews: newer first
        setReviews(fetchedReviews.sort((a, b) => b.id.localeCompare(a.id)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "reviews");
      }
    );

    return unsubscribe;
  }, []);

  // 5. Google Sign In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  // 6. Log Out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  // 7. Generate API Key in Firestore
  const createApiKey = async (name: string) => {
    if (!user) return;
    const keyId = "key_" + Date.now();
    const prefix = "tn_live_";
    const bodyStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newApiKeyStr = prefix + bodyStr;

    const newKeyObj: DevApiKey = {
      id: keyId,
      name: name.trim() || "Production API Integration Token",
      key: newApiKeyStr,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      callsCount: 0
    };

    const keyDocRef = doc(db, "users", user.uid, "apiKeys", keyId);
    try {
      await setDoc(keyDocRef, newKeyObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/apiKeys/${keyId}`);
    }
  };

  // 8. Revoke/Delete API Key in Firestore
  const revokeApiKey = async (id: string) => {
    if (!user) return;
    const keyDocRef = doc(db, "users", user.uid, "apiKeys", id);
    try {
      // For general app mechanics we support deleting key document from client
      await setDoc(keyDocRef, { ...apiKeys.find(k => k.id === id)!, status: "revoked" as const });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/apiKeys/${id}`);
    }
  };

  // 9. Toggle Status (Active/Revoked)
  const toggleApiKeyStatus = async (id: string) => {
    if (!user) return;
    const existingKey = apiKeys.find((k) => k.id === id);
    if (!existingKey) return;

    const keyDocRef = doc(db, "users", user.uid, "apiKeys", id);
    const updatedStatus = existingKey.status === "active" ? ("revoked" as const) : ("active" as const);
    try {
      await updateDoc(keyDocRef, { status: updatedStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/apiKeys/${id}`);
    }
  };

  // 10. Increment Scans Count
  const incrementScanCount = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        totalScansCount: totalScansCount + 1,
        updatedAt: new Date().toISOString()
      });
      setTotalScansCount((prev) => prev + 1);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // 11. Submit a Testimonial Review
  const submitFeedbackReview = async (reviewData: Omit<ClientReview, "id">) => {
    const reviewId = `review_${Date.now()}`;
    const fullReview: ClientReview = {
      ...reviewData,
      id: reviewId,
    };

    const reviewDocRef = doc(db, "reviews", reviewId);
    try {
      await setDoc(reviewDocRef, fullReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${reviewId}`);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: true,
        totalScansCount,
        apiKeys,
        reviews,
        signInWithGoogle,
        logOut,
        createApiKey,
        revokeApiKey,
        toggleApiKeyStatus,
        incrementScanCount,
        submitFeedbackReview,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
