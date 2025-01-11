import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [titles, setTitles] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch titles from the backend
    axios
      .get('https://mrs-4miz.onrender.com/get-titles')
      .then((response) => {
        console.log("Received data from backend:", response.data);
        setTitles(response.data.titles || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleSelection = (e) => {
    setSelectedMovie(e.target.value);
    console.log("Selected movie:", e.target.value);
  };

  const fetchRecommendations = () => {
    if (!selectedMovie) {
      alert('Please select a movie!');
      return;
    }

    axios
      .post('https://mrs-4miz.onrender.com/recommend-movie', { movie: selectedMovie })
      .then((response) => {
        console.log("Recommendations received:", response.data.recommendations);
        setRecommendations(response.data.recommendations || []);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="d-flex flex-column p-4 align-items-center">
      <h1>Movie Recommendation System</h1>
      <select
        className="form-select w-50 mb-3"
        aria-label="Movie Titles"
        onChange={handleSelection}
      >
        <option value="">Select a movie</option>
        {titles.map((title, index) => (
          <option key={index} value={title}>
            {title}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={fetchRecommendations}>
        Get Recommendations
      </button>
      <div className="mt-4">
        <h3>Recommended Movies:</h3>
        <ul>
          {recommendations.map((movie, index) => (
            <li key={index}>{movie}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
