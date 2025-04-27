# Intelligent System - Stock Analysis Platform

A full-stack web application for stock data analysis, beta calculation, and SVM predictive modeling with a Flask/Python backend, React frontend, and MongoDB database.

## Project Structure

```
project-root/
├── frontend/                  # React frontend
│   ├── public/                # Static files
│   ├── src/                   # React source code
│       ├── api/               # API client services
│       ├── assets/            # Static assets
│       ├── File_Platform/     # File platform components
│       ├── App.jsx            # Main app component
│       ├── App.css            # Main styles
│       ├── main.jsx           # Entry point
│       ├── Dashboard.jsx      # Dashboard component
│       ├── DataImport.jsx     # Data import component
│       ├── BetaCalculation.jsx # Beta calculation component
│       ├── SVMAnalysis.jsx    # SVM analysis component
│       ├── Login.jsx          # Login component
│       ├── Research.jsx       # Research component
│       ├── AnalystTool.jsx    # Analyst tools
│       ├── MarketIndexView.jsx # Market index view
│       └── ...                # Additional components
│   ├── package.json           # Frontend dependencies
│   └── Dockerfile             # Frontend Docker config
├── backend/                   # Flask API
│   ├── routes/                # API route definitions
│       └── api.py             # Main API routes
│   ├── models/                # Database models
│       └── item.py            # Item model
│   ├── services/              # Business logic services
│       ├── beta_calculation.py # Beta calculation service
│       └── svm_analysis.py    # SVM analysis service
│   ├── app.py                 # Flask application entry point
│   ├── requirements.txt       # Backend dependencies
│   └── Dockerfile             # Backend Docker config
├── docker-compose.yml         # Docker configuration
├── start-docker.ps1           # PowerShell script for Docker startup
├── clear_mongodb.js           # Script to clear MongoDB data
├── marketDB.csv               # Stock market data
├── marketindex.csv            # Market index data
├── StockePrice.csv            # Stock price data
└── .gitignore                 # Git ignore file
```

## Features

- **User Authentication**: Login and registration system with password recovery
- **Data Import**: Import stock data and market index data from CSV files
- **Market Index Analysis**: View and analyze market index data
- **Beta Calculation**: Calculate beta values for individual stocks and portfolios
- **SVM Analysis**: Train and test Support Vector Machine (SVM) models for stock price prediction
- **Research Tools**: Advanced research and analysis tools for financial analysts
- **Fund Management**: Track and manage investment portfolios
- **Data Visualization**: Charts and graphs for stock price and market trends

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
   - Backend API: http://localhost:5001
   - MongoDB: mongodb://localhost:27017/intelligent_system_db

4. To stop the containers:
   ```
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
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password recovery

### Stock Data
- `POST /api/import-data` - Import stock data from CSV
- `GET /api/stock-data` - Get all stock data
- `GET /api/ticker` - Get all tickers
- `GET /api/stock-data-with-beta` - Get stock data with calculated beta values

### Market Index
- `POST /api/import-market-index` - Import market index data
- `GET /api/market-index-data` - Get market index data
- `GET /api/market-code` - Get all market codes

### Analysis
- `POST /api/calculate` - Calculate beta and train SVM model
- `POST /api/calculate-beta` - Calculate beta for specific stock
- `POST /api/calculate-portfolio-beta` - Calculate beta for a portfolio
- `POST /api/svm-analysis` - Perform SVM analysis
- `GET /api/latest-svm-analysis` - Get latest SVM analysis results

## Database Structure

The application uses MongoDB with the following collections:
- `stock_data`: Imported stock price data
- `market_index_data`: Imported market index data
- `imports`: Metadata about data imports
- `beta_calculations`: Results of beta calculations
- `svm_analyses`: Results of SVM analyses

## Technologies

### Frontend
- React
- Vite
- Chart.js for data visualization
- Axios for API requests

### Backend
- Flask
- Pandas for data manipulation
- Scikit-learn for machine learning (SVM)
- PyMongo for MongoDB integration

### Database
- MongoDB

### Deployment
- Docker
- Docker Compose

## Future Improvements

- Enhanced security features
- More sophisticated machine learning models
- Portfolio optimization
- Real-time data integration
- Mobile application