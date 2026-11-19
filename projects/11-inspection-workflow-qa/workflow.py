def complete(status, checklist_done):
    if status != "In progress":
        raise ValueError("Only inspections in progress can be completed.")
    return "Completed"
