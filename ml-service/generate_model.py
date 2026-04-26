import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import os

print("Starting model training process...")

# Load the processed data
try:
    df = pd.read_csv('usda_processed_data.csv')
    print("Data loaded successfully.")
except FileNotFoundError:
    print("Error: 'usda_processed_data.csv' not found. Please run 'prepare_usda_data.py' first.")
    exit()

# Define features (X) and target (y)
X = df[['Ingredients']]
# The model will only predict the five macronutrients
y = df[['Carbohydrates (g)', 'Protein (g)', 'Fat (g)', 'Fiber (g)', 'Sugars (g)']]

# Handle potential NaN values
X['Ingredients'] = X['Ingredients'].fillna('')
y = y.fillna(0)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the model pipeline
# The pipeline first runs the vectorizer, then trains the RandomForestRegressor
pipeline = Pipeline(steps=[
    ('vectorizer', TfidfVectorizer(max_features=5000, stop_words='english')),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
])

print("Training the model...")
pipeline.fit(X_train['Ingredients'], y_train)

# Make predictions on the test set
y_pred = pipeline.predict(X_test['Ingredients'])

print("\nEvaluating model performance...")
# Evaluate the model for each nutrient
mae_results = {
    'Carbohydrates': mean_absolute_error(y_test['Carbohydrates (g)'], y_pred[:, 0]),
    'Protein': mean_absolute_error(y_test['Protein (g)'], y_pred[:, 1]),
    'Fat': mean_absolute_error(y_test['Fat (g)'], y_pred[:, 2]),
    'Fiber': mean_absolute_error(y_test['Fiber (g)'], y_pred[:, 3]),
    'Sugars': mean_absolute_error(y_test['Sugars (g)'], y_pred[:, 4])
}

# Print MAE results in a readable format
print("Mean Absolute Error (MAE):")
for nutrient, mae in mae_results.items():
    print(f"  {nutrient}: {mae:.2f}")

# Save the trained model and vectorizer
model_dir = 'models'
os.makedirs(model_dir, exist_ok=True)
joblib.dump(pipeline, os.path.join(model_dir, 'model.pkl'))
joblib.dump(pipeline.named_steps['vectorizer'], os.path.join(model_dir, 'vectorizer.joblib'))
print("\nModel trained and saved to 'models/model.pkl'.")
print("Vectorizer saved to 'models/vectorizer.joblib'.")

print("Model training complete.")
print("You can now run 'app.py' to use the trained model for predictions.")