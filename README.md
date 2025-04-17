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
└── backend/            # Flask API
    ├── routes/         # API route definitions
    ├── models/         # Database models
    ├── services/       # Business logic
    ├── app.py          # Flask application entry point
    └── requirements.txt # Backend dependencies
```

## Setup and Installation

### Backend Setup

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

### Frontend Setup

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