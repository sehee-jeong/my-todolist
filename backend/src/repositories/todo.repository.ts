import pool from '../config/db';
import { Todo, TodoStatus, CreateTodoDto, UpdateTodoDto } from '../types/todo.types';

type TodoRow = {
  id: string;
  member_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
};

function toTodo(row: TodoRow): Omit<Todo, 'overdue'> {
  return {
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAllByMemberId(memberId: string): Promise<Omit<Todo, 'overdue'>[]> {
  const result = await pool.query<TodoRow>(
    `SELECT id, member_id, title, description, due_date, status, created_at, updated_at
     FROM todo
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [memberId],
  );
  return result.rows.map(toTodo);
}

export async function findById(id: string): Promise<Omit<Todo, 'overdue'> | null> {
  const result = await pool.query<TodoRow>(
    `SELECT id, member_id, title, description, due_date, status, created_at, updated_at
     FROM todo WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? toTodo(result.rows[0]) : null;
}

export async function create(
  memberId: string,
  dto: CreateTodoDto,
): Promise<Omit<Todo, 'overdue'>> {
  const result = await pool.query<TodoRow>(
    `INSERT INTO todo (member_id, title, description, due_date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, member_id, title, description, due_date, status, created_at, updated_at`,
    [memberId, dto.title, dto.description ?? null, dto.dueDate ?? null],
  );
  return toTodo(result.rows[0]);
}

export async function update(
  id: string,
  dto: UpdateTodoDto,
): Promise<Omit<Todo, 'overdue'> | null> {
  const result = await pool.query<TodoRow>(
    `UPDATE todo
     SET title       = COALESCE($1, title),
         description = COALESCE($2, description),
         due_date    = COALESCE($3, due_date),
         updated_at  = now()
     WHERE id = $4
     RETURNING id, member_id, title, description, due_date, status, created_at, updated_at`,
    [dto.title ?? null, dto.description ?? null, dto.dueDate ?? null, id],
  );
  return result.rows[0] ? toTodo(result.rows[0]) : null;
}

export async function updateStatus(
  id: string,
  status: TodoStatus,
): Promise<Omit<Todo, 'overdue'> | null> {
  const result = await pool.query<TodoRow>(
    `UPDATE todo
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, member_id, title, description, due_date, status, created_at, updated_at`,
    [status, id],
  );
  return result.rows[0] ? toTodo(result.rows[0]) : null;
}

export async function deleteById(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM todo WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
