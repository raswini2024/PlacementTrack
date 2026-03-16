-- =============================================
-- PlacementTrack Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS placement_track;
USE placement_track;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    preferred_language ENUM('Java','Python','C++') NOT NULL,
    dream_company VARCHAR(100) NOT NULL,
    dream_role VARCHAR(100) NOT NULL,
    skill_level ENUM('Beginner','Intermediate','Advanced') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    module_type ENUM('APTITUDE','PROGRAMMING','INTERVIEW') NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- Subtopics table
CREATE TABLE IF NOT EXISTS subtopics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('Easy','Medium','Hard') DEFAULT 'Easy',
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subtopic_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    difficulty ENUM('Easy','Medium','Hard') DEFAULT 'Easy',
    question_type ENUM('MCQ','CODING','SUBJECTIVE') DEFAULT 'MCQ',
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE
);

-- Student progress per subtopic
CREATE TABLE IF NOT EXISTS student_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subtopic_id BIGINT NOT NULL,
    total_attempts INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_attempted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_subtopic (student_id, subtopic_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE
);

-- Student answers history
CREATE TABLE IF NOT EXISTS student_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Mock tests
CREATE TABLE IF NOT EXISTS mock_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    test_type ENUM('APTITUDE','PROGRAMMING','MIXED') NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    score_percentage DECIMAL(5,2) DEFAULT 0.00,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Company-specific questions
CREATE TABLE IF NOT EXISTS company_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('Technical','HR','Aptitude','Programming') NOT NULL,
    year_asked INT,
    answer_hint TEXT
);

-- HR interview questions
CREATE TABLE IF NOT EXISTS hr_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    category VARCHAR(100),
    sample_answer TEXT,
    tips TEXT
);

-- =============================================
-- SEED DATA
-- =============================================

-- Topics - Aptitude
INSERT INTO topics (name, module_type, description, icon) VALUES
('Quantitative Aptitude', 'APTITUDE', 'Number-based math problems', 'calculator'),
('Logical Reasoning', 'APTITUDE', 'Pattern and logic problems', 'brain'),
('Verbal Ability', 'APTITUDE', 'English language skills', 'book');

-- Topics - Programming
INSERT INTO topics (name, module_type, description, icon) VALUES
('Basics', 'PROGRAMMING', 'Loops, conditions, functions', 'code'),
('Arrays & Strings', 'PROGRAMMING', 'Array and string manipulation', 'array'),
('Data Structures', 'PROGRAMMING', 'Stacks, queues, trees, graphs', 'tree'),
('Recursion', 'PROGRAMMING', 'Recursive problem solving', 'refresh');

-- Topics - Interview
INSERT INTO topics (name, module_type, description, icon) VALUES
('HR Questions', 'INTERVIEW', 'Behavioral and HR interview questions', 'person'),
('Technical Concepts', 'INTERVIEW', 'Core CS concepts', 'chip'),
('System Design', 'INTERVIEW', 'Design large-scale systems', 'server');

-- Subtopics for Quantitative Aptitude
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(1, 'Profit and Loss', 'Easy'),
(1, 'Time and Work', 'Medium'),
(1, 'Percentages', 'Easy'),
(1, 'Simple and Compound Interest', 'Medium'),
(1, 'Ratio and Proportion', 'Easy'),
(1, 'Speed, Time and Distance', 'Medium');

-- Subtopics for Logical Reasoning
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(2, 'Number Series', 'Easy'),
(2, 'Coding Decoding', 'Medium'),
(2, 'Blood Relations', 'Medium'),
(2, 'Direction Sense', 'Easy'),
(2, 'Syllogisms', 'Hard');

-- Subtopics for Verbal Ability
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(3, 'Reading Comprehension', 'Medium'),
(3, 'Synonyms and Antonyms', 'Easy'),
(3, 'Fill in the Blanks', 'Easy'),
(3, 'Sentence Correction', 'Medium');

-- Subtopics for Basics
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(4, 'Loops and Patterns', 'Easy'),
(4, 'Functions', 'Easy'),
(4, 'Conditions', 'Easy');

-- Subtopics for Arrays & Strings
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(5, 'Array Operations', 'Easy'),
(5, 'String Manipulation', 'Medium'),
(5, 'Two Pointer Technique', 'Hard');

-- Subtopics for Data Structures
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(6, 'Stack and Queue', 'Medium'),
(6, 'Linked Lists', 'Medium'),
(6, 'Trees and BST', 'Hard');

