import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const responseSchema = new mongoose.Schema({
  questionId: String,
  userResponse: String,
  correctAnswer: String,
  isCorrect: Boolean
});

const submissionSchema = new mongoose.Schema({
  submissionId: {
    type: String,
    default: () => `sub-${uuidv4().split('-')[0]}`
  },
  quizId: String,
  userId: String, 
  attemptNumber: {
    type: Number,
    default: 1
  },
  isLatestAttempt: {
    type: Boolean,
    default: true
  },
  responses: [responseSchema],
  score: Number,
  maxScore: Number,
  percentage: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient querying
submissionSchema.index({ quizId: 1, userId: 1, attemptNumber: -1 });
submissionSchema.index({ quizId: 1, userId: 1, isLatestAttempt: 1 });
submissionSchema.index({ userId: 1, completedAt: -1 });


submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    
    const latestSubmission = await this.constructor.findOne({
      quizId: this.quizId,
      userId: this.userId
    }).sort({ attemptNumber: -1 });

    if (latestSubmission) {
      this.attemptNumber = latestSubmission.attemptNumber + 1;
      
      // Mark previous submissions as not latest
      await this.constructor.updateMany(
        { quizId: this.quizId, userId: this.userId },
        { isLatestAttempt: false }
      );
    }
    
    // Calculate percentage
    this.percentage = this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0;
  }
  next();
});

export const Submission = mongoose.model('Submission', submissionSchema);