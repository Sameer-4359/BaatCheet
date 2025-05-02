// note: Only necessary because no login persistence setup yet, would change in later implementations 

import { Redirect } from 'expo-router';
import { useAuth } from './_context/auth';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  
  return <Redirect href="/(tabs)" />;
}