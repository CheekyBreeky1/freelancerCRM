import React from 'react';
import './EmployersList.css';
import EmployerItem from './../../components/EmployerItem/EmployerItem'

const EmployersList = () => {
    const employers = [
    {
      id: 1,
      name: 'Анна Смирнова',
      company: 'ООО «Вектор»',
      email: 'anna@vector.ru',
      phone: '+7 912 345-67-89',
      projectsCount: 3,
      status: 'active',
    },
    {
      id: 2,
      name: 'Игорь Петров',
      company: 'ИП Петров',
      email: 'igor.petrov@gmail.com',
      phone: '+7 903 111-22-33',
      projectsCount: 1,
      status: 'new',
    },
    {
      id: 3,
      name: 'Мария Кузнецова',
      company: 'Studio Nord',
      email: 'm.kuznetsova@studionord.io',
      phone: '+7 921 555-44-22',
      projectsCount: 7,
      status: 'active',
    },
    {
      id: 4,
      name: 'Дмитрий Волков',
      company: 'Frilance Digital',
      email: 'dmitry@fr-digital.com',
      phone: '+7 999 777-88-11',
      projectsCount: 2,
      status: 'archived',
    },
  ];

  return (
    <main className="employers-list">
      <div className="employers-list__container">
        <div className="employers-list__header">
          <div className="employers-list__title-block">
            <h1 className="employers-list__title">Заказчики</h1>
            <p className="employers-list__subtitle">
              Люди и компании, с которыми вы работаете
            </p>
          </div>
          <button className="employers-list__add-btn" type="button">
            <span className="employers-list__add-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            Добавить заказчика
          </button>
        </div>

        <div className="employers-list__toolbar">
          <div className="employers-list__search">
            <span className="employers-list__search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              className="employers-list__search-input"
              type="text"
              placeholder="Поиск по заказчикам..."
            />
          </div>
        </div>

        <div className="employers-list__body">
          <div className="employers-list__body">
            {employers.map((employer) => (
              <EmployerItem
                key={employer.id}
                name={employer.name}
                company={employer.company}
                email={employer.email}
                phone={employer.phone}
                projectsCount={employer.projectsCount}
                status={employer.status}
              />
            ))}
          </div>
          {/*<div className="employers-list__empty">
            <p className="employers-list__empty-title">Пока заказчиков нет</p>
            <p className="employers-list__empty-text">
              Нажмите «Добавить заказчика», чтобы создать первого
            </p>
          </div>*/}
        </div>
      </div>
    </main>
  );
};

export default EmployersList;