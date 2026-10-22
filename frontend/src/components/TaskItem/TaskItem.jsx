import React from 'react';
import './TaskItem.css';

const TaskItem = ({ title, status, deadline, priority }) => {
  const statusLabels = {
    progress: 'В работе',
    review: 'На проверке',
    done: 'Готово',
    paid: 'Оплачено',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  return (
    <article className={`task-item task-item--priority-${priority}`}>
      <div className="task-item__priority" title={`Приоритет: ${priorityLabels[priority]}`}>
        <span className={`task-item__flag task-item__flag--${priority}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 1.5V12.5M3 2.5H10.5L8.75 5L10.5 7.5H3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
          </svg>
        </span>
      </div>

      <div className="task-item__main">
        <h3 className="task-item__title">{title}</h3>
        <div className="task-item__meta">
          <span className={`task-item__badge task-item__badge--${status}`}>
            {statusLabels[status]}
          </span>
          <span className={`task-item__deadline task-item__deadline--${deadline.state}`}>
            <span className="task-item__deadline-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M2 5.5H12" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 2V4M9 2V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            Дедлайн: {deadline.date}
          </span>
        </div>
      </div>

      <div className="task-item__actions">
        <button className="task-item__action" type="button" aria-label="Редактировать задачу">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.5 2.5L13.5 4.5L5.5 12.5L3 13L3.5 10.5L11.5 2.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="task-item__action task-item__action--danger" type="button" aria-label="Удалить задачу">
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

export default TaskItem;