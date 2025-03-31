import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { initializeTeams } from './services/teamService';

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        await initializeTeams();
      } catch (error) {
        console.error('Error setting up app:', error);
      }
    };

    setupApp();
  }, []);

  return <Slot />;
} 