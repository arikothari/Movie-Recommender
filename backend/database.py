import requests
import pandas as pd 

API_KEY = '60021372306d6c2aa043973273e5b7ee'

def fetch_movies():
    url = f'https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}&language=en-US&page=1'
    response = requests.get(url)
    movies = response.json()['results']
    df = pd.DataFrame(movies)
    return df

movies_df = fetch_movies()
print(movies_df.head())
