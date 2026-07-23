export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  exam_type: string;
  daily_goal_hours: number;
  exam_date: string | null;
  exam_name: string | null;
  lofi_beats_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  member_count: number;
  created_at: string;
}

export interface CommunityMember {
  id: string;
  user_id: string;
  community_id: string;
  joined_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  focus_duration_minutes: number;
  break_duration_minutes: number;
  completed: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  unlocked_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  community_id: string;
  content: string;
  post_type: 'update' | 'motivation' | 'announcement';
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  community?: Community;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface StudyRoom {
  id: string;
  community_id: string;
  name: string;
  active_users: number;
  created_at: string;
  community?: Community;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_hours: number;
  streak: number;
  rank: number;
}

export interface UserStats {
  total_hours: number;
  daily_hours: number;
  weekly_hours: number;
  monthly_hours: number;
  current_streak: number;
  pomodoro_count: number;
  rank: number;
}
