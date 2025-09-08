import type { Coordinates } from "./coordinates";
import type { User } from "./user";

export interface PaintRequest {
  _id: string;
  image?: {
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    size: number;
    width?: number;
    height?: number;
    originalFilename?: string;
  };
  coordinates: Coordinates;
  title: string;
  owner: User;
  participants: User[];
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
}