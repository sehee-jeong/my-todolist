import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TodoItem from '../../components/todo/TodoItem';
import type { Todo } from '../../types/todo.types';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  memberId: 'member-1',
  title: '테스트 할 일',
  description: null,
  dueDate: null,
  status: 'PENDING',
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
  ...overrides,
});

const renderItem = (todo: Todo, handlers = {}) =>
  render(
    <MemoryRouter>
      <TodoItem
        todo={todo}
        onComplete={vi.fn()}
        onRevert={vi.fn()}
        onRemove={vi.fn()}
        {...handlers}
      />
    </MemoryRouter>,
  );

describe('TodoItem', () => {
  it('제목 표시', () => {
    renderItem(makeTodo());
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
  });

  it('설명 표시 (있을 때)', () => {
    renderItem(makeTodo({ description: '상세 설명' }));
    expect(screen.getByText('상세 설명')).toBeInTheDocument();
  });

  it('설명 없으면 미표시', () => {
    renderItem(makeTodo({ description: null }));
    expect(screen.queryByText('상세 설명')).not.toBeInTheDocument();
  });

  it('마감일 표시 (있을 때)', () => {
    renderItem(makeTodo({ dueDate: '2026-02-20T10:30:00.000Z' }));
    const expected = `마감: ${new Date('2026-02-20T10:30:00.000Z').toLocaleString()}`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('마감일 없으면 미표시', () => {
    renderItem(makeTodo({ dueDate: null }));
    expect(screen.queryByText(/마감:/)).not.toBeInTheDocument();
  });

  it('PENDING: 완료 버튼 표시', () => {
    renderItem(makeTodo({ status: 'PENDING' }));
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.queryByText('완료 취소')).not.toBeInTheDocument();
  });

  it('DONE: 완료 취소 버튼 표시 및 취소선 적용', () => {
    renderItem(makeTodo({ status: 'DONE' }));
    expect(screen.getByText('완료 취소')).toBeInTheDocument();
    expect(screen.queryByText('완료')).not.toBeInTheDocument();

    const title = screen.getByText('테스트 할 일');
    expect(title).toHaveClass('todo-item__title--done');
  });

  it('Overdue: 마감 초과 배지 표시 및 overdue 클래스', () => {
    renderItem(makeTodo({ overdue: true, status: 'PENDING' }));
    expect(screen.getByText('마감 초과')).toBeInTheDocument();

    const item = screen.getByText('테스트 할 일').closest('.todo-item');
    expect(item).toHaveClass('todo-item--overdue');
  });

  it('DONE + overdue: 마감 초과 배지 미표시', () => {
    renderItem(makeTodo({ overdue: true, status: 'DONE' }));
    expect(screen.queryByText('마감 초과')).not.toBeInTheDocument();
  });

  it('완료 버튼 클릭 시 onComplete 호출', () => {
    const onComplete = vi.fn();
    renderItem(makeTodo({ status: 'PENDING' }), { onComplete });
    fireEvent.click(screen.getByText('완료'));
    expect(onComplete).toHaveBeenCalledWith('todo-1');
  });

  it('완료 취소 버튼 클릭 시 onRevert 호출', () => {
    const onRevert = vi.fn();
    renderItem(makeTodo({ status: 'DONE' }), { onRevert });
    fireEvent.click(screen.getByText('완료 취소'));
    expect(onRevert).toHaveBeenCalledWith('todo-1');
  });

  it('삭제 버튼 클릭 시 onRemove 호출', () => {
    const onRemove = vi.fn();
    renderItem(makeTodo(), { onRemove });
    fireEvent.click(screen.getByText('삭제'));
    expect(onRemove).toHaveBeenCalledWith('todo-1');
  });
});
