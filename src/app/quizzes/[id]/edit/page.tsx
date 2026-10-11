'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm';
import { Quiz } from '@/types/quiz';

function EditQuizContent() {
  const params = useParams();
  const id = params?.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.quiz) {
          setQuiz(data.quiz);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3" />
        <span>Loading quiz...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        Quiz not found.
      </div>
    );
  }

  return <QuizEditorForm initialQuiz={quiz} isEditing={true} />;
}

export default function EditQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Loading quiz...
        </div>
      }
    >
      <EditQuizContent />
    </Suspense>
  );
}
