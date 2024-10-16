const cv = require('opencv4nodejs');
const GazeTracking = require('./gazeTracking'); // Make sure the correct path is set for your GazeTracking class

const gaze = new GazeTracking();
const webcam = new cv.VideoCapture(0);

// Screen dimensions
const screenWidth = 640;
const screenHeight = 480;

// Box dimensions for a 3x3 grid
const boxWidth = Math.floor(screenWidth / 3);
const boxHeight = Math.floor(screenHeight / 3);

// Function to put text on the frame
function putText(frame, text, x, y) {
    const point = new cv.Point(x, y);
    frame.putText(text, point, cv.FONT_HERSHEY_DUPLEX, 1.6, new cv.Vec(147, 58, 31), 2);
}

function main() {
    setInterval(() => {
        // We get a new frame from the webcam
        let frame = webcam.read();

        // We send this frame to GazeTracking to analyze it
        gaze.refresh(frame);

        frame = gaze.annotatedFrame();
        let text = "";

        if (gaze.isBlinking()) {
            text = "Blinking";
        } else if (gaze.isRight()) {
            text = "Looking right";
        } else if (gaze.isLeft()) {
            text = "Looking left";
        } else if (gaze.isCenter()) {
            text = "Looking center";
        }

        putText(frame, text, 90, 60);

        const leftPupil = gaze.pupilLeftCoords();
        const rightPupil = gaze.pupilRightCoords();
        putText(frame, `Left pupil:  ${leftPupil}`, 90, 130);
        putText(frame, `Right pupil: ${rightPupil}`, 90, 165);

        // Get the gaze ratios
        const horizontalRatio = gaze.horizontalRatio();
        const verticalRatio = gaze.verticalRatio();

        // Create a visible grid of 9 boxes on the screen
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // Coordinates of the top-left and bottom-right corners of each box
                const topLeft = new cv.Point(col * boxWidth, row * boxHeight);
                const bottomRight = new cv.Point((col + 1) * boxWidth, (row + 1) * boxHeight);

                // Default color of the grid boxes
                const boxColor = new cv.Vec(200, 200, 200);
                frame.drawRectangle(topLeft, bottomRight, boxColor, 2);
            }
        }

        if (horizontalRatio !== null && verticalRatio !== null) {
            // Calculate the row and column based on the gaze ratios
            const gazeCol = Math.floor(horizontalRatio * 3); // 0, 1, or 2 for right, center, left
            const gazeRow = Math.floor(verticalRatio * 3);    // 0, 1, or 2 for top, center, bottom

            // If the current box matches the gaze location, change its color
            const topLeft = new cv.Point(gazeCol * boxWidth, gazeRow * boxHeight);
            const bottomRight = new cv.Point((gazeCol + 1) * boxWidth, (gazeRow + 1) * boxHeight);
            const boxColor = new cv.Vec(0, 255, 0);  // Green color for the box being looked at

            // Draw the rectangle for the grid box
            frame.drawRectangle(topLeft, bottomRight, boxColor, 2);

            // Additionally, draw a small circle at the exact gaze point for better visualization
            const gazeX = Math.floor(horizontalRatio * screenWidth);
            const gazeY = Math.floor(verticalRatio * screenHeight);
            frame.drawCircle(new cv.Point(gazeX, gazeY), 5, new cv.Vec(0, 0, 255), -1);  // Red circle for gaze point
        }

        cv.imshow("Demo", frame);
        if (cv.waitKey(1) === 27) { // ESC key to break
            clearInterval();
            webcam.release();
            cv.destroyAllWindows();
        }
    }, 0);
}

main();
