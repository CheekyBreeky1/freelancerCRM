import React, { useEffect, useRef, useState } from 'react';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    // логика выхода
  };

  const handleSettings = () => {
    setMenuOpen(false);
    // переход на страницу настроек
  };

  const handleThemeToggle = () => {
    setMenuOpen(false);
    // смена темы
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <div className="header__logo" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#6366F1" />
              <path
                d="M8 10.5C8 9.67157 8.67157 9 9.5 9H18.5C19.3284 9 20 9.67157 20 10.5V11.5C20 12.3284 19.3284 13 18.5 13H9.5C8.67157 13 8 12.3284 8 11.5V10.5Z"
                fill="white"
              />
              <path
                d="M8 16.5C8 15.6716 8.67157 15 9.5 15H15.5C16.3284 15 17 15.6716 17 16.5V17.5C17 18.3284 16.3284 19 15.5 19H9.5C8.67157 19 8 18.3284 8 17.5V16.5Z"
                fill="white"
                fillOpacity="0.7"
              />
            </svg>
          </div>
          <div className="header__title-block">
            <span className="header__title">FreelanceCRM</span>
            <span className="header__subtitle">Управление задачами</span>
          </div>
        </div>

        <nav className="header__nav" aria-label="Основная навигация">
          <a href="/tasks" className="header__link header__link--active">
            Задачи
          </a>
          <a href="/clients" className="header__link">
            Заказчики
          </a>
        </nav>

        <div className="header__actions" ref={menuRef}>
          <button
            className={`header__user ${menuOpen ? 'header__user--open' : ''}`}
            type="button"
            aria-label="Меню пользователя"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="header__user-avatar">А</span>
            <span className="header__user-name">Алексей</span>
            <span className="header__user-chevron" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {menuOpen && (
            <div className="header__menu" role="menu">
              <button
                className="header__menu-item"
                type="button"
                role="menuitem"
                onClick={handleSettings}
              >
                <span className="header__menu-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M6.5 1.5H9.5L10 3.2C10.4 3.35 10.8 3.55 11.15 3.8L12.9 3.3L14.4 5.9L13.2 7.2C13.25 7.45 13.25 7.55 13.25 8C13.25 8.45 13.25 8.55 13.2 8.8L14.4 10.1L12.9 12.7L11.15 12.2C10.8 12.45 10.4 12.65 10 12.8L9.5 14.5H6.5L6 12.8C5.6 12.65 5.2 12.45 4.85 12.2L3.1 12.7L1.6 10.1L2.8 8.8C2.75 8.55 2.75 8.45 2.75 8C2.75 7.55 2.75 7.45 2.8 7.2L1.6 5.9L3.1 3.3L4.85 3.8C5.2 3.55 5.6 3.35 6 3.2L6.5 1.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Настройки
              </button>

              <button
                className="header__menu-item"
                type="button"
                role="menuitem"
                onClick={handleThemeToggle}
              >
                <span className="header__menu-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5A5.5 5.5 0 1 0 13.5 9.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Сменить тему
              </button>

              <div className="header__menu-divider" role="separator" />

              <button
                className="header__menu-item header__menu-item--danger"
                type="button"
                role="menuitem"
                onClick={handleLogout}
              >
                <span className="header__menu-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H6M10.5 11L13.5 8L10.5 5M13.5 8H6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;