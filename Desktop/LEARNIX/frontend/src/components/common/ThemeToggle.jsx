import { Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/slices/uiSlice';

export default function ThemeToggle() {
    const dispatch = useDispatch();
    const { theme } = useSelector((s) => s.ui);
    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
