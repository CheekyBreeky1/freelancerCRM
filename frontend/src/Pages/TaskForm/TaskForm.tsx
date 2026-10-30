import './TaskForm.css';
import SubtaskItem from '../../components/SubtaskItem/SubtaskItem';
import type { Employer, SubTask } from '../../api/types';

type TaskStatus = 'progress' | 'review' | 'done' | 'paid';
type TaskPriority = 'low' | 'medium' | 'high';

type TaskFormProps = {
  id?: string;
  title?: string;
  description?: string;
  payment?: number | string;
  deadline?: string;
  employerId?: string;
  employers?: Employer[];
  subtasks?: SubTask[];
  status?: TaskStatus;
  priority?: TaskPriority;
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'progress', label: 'В работе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Готово' },
  { value: 'paid', label: 'Оплачено' },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
];

const TaskForm = ({
  id,
  title = '',
  description = '',
  payment = '',
  deadline = '',
  employerId = '',
  employers = [],
  subtasks = [],
  status = 'progress',
  priority = 'medium',
}: TaskFormProps) => {
  const isEditing = Boolean(id);

  const renderSubtasks = () => {
    return subtasks.length > 0 ? (
      <ul className="task-form__subtasks">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            text={subtask.text}
            done={subtask.isComplete}
          />
        ))}
      </ul>
    ) : (
      <p className="task-form__subtasks-empty">
        Пока нет подпунктов. Разбейте задачу на шаги, чтобы отслеживать прогресс.
      </p>
    );
  };

  return (
    <main className="task-form">
      <div className="task-form__container">
        <div className="task-form__header">
          <div className="task-form__title-block">
            <h1 className="task-form__title">
              {isEditing ? 'Редактирование задачи' : 'Новая задача'}
            </h1>
            <p className="task-form__subtitle">
              {isEditing
                ? `ID задачи: ${id}`
                : 'Заполните поля, чтобы создать задачу'}
            </p>
          </div>
        </div>

        <form className="task-form__form">
          {/* === Основное === */}
          <section className="task-form__section">
            <h2 className="task-form__section-title">Основное</h2>

            <div className="task-form__field">
              <label className="task-form__label" htmlFor="task-title">
                Название
              </label>
              <input
                id="task-title"
                className="task-form__input"
                type="text"
                defaultValue={title}
                placeholder="Например: Сверстать лендинг"
              />
            </div>

            <div className="task-form__field">
              <label className="task-form__label" htmlFor="task-description">
                Описание
              </label>
              <textarea
                id="task-description"
                className="task-form__textarea"
                rows={4}
                defaultValue={description}
                placeholder="Детали задачи, требования, ссылки..."
              />
            </div>
          </section>

          {/* === Детали === */}
          <section className="task-form__section">
            <h2 className="task-form__section-title">Детали</h2>

            <div className="task-form__grid">
              <div className="task-form__field">
                <label className="task-form__label" htmlFor="task-payment">
                  Оплата
                </label>
                <div className="task-form__input-group">
                  <input
                    id="task-payment"
                    className="task-form__input task-form__input--with-suffix"
                    type="number"
                    min="0"
                    defaultValue={payment}
                    placeholder="0"
                  />
                  <span className="task-form__input-suffix">₽</span>
                </div>
              </div>

              <div className="task-form__field">
                <label className="task-form__label" htmlFor="task-deadline">
                  Дедлайн
                </label>
                <input
                  id="task-deadline"
                  className="task-form__input"
                  type="date"
                  defaultValue={deadline}
                />
              </div>

              <div className="task-form__field">
                <label className="task-form__label" htmlFor="task-employer">
                  Заказчик
                </label>
                <select
                  id="task-employer"
                  className="task-form__select"
                  defaultValue={employerId}
                >
                  <option value="">Выберите заказчика</option>
                  {employers.map((employer) => (
                    <option key={employer.id} value={employer.id}>
                      {employer.name}
                      {employer.company ? ` — ${employer.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="task-form__field">
                <label className="task-form__label" htmlFor="task-priority">
                  Приоритет
                </label>
                <select
                  id="task-priority"
                  className="task-form__select"
                  defaultValue={priority}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="task-form__field">
              <span className="task-form__label">Статус</span>
              <div className="task-form__status-group">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`task-form__status task-form__status--${option.value}`}
                  >
                    <input
                      className="task-form__status-input"
                      type="radio"
                      name="task-status"
                      value={option.value}
                      defaultChecked={status === option.value}
                    />
                    <span className="task-form__status-label">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* === Подпункты === */}
          <section className="task-form__section">
            <div className="task-form__section-header">
              <h2 className="task-form__section-title">Подпункты задачи</h2>
              <button className="task-form__add-subtask" type="button">
                <span aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Добавить подпункт
              </button>
            </div>
            {renderSubtasks()}
          </section>

          {/* === Действия === */}
          <div className="task-form__actions">
            <button className="task-form__btn task-form__btn--secondary" type="button">
              Отмена
            </button>
            <button className="task-form__btn task-form__btn--primary" type="submit">
              {isEditing ? 'Сохранить изменения' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default TaskForm;