import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, hostId } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 });
    }

    const session = gameManager.createGame(quizId, hostId);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create game' }, { status: 500 });
  }
}
