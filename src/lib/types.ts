
export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

export interface Solution {
  id: string;
  title: string;
  content: string;
  code: string;
  createdAt: Date;
  images?: string[];
  likes: number;
  comments: Comment[];
  likedByCurrentUser?: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  createdAt: Date;
  images?: string[];
  solutions: Solution[];
}
