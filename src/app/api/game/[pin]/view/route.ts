import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await params;
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'host' or 'player'
    const participantId = searchParams.get('participantId');

    const game = gameManager.getGameByPin(pin);
    if (!game) {
      return NextResponse.json({ error: 'Game PIN not found or expired.' }, { status: 404 });
    }

    if (role === 'host') {
      const view = gameManager.getHostView(pin);
      return NextResponse.json({ success: true, view });
    } else {
      if (!participantId) {
        // Return basic lobby room info for players before joining
        return NextResponse.json({
          success: true,
          room: {
            pin: game.session.game_pin,
            quizTitle: game.quiz.title,
            themeId: game.session.theme_id,
            state: game.session.state,
            playerCount: game.participants.size,
          },
        });
      }

      const view = gameManager.getPlayerView(pin, participantId);
      if (!view) {
        return NextResponse.json({ error: 'Participant not found in session.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, view });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
