import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/test');
        setApiData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Flask App</h1>
        {loading ? (
          <p>Loading data from API...</p>
        ) : (
          <div>
            <p>API Response:</p>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App; 