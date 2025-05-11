import unittest
# import pytest # Pytest can run unittest test cases directly # Commenting out as pytest is run from terminal
from app import create_app
from app.models import init_db, close_db_session, get_db_session, Tasks, Archived
from app.models.database import Base, engine # Added Base and engine import
from app.config import Config
import os
import json

class AppTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test variables."""
        class TestConfig(Config):
            TESTING = True
            DATABASE_URI = 'sqlite:///:memory:' # Use in-memory SQLite for tests
            TASKS_PER_PAGE = 10 # Correctly override TASKS_PER_PAGE

        self.app = create_app(TestConfig)
        self.client = self.app.test_client()

        self.app_context = self.app.app_context()
        self.app_context.push()

        # Ensure a clean database for each test
        Base.metadata.drop_all(bind=engine) # Drop all tables
        init_db() # Recreate tables

    def tearDown(self):
        """Tear down all initialized variables."""
        close_db_session()
        self.app_context.pop()

    def test_app_exists(self):
        """Test if the application instance exists."""
        self.assertIsNotNone(self.app)

    def test_404_not_found(self):
        """Test for a 404 error on a non-existent route."""
        response = self.client.get('/non_existent_route')
        self.assertEqual(response.status_code, 404)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['error'], 'Not Found')

    # --- TODO: Add more specific tests for your API endpoints below ---

    # Example test for adding a task
    def test_add_task(self):
        response = self.client.post('/api/add', 
                                    data=json.dumps({'task_description': 'Test Task 1'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], 'Task added successfully')

        # Verify the task was added to the database
        db_session = get_db_session()
        tasks = db_session.query(Tasks).all()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0].TODO, 'Test Task 1')

    def test_get_tasks_empty(self):
        response = self.client.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response, [])

    def test_get_tasks_with_data(self):
        # Add a task first
        self.client.post('/api/add', 
                         data=json.dumps({'task_description': 'Task for GET'}),
                         content_type='application/json')
        
        response = self.client.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(len(json_response), 1)
        self.assertEqual(json_response[0]['TODO'], 'Task for GET')

    def test_archive_task_success(self):
        # Add a task first
        add_response = self.client.post('/api/add',
                                        data=json.dumps({'task_description': 'Task to Archive'}),
                                        content_type='application/json')
        self.assertEqual(add_response.status_code, 201)
        
        # Get the added task's ID (assuming it's the first/only one for simplicity in test)
        db_session = get_db_session()
        task_to_archive = db_session.query(Tasks).first()
        self.assertIsNotNone(task_to_archive)

        archive_response = self.client.post('/api/archive',
                                            data=json.dumps({'task_id': task_to_archive.id}),
                                            content_type='application/json')
        self.assertEqual(archive_response.status_code, 200)
        json_response = json.loads(archive_response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], 'Task archived successfully')
        self.assertIn('archived_task_id', json_response)

        # Verify task is removed from Tasks table and added to Archived table
        archived_task_id = json_response['archived_task_id']
        archived_item = db_session.query(Archived).filter_by(id=archived_task_id).first()
        self.assertIsNotNone(archived_item)
        self.assertEqual(archived_item.Finished, 'Task to Archive')
        
        task_exists = db_session.query(Tasks).filter_by(id=task_to_archive.id).first()
        self.assertIsNone(task_exists)

    def test_archive_task_not_found(self):
        archive_response = self.client.post('/api/archive',
                                            data=json.dumps({'task_id': 999}), # Non-existent ID
                                            content_type='application/json')
        self.assertEqual(archive_response.status_code, 404)
        json_response = json.loads(archive_response.data.decode('utf-8'))
        self.assertEqual(json_response['error'], 'Failed to archive task or task not found')

    def test_perm_delete_archive_success(self):
        # Add and archive a task first
        self.client.post('/api/add', data=json.dumps({'task_description': 'Task to Delete Permanently'}), content_type='application/json')
        db_session = get_db_session()
        task_to_archive = db_session.query(Tasks).first()
        self.client.post('/api/archive', data=json.dumps({'task_id': task_to_archive.id}), content_type='application/json')
        
        archived_item = db_session.query(Archived).filter_by(Finished='Task to Delete Permanently').first()
        self.assertIsNotNone(archived_item)

        delete_response = self.client.post('/api/perm_delete',
                                           data=json.dumps({'archive_id': archived_item.id}),
                                           content_type='application/json')
        self.assertEqual(delete_response.status_code, 200)
        json_response = json.loads(delete_response.data.decode('utf-8'))
        self.assertEqual(json_response['message'], 'Archive permanently deleted successfully')

        # Verify item is removed from Archived table
        deleted_item_exists = db_session.query(Archived).filter_by(id=archived_item.id).first()
        self.assertIsNone(deleted_item_exists)

    def test_perm_delete_archive_not_found(self):
        delete_response = self.client.post('/api/perm_delete',
                                           data=json.dumps({'archive_id': 999}), # Non-existent ID
                                           content_type='application/json')
        self.assertEqual(delete_response.status_code, 404)
        json_response = json.loads(delete_response.data.decode('utf-8'))
        self.assertEqual(json_response['error'], 'Failed to delete archive or archive not found')

    def test_get_archives_empty(self):
        response = self.client.get('/api/archives')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(json_response, [])

    def test_get_archives_with_data(self):
        # Add and archive a task
        self.client.post('/api/add', data=json.dumps({'task_description': 'Archived Task 1'}), content_type='application/json')
        db_session = get_db_session()
        task_to_archive = db_session.query(Tasks).first()
        self.client.post('/api/archive', data=json.dumps({'task_id': task_to_archive.id}), content_type='application/json')

        response = self.client.get('/api/archives')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.data.decode('utf-8'))
        self.assertEqual(len(json_response), 1)
        self.assertEqual(json_response[0]['Finished'], 'Archived Task 1')

    def test_get_tasks_pagination(self):
        # Add multiple tasks (e.g., 12 tasks for 2 pages if PER_PAGE is 10)
        # Assuming PER_PAGE is 10 from app.models.control
        for i in range(12):
            self.client.post('/api/add', 
                             data=json.dumps({'task_description': f'Task {i+1}'}),
                             content_type='application/json')
        
        # Test page 1
        response_page1 = self.client.get('/api/tasks?page=1')
        self.assertEqual(response_page1.status_code, 200)
        json_response_page1 = json.loads(response_page1.data.decode('utf-8'))
        self.assertEqual(len(json_response_page1), 10) 
        self.assertEqual(json_response_page1[0]['TODO'], 'Task 12') # Newest first
        self.assertEqual(json_response_page1[9]['TODO'], 'Task 3')

        # Test page 2
        response_page2 = self.client.get('/api/tasks?page=2')
        self.assertEqual(response_page2.status_code, 200)
        json_response_page2 = json.loads(response_page2.data.decode('utf-8'))
        self.assertEqual(len(json_response_page2), 2)
        self.assertEqual(json_response_page2[0]['TODO'], 'Task 2') # Continues from page 1
        self.assertEqual(json_response_page2[1]['TODO'], 'Task 1')
        
        # Test page 3 (should be empty)
        response_page3 = self.client.get('/api/tasks?page=3')
        self.assertEqual(response_page3.status_code, 200)
        json_response_page3 = json.loads(response_page3.data.decode('utf-8'))
        self.assertEqual(len(json_response_page3), 0)

    def test_get_archives_pagination(self):
        # Add and archive multiple tasks
        db_session = get_db_session()
        for i in range(12):
            self.client.post('/api/add', 
                             data=json.dumps({'task_description': f'Archive Task {i+1}'}),
                             content_type='application/json')
            task_to_archive = db_session.query(Tasks).filter_by(TODO=f'Archive Task {i+1}').first()
            self.client.post('/api/archive', 
                             data=json.dumps({'task_id': task_to_archive.id}),
                             content_type='application/json')

        # Test page 1
        response_page1 = self.client.get('/api/archives?page=1')
        self.assertEqual(response_page1.status_code, 200)
        json_response_page1 = json.loads(response_page1.data.decode('utf-8'))
        self.assertEqual(len(json_response_page1), 10)
        self.assertEqual(json_response_page1[0]['Finished'], 'Archive Task 12') # Newest first
        self.assertEqual(json_response_page1[9]['Finished'], 'Archive Task 3')

        # Test page 2
        response_page2 = self.client.get('/api/archives?page=2')
        self.assertEqual(response_page2.status_code, 200)
        json_response_page2 = json.loads(response_page2.data.decode('utf-8'))
        self.assertEqual(len(json_response_page2), 2)
        self.assertEqual(json_response_page2[0]['Finished'], 'Archive Task 2') # Continues from page 1
        self.assertEqual(json_response_page2[1]['Finished'], 'Archive Task 1')

        # Test page 3 (should be empty)
        response_page3 = self.client.get('/api/archives?page=3')
        self.assertEqual(response_page3.status_code, 200)
        json_response_page3 = json.loads(response_page3.data.decode('utf-8'))
        self.assertEqual(len(json_response_page3), 0)

if __name__ == '__main__':
    unittest.main()
