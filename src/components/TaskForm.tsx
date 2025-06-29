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

const TASK_TEMPLATES = {
  dailyRoutine: {
    title: "Daily Morning Routine",
    description: "Complete your daily morning activities",
    priority: 'medium' as const,
    category: 'personal',
    difficulty: 'easy' as const,
    tags: ['daily', 'routine', 'morning'],
    subtasks: [
      "Wake up and stretch",
      "Drink a glass of water",
      "Make the bed",
      "Brush teeth",
      "Take a shower",
      "Have a healthy breakfast",
      "Check today's schedule"
    ]
  },
  workProject: {
    title: "New Work Project",
    description: "Project planning and execution template",
    priority: 'high' as const,
    category: 'work',
    difficulty: 'medium' as const,
    tags: ['project', 'work', 'planning'],
    subtasks: [
      "Define project scope and goals",
      "Research and gather requirements",
      "Create project timeline",
      "Identify resources needed",
      "Set up project structure",
      "Create initial documentation",
      "Schedule team meetings"
    ]
  },
  workoutPlan: {
    title: "Weekly Workout Plan",
    description: "Stay fit with a structured workout routine",
    priority: 'medium' as const,
    category: 'health',
    difficulty: 'medium' as const,
    tags: ['fitness', 'health', 'weekly'],
    subtasks: [
      "Monday: Cardio workout (30 min)",
      "Tuesday: Upper body strength training",
      "Wednesday: Rest day or light yoga",
      "Thursday: Lower body strength training",
      "Friday: Cardio workout (30 min)",
      "Saturday: Full body workout",
      "Sunday: Rest and recovery"
    ]
  },
  shoppingList: {
    title: "Weekly Grocery Shopping",
    description: "Essential items for the week",
    priority: 'low' as const,
    category: 'shopping',
    difficulty: 'easy' as const,
    tags: ['grocery', 'weekly', 'essentials'],
    subtasks: [
      "Fresh fruits and vegetables",
      "Dairy products (milk, yogurt, cheese)",
      "Protein sources (meat, fish, eggs)",
      "Pantry staples (rice, pasta, bread)",
      "Snacks and beverages",
      "Cleaning supplies",
      "Personal care items"
    ]
  },
  studySession: {
    title: "Study Session Plan",
    description: "Structured learning and review session",
    priority: 'high' as const,
    category: 'learning',
    difficulty: 'medium' as const,
    tags: ['study', 'learning', 'academic'],
    subtasks: [
      "Review previous lesson notes",
      "Read new chapter/material",
      "Take detailed notes",
      "Practice exercises",
      "Create summary/flashcards",
      "Test understanding with quiz",
      "Plan next study session"
    ]
  },
  homeCleanup: {
    title: "Weekend House Cleanup",
    description: "Deep cleaning and organizing your living space",
    priority: 'medium' as const,
    category: 'personal',
    difficulty: 'medium' as const,
    tags: ['cleaning', 'organizing', 'weekend'],
    subtasks: [
      "Declutter and organize living room",
      "Clean kitchen and appliances",
      "Bathroom deep clean",
      "Vacuum and mop floors",
      "Dust furniture and surfaces",
      "Laundry and folding clothes",
      "Take out trash and recycling"
    ]
  }
};

export default function TaskForm({ onSubmit, initialData, isLoading = false, isEdit = false }: UpdatedTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [tagInput, setTagInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority || 'medium');
      setCategory(initialData.category || 'general');
      setDueDate(initialData.dueDate || '');
      setTags(initialData.tags || []);
      setDifficulty(initialData.difficulty || 'medium');

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
      const taskData = { 
        title: title.trim(), 
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || undefined,
        tags,
        difficulty,
        notes: notes.trim() || undefined,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined
      };

      // Add subtasks from template if a template was selected
      if (selectedTemplate && !isEdit) {
        const template = TASK_TEMPLATES[selectedTemplate as keyof typeof TASK_TEMPLATES];
        if (template) {
          (taskData as any).templateSubtasks = template.subtasks;
        }
      }

      onSubmit(taskData);
      
      if (!isEdit) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('general');
        setDueDate('');
        setTags([]);
        setDifficulty('medium');
        setNotes('');
        setIsRecurring(false);
        setRecurringPattern('daily');
        setSelectedTemplate('');
      }
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = TASK_TEMPLATES[templateKey as keyof typeof TASK_TEMPLATES];
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setPriority(template.priority);
      setCategory(template.category);
      setDifficulty(template.difficulty);
      setTags([...template.tags]);
      setSelectedTemplate(templateKey);
    }
  };

  const getSelectedTemplate = () => {
    if (!selectedTemplate) return null;
    return TASK_TEMPLATES[selectedTemplate as keyof typeof TASK_TEMPLATES];
  };

  const selectedTemplateData = getSelectedTemplate();

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('general');
    setDifficulty('medium');
    setTags([]);
    setDueDate('');
    setNotes('');
    setIsRecurring(false);
    setRecurringPattern('daily');
    setSelectedTemplate('');
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
        {isEdit ? '✎ Edit Task' : '+ Add New Task'}
      </h2>
      
      <form onSubmit={handleSubmit} className="form">
        {/* Template Selection */}
        {!isEdit && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label className="form-label">
                ☰ Quick Templates
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="btn-modern"
                  style={{ 
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    background: showTemplates ? 'var(--primary-gradient)' : 'rgba(102, 126, 234, 0.1)',
                    minWidth: 'auto'
                  }}
                >
                  {showTemplates ? 'Hide Templates' : 'Show Templates'}
                </button>
                {(title || description) && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="btn-modern"
                    style={{ 
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      background: 'rgba(231, 76, 60, 0.1)',
                      color: '#e74c3c',
                      minWidth: 'auto'
                    }}
                  >
                    Clear Form
                  </button>
                )}
              </div>
            </div>
            
            {/* Selected Template Preview */}
            {selectedTemplateData && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    ✓ Template Selected: {selectedTemplateData.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate('');
                      clearForm();
                    }}
                    style={{
                      background: 'rgba(231, 76, 60, 0.1)',
                      color: '#e74c3c',
                      border: '1px solid rgba(231, 76, 60, 0.3)',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  margin: '0 0 0.8rem 0',
                  fontSize: '0.9rem'
                }}>
                  This template will create <strong>{selectedTemplateData.subtasks.length} subtasks</strong> automatically when you submit.
                </p>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '0.8rem',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>Subtasks that will be created:</strong>
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.2rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}>
                    {selectedTemplateData.subtasks.map((subtask, index) => (
                      <li key={index} style={{ marginBottom: '0.3rem' }}>
                        {subtask}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {showTemplates && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                {Object.entries(TASK_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key)}
                    className="template-card"
                    style={{
                      padding: '1rem',
                      background: selectedTemplate === key 
                        ? 'rgba(102, 126, 234, 0.25)' 
                        : 'rgba(255, 255, 255, 0.08)',
                      border: selectedTemplate === key
                        ? '2px solid rgba(102, 126, 234, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      {selectedTemplate === key ? '✓ ' : ''}{template.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {template.description}
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '8px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            color: 'rgba(102, 126, 234, 0.8)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: selectedTemplate === key ? '#667eea' : 'var(--text-secondary)',
                        fontWeight: selectedTemplate === key ? 'bold' : 'normal'
                      }}>
                        ▦ {template.subtasks.length} steps
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Existing form fields */}
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