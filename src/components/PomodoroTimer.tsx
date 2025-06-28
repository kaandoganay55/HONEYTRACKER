'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Subtask } from '@/types/task';

interface PomodoroTimerProps {
  task: Task;
  subtask?: Subtask;
  onSessionComplete: (timeSpent: number) => void;
  onClose: () => void;
}

export default function PomodoroTimer({ task, subtask, onSessionComplete, onClose }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [sessionCount, setSessionCount] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = (type: typeof sessionType) => {
    switch (type) {
      case 'work': return 25 * 60;
      case 'short-break': return 5 * 60;
      case 'long-break': return 15 * 60;
      default: return 25 * 60;
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getSessionDuration(sessionType));
  };

  const completeSession = useCallback(() => {
    setIsRunning(false);
    
    if (sessionType === 'work') {
      const timeSpent = 25; // 25 minutes
      onSessionComplete(timeSpent);
      setSessionCount(prev => prev + 1);
      
      // Auto-switch to break
      const isLongBreak = (sessionCount + 1) % 4 === 0;
      const nextType = isLongBreak ? 'long-break' : 'short-break';
      setSessionType(nextType);
      setTimeLeft(getSessionDuration(nextType));
    } else {
      // Break completed, switch back to work
      setSessionType('work');
      setTimeLeft(getSessionDuration('work'));
    }
    
    // Play notification sound
    if (typeof window !== 'undefined' && 'Audio' in window) {
      try {
        const audio = new Audio('/notification.mp3'); // Add a notification sound file
        audio.play().catch(() => {}); // Ignore audio play errors
      } catch (error) {
        // Fallback notification
        new Notification(`${sessionType === 'work' ? 'Work' : 'Break'} session completed!`);
      }
    }
  }, [sessionType, sessionCount, onSessionComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return getSessionDuration(sessionType);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, completeSession, sessionType]);

  const progress = ((getSessionDuration(sessionType) - timeLeft) / getSessionDuration(sessionType)) * 100;

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <h3 className="timer-title">
          🍅 {sessionType === 'work' ? 'Focus Time' : 
               sessionType === 'short-break' ? 'Short Break' : 'Long Break'}
        </h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="timer-task-info">
        <div className="task-name">{task.title}</div>
        {subtask && <div className="subtask-name">→ {subtask.title}</div>}
      </div>

      <div className="timer-circle">
        <svg className="progress-ring" width="200" height="200">
          <circle
            className="progress-ring-bg"
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="10"
          />
          <circle
            className="progress-ring-fill"
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke={sessionType === 'work' ? '#ff6b6b' : '#4ecdc4'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="timer-display">
          <div className="time-text">{formatTime(timeLeft)}</div>
          <div className="session-info">
            Session {sessionCount + 1}
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={startTimer} className="btn-modern timer-btn start-btn">
            ▶️ Start
          </button>
        ) : (
          <button onClick={pauseTimer} className="btn-modern timer-btn pause-btn">
            ⏸️ Pause
          </button>
        )}
        <button onClick={resetTimer} className="btn-modern timer-btn reset-btn">
          🔄 Reset
        </button>
      </div>

      <div className="timer-stats">
        <div className="stat">
          <span className="stat-label">Sessions Today</span>
          <span className="stat-value">{sessionCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time Spent</span>
          <span className="stat-value">{Math.floor((task.timeSpent || 0) / 60)}h {(task.timeSpent || 0) % 60}m</span>
        </div>
      </div>
    </div>
  );
} 