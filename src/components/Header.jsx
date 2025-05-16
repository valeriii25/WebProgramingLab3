import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function Header() {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="header">
            <h1 className="title">Currency Converter</h1>
            <button onClick={toggleTheme} className="toggle-theme" aria-label="Toggle theme">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </header>
    );
}

export default Header;