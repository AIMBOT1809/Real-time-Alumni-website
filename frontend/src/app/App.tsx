
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect, useState } from 'react';
import IntroVideo from './components/IntroVideo';
import Toast from './components/Toast';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let played = false;
    try {
      played = localStorage.getItem('introPlayed') === '1';
    } catch (e) {
      played = true;
    }
    if (!played) setShowIntro(true);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toast />
        {showIntro && <IntroVideo onFinish={() => setShowIntro(false)} />}
      </AuthProvider>
    </ThemeProvider>
  );
}
