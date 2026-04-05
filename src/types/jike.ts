export interface JikeUser {
  user_id: string;
  username: string;
  nickname: string;
  avatar: string;
  bio?: string;
  is_verified: boolean;
}

export interface JikeTopic {
  topic_id: string;
  content: string;
  subscribers_count: number;
  square_picture: string;
}

export interface JikeLinkInfo {
  title: string;
  picture_url: string;
  link_url: string;
  source: string;
}

export interface JikePostBase {
  type: string;
  status: string;
  user: JikeUser;
  content: string;
  urls_in_text: string[];
  topic?: JikeTopic;
  like_count: number;
  comment_count: number;
  repost_count: number;
  share_count: number;
  collected: boolean;
  pictures: string[];
  raw_content?: string;
  action_time?: string;
  like_icon?: string;
  subtitle?: string;
  story_status?: string;
  feed_type?: string;
  record_id?: string;
  link_info?: JikeLinkInfo;
  created_at: string;
  edited_at?: string;
  upload_time: number;
}

export interface JikeReferencedPost extends JikePostBase {
  post_id: string;
  post_url: string;
}

export interface JikePost extends JikeReferencedPost {
  captured_at?: number;
  target_type?: string;
  root_type?: string;
  sync_comment_id?: string;
  target_post?: JikeReferencedPost;
}

export interface JikeComment {
  comment_id: string;
  target_id: string;
  target_type: string;
  post_url: string;
  captured_at?: number;
  type: string;
  status: string;
  thread_id: string;
  level: number;
  user: JikeUser;
  content: string;
  like_count: number;
  reply_count: number;
  pictures: string[];
  created_at: string;
  upload_time: number;
}
