"""
Demonstration of the GazeTracking library.
Check the README.md for complete documentation.
"""

import cv2
from gaze_tracking import GazeTracking

gaze = GazeTracking()
webcam = cv2.VideoCapture(0)

# Screen dimensions
screen_width = 640
screen_height = 480

# Box dimensions for a 3x3 grid
box_width = screen_width // 3
box_height = screen_height // 3

while True:
    # We get a new frame from the webcam
    _, frame = webcam.read()

    # We send this frame to GazeTracking to analyze it
    gaze.refresh(frame)

    frame = gaze.annotated_frame()
    text = ""

    if gaze.is_blinking():
        text = "Blinking"
    elif gaze.is_right():
        text = "Looking right"
    elif gaze.is_left():
        text = "Looking left"
    elif gaze.is_center():
        text = "Looking center"

    cv2.putText(frame, text, (90, 60), cv2.FONT_HERSHEY_DUPLEX, 1.6, (147, 58, 31), 2)

    left_pupil = gaze.pupil_left_coords()
    right_pupil = gaze.pupil_right_coords()
    cv2.putText(frame, "Left pupil:  " + str(left_pupil), (90, 130), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)
    cv2.putText(frame, "Right pupil: " + str(right_pupil), (90, 165), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)

    # Get the gaze ratios
    horizontal_ratio = gaze.horizontal_ratio()
    vertical_ratio = gaze.vertical_ratio()

    # Create a visible grid of 9 boxes on the screen
    for row in range(3):
        for col in range(3):
            # Coordinates of the top-left and bottom-right corners of each box
            top_left = (col * box_width, row * box_height)
            bottom_right = ((col + 1) * box_width, (row + 1) * box_height)

            # Default color of the grid boxes
            box_color = (200, 200, 200)

            cv2.rectangle(frame, top_left, bottom_right, box_color, 2)

    if horizontal_ratio is not None and vertical_ratio is not None:

        # Draw the gaze location on the screen


         # Calculate the row and column based on the gaze ratios
        gaze_col = int(horizontal_ratio * 3) # 0, 1, or 2 for right, center, left
        gaze_row = int(vertical_ratio * 3)    # 0, 1, or 2 for top, center, bottom

        print(gaze_col, gaze_row)

        # If the current box matches the gaze location, change its color
        top_left = (gaze_col * box_width, gaze_row * box_height)
        bottom_right = ((gaze_col + 1) * box_width, (gaze_row + 1) * box_height)

        box_color = (0, 255, 0)  # Green color for the box being looked at

        # Draw the rectangle for the grid box
        cv2.rectangle(frame, top_left, bottom_right, box_color, 2)

        # Additionally, draw a small circle at the exact gaze point for better visualization
        gaze_x = int(horizontal_ratio * screen_width)
        gaze_y = int(vertical_ratio * screen_height)
        cv2.circle(frame, (gaze_x, gaze_y), 5, (0, 0, 255), -1)  # Red circle for gaze point

    cv2.imshow("Demo", frame)

    if cv2.waitKey(1) == 27:
        break
   
webcam.release()
cv2.destroyAllWindows()
