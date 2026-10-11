import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = gameManager.getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = gameManager.getQuiz(id);
    if (!existing) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const updated = gameManager.saveQuiz({
      ...existing,
      ...body,
      id,
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, quiz: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = gameManager.deleteQuiz(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
