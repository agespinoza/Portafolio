import unittest
from duration import duration_minutes


class DurationTests(unittest.TestCase):
    def test_elapsed_minutes(self):
        self.assertEqual(duration_minutes(540, 572), 32)

    def test_zero_minutes(self):
        self.assertEqual(duration_minutes(540, 540), 0)

    def test_end_before_start(self):
        with self.assertRaises(ValueError):
            duration_minutes(572, 540)
