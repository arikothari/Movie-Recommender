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
      <h1 className="app-title">Movie Recommendation System</h1>
      <div className="movie-selection">
        <h2>Select Three Movies:</h2>
        <div className="movies-list">
          {availableMovies.map((movie, index) => (
            <div key={`${movie.id}-${index}`} className="movie-item">
              <button
                onClick={() => handleMovieSelect(movie.id)}
                className={`movie-button ${selectedMovies.includes(movie.id) ? 'selected' : ''}`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                />
                <p className="movie-title">{movie.title}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
      <button className="recommendation-button" onClick={getRecommendation}>
        Get Recommendation
      </button>
      {recommendation && (
        <div className="recommendation">
          <h2>Recommended Movie:</h2>
          <p className="recommendation-title">{recommendation.title}</p>
          <p>{recommendation.overview}</p>
          <img
            src={`https://image.tmdb.org/t/p/w500${recommendation.poster_path}`}
            alt={recommendation.title}
            className="recommended-poster"
          />
        </div>
      )}
    </div>
  );
}

export default App;
