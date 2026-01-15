import unittest
from genealogy_pipeline import GenealogyTextPipeline

class TestDateNormalization(unittest.TestCase):
    def setUp(self):
        self.pipeline = GenealogyTextPipeline()

    def test_standard_dates(self):
        self.assertEqual(self.pipeline._normalize_date("1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("May 1, 1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("1774-1780"), 1774)

    def test_modifiers(self):
        self.assertEqual(self.pipeline._normalize_date("bef 1800"), 1799)
        self.assertEqual(self.pipeline._normalize_date("bef. 1800"), 1799)
        self.assertEqual(self.pipeline._normalize_date("before 1800"), 1799)
        self.assertEqual(self.pipeline._normalize_date("by 1800"), 1799)

        self.assertEqual(self.pipeline._normalize_date("aft 1750"), 1751)
        self.assertEqual(self.pipeline._normalize_date("after 1750"), 1751)
        self.assertEqual(self.pipeline._normalize_date("aft. 1750"), 1751)

        self.assertEqual(self.pipeline._normalize_date("c. 1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("ca 1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("about 1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("abt 1774"), 1774)

    def test_double_dates(self):
        self.assertEqual(self.pipeline._normalize_date("1774/5"), 1774)
        self.assertEqual(self.pipeline._normalize_date("1/10/1654/5"), 1654)

    def test_living(self):
        self.assertEqual(self.pipeline._normalize_date("living in 1774"), 1774)
        self.assertEqual(self.pipeline._normalize_date("fl. 1774"), 1774)

    def test_messy_dates(self):
        self.assertEqual(self.pipeline._normalize_date("1/16/1737, Warren, MA"), 1737)
        # "1736 or 1788" -> 1736
        self.assertEqual(self.pipeline._normalize_date("1736 or 1788"), 1736)

    def test_unknown(self):
        self.assertIsNone(self.pipeline._normalize_date("Unknown"))
        self.assertIsNone(self.pipeline._normalize_date("?"))
        self.assertIsNone(self.pipeline._normalize_date(""))

    def test_centuries(self):
        self.assertEqual(self.pipeline._normalize_date("18th century"), 1700)
        self.assertEqual(self.pipeline._normalize_date("17th century"), 1600)

    def test_false_positives(self):
        # Should NOT match 5 digit numbers
        self.assertIsNone(self.pipeline._normalize_date("12345"))
        self.assertIsNone(self.pipeline._normalize_date("ID: 10203"))

    def test_decades(self):
        # "1990s" -> 1990
        self.assertEqual(self.pipeline._normalize_date("1990s"), 1990)
        self.assertEqual(self.pipeline._normalize_date("1750's"), 1750)

if __name__ == '__main__':
    unittest.main()
