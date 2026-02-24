# שלב 1: בנייה
FROM node:22-slim AS builder
WORKDIR /app

# התקנת ספריות מערכת ל-Prisma
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# יצירת הקליינט ובנייה
RUN npx prisma generate
RUN npm run build

# שלב 2: הרצה
FROM node:22-slim
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# העתקת התוצרים - ב-NestJS רגיל הבנייה הולכת לתיקיית dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# יצירת תיקיית העלאות
RUN mkdir -p uploads/images && chmod -R 777 uploads

ENV PORT=3000
EXPOSE 3000

# הרצה: Migration ודחיפת השרת באוויר
CMD npx prisma migrate deploy && node dist/main.js