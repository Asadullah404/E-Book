'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUserRole, createOrUpdateUser } from '@/lib/firestoreService';

// Create Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    photoURL: firebaseUser.photoURL,
                };

                setUser(userData);
                console.log('🔐 User signed in:', userData.email);

                // Create/update user in Firestore and get role
                try {
                    await createOrUpdateUser(firebaseUser.uid, {
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });

                    const role = await getUserRole(firebaseUser.uid);
                    console.log('👤 User role fetched:', role);
                    console.log('🔑 Is Admin:', role === 'admin');
                    setUserRole(role);
                } catch (error) {
                    console.error('❌ Error setting up user:', error);
                    setUserRole('user'); // Default to user role on error
                }
            } else {
                // User is signed out
                console.log('🚪 User signed out');
                setUser(null);
                setUserRole('user');
            }
            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            // User state will be updated by onAuthStateChanged
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setLoading(false);
            throw error;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserRole('user');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        userRole,
        loading,
        signInWithGoogle,
        logout,
        isAdmin: userRole === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
