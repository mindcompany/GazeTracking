class GazeTracking {
    /**
     * This class tracks the user's gaze.
     * It provides useful information like the position of the eyes
     * and pupils and allows determining if the eyes are open or closed.
     */
    constructor() {
        this.frame = null;
        this.eyeLeft = null;
        this.eyeRight = null;
        this.calibration = new Calibration();

        // _faceDetector is used to detect faces (Replace dlib with a JS library like face-api.js)
        this._faceDetector = new faceapi.SsdMobilenetv1();

        // _predictor is used to get facial landmarks of a given face (Replace with JS equivalent)
        this._predictor = new faceapi.FaceLandmark68Predictor();
    }

    get pupilsLocated() {
        /** Check that the pupils have been located */
        try {
            return (
                Number.isInteger(this.eyeLeft.pupil.x) &&
                Number.isInteger(this.eyeLeft.pupil.y) &&
                Number.isInteger(this.eyeRight.pupil.x) &&
                Number.isInteger(this.eyeRight.pupil.y)
            );
        } catch (e) {
            return false;
        }
    }

    _analyze() {
        /** Detects the face and initializes Eye objects */
        const frame = this._convertToGrayscale(this.frame); // Convert to grayscale
        const faces = this._faceDetector.detect(frame); // Detect faces

        if (faces.length > 0) {
            const landmarks = this._predictor.detectLandmarks(faces[0]); // Detect landmarks
            this.eyeLeft = new Eye(frame, landmarks, 0, this.calibration);
            this.eyeRight = new Eye(frame, landmarks, 1, this.calibration);
        } else {
            this.eyeLeft = null;
            this.eyeRight = null;
        }
    }

    _convertToGrayscale(frame) {
        /** Converts the frame to grayscale (dummy implementation, needs canvas manipulation) */
        return frame; // Placeholder for grayscale conversion logic
    }

    refresh(frame) {
        /** Refreshes the frame and analyzes it */
        this.frame = frame;
        this._analyze();
    }

    pupilLeftCoords() {
        /** Returns the coordinates of the left pupil */
        if (this.pupilsLocated) {
            const x = this.eyeLeft.origin.x + this.eyeLeft.pupil.x;
            const y = this.eyeLeft.origin.y + this.eyeLeft.pupil.y;
            return { x, y };
        }
        return null;
    }

    pupilRightCoords() {
        /** Returns the coordinates of the right pupil */
        if (this.pupilsLocated) {
            const x = this.eyeRight.origin.x + this.eyeRight.pupil.x;
            const y = this.eyeRight.origin.y + this.eyeRight.pupil.y;
            return { x, y };
        }
        return null;
    }

    horizontalRatio() {
        /** 
         * Returns a number between 0.0 and 1.0 indicating the horizontal direction of the gaze.
         * The extreme right is 0.0, the center is 0.5, and the extreme left is 1.0.
         */
        if (this.pupilsLocated) {
            const pupilLeft = this.eyeLeft.pupil.x / (this.eyeLeft.center.x * 2 - 10);
            const pupilRight = this.eyeRight.pupil.x / (this.eyeRight.center.x * 2 - 10);
            return (pupilLeft + pupilRight) / 2;
        }
        return null;
    }

    verticalRatio() {
        /** 
         * Returns a number between 0.0 and 1.0 indicating the vertical direction of the gaze.
         * The extreme top is 0.0, the center is 0.5, and the extreme bottom is 1.0.
         */
        if (this.pupilsLocated) {
            const pupilLeft = this.eyeLeft.pupil.y / (this.eyeLeft.center.y * 2 - 10);
            const pupilRight = this.eyeRight.pupil.y / (this.eyeRight.center.y * 2 - 10);
            return (pupilLeft + pupilRight) / 2;
        }
        return null;
    }

    isRight() {
        /** Returns true if the user is looking to the right */
        return this.pupilsLocated && this.horizontalRatio() <= 0.35;
    }

    isLeft() {
        /** Returns true if the user is looking to the left */
        return this.pupilsLocated && this.horizontalRatio() >= 0.65;
    }

    isCenter() {
        /** Returns true if the user is looking to the center */
        return this.pupilsLocated && !this.isRight() && !this.isLeft();
    }

    isBlinking() {
        /** Returns true if the user closes their eyes */
        if (this.pupilsLocated) {
            const blinkingRatio = (this.eyeLeft.blinking + this.eyeRight.blinking) / 2;
            return blinkingRatio > 3.8;
        }
        return false;
    }

    annotatedFrame() {
        /** Returns the main frame with pupils highlighted */
        const frame = this.frame; // Replace this with proper canvas/image frame copy logic

        if (this.pupilsLocated) {
            const color = 'rgb(0, 255, 0)';
            const { x: xLeft, y: yLeft } = this.pupilLeftCoords();
            const { x: xRight, y: yRight } = this.pupilRightCoords();

            // Draw cross at pupil locations (using Canvas API)
            this._drawCross(frame, xLeft, yLeft, color);
            this._drawCross(frame, xRight, yRight, color);
        }

        return frame;
    }

    _drawCross(frame, x, y, color) {
        /** Helper function to draw cross at pupil position */
        const ctx = frame.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
    }
}
