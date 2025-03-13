-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  lesson text NOT NULL,
  section text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  points integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all quizzes"
ON public.quizzes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify quizzes"
ON public.quizzes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND email = 'admin@solstudy.com'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial quizzes
INSERT INTO public.quizzes (title, lesson, section, questions, points)
VALUES
  (
    'Blockchain Fundamentals Quiz',
    'intro-to-blockchain',
    'section1',
    '[
      {
        "id": "q1",
        "question": "What is a blockchain?",
        "options": [
          "A centralized database",
          "A distributed ledger technology",
          "A social media platform",
          "A programming language"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q2",
        "question": "What is the main feature of blockchain technology?",
        "options": [
          "Fast transaction speed",
          "Low cost",
          "Decentralization",
          "Easy to modify data"
        ],
        "correctAnswer": 2
      },
      {
        "id": "q3",
        "question": "What ensures the security of blockchain transactions?",
        "options": [
          "Government regulations",
          "Bank oversight",
          "Cryptographic algorithms",
          "Manual verification"
        ],
        "correctAnswer": 2
      }
    ]'::jsonb,
    100
  ),
  (
    'Blockchain Core Components Quiz',
    'intro-to-blockchain',
    'section2',
    '[
      {
        "id": "q1",
        "question": "What is a block in blockchain?",
        "options": [
          "A unit of storage containing transactions",
          "A programming error",
          "A type of cryptocurrency",
          "A security protocol"
        ],
        "correctAnswer": 0
      },
      {
        "id": "q2",
        "question": "What is a hash function used for in blockchain?",
        "options": [
          "To store user data",
          "To create unique block identifiers",
          "To process payments",
          "To connect to the internet"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q3",
        "question": "What is a consensus mechanism?",
        "options": [
          "A voting system",
          "A method to agree on the state of the blockchain",
          "A type of cryptocurrency",
          "A security feature"
        ],
        "correctAnswer": 1
      }
    ]'::jsonb,
    150
  ),
  (
    'Blockchain Applications Quiz',
    'intro-to-blockchain',
    'section3',
    '[
      {
        "id": "q1",
        "question": "Which is a common application of blockchain?",
        "options": [
          "Word processing",
          "Cryptocurrency",
          "Video editing",
          "Web browsing"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q2",
        "question": "What are smart contracts?",
        "options": [
          "Legal documents",
          "Self-executing contracts on blockchain",
          "Employment contracts",
          "Insurance policies"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q3",
        "question": "What is DeFi?",
        "options": [
          "A type of cryptocurrency",
          "A blockchain platform",
          "Decentralized Finance",
          "A security protocol"
        ],
        "correctAnswer": 2
      }
    ]'::jsonb,
    200
  ),
  (
    'Blockchain Mastery Final Test',
    'intro-to-blockchain',
    'final',
    '[
      {
        "id": "q1",
        "question": "What is the role of miners in blockchain?",
        "options": [
          "To validate and add new blocks",
          "To create cryptocurrencies",
          "To write smart contracts",
          "To store data"
        ],
        "correctAnswer": 0
      },
      {
        "id": "q2",
        "question": "What is a private key used for?",
        "options": [
          "To view transactions",
          "To sign transactions",
          "To create new blocks",
          "To mine cryptocurrency"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q3",
        "question": "What is a fork in blockchain?",
        "options": [
          "A type of cryptocurrency",
          "A split in the blockchain",
          "A security feature",
          "A mining tool"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q4",
        "question": "What is the purpose of a public key?",
        "options": [
          "To sign transactions",
          "To create new blocks",
          "To receive cryptocurrency",
          "To mine blocks"
        ],
        "correctAnswer": 2
      },
      {
        "id": "q5",
        "question": "What is the main advantage of decentralization?",
        "options": [
          "Faster transactions",
          "Lower costs",
          "No single point of failure",
          "Easier maintenance"
        ],
        "correctAnswer": 2
      }
    ]'::jsonb,
    500
  ),
  (
    'Knowledge Check',
    'default',
    'default',
    '[
      {
        "id": "q1",
        "question": "What is blockchain technology primarily known for?",
        "options": [
          "Social networking",
          "Cryptocurrency and secure transactions",
          "Cloud storage",
          "Gaming"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q2",
        "question": "Which was the first cryptocurrency?",
        "options": [
          "Ethereum",
          "Bitcoin",
          "Litecoin",
          "Dogecoin"
        ],
        "correctAnswer": 1
      }
    ]'::jsonb,
    50
  ); 