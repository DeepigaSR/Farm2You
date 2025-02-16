import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';

// Create the Auth Context
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log("Auth State Changed:", user);
      setUser(user);
      setLoading(false);
    });
    return unsubscribe; // Unsubscribe on component unmount
  }, []);

  // Sign Up Function
  const signUp = async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User registered:', userCredential.user);
    } catch (error) {
      console.error('Sign Up Error:', error.message);
      throw error;
    }
  };

  // Sign In Function
  const signIn = async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in:', userCredential.user);
    } catch (error) {
      console.error('Sign In Error:', error.message);
      throw error;
    }
  };

  // Sign Out Function
  const signOut = async () => {
    try {
      await auth().signOut();
      console.log('User signed out');
    } catch (error) {
      console.error('Sign Out Error:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
