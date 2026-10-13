export interface GuessItem {
  id: string;
  name: string;
  imageUrl: string;
  hint?: string;
  category?: string;
  revealed?: boolean;
}

export type MysteryEffect = 'none' | 'blur' | 'silhouette' | 'tiles';

export interface ScoreTeam {
  id: string;
  name: string;
  score: number;
  color: string;
}
