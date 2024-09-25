import time

class ScreenTracker:
    """
    This class divides the screen into 9 squares and tracks if the user's gaze
    remains in the far-right middle square (2nd row, 3rd column) for at least 2 seconds.
    """
    
    def __init__(self, gaze_tracker, screen_width, screen_height):
        self.gaze_tracker = gaze_tracker
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.grid_size_x = self.screen_width // 3
        self.grid_size_y = self.screen_height // 3
        self.start_time = None
        self.threshold_time = 2  # Seconds to stay in the target region

    def get_current_square(self, pupil_coords):
        """Determine which square of the 9 the pupil is currently in."""
        if pupil_coords is None:
            return None
        
        x, y = pupil_coords
        col = x // self.grid_size_x 
        row = y // self.grid_size_y 
        
        return row, col

    def is_in_target_square(self, row, col):
        """Check if the gaze is in the far-right middle square (2nd row, 3rd column)."""
        return row == 1 and col == 2

    def track_gaze(self):
        """Check if the gaze stays in the far-right middle square for at least 2 seconds."""
        pupil_coords = self.gaze_tracker.pupil_right_coords()  
        current_square = self.get_current_square(pupil_coords)

        if current_square and self.is_in_target_square(*current_square):
            if self.start_time is None:
                self.start_time = time.time()
            elif time.time() - self.start_time >= self.threshold_time:
                print("Task accomplished")
                self.start_time = None
        else:
            self.start_time = None
