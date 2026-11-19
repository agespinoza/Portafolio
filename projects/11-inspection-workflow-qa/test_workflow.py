import unittest
from workflow import complete


class WorkflowTests(unittest.TestCase):
    def test_completed_checklist(self):
        self.assertEqual(complete("In progress", True), "Completed")

    def test_invalid_starting_status(self):
        with self.assertRaises(ValueError):
            complete("Scheduled", True)

    @unittest.expectedFailure
    def test_incomplete_checklist(self):
        with self.assertRaises(ValueError):
            complete("In progress", False)
