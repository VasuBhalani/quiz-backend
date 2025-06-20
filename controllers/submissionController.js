import { Quiz } from '../models/Quiz.js';
import { Submission } from '../models/submission.js';
import { v4 as uuidv4 } from 'uuid';
import { generateFeedbackPrompt } from '../prompt/promptGenerator.js';
import { callGroq } from '../utils/groqClient.js';
import { sendQuizConfirmationMail } from '../utils/emailService.js';

export const submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { responses } = req.body;
  const userId = req.user.uuid;
  const userEmail = req.user.email;

  try {
    // 1. Fetch Quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // 2. Get Previous Submissions
    const previousSubmissions = await Submission.find({ quizId, userId }).sort({ attemptNumber: -1 });
    const attemptCount = previousSubmissions.length;
    const latestSubmission = previousSubmissions[0];

    // 3. Check max attempts
    const MAX_ATTEMPTS = quiz.maxAttempts ?? 3;
    if (attemptCount >= MAX_ATTEMPTS) {
      return res.status(400).json({
        message: `Maximum attempts (${MAX_ATTEMPTS}) reached`,
        maxAttempts: MAX_ATTEMPTS,
        currentAttempts: attemptCount
      });
    }

    // 4. Evaluate Responses
    let score = 0;
    const evaluated = [];

    for (const resp of responses) {
      const question = quiz.questions.find(q => q._id.toString() === resp.questionId);
      if (!question) continue; // skip if questionId doesn't match
      const isCorrect = question.answer === resp.userResponse;
      if (isCorrect) score += quiz.marksPerQuestion || 1;

      evaluated.push({
        questionId: resp.questionId,
        userResponse: resp.userResponse,
        correctAnswer: question.answer,
        isCorrect
      });
    }

    const maxScore = quiz.totalQuestions * (quiz.marksPerQuestion || 1);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // 5. Save Submission
    const submission = new Submission({
      submissionId: `sub-${uuidv4().split('-')[0]}`,
      quizId,
      userId,
      responses: evaluated,
      score,
      maxScore,
      percentage,
      attemptNumber: attemptCount + 1,
      completedAt: new Date()
    });

    await submission.save();

    // 6. Respond Immediately
    const responseData = {
      message: attemptCount > 0 ? 'Resubmission successful' : 'Submission successful',
      submissionId: submission.submissionId,
      score,
      maxScore,
      percentage,
      attemptNumber: submission.attemptNumber,
      totalAttempts: submission.attemptNumber,
      isResubmission: submission.attemptNumber > 1
    };

    if (latestSubmission) {
      responseData.previousAttempt = {
        score: latestSubmission.score,
        percentage: latestSubmission.percentage,
        attemptNumber: latestSubmission.attemptNumber
      };

      responseData.improvement = {
        score: score - latestSubmission.score,
        percentage: percentage - latestSubmission.percentage,
        improved: score > latestSubmission.score
      };
    }

    res.status(200).json(responseData);

    // 7. Background Feedback Email
    (async () => {
      try {
        const prompt = generateFeedbackPrompt({
          grade: quiz.grade,
          subject: quiz.subject,
          latest: submission,
          prev: latestSubmission
        });

       let feedback;
try {
  const rawResponse = await callGroq(prompt);
  const parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

  feedback = {
      message: parsed.message || 'You did well!',
      tip: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.join('; ')
        : parsed.tip || 'Keep practicing regularly!'
    };

    // console.log('Groq feedback:', feedback);
  } catch (groqError) {
    console.warn('Groq failed or response malformed, using fallback:', groqError);
    feedback = {
      message: `Hi! You scored ${score}/${maxScore} (${percentage}%). Great effort! Keep practicing and aim for even better next time. 👍`,
      tip: 'Keep revising your weak areas, and try mock tests for better retention!'
    };
  }

      const emailContent = `
        <div style="background-color: #f4f6f8; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background-color: #1e3a8a; padding: 20px;">
              <h1 style="color: #ffffff; text-align: center; margin: 0;">📘 Quiz Feedback</h1>
            </div>
            <div style="padding: 30px 25px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>Message:</strong><br>
                ${feedback.message}
              </p>
              <p style="font-size: 15px; color: #4b5563; background-color: #f0f4ff; padding: 12px 18px; border-left: 4px solid #3b82f6; border-radius: 6px; margin-top: 15px;">
                💡 <strong>Tip:</strong> ${feedback.tip}
              </p>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

              <p style="font-size: 14px; color: #555;">
                <strong>Subject:</strong> ${quiz.subject}<br>
                <strong>Attempt:</strong> ${submission.attemptNumber}<br>
                <strong>Score:</strong> ${score} / ${maxScore} (${percentage}%)
              </p>
            </div>

            <div style="background-color: #f9fafb; text-align: center; padding: 20px; font-size: 13px; color: #9ca3af;">
              &copy; 2025 AIQuizzer. All rights reserved.
            </div>
          </div>
        </div>
      `;


        await sendQuizConfirmationMail({
          to: userEmail,
          subject: `Feedback for ${quiz.subject} Quiz`,
          html: emailContent
        });

        console.log('Email sent to', userEmail);
      } catch (mailErr) {
        console.error('Failed to send feedback email:', mailErr);
      }
    })();

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({
      message: 'Failed to submit quiz',
      error: err.message
    });
  }
};
