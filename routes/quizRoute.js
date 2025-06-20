import express from 'express';
import {
  generateQuiz,
  getQuizHistory,
  getQuizById,
  getHint
} from '../controllers/quizController.js';
import {submitQuiz} from '../controllers/submissionController.js';
import {verifyToken} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', verifyToken, generateQuiz);
// quiz submission and resubmission
router.post('/attempt/:quizId', verifyToken, submitQuiz);
router.get('/history', verifyToken, getQuizHistory);
// hint is available for few times only that is controlled by the frontend
router.post('/get-hint',verifyToken, getHint); 
router.get('/:quizId', getQuizById);


export default router;
