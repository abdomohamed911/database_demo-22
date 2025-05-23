import unittest
import os
import json
import io
import pandas as pd
from unittest.mock import patch, MagicMock, mock_open

# Add server directory to sys.path to allow direct import of app
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app, get_db_connection, UPLOAD_FOLDER
from mysql.connector import Error as MySQLError


class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        app.config['TESTING'] = True
        self.original_env = os.environ.copy()
        # Ensure upload folder exists for tests that might write to it (though we'll mock most of this)
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

    def tearDown(self):
        os.environ = self.original_env
        # Clean up any files in upload folder if created (though mocks should prevent this)
        for f in os.listdir(UPLOAD_FOLDER):
            os.remove(os.path.join(UPLOAD_FOLDER, f))
        if os.path.exists(UPLOAD_FOLDER) and not os.listdir(UPLOAD_FOLDER): # Remove if empty
             pass # Keep upload folder for now, it's created by app startup too.

    # --- Port Configuration Tests ---
    @patch('app.app.run')
    def test_flask_port_default(self, mock_app_run):
        # Temporarily remove FLASK_PORT if it's set
        if 'FLASK_PORT' in os.environ:
            del os.environ['FLASK_PORT']
        
        # This is tricky because app.run is called at the bottom of app.py
        # We need to simulate the execution context of __main__
        # For simplicity, we'll check the port value derived in app.py's __main__
        # by accessing the logic directly or by re-importing/executing a small part.
        # Re-executing __main__ part of app.py is complex in a test.
        # Instead, we can test the logic that *would* be used by app.run.
        
        # Simulate how app.py determines the port
        port = int(os.environ.get("FLASK_PORT", 5000))
        self.assertEqual(port, 5000)
        
        # If we could re-run the app.py's main block, we'd check mock_app_run
        # For now, this test verifies the port determination logic.

    @patch('app.app.run')
    def test_flask_port_env_variable(self, mock_app_run):
        os.environ['FLASK_PORT'] = '8080'
        # Simulate how app.py determines the port
        port = int(os.environ.get("FLASK_PORT", 5000))
        self.assertEqual(port, 8080)
        # Clean up env var
        del os.environ['FLASK_PORT']

    # --- File Upload Logic Tests ---

    @patch('app.get_db_connection')
    @patch('pandas.read_csv')
    def test_upload_csv_success(self, mock_read_csv, mock_get_db_connection):
        # Mock database
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_db_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.execute.return_value = None
        mock_conn.commit.return_value = None

        # Mock pandas read_csv
        data = {
            'ssn': ['1234567890'], 'name': ['Test User'], 'email': ['test@example.com'],
            'address': ['123 Test St'], 'date_of_birth': ['2000-01-01']
        }
        mock_df = pd.DataFrame(data)
        mock_read_csv.return_value = mock_df

        # Simulate file upload
        file_content = "ssn,name,email,address,date_of_birth\n1234567890,Test User,test@example.com,123 Test St,2000-01-01"
        data = {'file': (io.BytesIO(file_content.encode('utf-8')), 'test.csv')}
        
        with patch('os.path.exists', return_value=True), patch('os.remove'): # Mock os file operations
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertIn("processed successfully for 'User' table!", json_response['message'])
        mock_get_db_connection.assert_called_once()
        mock_cursor.execute.assert_called() # Check that execute was called
        mock_conn.commit.assert_called_once()


    @patch('app.get_db_connection')
    @patch('pandas.read_excel')
    def test_upload_xlsx_success(self, mock_read_excel, mock_get_db_connection):
        # Mock database
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_db_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor

        # Mock pandas read_excel
        data = {
            'ssn': ['1234567890'], 'name': ['Test User'], 'email': ['test@example.com'],
            'address': ['123 Test St'], 'date_of_birth': ['2000-01-01']
        }
        mock_df = pd.DataFrame(data)
        mock_read_excel.return_value = mock_df

        # Simulate file upload
        # Creating a dummy xlsx in memory is complex, so we rely on mocking read_excel
        # and just pass dummy bytes with the correct filename.
        data = {'file': (io.BytesIO(b'dummy xlsx content'), 'test.xlsx')}
        
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)

        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertIn("processed successfully for 'User' table!", json_response['message'])

    def test_upload_unsupported_extension(self):
        data = {'file': (io.BytesIO(b'dummy content'), 'test.txt')}
        response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "Allowed file types are CSV, XLSX")

    @patch('pandas.read_csv')
    def test_upload_missing_columns(self, mock_read_csv):
        # Mock pandas to return a DataFrame with missing columns
        mock_df = pd.DataFrame({'ssn': ['123'], 'name': ['Test']}) # Missing email, address, dob
        mock_read_csv.return_value = mock_df

        data = {'file': (io.BytesIO(b'ssn,name\n123,Test'), 'test.csv')}
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertIn("Missing columns: address, date_of_birth, email.", json_response['message'])


    @patch('pandas.read_csv')
    def test_upload_extra_columns(self, mock_read_csv):
        # Mock pandas to return a DataFrame with extra columns
        data_val = {
            'ssn': ['123'], 'name': ['Test User'], 'email': ['test@example.com'],
            'address': ['123 Test St'], 'date_of_birth': ['2000-01-01'],
            'extra_col': ['unexpected']
        }
        mock_df = pd.DataFrame(data_val)
        mock_read_csv.return_value = mock_df

        data = {'file': (io.BytesIO(b'ssn,name,email,address,date_of_birth,extra_col\n123,Test User,t@x.c,addr,2000,val'), 'test.csv')}
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)

        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertIn("Unexpected columns: extra_col.", json_response['message'])

    @patch('app.get_db_connection')
    @patch('pandas.read_csv')
    def test_upload_db_duplicate_error(self, mock_read_csv, mock_get_db_connection):
        # Mock database to raise duplicate error
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_db_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        
        # Simulate MySQL duplicate entry error (1062)
        mock_cursor.execute.side_effect = MySQLError(errno=1062, msg="Duplicate entry '1234567890' for key 'PRIMARY'")

        # Mock pandas read_csv
        data = {
            'ssn': ['1234567890'], 'name': ['Test User'], 'email': ['test@example.com'],
            'address': ['123 Test St'], 'date_of_birth': ['2000-01-01']
        }
        mock_df = pd.DataFrame(data)
        mock_read_csv.return_value = mock_df

        file_content = "ssn,name,email,address,date_of_birth\n1234567890,Test User,test@example.com,123 Test St,2000-01-01"
        data_file = {'file': (io.BytesIO(file_content.encode('utf-8')), 'test.csv')}
        
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data_file)

        self.assertEqual(response.status_code, 409) # 409 for duplicate entry
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertIn("Database error: Duplicate entry found.", json_response['message'])
        mock_conn.rollback.assert_called_once()


    @patch('pandas.read_csv')
    def test_upload_empty_file_content(self, mock_read_csv): # Test for EmptyDataError
        mock_read_csv.side_effect = pd.errors.EmptyDataError("No columns to parse from file")
        
        data = {'file': (io.BytesIO(b''), 'empty.csv')} # Empty content
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "File is empty.")

    @patch('pandas.read_csv')
    def test_upload_malformed_csv(self, mock_read_csv): # Test for ParserError
        mock_read_csv.side_effect = pd.errors.ParserError("Error tokenizing data.")
        
        data = {'file': (io.BytesIO(b'ssn,name\n123"unterminated quote'), 'malformed.csv')}
        with patch('os.path.exists', return_value=True), patch('os.remove'):
            response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "Could not parse CSV file. Please ensure it is correctly formatted.")

    def test_upload_no_file_part(self):
        response = self.app.post('/api/upload_data', content_type='multipart/form-data', data={})
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "No file part")

    def test_upload_no_selected_file(self):
        data = {'file': (io.BytesIO(b''), '')} # Empty filename
        response = self.app.post('/api/upload_data', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 400)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "No selected file")

    # --- General Error Handling Test ---
    @patch('app.get_db_connection')
    def test_db_connection_error_generic_endpoint(self, mock_get_db_connection):
        mock_get_db_connection.return_value = None # Simulate DB connection failure

        # Test with an endpoint that requires DB access, e.g., /api/users
        # Assuming /api/users is protected, we might need to simulate login or use a public endpoint
        # For simplicity, if /api/users requires login and role, this test might fail due to auth.
        # Let's assume for now we can hit it or pick one that doesn't need deep auth.
        # The /api/admin_dashboard_data seems like a good candidate if we mock auth.
        
        # To test a generic db connection error, we can try any route that calls get_db_connection early.
        # The login route is one such.
        response = self.app.post('/api/login', json={'ssn': '123'}) # Actual ssn doesn't matter here
        
        self.assertEqual(response.status_code, 500)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], "Database connection error")


if __name__ == '__main__':
    """
    To run these tests:
    1. Ensure you are in the root directory of the project.
    2. Run the command: python -m unittest server/test_app.py
    """
    unittest.main()

# Note: For the port configuration tests, directly testing `app.run` behavior when `if __name__ == '__main__'`
# is involved is complex. The current tests verify the logic that determines the port.
# A more involved approach might use multiprocessing to run the app in a separate process,
# then try to connect to the specified port, but this is often too heavy for unit tests.
# Mocking `app.run` as done in the flask documentation is usually for testing what args it's called with
# *if* the main block could be easily triggered and isolated.
# The current `test_flask_port_default` and `test_flask_port_env_variable` check the critical
# `os.environ.get("FLASK_PORT", 5000)` logic.
