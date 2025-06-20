import { callGroq } from '../utils/groqClient.js';
import { Quiz } from '../models/Quiz.js';
import { Submission } from '../models/Submission.js';
import { generateQuizPrompt,generateHintPrompt } from '../prompt/promptGenerator.js';
import redis from '../config/redisClient.js';
// Generate Quiz
export const generateQuiz = async (req, res) => {
  const { grade, subject, totalQuestions, difficulty, marksPerQuestion } = req.body;

  const redisKey = `quiz:${grade}:${subject}:${difficulty}:${totalQuestions}`;

  // Step 1: Try Redis Cache
  try {
    const cachedQuiz = await redis.get(redisKey);
    if (cachedQuiz) {
      console.log('Returned from Redis cache');
      return res.status(200).json(JSON.parse(cachedQuiz));
    }
  } catch (err) {
    console.warn('Redis GET failed:', err.message);
  }

  // Step 2: Generate quiz using Groq and store in MongoDB
  try {
    const prompt = generateQuizPrompt({ grade, subject, totalQuestions, difficulty });
    const response = await callGroq(prompt);

    const cleanedResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    const quiz = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedResponse);

    
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.answer ||
        !q.options.includes(q.answer)
      ) {
        throw new Error(`Invalid question format at index ${i}`);
      }
    }

    
    const newQuiz = new Quiz({
      grade,
      subject,
      difficulty,
      questions: quiz,
      totalQuestions,
      maxScore: totalQuestions * marksPerQuestion,
    });

    await newQuiz.save();

    // Step 5: Cache in Redis (safe block)
    try {
      await redis.set(redisKey, JSON.stringify(newQuiz), 'EX', 60 * 60 * 24); // TTL: 24 hours
    } catch (err) {
      console.warn('Redis SET failed:', err.message);
    }

    // Step 6: Respond with success
    return res.status(201).json({
      success: true,
      message: 'Quiz generated and stored successfully',
      quizId: newQuiz.quizId,
      quiz: newQuiz,
    });

  } catch (err) {
    console.error('Quiz generation/storage failed:', err.message);
    return res.status(500).json({
      message: 'Failed to generate or store quiz',
      error: err.message,
    });
  }
};

// Get Quiz History
export const getQuizHistory = async (req, res) => {
  const userId = req.user.uuid;
console.log('hello');
  try {
    console.log('Fetching quiz history for user:', userId);

    // Step 1: Fetch all submissions for the user
    let submissions = await Submission.find({ userId }).sort({ completedAt: -1 });

    // Step 2: Get all quiz details for the related quizIds
    const quizIds = submissions.map(sub => sub.quizId);
    const quizzes = await Quiz.find({ quizId: { $in: quizIds } });

    const quizMap = new Map();
    quizzes.forEach(q => quizMap.set(q.quizId, q));

    // Step 3: Build history records
    let history = submissions.map(sub => {
      const quiz = quizMap.get(sub.quizId);
      if (!quiz) return null;

      const status = sub.score >= quiz.maxScore / 2 ? "Passed" : "Failed";

      return {
        quizId: sub.quizId,
        subject: quiz.subject,
        grade: quiz.grade,
        score: sub.score,
        maxScore: sub.maxScore,
        status,
        completedAt: sub.completedAt,
        canRetry: true
      };
    }).filter(item => item !== null);

    // Step 4: Apply optional filters from query params
    const { grade, subject, minScore, maxScore, fromDate, toDate, status } = req.query;

    if (grade) history = history.filter(q => q.grade === grade);
    if (subject) history = history.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    if (minScore) history = history.filter(q => q.score >= parseInt(minScore));
    if (maxScore) history = history.filter(q => q.score <= parseInt(maxScore));
    if (status) history = history.filter(q => q.status.toLowerCase() === status.toLowerCase());

    if (fromDate) {
      const from = new Date(fromDate);
      history = history.filter(q => new Date(q.completedAt) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      history = history.filter(q => new Date(q.completedAt) <= to);
    }

    res.status(200).json(history);
  } catch (err) {
    console.error("Error fetching quiz history:", err);
    res.status(500).json({ error: "Server error fetching quiz history" });
  }
};

// Get Quiz by ID
export const getQuizById = async (req, res) => {

  console.log('in byId',req.params);
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.status(200).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
  }
};


export const getHint = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question and at least two options.'
      });
    }

    const prompt = generateHintPrompt({ question, options });

    const rawHint = await callGroq(prompt);

    let hint;
    try {
      const parsed = JSON.parse(rawHint);
      hint = parsed.hint;
    } catch (err) {
      console.warn('Hint is not valid JSON, falling back to raw string.');
      hint = rawHint.trim();
    }

    res.status(200).json({
      success: true,
      hint
    });

  } catch (error) {
    console.error('Hint generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hint',
      error: error.message
    });
  }
};
