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
ENV MONGO_URI=mongodb+srv://vasu:1Z7tBA5jF13LqXQW@cluster0.vnnjtrl.mongodb.net/aiquizzer?retryWrites=true&w=majority
ENV JWT_SECRET="qwer!@#ASD"
ENV JWT_EXPIRE=7d
ENV GROQ_API_KEY=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
ENV GROQ_MODEL=llama3-8b-8192
ENV REDIS_URL=redis://default:n6f0t9LsoMDOmz2wKr9Lg2HjSQ8lddUa@redis-10451.c74.us-east-1-4.ec2.redns.redis-cloud.com:10451
ENV MAIL_USER="vasubhalani258@gmail.com"
ENV MAIL_PASS="npwn izzh efzy rvsq"

# Start the server
CMD ["npm", "start"]
