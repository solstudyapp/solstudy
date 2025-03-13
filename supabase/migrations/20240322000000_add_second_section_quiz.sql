-- Add a test quiz for the second section
INSERT INTO public.quizzes (title, questions, points, lesson_id, section_id)
SELECT 
  'Getting Started Quiz',
  '[
    {
      "id": "q1",
      "question": "What do you need to get started with Solana development?",
      "options": ["A Solana wallet", "Node.js and Rust", "A high-end computer", "All of the above"],
      "correctAnswer": 3
    },
    {
      "id": "q2",
      "question": "Which tool is commonly used for Solana development?",
      "options": ["Anchor", "Hardhat", "Truffle", "Remix"],
      "correctAnswer": 0
    }
  ]'::jsonb,
  50,
  l.id,
  s.id
FROM public.sections s
JOIN public.lessons l ON s.lesson_id = l.id
WHERE l.title = 'Introduction to Solana' AND s.title = 'Getting Started'
ON CONFLICT (id) DO NOTHING;

-- Add a final test for the lesson
INSERT INTO public.quizzes (title, questions, points, lesson_id, is_final_test)
SELECT 
  'Final Test: Introduction to Solana',
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
    },
    {
      "id": "q3",
      "question": "What do you need to get started with Solana development?",
      "options": ["A Solana wallet", "Node.js and Rust", "A high-end computer", "All of the above"],
      "correctAnswer": 3
    },
    {
      "id": "q4",
      "question": "Which tool is commonly used for Solana development?",
      "options": ["Anchor", "Hardhat", "Truffle", "Remix"],
      "correctAnswer": 0
    }
  ]'::jsonb,
  100,
  l.id,
  true
FROM public.lessons l
WHERE l.title = 'Introduction to Solana'
ON CONFLICT (id) DO NOTHING; 