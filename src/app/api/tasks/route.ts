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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, priority = 'medium', category = 'general' } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const task = await Task.create({
      title,
      description,
      priority,
      category,
      userId: session.user.id,
      status: 'pending',
      subtasks: [],
      pomodoroCount: 0,
      timeSpent: 0
    });

    const taskWithVirtuals = task.toObject({ virtuals: true });

    return NextResponse.json(
      { 
        message: 'Task created successfully',
        task: taskWithVirtuals 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 