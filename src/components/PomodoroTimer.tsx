'use client';

import { useState, useEffect, useRef } from 'react';

interface PomodoroTimerProps {
  taskTitle: string;
  onComplete: (timeSpent: number) => void;
  onClose: () => void;
}

const TIME_OPTIONS = [
  { value: 10, label: '10 minutes', emoji: '⚡' },
  { value: 15, label: '15 minutes', emoji: '●' },
  { value: 20, label: '20 minutes', emoji: '■' },
  { value: 25, label: '25 minutes (Classic)', emoji: 'T' },
  { value: 30, label: '30 minutes', emoji: '▲' },
];

export default function PomodoroTimer({ taskTitle, onComplete, onClose }: PomodoroTimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(25); // Default to classic 25 minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timeLeft when selectedMinutes changes
  useEffect(() => {
    if (!isRunning && showTimeSelection) {
      setTimeLeft(selectedMinutes * 60);
    }
  }, [selectedMinutes, isRunning, showTimeSelection]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (!isBreak) {
        // Work session completed
        const timeSpent = selectedMinutes * 60; // in seconds
        onComplete(timeSpent);
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        // Break completed
        setIsBreak(false);
        setTimeLeft(selectedMinutes * 60);
        setShowTimeSelection(true);
      }
    }
  }, [timeLeft, isRunning, isBreak, selectedMinutes, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setShowTimeSelection(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(selectedMinutes * 60);
    setShowTimeSelection(true);
  };

  const handleTimeSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    // Only update timeLeft if showing time selection (not running/paused)
    if (showTimeSelection) {
      setTimeLeft(minutes * 60);
    }
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
          T Pomodoro Timer
        </h2>
        
        <p style={{ 
          margin: '0 0 2rem 0', 
          opacity: 0.9,
          fontSize: '1rem'
        }}>
          {taskTitle}
        </p>

        {/* Time Selection */}
        {showTimeSelection && !isRunning && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              opacity: 0.9
            }}>
              Choose your focus time:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.8rem',
              marginBottom: '1.5rem'
            }}>
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeSelect(option.value)}
                  style={{
                    background: selectedMinutes === option.value 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: selectedMinutes === option.value
                      ? '2px solid rgba(255, 255, 255, 0.8)'
                      : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '0.8rem 0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: selectedMinutes === option.value ? 'bold' : 'normal'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                    {option.emoji}
                  </div>
                  <div>{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2rem',
          margin: '1rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Progress Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
            transition: 'width 1s linear',
            borderRadius: '20px'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              fontFamily: 'monospace'
            }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ 
              fontSize: '1.2rem', 
              opacity: 0.8,
              marginBottom: '0.5rem'
            }}>
              {isBreak ? '⏸ Break Time' : `◯ Focus Time (${selectedMinutes} min)`}
            </div>
            {!showTimeSelection && (
              <div style={{ 
                fontSize: '0.9rem', 
                opacity: 0.7
              }}>
                {Math.round(progress)}% Complete
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {showTimeSelection ? (
            <button
              onClick={handleStart}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                padding: '0.8rem 2rem',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ▶ Start Focus Session
            </button>
          ) : (
            <>
              <button
                onClick={isRunning ? handlePause : () => setIsRunning(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ↻ Reset
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        {showTimeSelection && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '0.9rem',
            opacity: 0.8,
            lineHeight: '1.4'
          }}>
            ℹ <strong>Tip:</strong> Classic Pomodoro is 25 minutes, but choose what works best for your focus level!
          </div>
        )}
      </div>
    </div>
  );
} 