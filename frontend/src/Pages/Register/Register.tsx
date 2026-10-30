import { FormEvent } from 'react';
import './Register.css';

const Register = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // логика регистрации
  };

  return (
    <main className="register">
      <div className="register__card">
        <div className="register__brand">
          <div className="register__logo" aria-hidden="true">
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
          <h1 className="register__title">Создать аккаунт</h1>
          <p className="register__subtitle">
            Несколько шагов — и вы в FreelanceCRM
          </p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label className="register__label" htmlFor="register-name">
              Имя
            </label>
            <input
              id="register-name"
              className="register__input"
              type="text"
              placeholder="Алексей"
              autoComplete="name"
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className="register__input"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="register-password">
              Пароль
            </label>
            <input
              id="register-password"
              className="register__input"
              type="password"
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="register-confirm">
              Повторите пароль
            </label>
            <input
              id="register-confirm"
              className="register__input"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <label className="register__agree">
            <input
              className="register__agree-input"
              type="checkbox"
            />
            <span className="register__agree-text">
              Я согласен с{' '}
              <a className="register__agree-link" href="/terms">
                условиями использования
              </a>{' '}
              и{' '}
              <a className="register__agree-link" href="/privacy">
                политикой конфиденциальности
              </a>
            </span>
          </label>

          <button className="register__submit" type="submit">
            Зарегистрироваться
          </button>
        </form>

        <p className="register__footer">
          Уже есть аккаунт?{' '}
          <a className="register__footer-link" href="/login">
            Войти
          </a>
        </p>
      </div>
    </main>
  );
};

export default Register;