import React from 'react';
import './SubtaskItem.css';

const SubtaskItem = ({ text, done = false, onToggle, onEdit, onRemove }) => {
  return (
    <li className="subtask-item">
      <label className="subtask-item__check">
        <input
          className="subtask-item__checkbox"
          type="checkbox"
          checked={done}
          onChange={onToggle}
        />
        <span className="subtask-item__text">{text}</span>
      </label>

      {(onEdit || onRemove) && (
        <div className="subtask-item__actions">
          {onEdit && (
            <button
              className="subtask-item__action"
              type="button"
              aria-label="Редактировать подпункт"
              onClick={onEdit}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 2.5L11.5 4L5 10.5L3 11L3.5 9L10 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {onRemove && (
            <button
              className="subtask-item__action subtask-item__action--danger"
              type="button"
              aria-label="Удалить подпункт"
              onClick={onRemove}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </li>
  );
};

export default SubtaskItem;