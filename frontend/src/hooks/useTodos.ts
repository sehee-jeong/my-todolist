import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types/todo.types';
import * as todoService from '../services/todoService';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch {
      setError('할 일 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleComplete(id: string) {
    try {
      const updated = await todoService.complete(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) alert('이미 완료된 항목입니다.');
    }
  }

  async function handleRevert(id: string) {
    try {
      const updated = await todoService.revert(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 400) alert('이미 미완료 상태입니다.');
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await todoService.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  return { todos, loading, error, handleComplete, handleRevert, handleRemove, fetchTodos };
}
