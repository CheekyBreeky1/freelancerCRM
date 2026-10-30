import './EmployerItem.css';
import type { Employer } from '../../api/types';

type EmployerItemProps = {
  employer: Employer;
  onEdit?: () => void;
  onRemove?: () => void;
};

const statusLabels: Record<Employer['status'], string> = {
  active: 'Активный',
  new: 'Новый',
  archived: 'В архиве',
};

const EmployerItem = ({ employer, onEdit, onRemove }: EmployerItemProps) => {
  const { name, company, email, phoneNumber, projectsCount, status } = employer;

  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="employer-item">
      <div className="employer-item__avatar" aria-hidden="true">
        {initials}
      </div>

      <div className="employer-item__main">
        <div className="employer-item__top">
          <h3 className="employer-item__name">{name}</h3>
          <span className={`employer-item__badge employer-item__badge--${status}`}>
            {statusLabels[status]}
          </span>
        </div>

        {company && <p className="employer-item__company">{company}</p>}

        <div className="employer-item__contacts">
          {email && (
            <span className="employer-item__contact">
              <span className="employer-item__contact-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M2 4L7 7.5L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {email}
            </span>
          )}
          {phoneNumber && (
            <span className="employer-item__contact">
              <span className="employer-item__contact-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 2C3.5 2 3 2.3 2.7 2.8L2.2 3.8C1.8 4.6 2 5.6 2.6 6.5C3.8 8.4 5.6 10.2 7.5 11.4C8.4 12 9.4 12.2 10.2 11.8L11.2 11.3C11.7 11 12 10.5 12 10V9C12 8.7 11.8 8.5 11.5 8.4L9.8 7.9C9.5 7.8 9.2 7.9 9 8.1L8.3 8.8C7.1 8.2 6.1 7.2 5.5 6L6.2 5.3C6.4 5.1 6.5 4.8 6.4 4.5L5.9 2.8C5.8 2.5 5.6 2.3 5.3 2.3H4Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {phoneNumber}
            </span>
          )}
        </div>
      </div>

      <div className="employer-item__stats">
        <span className="employer-item__stats-value">{projectsCount}</span>
        <span className="employer-item__stats-label">
          {projectsCount === 1 ? 'проект' : projectsCount < 5 ? 'проекта' : 'проектов'}
        </span>
      </div>

      <div className="employer-item__actions">
        <button
          className="employer-item__action"
          type="button"
          aria-label="Редактировать заказчика"
          onClick={onEdit}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.5 2.5L13.5 4.5L5.5 12.5L3 13L3.5 10.5L11.5 2.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="employer-item__action employer-item__action--danger"
          type="button"
          aria-label="Удалить заказчика"
          onClick={onRemove}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 4.5H13M6.5 4.5V3C6.5 2.44772 6.94772 2 7.5 2H8.5C9.05228 2 9.5 2.44772 9.5 3V4.5M5 4.5L5.5 13C5.5 13.5523 5.94772 14 6.5 14H9.5C10.0523 14 10.5 13.5523 10.5 13L11 4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </article>
  );
};

export default EmployerItem;