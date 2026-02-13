import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTodos } from '../hooks/useTodos';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';
import TodoItem from '../components/todo/TodoItem';
import * as authService from '../services/authService';

export default function TodoListPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { filteredTodos, filter, setFilter, loading, error, handleComplete, handleRevert, handleRemove } = useTodos();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await authService.logout();
    navigate('/login');
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{t('todo.myTodos')}</h1>
        <div className="page-header__actions">
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className="lang-select">
            <option value="system">{t('theme.system')}</option>
            <option value="light">{t('theme.light')}</option>
            <option value="dark">{t('theme.dark')}</option>
          </select>
          <select value={i18n.language} onChange={handleLanguageChange} className="lang-select">
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
          <button onClick={() => navigate('/todos/new')} className="btn btn--primary">
            {t('todo.addTodo')}
          </button>
          <button onClick={handleLogout} className="btn btn--secondary">
            {t('todo.logout')}
          </button>
        </div>
      </header>

      {loading && <p className="status-message">{t('common.loading')}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="filter-tabs">
        {(['all', 'pending', 'done'] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {t(`todo.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
          </button>
        ))}
      </div>

      {!loading && filteredTodos.length === 0 && (
        <p className="status-message">{t('todo.empty')}</p>
      )}

      <ul className="todo-list">
        {filteredTodos.map((todo) => (
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
