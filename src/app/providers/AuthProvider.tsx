"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../../firebase/firebaseConfig";
import { db } from "../../firebase/firebaseConfig";

type ExtendedUser = User & {
  displayNameFromDB?: string;
};

type AuthContextType = {
  currentUser: ExtendedUser | null;
  isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 🔽 Firestore の users コレクションから表示名取得
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const displayNameFromDB = userDoc.exists()
          ? userDoc.data().displayName
          : "";

        setCurrentUser({ ...user, displayNameFromDB }); // 🔁 拡張ユーザー
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
