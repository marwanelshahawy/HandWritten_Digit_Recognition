import os
import base64
import numpy as np
from PIL import Image
import io
from flask import Flask, render_template, request, jsonify
import tflite_runtime.interpreter as tflite

application = Flask(__name__)
app = application

# Load TFLite Model
MODEL_PATH = 'model.tflite'
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        image_data = base64.b64decode(data['image'].split(',')[1])
        image = Image.open(io.BytesIO(image_data)).convert('L')
        image = image.resize((28, 28), Image.Resampling.LANCZOS)

        # Invert colors if canvas is black on white (MNIST is white on black)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = image_array.reshape(1, 28, 28, 1)

        interpreter.set_tensor(input_details[0]['index'], image_array)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])[0]

        if np.any(predictions < 0):
            exp_pred = np.exp(predictions - np.max(predictions))
            probabilities = exp_pred / np.sum(exp_pred)
        else:
            probabilities = predictions / np.sum(predictions)

        digit = int(np.argmax(probabilities))
        confidence = float(probabilities[digit])

        return jsonify({
            'digit': digit,
            'confidence': confidence,
            'probabilities': probabilities.tolist()
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5000)