import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="jump-hover w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/70 border border-slate-900/10 dark:border-yellow-400/20 text-slate-700 dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-200 transition-all duration-300"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}