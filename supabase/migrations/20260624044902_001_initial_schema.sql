-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  exam_type TEXT DEFAULT 'Other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communities_select_all" ON communities FOR SELECT TO authenticated USING (true);
CREATE POLICY "communities_insert_admin" ON communities FOR INSERT TO authenticated WITH CHECK (false);

-- Community members
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm_select_all" ON community_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "cm_insert_own" ON community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cm_delete_own" ON community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ss_select_own" ON study_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ss_insert_own" ON study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ss_delete_own" ON study_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Pomodoro sessions table
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  focus_duration_minutes INTEGER NOT NULL,
  break_duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ps_select_own" ON pomodoro_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ps_insert_own" ON pomodoro_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ps_update_own" ON pomodoro_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_all" ON achievements FOR SELECT TO authenticated USING (true);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ua_select_all" ON user_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "ua_insert_own" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fs_select_involved" ON friendships FOR SELECT TO authenticated 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "fs_insert_own" ON friendships FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "fs_update_own" ON friendships FOR UPDATE TO authenticated 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'update',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_own" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pl_select_all" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "pl_insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pl_delete_own" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Study rooms table
CREATE TABLE study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sr_select_all" ON study_rooms FOR SELECT TO authenticated USING (true);

-- Study room participants
CREATE TABLE study_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE study_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srp_select_all" ON study_room_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "srp_insert_own" ON study_room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "srp_delete_own" ON study_room_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert default communities
INSERT INTO communities (name, description, icon) VALUES
  ('JEE', 'Joint Entrance Examination community', 'graduation-cap'),
  ('NEET', 'National Eligibility Entrance Test community', 'stethoscope'),
  ('UPSC', 'Union Public Service Commission community', 'landmark'),
  ('SSC', 'Staff Selection Commission community', 'briefcase'),
  ('GATE', 'Graduate Aptitude Test in Engineering community', 'cpu'),
  ('CAT', 'Common Admission Test community', 'bar-chart'),
  ('Other', 'Other Competitive Exams community', 'book-open');

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Step', 'Complete your first study session', 'footprints', 'study_sessions', 1),
  ('Getting Started', 'Study for 10 total hours', 'flame', 'total_hours', 10),
  ('Dedicated', 'Study for 50 total hours', 'star', 'total_hours', 50),
  ('Scholar', 'Study for 100 total hours', 'award', 'total_hours', 100),
  ('Master', 'Study for 500 total hours', 'trophy', 'total_hours', 500),
  ('Streak Master', 'Maintain a 30-day streak', 'zap', 'streak_days', 30),
  ('Top 10', 'Reach top 10 on the leaderboard', 'medal', 'leaderboard_rank', 10),
  ('Community Champion', 'Post 50 community updates', 'users', 'posts_count', 50),
  ('Pomodoro Pro', 'Complete 100 pomodoro sessions', 'timer', 'pomodoro_count', 100),
  ('Early Bird', 'Study before 6 AM', 'sunrise', 'early_sessions', 1),
  ('Night Owl', 'Study after midnight', 'moon', 'night_sessions', 1);
