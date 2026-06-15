
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useState } from 'react';
import IntroVideo from './components/IntroVideo';

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

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {showIntro && <IntroVideo onFinish={() => setShowIntro(false)} />}
    </AuthProvider>
  );
}
