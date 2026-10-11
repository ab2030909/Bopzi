import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await params;
    const body = await req.json();
    const { action, nickname, avatar, participantId, questionId, selectedOptionId } = body;

    const game = gameManager.getGameByPin(pin);
    if (!game) {
      return NextResponse.json({ error: 'Game PIN not found or expired.' }, { status: 404 });
    }

    switch (action) {
      case 'join': {
        if (!nickname) {
          return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
        }
        const participant = gameManager.joinPlayer(pin, nickname, avatar || 'blip');
        return NextResponse.json({ success: true, participant });
      }

      case 'start': {
        const session = gameManager.startGame(pin);
        return NextResponse.json({ success: true, session });
      }

      case 'submit_answer': {
        if (!participantId || !questionId || !selectedOptionId) {
          return NextResponse.json(
            { error: 'participantId, questionId, and selectedOptionId are required.' },
            { status: 400 }
          );
        }
        const result = gameManager.submitAnswer(pin, participantId, questionId, selectedOptionId);
        return NextResponse.json(result);
      }

      case 'reveal': {
        const session = gameManager.revealAnswer(pin);
        return NextResponse.json({ success: true, session });
      }

      case 'leaderboard': {
        const session = gameManager.showLeaderboard(pin);
        return NextResponse.json({ success: true, session });
      }

      case 'next_question': {
        const session = gameManager.nextQuestion(pin);
        return NextResponse.json({ success: true, session });
      }

      case 'finish': {
        const session = gameManager.finishGame(pin);
        return NextResponse.json({ success: true, session });
      }

      case 'kick': {
        if (!participantId) {
          return NextResponse.json({ error: 'participantId is required.' }, { status: 400 });
        }
        const removed = gameManager.kickPlayer(pin, participantId);
        return NextResponse.json({ success: removed });
      }

      default:
        return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 400 });
  }
}
