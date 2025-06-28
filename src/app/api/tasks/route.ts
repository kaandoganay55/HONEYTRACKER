import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

// GET - Kullanıcının tüm task'larını getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const tasks = await Task.find({ userId: session.user.id }).sort({ createdAt: -1 });

    // Ensure all tasks have required fields
    const normalizedTasks = tasks.map(task => ({
      ...task.toObject(),
      priority: task.priority || 'medium',
      category: task.category || 'general',
      subtasks: task.subtasks || [],
      pomodoroCount: task.pomodoroCount || 0,
      timeSpent: task.timeSpent || 0,
      status: task.status || 'pending',
      completionPercentage: task.completionPercentage || 0
    }));

    return NextResponse.json({ tasks: normalizedTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Yeni task oluştur
export async function POST(request: NextRequest) {
  try {
    console.log('POST request received');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', !!session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('Unauthorized: No session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      title, 
      description, 
      priority = 'medium',
      category = 'general',
      dueDate,
      tags,
      difficulty = 'medium',
      notes,
      isRecurring = false,
      recurringPattern,
      order = 0,
      templateSubtasks
    } = body;

    if (!title?.trim() || !description?.trim()) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('DB connected');
    
    // Create the task data
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      userId: session.user.id,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      difficulty,
      notes: notes?.trim() || '',
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      order,
      subtasks: [] as any[]
    };

    // Add template subtasks if provided
    if (templateSubtasks && Array.isArray(templateSubtasks)) {
      taskData.subtasks = templateSubtasks.map((subtaskTitle: string, index: number) => ({
        title: subtaskTitle,
        completed: false,
        order: index,
        pomodoroCount: 0,
        timeSpent: 0,
      }));
    }

    console.log('Creating task:', taskData);
    const task = new Task(taskData);
    const savedTask = await task.save();
    console.log('Task saved successfully');

    const taskWithVirtuals = savedTask.toObject({ virtuals: true });
    
    return NextResponse.json({ 
      message: 'Task created successfully',
      task: taskWithVirtuals 
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 