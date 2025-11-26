import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if this is the first user
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);

        const role = snapshot.empty ? "admin" : "viewer";

        // Create user document
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
        });

        setUserRole(role);
        return user;
    }

    async function login(email, password) {
        await setPersistence(auth, browserLocalPersistence);
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch role
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserRole(docSnap.data().role);
                } else {
                    // Handle case where auth exists but firestore doc doesn't (shouldn't happen in normal flow)
                    setUserRole("viewer");
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
