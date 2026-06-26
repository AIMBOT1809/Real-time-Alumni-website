
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useState } from 'react';
import IntroVideo from './components/IntroVideo';
import Toast from './components/Toast';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem('introPlayed') === '1';
    } catch (e) {
      played = true;
    }
    if (!played) setShowIntro(true);
  }, []);

  // Ensure the intro replays on full page reloads but not on client-side SPA navigation.
  useEffect(() => {
    const onBeforeUnload = () => {
      try {
        sessionStorage.removeItem('introPlayed');
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toast />
      {showIntro && <IntroVideo onFinish={() => setShowIntro(false)} />}
    </AuthProvider>
  );
}
