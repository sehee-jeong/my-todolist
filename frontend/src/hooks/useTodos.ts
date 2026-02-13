import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Todo } from '../types/todo.types';
import * as todoService from '../services/todoService';

type Filter = 'all' | 'pending' | 'done';

export function useTodos() {
  const { t } = useTranslation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filteredTodos = useMemo(() => {
    if (filter === 'pending') return todos.filter((t) => t.status === 'PENDING');
    if (filter === 'done') return todos.filter((t) => t.status === 'DONE');
    return todos;
  }, [todos, filter]);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch {
      setError(t('todo.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleComplete(id: string) {
    try {
      const updated = await todoService.complete(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) alert(t('todo.alreadyDone'));
    }
  }

  async function handleRevert(id: string) {
    try {
      const updated = await todoService.revert(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) alert(t('todo.alreadyPending'));
    }
  }

  async function handleRemove(id: string) {
    if (!confirm(t('todo.deleteConfirm'))) return;
    try {
      await todoService.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert(t('todo.deleteFailed'));
    }
  }

  return { todos, filteredTodos, filter, setFilter, loading, error, handleComplete, handleRevert, handleRemove, fetchTodos };
}
