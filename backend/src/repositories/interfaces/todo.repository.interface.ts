import { Todo, TodoStatus, CreateTodoDto, UpdateTodoDto } from '../../types/todo.types';

export interface ITodoRepository {
  findAllByMemberId(memberId: string): Promise<Omit<Todo, 'overdue'>[]>;
  findById(id: string): Promise<Omit<Todo, 'overdue'> | null>;
  create(memberId: string, dto: CreateTodoDto): Promise<Omit<Todo, 'overdue'>>;
  update(id: string, dto: UpdateTodoDto): Promise<Omit<Todo, 'overdue'> | null>;
  updateStatus(id: string, status: TodoStatus): Promise<Omit<Todo, 'overdue'> | null>;
  deleteById(id: string): Promise<boolean>;
}
