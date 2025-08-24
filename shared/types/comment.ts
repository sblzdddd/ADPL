import type { User } from './user';

export interface Comment {
  _id?: string;
  user: User;
  content: string;
  createdAt: string;
  parentComment?: string; // ID of parent comment for replies
  replies?: Comment[]; // Array of reply comments
}
