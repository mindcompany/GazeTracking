class Eye {
    /**
     * This class creates a new frame to isolate the eye and
     * initiates the pupil detection.
     */
    static LEFT_EYE_POINTS = [36, 37, 38, 39, 40, 41];
    static RIGHT_EYE_POINTS = [42, 43, 44, 45, 46, 47];

    constructor(originalFrame, landmarks, side, calibration) {
        this.frame = null;
        this.origin = null;
        this.center = null;
        this.pupil = null;
        this.landmarkPoints = null;

        this._analyze(originalFrame, landmarks, side, calibration);
    }

    static _middlePoint(p1, p2) {
        /**
         * Returns the middle point (x, y) between two points
         * Arguments:
         *   p1 (Object): {x, y} First point
         *   p2 (Object): {x, y} Second point
         */
        const x = Math.floor((p1.x + p2.x) / 2);
        const y = Math.floor((p1.y + p2.y) / 2);
        return { x, y };
    }

    _isolate(frame, landmarks, points) {
        /**
         * Isolates the eye region from the face frame using a mask
         * Arguments:
         *   frame (Canvas/Image): Frame containing the face
         *   landmarks (Array): Facial landmarks (68 points)
         *   points (Array): Points of an eye (left or right)
         */
        const region = points.map(point => ({
            x: landmarks[point].x,
            y: landmarks[point].y
        }));

        // Create a mask to isolate the eye
        const ctx = frame.getContext('2d');
        const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
        const data = imageData.data;

        // Create an empty mask and fill the region of the eye
        const mask = new Array(frame.width * frame.height).fill(255);
        region.forEach(({x, y}) => {
            mask[y * frame.width + x] = 0;  // Mark the region points as the eye
        });

        // Use mask to isolate the eye (simple operation for demonstration)
        for (let i = 0; i < data.length; i += 4) {
            if (mask[i / 4] === 255) {
                data[i] = 0;    // Apply mask: Set outside of eye to black
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
        }

        // Update the canvas with the isolated eye region
        ctx.putImageData(imageData, 0, 0);
        this.frame = frame;  // Store the isolated eye frame
        this.origin = { x: region[0].x, y: region[0].y };

        const height = frame.height;
        const width = frame.width;
        this.center = { x: width / 2, y: height / 2 };
    }

    _blinkingRatio(landmarks, points) {
        /**
         * Calculates a ratio that can indicate whether an eye is closed or not.
         * Arguments:
         *   landmarks (Array): Facial landmarks (68 points)
         *   points (Array): Points of an eye (left or right)
         * Returns:
         *   The computed ratio (eye width / eye height)
         */
        const left = landmarks[points[0]];
        const right = landmarks[points[3]];
        const top = Eye._middlePoint(landmarks[points[1]], landmarks[points[2]]);
        const bottom = Eye._middlePoint(landmarks[points[5]], landmarks[points[4]]);

        const eyeWidth = Math.hypot(left.x - right.x, left.y - right.y);
        const eyeHeight = Math.hypot(top.x - bottom.x, top.y - bottom.y);

        return eyeHeight === 0 ? null : eyeWidth / eyeHeight;
    }

    _analyze(originalFrame, landmarks, side, calibration) {
        /**
         * Detects and isolates the eye in a new frame, sends data to the calibration
         * and initializes Pupil object.
         * Arguments:
         *   originalFrame (Canvas/Image): Frame passed by the user
         *   landmarks (Array): Facial landmarks (68 points)
         *   side: Indicates whether it's the left eye (0) or the right eye (1)
         *   calibration (Object): Manages the binarization threshold value
         */
        let points;
        if (side === 0) {
            points = Eye.LEFT_EYE_POINTS;
        } else if (side === 1) {
            points = Eye.RIGHT_EYE_POINTS;
        } else {
            return;
        }

        this.blinking = this._blinkingRatio(landmarks, points);
        this._isolate(originalFrame, landmarks, points);

        if (!calibration.isComplete()) {
            calibration.evaluate(this.frame, side);
        }

        const threshold = calibration.getThreshold(side);
        this.pupil = new Pupil(this.frame, threshold);
    }
}
