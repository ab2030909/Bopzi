import { gameManager } from '@/lib/game-manager';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  const game = gameManager.getGameByPin(pin);

  if (!game) {
    return new Response('Game not found', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connect ping
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', pin })}\n\n`));

      // Subscribe to real-time events
      const unsubscribe = gameManager.subscribe(pin, (payload) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (e) {
          // Stream might be closed by client
        }
      });

      // Keep alive heartbeat every 15 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(interval);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
