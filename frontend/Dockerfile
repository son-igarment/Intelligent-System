FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN npm install chart.js react-chartjs-2

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 