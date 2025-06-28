import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  pomodoroCount: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0, // in minutes
  },
}, {
  timestamps: true,
  _id: true, // Ensure subdocuments get _id
});

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  category: {
    type: String,
    default: 'general',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subtasks: [SubtaskSchema],
  pomodoroCount: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0, // in minutes
  },
  dueDate: {
    type: Date,
  },
  isMainTask: {
    type: Boolean,
    default: true,
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  order: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    default: '',
  },
  estimatedTime: {
    type: Number,
    default: 0, // estimated minutes to complete
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
}, {
  timestamps: true,
});

// Virtual for completion percentage
TaskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Auto-update main task status based on subtasks
TaskSchema.pre('save', function() {
  if (this.subtasks.length > 0) {
    const allCompleted = this.subtasks.every(subtask => subtask.completed);
    const someCompleted = this.subtasks.some(subtask => subtask.completed);
    
    if (allCompleted) {
      this.status = 'completed';
    } else if (someCompleted) {
      this.status = 'in-progress';
    } else {
      this.status = 'pending';
    }
  }
});

// Ensure virtual fields are serialized
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema); 