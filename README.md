# Handwritten Digit Recognition Web App

A web application for recognizing handwritten digits (0-9) using a convolutional neural network model trained on MNIST-like data. The app allows users to draw digits on a canvas and get real-time predictions.

## Features

- **Interactive Canvas**: Draw digits with mouse or touch (mobile-friendly)
- **Real-time Prediction**: Get instant predictions as you draw
- **Visual Feedback**: See the processed 28x28 input and prediction confidence
- **Probability Distribution**: View confidence scores for all digits (0-9)
- **Modern UI**: Clean, dark theme with responsive design
- **Robust Backend**: Flask API with image preprocessing and model inference
- **Fallback Mechanism**: Uses mock predictions if model file is missing

## Tech Stack

### Backend
- Python 3.x
- Flask (web framework)
- TensorFlow/Keras (model inference)
- PIL/Pillow (image processing)
- NumPy (numerical operations)

### Frontend
- HTML5 Canvas (drawing interface)
- CSS3 (custom dark/modern theme)
- Vanilla JavaScript (event handling & API communication)
- Fetch API (AJAX requests)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/handwritten-digit-recognition.git
   cd handwritten-digit-recognition
   ```

2. **Set up a virtual environment (optional but recommended)**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **Draw a digit** (0-9) on the black canvas using your mouse or touchscreen.

4. **Click "Predict"** to get the recognition result, or let it predict automatically as you draw.

5. **Click "Clear"** to reset the canvas and try another digit.

## Model Information

The application uses a Convolutional Neural Network (CNN) model trained on grayscale images of handwritten digits (similar to MNIST). The model expects input images of size 28x28 pixels.

- **Input**: Grayscale image, 28x28 pixels, normalized to [0, 1]
- **Output**: Probability distribution over 10 classes (digits 0-9)
- **File**: `handwritten.keras` (Keras model format)

If the model file is not found or fails to load, the application will use a mock prediction generator for demonstration purposes.

## Project Structure

```
handwritten-digit-recognition/
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
├── handwritten.keras       # Trained model (optional for mock mode)
├── README.md               # This file
├── templates/
│   └── index.html         # Main HTML page
└── static/
    ├── css/
    │   └── style.css      # Styling (dark/modern theme)
    └── js/
        └── main.js        # Frontend logic (drawing & API calls)
```

## How It Works

1. **Frontend**:
   - User draws on the HTML5 canvas
   - Canvas content is converted to base64-encoded PNG
   - Sent to the backend via POST request to `/predict`

2. **Backend**:
   - Receives and decodes the base64 image
   - Converts to grayscale and resizes to 28x28 pixels
   - Normalizes pixel values to [0.0, 1.0]
   - Reshapes to match model input shape (1, 28, 28, 1)
   - Runs inference using the loaded Keras model
   - Applies softmax to get probability distribution
   - Returns JSON with predicted digit, confidence, and all class probabilities

3. **Frontend (again)**:
   - Receives prediction results from backend
   - Updates the UI with the predicted digit and confidence
   - Displays probability bars for all digits
   - Shows the processed 28x28 image in the preview canvas

## Customization

### Changing the Model
Replace `handwritten.keras` with your own trained Keras model. Ensure it:
- Accepts input shape (28, 28, 1) or (784,)
- Outputs 10 classes (digits 0-9)
- Is saved in Keras `.h5` or `.keras` format

### Adjusting Drawing Parameters
Modify `static/js/main.js` to change:
- Brush size (`ctx.lineWidth`)
- Brush color (`ctx.strokeStyle`)
- Canvas size (adjust both HTML and JS)

### Changing the Port
Modify `app.py` to change the Flask port:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port number
```

## Troubleshooting

- **ModuleNotFoundError**: Make sure you've installed all dependencies with `pip install -r requirements.txt`
- **Model Loading Errors**: Verify `handwritten.keras` exists in the root directory and is a valid Keras model
- **Port Already In Use**: Change the port number in `app.py` or stop the conflicting service
- **CORS Issues**: If hosting frontend/backend separately, enable CORS in Flask

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Model architecture inspired by MNIST classification tutorials
- Frontend design influenced by modern web UI principles
- Built with Python Flask and vanilla JavaScript for simplicity and performance

---

**Happy digit recognizing!** ✏️🔢