import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [availableMovies, setAvailableMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  // Fetch available movies when the component mounts
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/movies');
        setAvailableMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies', error);
      }
    };

    fetchMovies();
  }, []);

  // Handle selecting and unselecting a movie
  const handleMovieSelect = (movieId) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter((id) => id !== movieId));
    } else if (selectedMovies.length < 3) {
      setSelectedMovies([...selectedMovies, movieId]);
    }
  };

  // Request a recommendation based on the selected movies
  const getRecommendation = async () => {
    if (selectedMovies.length !== 3) {
      alert('Please select exactly three movies.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/recommend', {
        movie_ids: selectedMovies,
      });
      setRecommendation(response.data.recommended_movie);
    } catch (error) {
      console.error('Error fetching recommendation', error);
    }
  };

  return (
    <div className="App">
      <h1>Movie Recommendation System</h1>
      <div className="movie-selection">
        <h2>Select Three Movies:</h2>
        <div className="movies-list">
          {availableMovies.map((movie, index) => (
            <div key={`${movie.id}-${index}`} className="movie-item">
              <button
                onClick={() => handleMovieSelect(movie.id)}
                style={{ 
                  backgroundColor: selectedMovies.includes(movie.id) ? 'green' : 'white',
                  border: '1px solid black',
                  margin: '10px',
                  padding: '10px'
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  style={{ display: 'block', margin: 'auto' }}
                />
                <p style={{ textAlign: 'center' }}>{movie.title}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
      <button onClick={getRecommendation} style={{ marginTop: '20px' }}>Get Recommendation</button>
      {recommendation && (
        <div className="recommendation" style={{ marginTop: '20px' }}>
          <h2>Recommended Movie:</h2>
          <p>Title: {recommendation.title}</p>
          <p>{recommendation.overview}</p>
          <img
            src={`https://image.tmdb.org/t/p/w500${recommendation.poster_path}`}
            alt={recommendation.title}
            style={{ width: '300px', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
