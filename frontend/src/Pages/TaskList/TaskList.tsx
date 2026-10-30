import './TaskList.css';
import TaskItem from '../../components/TaskItem/TaskItem';
import type { Task } from '../../api/types';

const tasks: Task[] = [
  {
    id: 'task000001',
    employerId: null,
    title: 'Сверстать лендинг для клиента',
    currency: 'RUB',
    priority: 'high',
    status: 'progress',
    description: null,
    payment: 0,
    deadline: '2026-10-12',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'task000002',
    employerId: null,
    title: 'Настроить аналитику',
    currency: 'RUB',
    priority: 'medium',
    status: 'review',
    description: null,
    payment: 0,
    deadline: '2026-10-15',
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    deletedAt: null,
  },
  {
    id: 'task000003',
    employerId: null,
    title: 'Правки по дизайну',
    currency: 'RUB',
    priority: 'low',
    status: 'paid',
    description: null,
    payment: 0,
    deadline: '2026-10-01',
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z',
    deletedAt: null,
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
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default TaskList;