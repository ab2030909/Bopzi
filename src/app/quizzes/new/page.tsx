import React, { Suspense } from 'react';
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm';

export default function NewQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-bold text-sm">
          Loading Quiz Creator...
        </div>
      }
    >
      <QuizEditorForm isEditing={false} />
    </Suspense>
  );
}
