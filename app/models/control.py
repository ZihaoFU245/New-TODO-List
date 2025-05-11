"""
Main Logic for TODO Lists
"""
from typing import List, Any, Optional
from sqlalchemy.exc import SQLAlchemyError
from flask import current_app # Changed from 'from app import app'
from .database import get_db_session, Tasks, Archived
from ..config import Config # Corrected relative import for config

class MainLogic:
    """
    Manager for Tasks.

    Methods:
        * Add new tasks to `Tasks`
        * Remove from `Tasks` then add to `Archived`
        * permenently delete from `Archived`
    """
    def __init__(self):
        self.db_session = get_db_session()

    def add_todo(self, detail: str) -> None:
        """Add a new task."""
        try:
            if len(detail) > 255:
                detail = detail[:255]   # truncate
            task = Tasks(
                TODO=detail
            )
            self.db_session.add(task)
            self.db_session.commit()
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.error(f"Failed to insert new task {e}") # Changed app.logger to current_app.logger

    def archive(self, target_id:int) -> Optional[Archived]:
        """Archive a task."""
        task = self.db_session.query(Tasks).filter_by(id=target_id).first()

        if not task:
            current_app.logger.warning(f"Task with id {target_id} not found for archiving.") # Changed app.logger to current_app.logger
            return None
        
        content = task.TODO
        
        try:
            self.db_session.delete(task)
            new_archive_entry = Archived(Finished=content)
            self.db_session.add(new_archive_entry)

            self.db_session.commit()
            current_app.logger.info(f"Task {target_id} archived successfully.") # Changed app.logger to current_app.logger
            return new_archive_entry
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.error(f"Failed to archive task {target_id}: {e}") # Changed app.logger to current_app.logger
            return None

    def perm_delete(self, target_id: int) -> bool:
        """Permanently remove a task. Returns True on success, False otherwise."""
        archive_entry = self.db_session.query(Archived).filter_by(id=target_id).first()
        if archive_entry:
            try:
                self.db_session.delete(archive_entry)
                self.db_session.commit()
                current_app.logger.info(f"Archived task {target_id} permanently deleted.") # Changed app.logger to current_app.logger
                return True
            except SQLAlchemyError as e:
                self.db_session.rollback()
                current_app.logger.error(f"Failed to permanently delete archived task {target_id}: {e}") # Changed app.logger to current_app.logger
                return False
        else:
            current_app.logger.warning(f"Archived task with id {target_id} not found for permanent deletion.") # Changed app.logger to current_app.logger
            return False
        
    def get_tasks(self, page: int = 1) -> List[Tasks]:
        """Get a paginated list of tasks."""
        per_page = current_app.config.get('TASKS_PER_PAGE', 10) # Use app config
        offset = (page - 1) * per_page
        try:
            tasks = (
                self.db_session.query(Tasks)
                .order_by(Tasks.id.desc())
                .offset(offset)
                .limit(per_page)
                .all()
            )
            return tasks
        except SQLAlchemyError as e:
            current_app.logger.error(f"Failed to fetch tasks: {e}") # Changed app.logger to current_app.logger
            return []
        
    def get_archives(self, page: int = 1) -> List[Archived]:
        """Get a paginated list of archived tasks."""
        per_page = current_app.config.get('TASKS_PER_PAGE', 10) # Use app config
        offset = (page - 1) * per_page
        try:
            archivs = (
                self.db_session.query(Archived)
                .order_by(Archived.id.desc())
                .offset(offset)
                .limit(per_page)
                .all()
            )
            return archivs
        except SQLAlchemyError as e:
            current_app.logger.error(f"Failed to fetch archived tasks: {e}") # Changed app.logger to current_app.logger
            return []

