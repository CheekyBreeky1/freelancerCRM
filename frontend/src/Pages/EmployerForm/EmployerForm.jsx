import React from 'react';
import './EmployerForm.css';

const EmployerForm = ({
  id,
  name = '',
  company = '',
  email = '',
  phone = '',
  telegram = '',
  website = '',
  notes = '',
  status = 'new',
  projectsCount = 0,
}) => {
  const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'active', label: 'Активный' },
    { value: 'archived', label: 'В архиве' },
  ];

  const isEditing = Boolean(id);

  return (
    <main className="employer-form">
      <div className="employer-form__container">
        <div className="employer-form__header">
          <div className="employer-form__title-block">
            <h1 className="employer-form__title">
              {isEditing ? 'Редактирование заказчика' : 'Новый заказчик'}
            </h1>
            <p className="employer-form__subtitle">
              {isEditing
                ? `ID заказчика: ${id}`
                : 'Заполните данные, чтобы добавить заказчика'}
            </p>
          </div>
        </div>

        <form className="employer-form__form">
          {/* === Основное === */}
          <section className="employer-form__section">
            <h2 className="employer-form__section-title">Основное</h2>

            <div className="employer-form__grid">
              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-name">
                  Имя
                </label>
                <input
                  id="employer-name"
                  className="employer-form__input"
                  type="text"
                  defaultValue={name}
                  placeholder="Например: Анна Смирнова"
                />
              </div>

              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-company">
                  Компания
                </label>
                <input
                  id="employer-company"
                  className="employer-form__input"
                  type="text"
                  defaultValue={company}
                  placeholder="ООО «Вектор» или ИП"
                />
              </div>
            </div>

            <div className="employer-form__field">
              <span className="employer-form__label">Статус</span>
              <div className="employer-form__status-group">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`employer-form__status employer-form__status--${option.value}`}
                  >
                    <input
                      className="employer-form__status-input"
                      type="radio"
                      name="employer-status"
                      value={option.value}
                      defaultChecked={status === option.value}
                    />
                    <span className="employer-form__status-label">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* === Контакты === */}
          <section className="employer-form__section">
            <h2 className="employer-form__section-title">Контакты</h2>

            <div className="employer-form__grid">
              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-email">
                  Email
                </label>
                <input
                  id="employer-email"
                  className="employer-form__input"
                  type="email"
                  defaultValue={email}
                  placeholder="name@example.com"
                />
              </div>

              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-phone">
                  Телефон
                </label>
                <input
                  id="employer-phone"
                  className="employer-form__input"
                  type="tel"
                  defaultValue={phone}
                  placeholder="+7 900 000-00-00"
                />
              </div>

              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-telegram">
                  Telegram
                </label>
                <div className="employer-form__input-group">
                  <span className="employer-form__input-prefix">@</span>
                  <input
                    id="employer-telegram"
                    className="employer-form__input employer-form__input--with-prefix"
                    type="text"
                    defaultValue={telegram}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="employer-form__field">
                <label className="employer-form__label" htmlFor="employer-website">
                  Сайт
                </label>
                <input
                  id="employer-website"
                  className="employer-form__input"
                  type="url"
                  defaultValue={website}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </section>

          {/* === Дополнительно === */}
          <section className="employer-form__section">
            <h2 className="employer-form__section-title">Дополнительно</h2>

            <div className="employer-form__field">
              <label className="employer-form__label" htmlFor="employer-notes">
                Заметки
              </label>
              <textarea
                id="employer-notes"
                className="employer-form__textarea"
                rows={4}
                defaultValue={notes}
                placeholder="Особенности работы, предпочтения по связи, детали..."
              />
            </div>

          </section>

          {/* === Действия === */}
          <div className="employer-form__actions">
            <button className="employer-form__btn employer-form__btn--secondary" type="button">
              Отмена
            </button>
            <button className="employer-form__btn employer-form__btn--primary" type="submit">
              {isEditing ? 'Сохранить изменения' : 'Добавить заказчика'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EmployerForm;