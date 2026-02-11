import { useNavigate } from 'react-router-dom';
import type { Todo } from '../../types/todo.types';

interface Props {
  todo: Todo;
  onComplete: (id: string) => void;
  onRevert: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TodoItem({ todo, onComplete, onRevert, onRemove }: Props) {
  const navigate = useNavigate();
  const isDone = todo.status === 'DONE';

  return (
    <div className={`todo-item ${isDone ? 'todo-item--done' : ''} ${todo.overdue && !isDone ? 'todo-item--overdue' : ''}`}>
      <div className="todo-item__content">
        <div className="todo-item__title-row">
          <span className={`todo-item__title ${isDone ? 'todo-item__title--done' : ''}`}>
            {todo.title}
          </span>
          {todo.overdue && !isDone && (
            <span className="todo-item__overdue-badge">마감 초과</span>
          )}
        </div>
        {todo.description && (
          <p className="todo-item__description">{todo.description}</p>
        )}
        {todo.dueDate && (
          <p className="todo-item__due-date">마감: {todo.dueDate}</p>
        )}
      </div>
      <div className="todo-item__actions">
        {isDone ? (
          <button onClick={() => onRevert(todo.id)} className="btn btn--secondary">
            완료 취소
          </button>
        ) : (
          <button onClick={() => onComplete(todo.id)} className="btn btn--primary">
            완료
          </button>
        )}
        <button
          onClick={() => navigate(`/todos/${todo.id}/edit`)}
          className="btn btn--secondary"
        >
          수정
        </button>
        <button onClick={() => onRemove(todo.id)} className="btn btn--danger">
          삭제
        </button>
      </div>
    </div>
  );
}
