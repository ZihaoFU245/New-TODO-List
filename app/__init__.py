import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify
from flask_cors import CORS 
import os
from .models import init_db, close_db_session
from .control_endpoints import api
from .config import Config

def create_app(config_object=None):
    if config_object is None:
        config_object = Config

    # Logging setup
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'app.log')

    handler = RotatingFileHandler(log_file, maxBytes=100000, backupCount=3)
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)

    # Flask app initialization
    app = Flask(__name__)
    app.config.from_object(config_object)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    CORS(app)

    app.logger.info('Flask app initialized with logging.')

    # --- Database initialization integration ---
    database_uri = config_object.DATABASE_URI
    is_sqlite = False
    actual_db_file_path = None

    if database_uri.startswith('sqlite:///'):
        is_sqlite = True
        actual_db_file_path = database_uri[len('sqlite:///'):]

    if is_sqlite and actual_db_file_path:
        db_dir = os.path.dirname(actual_db_file_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            app.logger.info(f"Created directory for SQLite database: {db_dir}")

        if not os.path.exists(actual_db_file_path):
            app.logger.info(f"SQLite Database file not found at {actual_db_file_path}. Initializing new database...")
        else:
            app.logger.info(f"SQLite Database file found at {actual_db_file_path}. Ensuring tables exist...")
    else:
        app.logger.info(f"Database URI: {database_uri}. Proceeding with initialization (file existence check skipped or not applicable for this URI type).")

    init_db()
    # --- End database initialization integration ---

    app.register_blueprint(api, url_prefix='/api')

    @app.teardown_appcontext
    def shutdown_session(exc=None): # Added exc=None argument
        close_db_session()

    @app.errorhandler(404)
    def not_found(error=None):
        return jsonify({'error' : 'Not Found'}), 404
    
    @app.errorhandler(500)
    def server_error(error=None):
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == "__main__":
    current_app = create_app()
    current_app.run(host="0.0.0.0", port=current_app.config.get('PORT', 5000), debug=True)
