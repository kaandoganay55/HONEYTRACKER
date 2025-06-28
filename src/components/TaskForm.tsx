'use client';

import { useState, useEffect } from 'react';

interface TaskFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  initialData?: {
    title: string;
    description: string;
  };
  isLoading?: boolean;
  isEdit?: boolean;
}

interface TaskFormData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

interface UpdatedTaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: TaskFormData;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function TaskForm({ onSubmit, initialData, isLoading = false, isEdit = false }: UpdatedTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority || 'medium');
      setCategory(initialData.category || 'general');
      setDueDate(initialData.dueDate || '');
      setTags(initialData.tags || []);
      setDifficulty(initialData.difficulty || 'medium');
      setEstimatedTime(initialData.estimatedTime || 0);
      setNotes(initialData.notes || '');
      setIsRecurring(initialData.isRecurring || false);
      setRecurringPattern(initialData.recurringPattern || 'daily');
    }
  }, [initialData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit({ 
        title: title.trim(), 
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || undefined,
        tags,
        difficulty,
        estimatedTime: estimatedTime > 0 ? estimatedTime : undefined,
        notes: notes.trim() || undefined,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined
      });
      if (!isEdit) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('general');
        setDueDate('');
        setTags([]);
        setDifficulty('medium');
        setEstimatedTime(0);
        setNotes('');
        setIsRecurring(false);
        setRecurringPattern('daily');
      }
    }
  };

  return (
    <div className="task-form">
      <h2 style={{ 
        background: 'var(--primary-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1.5rem',
        fontSize: '1.8rem',
        textAlign: 'center'
      }}>
        {isEdit ? '✏️ Edit Task' : '➕ Add New Task'}
      </h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="Enter task title..."
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            placeholder="Enter task description..."
            required
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="form-input"
              disabled={isLoading}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              disabled={isLoading}
            >
              <option value="general">📝 General</option>
              <option value="work">💼 Work</option>
              <option value="personal">👤 Personal</option>
              <option value="shopping">🛒 Shopping</option>
              <option value="health">🏥 Health</option>
              <option value="learning">📚 Learning</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="difficulty" className="form-label">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="form-input"
              disabled={isLoading}
            >
              <option value="easy">😊 Easy</option>
              <option value="medium">😐 Medium</option>
              <option value="hard">😰 Hard</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
            <label htmlFor="dueDate" className="form-label">
              📅 Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label htmlFor="estimatedTime" className="form-label">
              ⏱️ Estimated Time (Minutes)
            </label>
            <input
              type="number"
              id="estimatedTime"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(Number(e.target.value))}
              className="form-input"
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Tags Section */}
        <div className="form-group">
          <label className="form-label">
            🏷️ Tags
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="form-input"
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-modern"
              disabled={isLoading || !tagInput.trim()}
              style={{ 
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                background: 'var(--accent-gradient)',
                minWidth: 'auto'
              }}
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '1rem'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            📝 Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
            placeholder="Add any additional notes..."
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Recurring Task Section */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              disabled={isLoading}
              style={{ 
                width: '18px', 
                height: '18px',
                accentColor: '#667eea'
              }}
            />
            <span className="form-label" style={{ margin: 0 }}>
              🔄 Recurring Task
            </span>
          </label>
          
          {isRecurring && (
            <select
              value={recurringPattern}
              onChange={(e) => setRecurringPattern(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="form-input"
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
              <option value="monthly">🗓️ Monthly</option>
            </select>
          )}
        </div>

        <button
          type="submit"
          className="btn-modern"
          disabled={isLoading || !title.trim() || !description.trim()}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Task' : 'Add Task'}
        </button>
      </form>
    </div>
  );
} 