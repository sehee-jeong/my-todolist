import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as todoService from '../services/todoService';

export default function TodoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        setDueDate(todo.dueDate ?? '');
      })
      .catch(() => navigate('/'))
      .finally(() => setInitialLoading(false));
  }, [id, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
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
        setError('접근 권한이 없습니다.');
      } else {
        setError('수정에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return <p className="status-message">불러오는 중...</p>;

  return (
    <div className="page-container">
      <h1>할 일 수정</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목 *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">설명 (선택)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dueDate">마감일 (선택)</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn--secondary">
            취소
          </button>
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
