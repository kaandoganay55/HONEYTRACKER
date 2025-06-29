'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import Link from 'next/link';
import { Task } from '@/types/task';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'alphabetical' | 'order'>('order');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag and Drop sensors - optimized for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (error) {
      setError('An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

  // Create new task
  const handleCreateTask = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          order: tasks.length, // Add order field
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => [result.task, ...prev]);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      setError('An error occurred while creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task
  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => 
          prev.map(task => 
            task._id === editingTask._id ? result.task : task
          )
        );
        setEditingTask(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      setError('An error occurred while updating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task._id !== id));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      setError('An error occurred while deleting task');
    }
  };

  // Toggle task status
  const handleToggleStatus = async (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => 
          prev.map(task => 
            task._id === id ? result.task : task
          )
        );
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update task status');
      }
    } catch (error) {
      setError('An error occurred while updating task status');
    }
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => {
      // Status filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      // Category filter
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

      return matchesStatus && matchesPriority && matchesCategory;
    });

    // Sort tasks
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
        
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

    return filteredTasks;
  };

  // Get unique categories from tasks
  const getUniqueCategories = () => {
    const categories = tasks.map(task => task.category).filter(Boolean);
    return [...new Set(categories)];
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const filteredTasks = getFilteredAndSortedTasks();
    const oldIndex = filteredTasks.findIndex(task => task._id === active.id);
    const newIndex = filteredTasks.findIndex(task => task._id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update the UI
    const newOrder = arrayMove(filteredTasks, oldIndex, newIndex);
    
    // Update the order in original tasks array
    const updatedTasks = tasks.map(task => {
      const orderIndex = newOrder.findIndex(t => t._id === task._id);
      if (orderIndex !== -1) {
        return { ...task, order: orderIndex };
      }
      return task;
    });
    
    setTasks(updatedTasks);

    // Update order in backend
    try {
      const updatePromises = newOrder.map((task, index) => 
        fetch(`/api/tasks/${task._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: index }),
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Failed to update task order:', error);
      // Revert on error
      fetchTasks();
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get the active task for drag overlay
  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  return (
    <>
      <Navbar />
      
      <div className="main-content">
        {!session ? (
          // Welcome section for non-authenticated users
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome to Task Tracker! 📝
            </h1>
            <p className="welcome-subtitle">
              Organize your tasks beautifully and efficiently. Get started by creating your account!
            </p>
            <Link href="/auth">
              <button className="btn-modern">
                Get Started
              </button>
            </Link>
            
            <div style={{ marginTop: '3rem' }}>
              <h2 style={{ 
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1.5rem',
                fontSize: '1.8rem',
                textAlign: 'center'
              }}>
                ✨ Features
              </h2>
              <ul>
                <li>🎨 Beautiful and modern interface with glassmorphism design</li>
                <li>📱 Responsive design for all devices</li>
                <li>🔐 Secure user authentication</li>
                <li>📝 Create, edit, and delete tasks with rich features</li>
                <li>✅ Subtasks with checkboxes for step-by-step progress</li>
                <li>🍅 Integrated Pomodoro timer for focused work sessions</li>
                <li>📅 Due dates with visual indicators</li>
                <li>🏷️ Tags system for better organization</li>
                <li>⚡ Priority levels (Low, Medium, High)</li>
                <li>😊 Difficulty ratings (Easy, Medium, Hard)</li>
                <li>⏱️ Time estimation and tracking</li>
                <li>📝 Notes and detailed task descriptions</li>
                <li>🔄 Recurring tasks (Daily, Weekly, Monthly)</li>
                <li>📊 Progress tracking with visual bars</li>
                <li>🎯 Category-based task organization</li>
              </ul>
            </div>
          </div>
        ) : (
          // Dashboard for authenticated users
          <div className="tasks-section">
            <div className="tasks-header">
              <h1 className="tasks-title">My Tasks Dashboard 📋</h1>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <TaskForm 
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              initialData={editingTask ? {
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
                category: editingTask.category,
                dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().slice(0, 16) : undefined,
                tags: editingTask.tags,
                difficulty: editingTask.difficulty,

                notes: editingTask.notes,
                isRecurring: editingTask.isRecurring,
                recurringPattern: editingTask.recurringPattern
              } : undefined}
              isLoading={isSubmitting}
              isEdit={!!editingTask}
            />

            {editingTask && (
              <button
                onClick={handleCancelEdit}
                className="btn-modern"
                style={{ 
                  background: 'linear-gradient(135deg, #6c757d, #495057)',
                  marginBottom: '2rem'
                }}
              >
                Cancel Edit
              </button>
            )}

            {/* Filters and Search */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                fontSize: '1.2rem'
              }}>
                ⌬ Filters
              </h3>

              {/* Filter Controls */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {/* Status Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ◆ Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ◇ Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ◈ Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ⟷ Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="order">↕ Custom Order (Drag & Drop)</option>
                    <option value="created">📅 Date Created</option>
                    <option value="dueDate">⏰ Due Date</option>
                    <option value="priority">⚡ Priority</option>
                    <option value="alphabetical">🔤 Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="tasks-grid">
              <div style={{ gridColumn: '1 / -1', marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem',
                  fontSize: '1.8rem'
                }}>
                  Your Tasks ({getFilteredAndSortedTasks().length} of {tasks.length})
                </h2>
                
                {sortBy === 'order' && tasks.length > 1 && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    margin: 0
                  }}>
                                         ↕ Drag the grip handles (≡) to reorder your tasks
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="loading">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="glass-card" style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  gridColumn: '1 / -1'
                }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    No tasks yet! 🎯
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Create your first task above to get started.
                  </p>
                </div>
              ) : getFilteredAndSortedTasks().length === 0 ? (
                <div className="glass-card" style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  gridColumn: '1 / -1'
                }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    No tasks match your filters! 🔍
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Try adjusting your search criteria or clear the filters.
                  </p>
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterCategory('all');
                    }}
                    className="btn-modern"
                    style={{ marginTop: '1rem' }}
                  >
                    Clear All Filters
                  </button>
        </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={getFilteredAndSortedTasks().map(task => task._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getFilteredAndSortedTasks().map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onToggleStatus={handleToggleStatus}
                        onUpdateTask={(updatedTask) => {
                          setTasks(prev => 
                            prev.map(t => 
                              t._id === updatedTask._id ? updatedTask : t
                            )
                          );
                        }}
                      />
                    ))}
                  </SortableContext>
                  
                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeTask ? (
                      <div style={{
                        transform: 'rotate(5deg)',
                        opacity: 0.9,
                        cursor: 'grabbing'
                      }}>
                        <TaskCard
                          task={activeTask}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onToggleStatus={() => {}}
                          onUpdateTask={() => {}}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        )}
    </div>
    </>
  );
}
