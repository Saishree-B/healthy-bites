from flask import Flask, request, jsonify
import joblib
import re
import os

app = Flask(__name__)

# Define the threshold for what is considered 'diabetic safe'
DIABETIC_SUGAR_THRESHOLD = 10.0

try:
    # Load the correct model file
    model_path = os.path.join('models', 'model.pkl')
    model = joblib.load(model_path)
    print("Model loaded successfully.")
except FileNotFoundError:
    print("Error: Model file not found. Please run 'generate_model.py' first.")
    exit()

# Calorie calculation function
def calculate_calories(carbs, protein, fat):
    return (carbs * 4) + (protein * 4) + (fat * 9)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '')

        cleaned_ingredients = re.sub(r'[^a-zA-Z\s,]', '', ingredients).lower()
        
        # The model is now a single pipeline, so we pass the text directly
        prediction = model.predict([cleaned_ingredients])
        
        pred_values = prediction[0]

        # Get the predicted nutrient values from the model
        predicted_carbs = float(pred_values[0])
        predicted_protein = float(pred_values[1])
        predicted_fat = float(pred_values[2])
        predicted_fiber = float(pred_values[3])
        predicted_sugar = float(pred_values[4])

        # Use the formula to calculate a more accurate calorie value
        calculated_calories = calculate_calories(predicted_carbs, predicted_protein, predicted_fat)
        
        # Calculate diabetic_safe based on the predicted sugar value
        diabetic_safe_status = bool(predicted_sugar < DIABETIC_SUGAR_THRESHOLD)

        print(f"Predicted sugar value from model: {predicted_sugar}")
        
        result = {
            "calories": calculated_calories,
            "carbohydrates": predicted_carbs,
            "protein": predicted_protein,
            "fat": predicted_fat,
            "fiber": predicted_fiber,
            "sugar": predicted_sugar,
            "diabetic_safe": diabetic_safe_status
        }
        
        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)