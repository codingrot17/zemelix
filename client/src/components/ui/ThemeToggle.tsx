import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeMode = 'light' | 'dark' | 'system';

const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeToggle: React.FC = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    return mode === 'system' ? getSystemTheme() : mode;
  });

  // Apply theme to <html>
  useEffect(() => {
    const applyTheme = () => {
      const theme = mode === 'system' ? getSystemTheme() : mode;
      document.documentElement.classList.toggle('dark', theme === 'dark');
      setCurrentTheme(theme);
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (mode === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', onSystemChange);
    return () => mediaQuery.removeEventListener('change', onSystemChange);
  }, [mode]);

  const changeTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const icon =
    mode === 'system' ? <Laptop className="w-5 h-5" /> :
    currentTheme === 'dark' ? <Sun className="w-5 h-5" /> :
    <Moon className="w-5 h-5" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme dropdown">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-36">
        <DropdownMenuItem onClick={() => changeTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {mode === 'light' && <Check className="ml-auto h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {mode === 'dark' && <Check className="ml-auto h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('system')}>
          <Laptop className="mr-2 h-4 w-4" />
          System
          {mode === 'system' && <Check className="ml-auto h-4 w-4 text-indigo-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
