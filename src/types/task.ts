export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
  order: number;
  pomodoroCount: number;
  timeSpent: number; // in minutes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  userId: string;
  subtasks: Subtask[];
  pomodoroCount: number;
  timeSpent: number; // in minutes
  dueDate?: Date;
  isMainTask: boolean;
  parentTaskId?: string;
  order: number;
  completionPercentage: number;
  tags?: string[];
  notes?: string;

  difficulty?: 'easy' | 'medium' | 'hard';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSession {
  taskId: string;
  subtaskId?: string;
  duration: number; // in minutes
  type: 'work' | 'short-break' | 'long-break';
  startTime: Date;
  endTime?: Date;
  completed: boolean;
} 