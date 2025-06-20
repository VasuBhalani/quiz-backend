export function generateQuizPrompt({ grade, subject, totalQuestions, difficulty }) {
  return `Create exactly ${totalQuestions} multiple choice questions for ${subject} subject, grade ${grade}, ${difficulty} difficulty level.

IMPORTANT: Respond with ONLY valid JSON in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "answer": "A. Option 1"
  }
]

Rules:
- Each question must have exactly 4 options labeled A., B., C., D.
- Answer must match one of the options exactly
- Questions should be appropriate for grade ${grade}
- Difficulty: ${difficulty}
- Subject: ${subject}
- Return ONLY the JSON array, no other text`;

}


export const generateFeedbackPrompt = ({ grade, subject, latest, prev }) => {
  const { score, maxScore, percentage, attemptNumber } = latest;

  let prompt = `A student from grade ${grade} has just completed a quiz on ${subject}.\n`;

  prompt += `They scored ${score} out of ${maxScore} (${percentage}%) in attempt #${attemptNumber}.\n`;

  if (prev) {
    prompt += `In the previous attempt #${prev.attemptNumber}, they scored ${prev.score} out of ${prev.maxScore} (${prev.percentage}%).\n`;
    prompt += `\nCompare their recent performance with the previous one, and provide:\n`;
    prompt += `1. A personalized motivational message based on improvement or decline.\n`;
    prompt += `2. One or two practical suggestions to help them improve.\n`;
  } else {
    prompt += `\nThis is their first attempt. Provide:\n`;
    prompt += `1. An encouraging message.\n`;
    prompt += `2. One helpful tip to improve in the future.\n`;
  }

  prompt += `\nKeep it short, kind, and helpful.`;

  return prompt;
};

export const generateHintPrompt = ({ question, options }) => {
  return `
You're a helpful educational AI. Give only a **hint** (not the answer) to help the student solve the question.

Question: ${question}
Options:
${options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

Hint:
(Keep the hint short, relevant, and helpful. Do not give the correct answer directly.)
  `.trim();
};
