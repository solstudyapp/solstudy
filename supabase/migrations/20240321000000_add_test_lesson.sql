-- Add a test lesson
INSERT INTO public.lessons (title, difficulty, category, description, points, published)
VALUES 
  ('Introduction to Solana', 'beginner', 'Blockchain', 'Learn the basics of Solana blockchain', 100, true),
  ('Smart Contracts on Solana', 'intermediate', 'Development', 'Learn how to write smart contracts on Solana', 200, true),
  ('DeFi on Solana', 'advanced', 'DeFi', 'Learn about decentralized finance on Solana', 300, true)
ON CONFLICT (id) DO NOTHING;

-- Add test sections for the first lesson
INSERT INTO public.sections (lesson_id, title, position)
SELECT 
  id, 
  'Introduction', 
  0
FROM public.lessons 
WHERE title = 'Introduction to Solana'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sections (lesson_id, title, position)
SELECT 
  id, 
  'Getting Started', 
  1
FROM public.lessons 
WHERE title = 'Introduction to Solana'
ON CONFLICT (id) DO NOTHING;

-- Add test pages for the first section
INSERT INTO public.pages (section_id, title, content, position)
SELECT 
  s.id, 
  'What is Solana?', 
  '<p>Solana is a high-performance blockchain platform designed for decentralized applications and marketplaces.</p>', 
  0
FROM public.sections s
JOIN public.lessons l ON s.lesson_id = l.id
WHERE l.title = 'Introduction to Solana' AND s.title = 'Introduction'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pages (section_id, title, content, position)
SELECT 
  s.id, 
  'Why Solana?', 
  '<p>Solana offers high throughput, low transaction costs, and fast confirmation times.</p>', 
  1
FROM public.sections s
JOIN public.lessons l ON s.lesson_id = l.id
WHERE l.title = 'Introduction to Solana' AND s.title = 'Introduction'
ON CONFLICT (id) DO NOTHING;

-- Add a test quiz for the first section
INSERT INTO public.quizzes (title, questions, points, lesson_id, section_id)
SELECT 
  'Introduction Quiz',
  '[
    {
      "id": "q1",
      "question": "What is Solana?",
      "options": ["A cryptocurrency", "A blockchain platform", "A wallet", "A programming language"],
      "correctAnswer": 1
    },
    {
      "id": "q2",
      "question": "What are the advantages of Solana?",
      "options": ["High throughput", "Low transaction costs", "Fast confirmation times", "All of the above"],
      "correctAnswer": 3
    }
  ]'::jsonb,
  50,
  l.id,
  s.id
FROM public.sections s
JOIN public.lessons l ON s.lesson_id = l.id
WHERE l.title = 'Introduction to Solana' AND s.title = 'Introduction'
ON CONFLICT (id) DO NOTHING; 