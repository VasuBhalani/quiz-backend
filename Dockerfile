# Base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV MONGO_URI=
ENV JWT_SECRET="qwer!@#ASD"
ENV JWT_EXPIRE=7d
ENV GROQ_API_KEY=
ENV GROQ_MODEL=llama3-8b-8192
ENV REDIS_URL=
ENV MAIL_USER=""
ENV MAIL_PASS=""

# Start the server
CMD ["npm", "start"]
