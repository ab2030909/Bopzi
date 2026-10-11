import { ThemeId } from './theme';

export type QuestionType = 'multiple_choice' | 'true_false';

export interface AnswerOption {
  id: string;
  position: number;
  answer_text: string;
  is_correct: boolean;
  image_url?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  position: number;
  question_text: string;
  question_type: QuestionType;
  time_limit_seconds: number;
  points: number;
  image_url?: string;
  answer_options: AnswerOption[];
}

export interface Quiz {
  id: string;
  owner_id: string | null;
  title: string;
  description: string;
  theme_id: ThemeId;
  visibility: 'public' | 'private' | 'unlisted';
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export interface ClientQuestion {
  id: string;
  position: number;
  question_text: string;
  question_type: QuestionType;
  time_limit_seconds: number;
  points: number;
  image_url?: string;
  // Anti-cheat: during active question, correctness is STRIPPED from options
  answer_options: {
    id: string;
    position: number;
    answer_text: string;
  }[];
}
