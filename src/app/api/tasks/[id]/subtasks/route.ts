import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

// POST - Yeni subtask ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('POST subtask request for task:', id);
    
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
    const { title } = body;

    if (!title?.trim()) {
      console.log('Invalid title:', title);
      return NextResponse.json(
        { error: 'Subtask title is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('DB connected');
    
    const task = await Task.findOne({ 
      _id: id, 
      userId: session.user.id 
    });

    console.log('Task found:', !!task);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Create new subtask
    const newSubtask = {
      title: title.trim(),
      completed: false,
      order: (task.subtasks || []).length,
      pomodoroCount: 0,
      timeSpent: 0,
    };

    console.log('New subtask:', newSubtask);
    console.log('Current subtasks length:', (task.subtasks || []).length);

    if (!task.subtasks) {
      task.subtasks = [];
    }
    task.subtasks.push(newSubtask);
    
    console.log('Before save - subtasks length:', task.subtasks.length);
    const savedTask = await task.save();
    console.log('After save - subtasks length:', savedTask.subtasks.length);

    const taskWithVirtuals = savedTask.toObject({ virtuals: true });
    
    return NextResponse.json({ 
      message: 'Subtask added successfully',
      task: taskWithVirtuals,
      subtask: savedTask.subtasks[savedTask.subtasks.length - 1]
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// PUT - Subtask'ları güncelle (reorder, toggle, vb.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subtasks } = await request.json();

    if (!Array.isArray(subtasks)) {
      return NextResponse.json(
        { error: 'Invalid subtasks data' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const task = await Task.findOne({ 
      _id: id, 
      userId: session.user.id 
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update subtasks
    task.subtasks = subtasks.map((subtask, index) => ({
      ...subtask,
      order: index
    }));

    const savedTask = await task.save();
    const taskWithVirtuals = savedTask.toObject({ virtuals: true });

    return NextResponse.json({ 
      message: 'Subtasks updated successfully',
      task: taskWithVirtuals
    });
  } catch (error) {
    console.error('Update subtasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 