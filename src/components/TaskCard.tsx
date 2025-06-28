'use client';

import { useState } from 'react';
import { Task, Subtask } from '@/types/task';
import PomodoroTimer from './PomodoroTimer';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'pending' | 'in-progress' | 'completed') => void;
  onUpdateTask: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus, onUpdateTask }: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null);

  const handleToggleStatus = () => {
    let newStatus: 'pending' | 'in-progress' | 'completed';
    
    if (task.status === 'completed') {
      newStatus = 'pending';
    } else if (task.status === 'pending') {
      newStatus = task.subtasks && task.subtasks.length > 0 && task.subtasks.some(s => s.completed) 
        ? 'in-progress' 
        : 'completed';
    } else {
      newStatus = 'completed';
    }
    
    onToggleStatus(task._id, newStatus);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      console.log('Adding subtask:', newSubtaskTitle.trim(), 'to task:', task._id);
      
      const response = await fetch(`/api/tasks/${task._id}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Subtask added successfully:', data);
        onUpdateTask(data.task);
        setNewSubtaskTitle('');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error adding subtask: ${errorData.error || 'Unknown error'}`);
      }
          } catch (error) {
        console.error('Error adding subtask:', error);
        alert('Error adding subtask: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(subtask => 
      subtask._id === subtaskId 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    try {
      const response = await fetch(`/api/tasks/${task._id}/subtasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateTask(data.task);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter(subtask => subtask._id !== subtaskId);

    try {
      const response = await fetch(`/api/tasks/${task._id}/subtasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateTask(data.task);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handlePomodoroComplete = async (timeSpent: number) => {
    // Update task time spent
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeSpent: (task.timeSpent || 0) + timeSpent,
          pomodoroCount: (task.pomodoroCount || 0) + 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateTask(data.task);
      }
    } catch (error) {
      console.error('Error updating pomodoro stats:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#2ecc71';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'hard': return '😰';
      default: return '😐';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'shopping': return '🛒';
      case 'health': return '🏥';
      case 'learning': return '📚';
      case 'general': return '📝';
      default: return '📝';
    }
  };

  const getDueDateColor = (dueDate: Date | string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return '#e74c3c'; // Overdue - red
    if (diffHours < 24) return '#f39c12'; // Due soon - orange
    if (diffHours < 72) return '#f1c40f'; // Due this week - yellow
    return '#2ecc71'; // Due later - green
  };

  const formatDueDate = (dueDate: Date | string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < -24) {
      const days = Math.floor(-diffHours / 24);
      return `${days}d overdue`;
    } else if (diffHours < 0) {
      return 'Overdue';
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return hours < 1 ? 'Due now' : `${hours}h left`;
    } else if (diffHours < 48) {
      return 'Due tomorrow';
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days}d left`;
    }
  };

  return (
    <>
      <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
        {/* Priority indicator */}
        <div 
          className="priority-indicator"
          style={{ 
            background: getPriorityColor(task.priority || 'medium'),
            position: 'absolute',
            top: '0',
            right: '1rem',
            width: '4px',
            height: '30px',
            borderRadius: '0 0 2px 2px'
          }}
        />

        <div className="task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div className="task-title">{task.title}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className="priority-badge" style={{ 
                fontSize: '0.8rem', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '10px',
                background: getPriorityColor(task.priority || 'medium') + '20',
                color: getPriorityColor(task.priority || 'medium'),
                border: `1px solid ${getPriorityColor(task.priority || 'medium')}30`
              }}>
                {(task.priority || 'medium').toUpperCase()}
              </span>
              
              {/* Difficulty Badge */}
              {task.difficulty && (
                <span className="difficulty-badge" style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '10px',
                  background: getDifficultyColor(task.difficulty) + '20',
                  color: getDifficultyColor(task.difficulty),
                  border: `1px solid ${getDifficultyColor(task.difficulty)}30`
                }}>
                  {getDifficultyIcon(task.difficulty)} {task.difficulty.toUpperCase()}
                </span>
              )}
              
              {/* Category Badge */}
              <span className="category-badge" style={{
                fontSize: '0.8rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                background: 'rgba(102, 126, 234, 0.1)',
                color: 'rgba(102, 126, 234, 1)',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                {getCategoryIcon(task.category)} {task.category}
              </span>
              
              {/* Pomodoro Count */}
              {(task.pomodoroCount || 0) > 0 && (
                <span className="pomodoro-count" style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>
                  🍅 {task.pomodoroCount || 0}
                </span>
              )}
              
              {/* Due Date Badge */}
              {task.dueDate && (
                <span className="due-date-badge" style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '10px',
                  background: getDueDateColor(task.dueDate) + '20',
                  color: getDueDateColor(task.dueDate),
                  border: `1px solid ${getDueDateColor(task.dueDate)}30`
                }}>
                  📅 {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>
            
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '8px',
                      background: 'rgba(224, 85, 196, 0.1)',
                      color: 'rgba(224, 85, 196, 1)',
                      border: '1px solid rgba(224, 85, 196, 0.3)'
                    }}
                  >
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button
              onClick={() => setShowPomodoro(true)}
              className="btn-modern pomodoro-btn"
              style={{ 
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
              }}
            >
              🍅 Focus
            </button>
            
            {/* Estimated Time */}
            {task.estimatedTime && task.estimatedTime > 0 && (
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                opacity: 0.8
              }}>
                ⏱️ ~{task.estimatedTime}min
              </span>
            )}
          </div>
        </div>

        <div className="task-description">{task.description}</div>
        
        {/* Notes Section */}
        {task.notes && task.notes.trim() && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '8px',
            borderLeft: '3px solid rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '0.3rem',
              fontWeight: 'bold'
            }}>
              📝 Notes:
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-primary)',
              fontStyle: 'italic'
            }}>
              {task.notes}
            </div>
          </div>
        )}

        {/* Progress bar for subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="progress-section" style={{ margin: '1rem 0' }}>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${task.completionPercentage || 0}%` }}
              />
            </div>
            <div className="progress-text">
              {(task.subtasks || []).filter(s => s.completed).length} / {(task.subtasks || []).length} subtasks completed
            </div>
          </div>
        )}

        {/* Subtasks section */}
        <div className="subtasks-section">
          <div className="subtasks-header">
            <h4 className="subtasks-title">
              Subtasks ({task.subtasks?.length || 0})
            </h4>
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="btn-modern add-subtask-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {showSubtasks ? '▲ Hide' : '▼ Show'}
            </button>
          </div>

          {showSubtasks && (
            <div>
              {/* Add new subtask */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add new subtask..."
                  className="subtask-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <button
                  onClick={handleAddSubtask}
                  className="btn-modern"
                  style={{ 
                    padding: '0.6rem 1rem',
                    fontSize: '0.8rem',
                    background: 'var(--accent-gradient)'
                  }}
                  disabled={!newSubtaskTitle.trim()}
                >
                  ➕
                </button>
              </div>

              {/* Subtasks list */}
              <ul className="subtasks-list">
                {(task.subtasks || []).map((subtask) => (
                  <li
                    key={subtask._id}
                    className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
                  >
                    <div
                      className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleSubtask(subtask._id!)}
                    />
                    <span className="subtask-text">{subtask.title}</span>
                    <div className="subtask-actions">
                      <button
                        onClick={() => {
                          setActiveSubtask(subtask);
                          setShowPomodoro(true);
                        }}
                        className="subtask-action-btn pomodoro-btn"
                      >
                        🍅
                      </button>
                      <button
                        onClick={() => handleDeleteSubtask(subtask._id!)}
                        className="subtask-action-btn delete-subtask-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Task actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <span className={`task-status ${task.status === 'completed' ? 'status-completed' : 
                                        task.status === 'in-progress' ? 'status-in-progress' : 'status-pending'}`}>
            {getStatusIcon(task.status)} {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
          </span>
          
          <div className="task-actions">
            <button
              onClick={handleToggleStatus}
              className="btn-modern"
              style={{ 
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                background: task.status === 'completed' 
                  ? 'linear-gradient(135deg, #f39c12, #e67e22)' 
                  : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                minWidth: '110px'
              }}
            >
              {task.status === 'completed' ? 'Reopen' : 'Complete'}
            </button>
            
            <button
              onClick={() => onEdit(task)}
              className="btn-modern"
              style={{ 
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                minWidth: '80px'
              }}
            >
              Edit
            </button>
            
            <button
              onClick={() => onDelete(task._id)}
              className="btn-modern"
              style={{ 
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                minWidth: '80px'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Pomodoro Timer Modal */}
      {showPomodoro && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: 999
        }}>
          <PomodoroTimer
            task={task}
            subtask={activeSubtask || undefined}
            onSessionComplete={handlePomodoroComplete}
            onClose={() => {
              setShowPomodoro(false);
              setActiveSubtask(null);
            }}
          />
        </div>
      )}
    </>
  );
} 