-- Subtopics for Recursion
INSERT INTO subtopics (topic_id, name, difficulty) VALUES
(7, 'Basic Recursion', 'Easy'),
(7, 'Backtracking', 'Hard');

-- Sample Questions - Profit and Loss
INSERT INTO questions (subtopic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
(1, 'A shopkeeper buys an article for Rs. 200 and sells it for Rs. 250. What is the profit percentage?', '20%', '25%', '30%', '15%', 'B', 'Profit = 250-200 = 50. Profit% = (50/200)*100 = 25%', 'Easy'),
(1, 'If an item is sold at a loss of 10% for Rs. 450, what was the cost price?', 'Rs. 480', 'Rs. 490', 'Rs. 500', 'Rs. 510', 'C', 'CP = SP/(1 - loss%) = 450/0.9 = 500', 'Easy'),
(1, 'A trader marks his goods 20% above cost price and gives 10% discount. Find profit%.', '8%', '10%', '12%', '6%', 'A', 'SP = 1.2CP * 0.9 = 1.08CP. Profit = 8%', 'Medium'),
(1, 'A sold an article at 25% profit. If the CP was Rs. 400, what is the SP?', 'Rs. 450', 'Rs. 480', 'Rs. 500', 'Rs. 520', 'C', 'SP = 400 * 1.25 = 500', 'Easy'),
(1, 'By selling 45 oranges for Rs. 40, a man loses 20%. How many oranges should he sell for Rs. 24 to gain 20%?', '16', '18', '20', '22', 'B', 'CP of 45 = 40/0.8 = 50, CP per orange = 50/45. To gain 20%, SP = CP*1.2. Count = 24/(50/45 * 1.2) = 18', 'Hard');

-- Sample Questions - Number Series
INSERT INTO questions (subtopic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
(7, 'Find the next number: 2, 4, 8, 16, 32, ?', '48', '64', '56', '72', 'B', 'Each number is doubled. 32*2 = 64', 'Easy'),
(7, 'Find the missing number: 3, 7, 13, 21, 31, ?', '41', '43', '45', '47', 'B', 'Differences are 4, 6, 8, 10, 12. Next = 31+12 = 43', 'Medium'),
(7, 'Which number should replace ?: 1, 4, 9, 16, 25, ?', '30', '35', '36', '49', 'C', 'Perfect squares: 1², 2², 3², 4², 5², 6² = 36', 'Easy'),
(7, 'Find next: 2, 6, 12, 20, 30, ?', '40', '42', '44', '46', 'B', 'Pattern: n(n+1). 6*7=42', 'Medium');

-- Sample Questions - Percentages
INSERT INTO questions (subtopic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
(3, 'What is 15% of 240?', '34', '36', '38', '40', 'B', '240 * 15/100 = 36', 'Easy'),
(3, 'If 30% of a number is 90, what is the number?', '270', '280', '290', '300', 'D', 'x * 30/100 = 90, x = 300', 'Easy'),
(3, 'A number is increased by 20% then decreased by 20%. Net change is?', '-4%', '0%', '+4%', '-2%', 'A', '100 -> 120 -> 96. Net = -4%', 'Medium'),
(3, 'In an election, 60% people voted. Winner got 55% of votes. Loser got?', '22%', '24%', '26%', '28%', 'C', 'Loser = 60% * 45% = 27%, but of total = 45% of 60 = 27. Hmm, of votes polled = 45%', 'Hard');

-- HR Questions
INSERT INTO hr_questions (question_text, category, sample_answer, tips) VALUES
('Tell me about yourself.', 'Introduction', 'Start with your education, then internships/projects, then skills, and end with why you are excited about this role.', 'Keep it under 2 minutes. Be professional and enthusiastic.'),
('Why do you want to join this company?', 'Motivation', 'Mention the company''s values, growth opportunities, and how it aligns with your career goals.', 'Research the company before the interview. Mention specific aspects.'),
('What are your strengths and weaknesses?', 'Self-Assessment', 'Strengths: problem-solving, teamwork. Weakness: turn a real weakness into a learning opportunity.', 'Be honest but frame weaknesses as areas of improvement.'),
('Where do you see yourself in 5 years?', 'Career Goals', 'Talk about growing within the company, taking on responsibilities, and becoming a subject matter expert.', 'Show ambition but also loyalty to the company.'),
('Why should we hire you?', 'Value Proposition', 'Summarize your skills, experience, and enthusiasm, then connect them to the job requirements.', 'Be confident. This is your elevator pitch.'),
('Describe a challenging situation and how you handled it.', 'Behavioral', 'Use the STAR method: Situation, Task, Action, Result.', 'Prepare 2-3 stories that show problem-solving and teamwork.'),
('What is your expected salary?', 'Compensation', 'Research industry standards. Give a range based on your research.', 'Don''t lowball yourself. Know your market value.'),
('Do you have any questions for us?', 'Closing', 'Ask about team culture, growth opportunities, or day-to-day responsibilities.', 'Always have 2-3 questions ready. It shows interest.');

-- Company specific questions - Zoho
INSERT INTO company_questions (company, question_text, question_type, year_asked, answer_hint) VALUES
('Zoho', 'What is the output of: int a=5; System.out.println(a++ + ++a);', 'Technical', 2023, 'a++ returns 5 then increments, ++a pre-increments to 7. Answer: 12'),
('Zoho', 'Reverse a string without using built-in functions.', 'Programming', 2023, 'Use a loop from end to start, building a new string'),
('Zoho', 'Find the second largest element in an array.', 'Programming', 2022, 'Sort the array or use two-variable tracking'),
('Zoho', 'What is polymorphism? Give an example.', 'Technical', 2023, 'Same interface, different implementations. Method overloading and overriding.'),
('Zoho', 'Write a program to check if a number is prime.', 'Programming', 2022, 'Check divisibility from 2 to sqrt(n)'),
('Zoho', 'What is the difference between == and .equals() in Java?', 'Technical', 2023, '== compares references, .equals() compares values'),
('Zoho', 'Find all pairs in an array that sum to a given target.', 'Programming', 2023, 'Use a HashSet or sort and use two pointers'),
('Zoho', 'Explain the concept of OOPS with real-world examples.', 'Technical', 2022, 'Encapsulation, Inheritance, Polymorphism, Abstraction with real examples');

-- Company specific questions - TCS
INSERT INTO company_questions (company, question_text, question_type, year_asked, answer_hint) VALUES
('TCS', 'What are the ACID properties in databases?', 'Technical', 2023, 'Atomicity, Consistency, Isolation, Durability'),
('TCS', 'Write SQL query to find the second highest salary.', 'Programming', 2023, 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)'),
('TCS', 'What is normalization? Explain 1NF, 2NF, 3NF.', 'Technical', 2022, 'Process of organizing data to reduce redundancy'),
('TCS', 'Difference between process and thread.', 'Technical', 2023, 'Process is independent, thread shares memory within a process'),
('TCS', 'What is REST API? Explain HTTP methods.', 'Technical', 2023, 'GET, POST, PUT, DELETE, PATCH with their purposes');

-- Company specific questions - Amazon
INSERT INTO company_questions (company, question_text, question_type, year_asked, answer_hint) VALUES
('Amazon', 'Implement LRU Cache.', 'Programming', 2023, 'Use HashMap + Doubly Linked List for O(1) operations'),
('Amazon', 'Find the longest substring without repeating characters.', 'Programming', 2023, 'Sliding window technique with HashMap'),
('Amazon', 'Design a URL shortener system.', 'Technical', 2023, 'Discuss hashing, database design, scalability'),
('Amazon', 'Tell me about a time you failed and what you learned.', 'HR', 2023, 'STAR method - be honest and show learning mindset'),
('Amazon', 'Two Sum problem - given array and target, find indices.', 'Programming', 2022, 'HashMap approach: O(n) time, O(n) space');

-- Company specific questions - Google  
INSERT INTO company_questions (company, question_text, question_type, year_asked, answer_hint) VALUES
('Google', 'Merge two sorted arrays without extra space.', 'Programming', 2023, 'Start comparing from the end of each array'),
('Google', 'Design Google Search autocomplete.', 'Technical', 2023, 'Trie data structure, caching, ranking algorithms'),
('Google', 'Find median of two sorted arrays.', 'Programming', 2023, 'Binary search on smaller array for O(log(min(m,n)))'),
('Google', 'What is MapReduce?', 'Technical', 2022, 'Distributed processing: map phase and reduce phase'),
('Google', 'Serialize and deserialize a binary tree.', 'Programming', 2023, 'BFS or DFS traversal with null markers');
