class ScreenTracker {
    /**
     * This class divides the screen into 9 squares and tracks if the user's gaze
     * remains in the far-right middle square (2nd row, 3rd column) for at least 2 seconds.
     */
    constructor(gazeTracker, screenWidth, screenHeight) {
        this.gazeTracker = gazeTracker;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.gridSizeX = Math.floor(this.screenWidth / 3);
        this.gridSizeY = Math.floor(this.screenHeight / 3);
        this.startTime = null;
        this.thresholdTime = 2000; // Milliseconds to stay in the target region (2 seconds)
    }

    getCurrentSquare(pupilCoords) {
        /**
         * Determine which square of the 9 the pupil is currently in.
         *
         * @param {Array} pupilCoords - Array containing x and y coordinates of the pupil
         * @returns {Array|null} - Array with row and column or null if not in frame
         */
        if (pupilCoords === null) {
            return null;
        }

        const [x, y] = pupilCoords;
        const col = Math.floor(x / this.gridSizeX);
        const row = Math.floor(y / this.gridSizeY);

        return [row, col];
    }

    isInTargetSquare(row, col) {
        /**
         * Check if the gaze is in the far-right middle square (2nd row, 3rd column).
         *
         * @param {number} row - Row index of the square
         * @param {number} col - Column index of the square
         * @returns {boolean} - True if in target square, else false
         */
        return row === 1 && col === 2;
    }

    trackGaze() {
        /**
         * Check if the gaze stays in the far-right middle square for at least 2 seconds.
         */
        const pupilCoords = this.gazeTracker.pupilRightCoords();
        const currentSquare = this.getCurrentSquare(pupilCoords);

        if (currentSquare && this.isInTargetSquare(...currentSquare)) {
            if (this.startTime === null) {
                this.startTime = Date.now();
            } else if (Date.now() - this.startTime >= this.thresholdTime) {
                console.log("Task accomplished");
                this.startTime = null; // Reset for next tracking
            }
        } else {
            this.startTime = null; // Reset if not in the target square
        }
    }
}
