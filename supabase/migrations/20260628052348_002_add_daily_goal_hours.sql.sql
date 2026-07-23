-- Add daily_goal_hours column to users table
ALTER TABLE public.users ADD COLUMN daily_goal_hours integer DEFAULT 4;

-- Add check constraint to ensure reasonable values (1-12 hours)
ALTER TABLE public.users ADD CONSTRAINT daily_goal_hours_check 
  CHECK (daily_goal_hours >= 1 AND daily_goal_hours <= 12);