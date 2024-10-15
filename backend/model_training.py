import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Sample user-movie interaction data
user_movie_data = {
    'movie_id': [101, 102, 103, 102, 101, 104],
    'rating': [5, 4, 3, 5, 4, 3]
}

# Load and prepare the data
df = pd.DataFrame(user_movie_data)
X = df[['movie_id']]
y = df['rating']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build a simple model
model = Sequential()
model.add(Dense(128, input_dim=1, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mean_squared_error')
model.fit(X_train, y_train, epochs=10, batch_size=8, validation_data=(X_test, y_test))

# Save the model
model.save('../model/movie_recommender1_model.h5')
