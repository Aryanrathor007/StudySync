-- Add exam_date column for countdown feature
ALTER TABLE public.users ADD COLUMN exam_date date;
ALTER TABLE public.users ADD COLUMN exam_name text DEFAULT 'JEE Main';

-- Add lofi_beats_url for music customization
ALTER TABLE public.users ADD COLUMN lofi_beats_url text;