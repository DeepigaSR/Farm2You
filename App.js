import React from 'react';
import { AuthProvider } from './src/auth/AuthContext';
import MainNavigator from './src/MainNavigator';

const App = () => {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
};

export default App;
