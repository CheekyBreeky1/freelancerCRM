import './EmployersList.css';
import EmployerItem from '../../components/EmployerItem/EmployerItem';
import type { Employer } from '../../api/types';

const employers: Employer[] = [
  {
    id: 'empl000001',
    name: 'Анна Смирнова',
    status: 'active',
    company: 'ООО «Вектор»',
    email: 'anna@vector.ru',
    phoneNumber: '+7 912 345-67-89',
    telegram: null,
    website: null,
    notes: null,
    projectsCount: 3,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'empl000002',
    name: 'Игорь Петров',
    status: 'new',
    company: 'ИП Петров',
    email: 'igor.petrov@gmail.com',
    phoneNumber: '+7 903 111-22-33',
    telegram: null,
    website: null,
    notes: null,
    projectsCount: 1,
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'empl000003',
    name: 'Мария Кузнецова',
    status: 'active',
    company: 'Studio Nord',
    email: 'm.kuznetsova@studionord.io',
    phoneNumber: '+7 921 555-44-22',
    telegram: null,
    website: null,
    notes: null,
    projectsCount: 7,
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'empl000004',
    name: 'Дмитрий Волков',
    status: 'archived',
    company: 'Frilance Digital',
    email: 'dmitry@fr-digital.com',
    phoneNumber: '+7 999 777-88-11',
    telegram: null,
    website: null,
    notes: null,
    projectsCount: 2,
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    deletedAt: null,
  },
];

const EmployersList = () => {
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
          {employers.map((employer) => (
            <EmployerItem key={employer.id} employer={employer} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default EmployersList;