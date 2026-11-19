def duration_minutes(start_minute, end_minute):
    if end_minute < start_minute:
        raise ValueError("The end time must be at or after the start time.")
    return end_minute - start_minute
