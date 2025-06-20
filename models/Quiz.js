import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const questionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  question: String,
  options: [String],
  answer: String
});

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    unique: true,
    default: () => `${uuidv4().split('-')[0]}`
  },
  grade: Number,
  subject: String,
  difficulty: String,
  maxScore: Number,
  marksPerQuestion: Number || 1,
  totalQuestions: Number,
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

quizSchema.index({ grade: 1, subject: 1, difficulty: 1, createdAt: -1 }); // indexing

export const Quiz = mongoose.model('Quiz', quizSchema);
