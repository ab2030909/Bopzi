import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';
import { Quiz } from '@/types/quiz';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const quizzes = gameManager.getQuizzes(ownerId);
    return NextResponse.json({ success: true, quizzes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, theme_id, questions } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Quiz title is required.' }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required.' }, { status: 400 });
    }

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      owner_id: body.owner_id || 'host-local',
      title: title.trim(),
      description: description?.trim() || '',
      theme_id: theme_id || 'party-pop',
      cover_image: body.cover_image || undefined,
      visibility: body.visibility || 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: questions.map((q: any, qIdx: number) => ({
        id: q.id || `q-${Date.now()}-${qIdx}`,
        quiz_id: '',
        position: qIdx + 1,
        question_text: q.question_text || `Question ${qIdx + 1}`,
        question_type: q.question_type || 'multiple_choice',
        time_limit_seconds: Number(q.time_limit_seconds) || 20,
        points: Number(q.points) || 1000,
        image_url: q.image_url,
        answer_options: (q.answer_options || []).map((opt: any, oIdx: number) => ({
          id: opt.id || `opt-${qIdx}-${oIdx}`,
          position: oIdx + 1,
          answer_text: opt.answer_text || `Option ${oIdx + 1}`,
          is_correct: !!opt.is_correct,
        })),
      })),
    };

    // Fix quiz_id reference in questions
    newQuiz.questions.forEach(q => (q.quiz_id = newQuiz.id));

    const saved = gameManager.saveQuiz(newQuiz);
    return NextResponse.json({ success: true, quiz: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
