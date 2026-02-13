import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as todoService from '../services/todoService';

export default function TodoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    todoService
      .getAll()
      .then((todos) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo) {
          navigate('/');
          return;
        }
        setTitle(todo.title);
        setDescription(todo.description ?? '');
        setDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '');
      })
      .catch(() => navigate('/'))
      .finally(() => setInitialLoading(false));
  }, [id, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('todo.titleRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await todoService.update(id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 403) {
        setError(t('todo.noAccess'));
      } else {
        setError(t('todo.editFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return <p className="status-message">{t('common.loading')}</p>;

  return (
    <div className="page-container">
      <h1>{t('todo.editTitle')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">{t('todo.titleLabel')}</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">{t('todo.descLabel')}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dueDate">{t('todo.dueDateLabel')}</label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn--secondary">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
