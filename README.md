# Flask + React Project

A full-stack web application with a Flask API backend and React frontend.

## Project Structure

```
project-root/
├── frontend/           # React frontend
│   ├── public/         # Static files
│   ├── src/            # React source code
│   │   ├── components/ # Reusable components
│   │   └── pages/      # Page components
│   └── package.json    # Frontend dependencies
├── backend/            # Flask API
│   ├── routes/         # API route definitions
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── app.py          # Flask application entry point
│   └── requirements.txt # Backend dependencies
└── docker-compose.yml  # Docker configuration
```

## Setup and Installation

### Using Docker (Recommended)

The easiest way to run the application is using Docker:

1. Make sure Docker and Docker Compose are installed on your system.

2. Start the containers:
   ```
   # On Windows PowerShell
   .\start-docker.ps1
   
   # Or using Docker Compose directly
   docker-compose up -d
   ```

3. The application will be available at:
   - Frontend: http://localhost:5175
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017/intelligent_system_db

4. To stop the containers:
   ```
   # On Windows PowerShell
   .\stop-docker.ps1
   
   # Or using Docker Compose directly
   docker-compose down
   ```

### Manual Setup

#### Backend Setup

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```
   python app.py
   ```

#### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

## API Endpoints

- `GET /api/test` - Test endpoint
- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/stock-data` - Get all stock data
- `POST /api/import-data` - Import data from CSV/Excel
- `POST /api/calculate` - Calculate Beta and train SVM model