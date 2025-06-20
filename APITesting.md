# AI Quizer API Testing Guide

## Base URL
```
http://localhost:3000
```

## Authentication

### Login
Get JWT token for authenticated requests.

**Endpoint:** `POST /api/auth/login`

**URL:** `http://localhost:3000/api/auth/login`

**Request Body:**
```json
{
  "email": "vasubhalani258@gmail.com",
  "password": "123456"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMmQwM2IxYTciLCJlbWFpbCI6InZhc3ViaGFsYW5pMjU4QGdtYWlsLmNvbSIsImlhdCI6MTc1MDM1MDY4MiwiZXhwIjoxNzUwOTU1NDgyfQ.AB8J_xTwx5UCFmsCgoqO-aUyQmOZBbzNJFr7kMffvPQ",
    "uuid": "2d03b1a7"
}
```

**Note:** Save the `token` from the response for use in subsequent requests.

---

## Quiz Management

### 1. Create/Generate Quiz

**Endpoint:** `POST /api/quiz/generate`

**URL:** `http://localhost:3000/api/quiz/generate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "grade": "5",
  "subject": "Maths",
  "difficulty": "Medium",
  "totalQuestions": 5,
  "marksPerQuestion": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz fetched from Redis cache",
  "quizId": "96f8e687",
  "quiz": {
    "grade": 5,
    "subject": "Maths",
    "difficulty": "Medium",
    "maxScore": 10,
    "totalQuestions": 5,
    "questions": [
      {
        "question": "What is the value of x in the equation 2x + 5 = 11?",
        "options": [
          "A. 2",
          "B. 3",
          "C. 4",
          "D. 5"
        ],
        "answer": "B. 3",
        "_id": "31c47a43-c5d0-4342-a698-a3fdd4b5d2c7"
      },
      {
        "question": "A bookshelf has 5 shelves, and each shelf can hold 8 books. How many books can the bookshelf hold in total?",
        "options": [
          "A. 20",
          "B. 30",
          "C. 40",
          "D. 50"
        ],
        "answer": "C. 40",
        "_id": "d3c28088-390c-4350-bffd-f7eedece9543"
      },
      {
        "question": "A bakery sells 240 loaves of bread per day. If they sell bread for 2 dollars per loaf, how much money do they make in a day?",
        "options": [
          "A. 400",
          "B. 480",
          "C. 560",
          "D. 640"
        ],
        "answer": "B. 480",
        "_id": "e6022cc9-216e-4dd2-acdd-dce8645ffa38"
      },
      {
        "question": "What is the perimeter of a rectangle with a length of 6 cm and a width of 4 cm?",
        "options": [
          "A. 10 cm",
          "B. 12 cm",
          "C. 14 cm",
          "D. 16 cm"
        ],
        "answer": "B. 12 cm",
        "_id": "db25dd58-311b-4d0a-aea7-6d943e9fd927"
      },
      {
        "question": "A group of friends want to share some candy equally. If they have 48 pieces of candy and there are 8 friends, how many pieces of candy will each friend get?",
        "options": [
          "A. 4",
          "B. 5",
          "C. 6",
          "D. 8"
        ],
        "answer": "C. 6",
        "_id": "8421cf62-4221-491c-af35-767eebc6be93"
      }
    ],
    "_id": "68543c75190194c6b00d9950",
    "quizId": "96f8e687",
    "createdAt": "2025-06-19T16:36:05.620Z",
    "__v": 0
  }
}
```

### 2. Submit Quiz Attempt

**Endpoint:** `POST /api/quiz/attempt/{quizId}`

**Example:** `POST /api/quiz/attempt/a3e8e108`

**URL:** `http://localhost:3000/api/quiz/attempt/a3e8e108`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "fbe6d1a1-c3db-4ecd-a221-901f3bcc11df",
      "userResponse": "A. Igneous"
    },
    {
      "questionId": "4a1c09a0-fa77-418e-972a-fb0dc1ad3903",
      "userResponse": "C. Transpiration"
    },
    {
      "questionId": "f216dbc2-b043-471c-b792-e5b0d555215f",
      "userResponse": "C. Charles Darwin"
    },
    {
      "questionId": "67427a5d-3e25-4148-a5a6-e51ee56346c7",
      "userResponse": "C. Heredity"
    },
    {
      "questionId": "39dc3692-e9e0-4157-99e1-e300f422926d",
      "userResponse": "D. Oxidation"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "score": 8,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "percentage": 80,
  "results": [
    {
      "questionId": "fbe6d1a1-c3db-4ecd-a221-901f3bcc11df",
      "correct": true,
      "userResponse": "A. Igneous",
      "correctAnswer": "A. Igneous"
    }
  ]
}
```

### 3. Get Quiz by ID

**Endpoint:** `GET /api/quiz/{quizId}`

**Example:** `GET /api/quiz/efe95361`

**URL:** `http://localhost:3000/api/quiz/efe95361`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "quizId": "efe95361",
    "grade": 5,
    "subject": "Science",
    "difficulty": "Medium",
    "totalQuestions": 5,
    "maxScore": 10,
    "questions": [...]
  }
}
```

### 4. Get Quiz History

**Endpoint:** `GET /api/quiz/history`

**Query Parameters:**
- `score` (optional): Filter by minimum score

**Example:** `GET /api/quiz/history?score=7`

**URL:** `http://localhost:3000/api/quiz/history?grade=5`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "quizId": "96f8e687",
      "subject": "Maths",
      "grade": 5,
      "score": 8,
      "totalQuestions": 5,
      "completedAt": "2025-06-19T16:45:00.000Z"
    },
    {
      "quizId": "a3e8e108",
      "subject": "Science",
      "grade": 5,
      "score": 7,
      "totalQuestions": 5,
      "completedAt": "2025-06-19T15:30:00.000Z"
    }
  ]
}
```

### 5. Get Hint

**Endpoint:** `POST /api/quiz/get-hint`

**URL:** `http://localhost:3000/api/quiz/get-hint`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "Which gas do plants absorb from the atmosphere?",
  "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"]
}
```

**Response:**
```json
{
  "success": true,
  "hint": "Think about what plants need for photosynthesis. They take in this gas and release oxygen as a byproduct.",
  "hintsRemaining": 2
}
```

---

## Testing Workflow

### Step 1: Mock Authentication
1. Send login request to get JWT token
2. Save the token for subsequent requests

### Step 2: Create Quiz
1. Use the generate quiz endpoint with your preferred parameters
2. Note the `quizId` from the response

### Step 3: Attempt Quiz
1. Use the quiz attempt endpoint with the `quizId`
2. Send your responses in the specified format

### Step 4: Check History
1. Use the history endpoint to view past quiz attempts
2. Filter by score if needed

### Step 5: Get Hints (Optional)
1. Use the hint endpoint for difficult questions
2. Note: Hints are limited per user handle by frontend

---
