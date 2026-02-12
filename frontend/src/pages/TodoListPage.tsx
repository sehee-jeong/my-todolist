import { useNavigate } from 'react-router-dom';
import { useTodos } from '../hooks/useTodos';
import TodoItem from '../components/todo/TodoItem';
import * as authService from '../services/authService';

export default function TodoListPage() {
  const navigate = useNavigate();
  const { todos, loading, error, handleComplete, handleRevert, handleRemove } = useTodos();

  async function handleLogout() {
    await authService.logout();
    navigate('/login');
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>내 할 일</h1>
        <div className="page-header__actions">
          <button onClick={() => navigate('/todos/new')} className="btn btn--primary">
            + 할 일 추가
          </button>
          <button onClick={handleLogout} className="btn btn--secondary">
            로그아웃
          </button>
        </div>
      </header>

      {loading && <p className="status-message">불러오는 중...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && todos.length === 0 && (
        <p className="status-message">할 일이 없습니다. 추가해보세요!</p>
      )}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <TodoItem
              todo={todo}
              onComplete={handleComplete}
              onRevert={handleRevert}
              onRemove={handleRemove}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
