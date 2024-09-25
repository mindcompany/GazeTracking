import cv2
from gaze_tracking import GazeTracking, ScreenTracker

# Initialize gaze tracking and screen tracking
gaze = GazeTracking()
screen_width = 1920 
screen_height = 1080
screen_tracker = ScreenTracker(gaze, screen_width, screen_height)

webcam = cv2.VideoCapture(0)

while True:

    _, frame = webcam.read()
    gaze.refresh(frame)
    frame = gaze.annotated_frame()
    screen_tracker.track_gaze()
    cv2.imshow("Demo", frame)

    if cv2.waitKey(1) == 27:
        break

webcam.release()
cv2.destroyAllWindows()
