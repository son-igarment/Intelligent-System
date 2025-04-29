FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install


RUN npm install chart.js@4.4.9 react-chartjs-2@5.3.0 --force

COPY . .

# Set NODE_ENV to production to avoid dev errors
ENV NODE_ENV=production

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 