import React from 'react';
import './TaskList.css';

import TaskItem from '../../components/TaskItem/TaskItem';

const tasks = [
  {
    id: 1,
    title: 'Сверстать лендинг для клиента',
    status: 'progress',
    deadline: { date: '12 октября', state: 'default' },
    priority: 'high',
  },
  {
    id: 2,
    title: 'Настроить аналитику',
    status: 'review',
    deadline: { date: '15 октября', state: 'soon' },
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Правки по дизайну',
    status: 'paid',
    deadline: { date: '1 октября', state: 'overdue' },
    priority: 'low',
  },
];

const TaskList = () => {
  return (
    <main className="task-list">
      <div className="task-list__container">
        <div className="task-list__header">
          <div className="task-list__title-block">
            <h1 className="task-list__title">Задачи</h1>
            <p className="task-list__subtitle">
              Все ваши задачи в одном месте
            </p>
          </div>
          <button className="task-list__add-btn" type="button">
            <span className="task-list__add-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            Добавить задачу
          </button>
        </div>

        <div className="task-list__toolbar">
          <div className="task-list__search">
            <span className="task-list__search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              className="task-list__search-input"
              type="text"
              placeholder="Поиск по задачам..."
            />
          </div>
        </div>

        <div className="task-list__body">
          {/* Здесь будут элементы списка */}
          {tasks.map((task) => (
            <TaskItem
                key={task.id}
                title={task.title}
                status={task.status}
                deadline={task.deadline}
                priority={task.priority}
              />
          ))}
          {/*<div className="task-list__empty">
            <p className="task-list__empty-title">Пока задач нет</p>
            <p className="task-list__empty-text">
              Нажмите «Добавить задачу», чтобы создать первую
            </p>
          </div>*/}
        </div>
      </div>
    </main>
  );
};

export default TaskList;