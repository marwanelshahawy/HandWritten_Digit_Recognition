document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewCtx = previewCanvas.getContext('2d');
    const clearBtn = document.getElementById('clearBtn');
    const predictBtn = document.getElementById('predictBtn');
    const predictionDisplay = document.getElementById('prediction');
    const confidenceDisplay = document.getElementById('confidence');
    const probabilityList = document.getElementById('probabilityList');

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set up drawing style
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear the canvas
    function clearCanvas() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Also clear preview
        previewCtx.fillStyle = '#000000';
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        // Reset UI
        predictionDisplay.textContent = '-';
        confidenceDisplay.textContent = '0%';
        probabilityList.innerHTML = '';
    }

    // Start drawing
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }

    // Stop drawing
    function stopDrawing() {
        isDrawing = false;
    }

    // Draw line
    function drawLine(x, y) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    }

    // Get coordinates from mouse or touch event
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.type.startsWith('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return [x, y];
    }

    // Event listeners for mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) drawLine(...getCoordinates(e)); });
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Event listeners for touch
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawLine(...getCoordinates(e)); });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Clear button
    clearBtn.addEventListener('click', clearCanvas);

    // Predict button
    predictBtn.addEventListener('click', async () => {
        // Disable button during prediction
        predictBtn.disabled = true;
        predictBtn.textContent = 'Predicting...';

        try {
            // Get canvas data as base64 PNG
            const imageDataUrl = canvas.toDataURL('image/png');

            // Send to backend
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageDataUrl })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            // Update UI
            predictionDisplay.textContent = result.digit;
            confidenceDisplay.textContent = `${(result.confidence * 100).toFixed(1)}%`;

            // Update probability list
            probabilityList.innerHTML = '';
            result.probabilities.forEach((prob, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${index}</span>
                    <div class="probability-bar">
                        <div class="probability-fill" style="width: ${prob * 100}%"></div>
                    </div>
                    <span>${(prob * 100).toFixed(2)}%</span>
                `;
                probabilityList.appendChild(li);
            });

            // Update preview canvas with the 28x28 image (scaled up)
            // We need to get the image data from the canvas, but we have already sent it.
            // Alternatively, we can reuse the same data URL and draw it on the preview canvas.
            const img = new Image();
            img.onload = () => {
                previewCtx.fillStyle = '#000000';
                previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
                // Draw the 28x28 image, scaling it to fit the preview canvas (140x140 => 5x scaling)
                previewCtx.imageSmoothingEnabled = false; // Keep it pixelated
                previewCtx.drawImage(img, 0, 0, 28, 28, 0, 0, 140, 140);
            };
            img.src = imageDataUrl;

        } catch (error) {
            console.error('Error:', error);
            alert('Prediction failed: ' + error.message);
        } finally {
            predictBtn.disabled = false;
            predictBtn.textContent = 'Predict';
        }
    });

    // Initialize canvas
    clearCanvas();
});