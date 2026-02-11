export type TodoStatus = 'PENDING' | 'DONE';

export interface Todo {
  id: string;
  memberId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  overdue: boolean;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  dueDate?: string;
}
