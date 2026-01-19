export interface MagnetItem {
  id: string;
  url: string;
  title: string;
  author: string;
  author_avatar?: string;
  created_at: string;
  status_url: string;
  preview_image?: string | null;
  sticker_id: string;
  matched_keyword: string | null;
  rank: number;
}

export interface MagnetsData {
  generated_at: string;
  source: {
    instance: string;
    required_hashtag: string;
    limit: number;
  };
  items: MagnetItem[];
}

export type FridgeState =
  | 'BOOT'
  | 'CLOSED'
  | 'OPENING'
  | 'OPEN'
  | 'CLOSING'
  | 'ERROR';

export interface MagnetPosition {
  x: number;
  y: number;
  rotation: number;
  size: number;
}
