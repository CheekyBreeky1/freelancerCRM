import React from 'react';
import './Login.css';

const Login = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // логика авторизации
  };

  return (
    <main className="login">
      <div className="login__card">
        <div className="login__brand">
          <div className="login__logo" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="login__title">Вход в FreelanceCRM</h1>
          <p className="login__subtitle">
            Введите данные, чтобы продолжить работу
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login__input"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              className="login__input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="login__row">
            <label className="login__remember">
              <input
                className="login__remember-input"
                type="checkbox"
              />
              <span className="login__remember-text">Запомнить меня</span>
            </label>
            <a className="login__forgot" href="/forgot">
              Забыли пароль?
            </a>
          </div>

          <button className="login__submit" type="submit">
            Войти
          </button>
        </form>

        <p className="login__footer">
          Нет аккаунта?{' '}
          <a className="login__footer-link" href="/register">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </main>
  );
};

export default Login;