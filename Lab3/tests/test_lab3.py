import unittest
from app import app


class TestLab3(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)

    def test_home(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)

    def test_data(self):
        res = self.client.get('/data')
        self.assertIn(res.status_code, [200, 400])

    def test_404(self):
        res = self.client.get('/notfound')
        self.assertEqual(res.status_code, 404)


if __name__ == '__main__':
    unittest.main()
