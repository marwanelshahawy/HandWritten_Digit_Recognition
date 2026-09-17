import os
import base64
import numpy as np
from PIL import Image
import io
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load the model
MODEL_PATH = 'handwritten.keras'
model = None
try:
    from tensorflow.keras.models import load_model
    model = load_model(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Could not load model from {MODEL_PATH}. Using mock predictions. Error: {e}")

def mock_prediction(image_array):
    """Return a mock prediction for when the model is not available."""
    # Return a random digit with high confidence for demonstration
    import random
    digit = random.randint(0, 9)
    # Create a probability array with one high value and others low
    probabilities = [0.01] * 10
    probabilities[digit] = 0.9 + random.random() * 0.09  # between 0.9 and 0.99
    # Normalize to sum to 1
    total = sum(probabilities)
    probabilities = [p / total for p in probabilities]
    confidence = probabilities[digit]
    return digit, confidence, probabilities

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the base64 image data from the request
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Decode the base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])  # Remove the data URL prefix if present
        image = Image.open(io.BytesIO(image_data))

        # Convert to grayscale
        image = image.convert('L')

        # Resize to 28x28
        image = image.resize((28, 28), Image.Resampling.LANCZOS)

        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0

        # Reshape for model input: (1, 28, 28, 1) for CNN
        image_array = image_array.reshape(1, 28, 28, 1).astype(np.float32)

        # Predict
        if model is not None:
            predictions = model.predict(image_array)[0]
            # If output contains negative values, apply softmax to get probabilities
            if np.any(predictions < 0):
                # Apply softmax to get probabilities
                exp_pred = np.exp(predictions - np.max(predictions))  # for numerical stability
                probabilities = exp_pred / np.sum(exp_pred)
                digit = np.argmax(probabilities)
                confidence = float(probabilities[digit])
                probabilities = probabilities.tolist()
            else:
                # Assume output is already probabilities, but normalize to sum to 1
                total = np.sum(predictions)
                if total > 0:
                    probabilities = predictions / total
                else:
                    probabilities = predictions  # avoid division by zero
                digit = np.argmax(probabilities)
                confidence = float(probabilities[digit])
                probabilities = probabilities.tolist()
        else:
            # Mock prediction
            digit, confidence, probabilities = mock_prediction(image_array)

        return jsonify({
            'digit': int(digit),
            'confidence': float(confidence),
            'probabilities': probabilities
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)