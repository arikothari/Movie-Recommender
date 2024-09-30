from flask import Flask, request, jsonify
import requests
import pandas as pd
from flask_cors import CORS
import os

API_KEY = '60021372306d6c2aa043973273e5b7ee'

app = Flask(__name__)
CORS(app)  # Allow requests from the frontend

# Load all movies into memory
def fetch_movies():
    movies = []
    for page in range(1, 6):  # Fetch multiple pages of popular movies
        url = f'https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}&language=en-US&page={page}'
        response = requests.get(url)
        movies.extend(response.json()['results'])
    df = pd.DataFrame(movies)
    
    # Fetch additional features for each movie and store in the dataframe
    genres_list = []
    keywords_list = []
    
    for movie_id in df['id']:
        movie_features = get_movie_features(movie_id)
        genres_list.append([genre['name'] for genre in movie_features['genres']])
        keywords_list.append([keyword['name'] for keyword in movie_features.get('keywords', {}).get('keywords', [])])
    
    df['genres'] = genres_list
    df['keywords'] = keywords_list
    return df

# Fetch movie details from TMDB
def get_movie_features(movie_id):
    url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}&language=en-US'
    response = requests.get(url)
    return response.json()

# Fetch all movies at the start of the server
movies_df = fetch_movies()

# API to get a list of available movies
@app.route('/movies', methods=['GET'])
def get_movies():
    return jsonify(movies_df[['id', 'title', 'poster_path']].to_dict(orient='records'))

# API to recommend a movie based on three selected movies
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    movie_ids = data['movie_ids']  # expecting a list of 3 movie IDs
    
    # Fetch features of the selected movies
    features_list = []
    for movie_id in movie_ids:
        movie = movies_df[movies_df['id'] == movie_id].iloc[0]
        features_list.append({
            'genres': movie['genres'],
            'keywords': movie['keywords']
        })

    # Combine the features to create a preference profile
    all_genres = sum([features['genres'] for features in features_list], [])
    all_keywords = sum([features['keywords'] for features in features_list], [])
    
    # Find similar movies
    def calculate_similarity(movie):
        common_genres = set(all_genres) & set(movie['genres'])
        common_keywords = set(all_keywords) & set(movie['keywords'])
        return len(common_genres) + len(common_keywords)
    
    # Calculate similarity scores for all movies
    movies_df['similarity_score'] = movies_df.apply(lambda row: calculate_similarity(row), axis=1)
    recommended_movie = movies_df.sort_values(by='similarity_score', ascending=False).iloc[0]

    return jsonify({
        'recommended_movie': {
            'title': recommended_movie['title'],
            'overview': recommended_movie['overview'],
            'poster_path': recommended_movie['poster_path']
        }
    })

# if __name__ == '__main__':
#     app.run(debug=True)

# import os

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))