import os

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class Config:
    
    DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(base_dir, 'MyTODO.db')
    
    TASKS_PER_PAGE = 25
    PORT = int(os.environ.get('FLASK_RUN_PORT', 5000))
