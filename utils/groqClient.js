import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const callGroq = async (prompt) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a quiz generator. Always respond with valid JSON only, no explanations or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON output
      max_tokens: 2000
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
};