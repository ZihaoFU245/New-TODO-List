"""
Main Logic for TODO Lists
"""
from typing import List, Any, Optional
from sqlalchemy.exc import SQLAlchemyError
from flask import current_app
from .database import get_db_session, Tasks, Archived
from ..config import Config 

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
        
    def add_todo(self, detail: str) -> Optional[Tasks]:
        """Add a new task."""
        try:
            if len(detail) > 255:
                detail = detail[:255]   # truncate
            task = Tasks(
                TODO=detail
            )
            self.db_session.add(task)
            self.db_session.commit()
            # Refresh the task to get the assigned ID
            self.db_session.refresh(task)
            return task
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.error(f"Failed to insert new task {e}") # Changed app.logger to current_app.logger
            return None

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
        
    def unArchive(self, target_id: int) ->Optional[Tasks]:
        """UnArchive from the Archived Table"""
        task = self.db_session.query(Archived).filter_by(id=target_id).first()

        if not task:
            current_app.logger.warning(f"Archived Task with id {target_id} not found for unArchiving.")
            return None
        
        content = task.Finished

        try:
            self.db_session.delete(task)
            restore_entry = Tasks(TODO=content)
            self.db_session.add(restore_entry)

            self.db_session.commit()
            current_app.logger.info(f"Task {target_id} unArchived succesfully.")
            return restore_entry
        
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.error(f"Failed to unArchived task with id {target_id}: {e}")
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

    def get_task_by_id(self, task_id: int) -> Optional[Tasks]:
        """Get a specific task by ID."""
        try:
            task = self.db_session.query(Tasks).filter_by(id=task_id).first()
            return task
        except SQLAlchemyError as e:
            current_app.logger.error(f"Failed to fetch task {task_id}: {e}")
            return None

    def get_archive_by_id(self, archive_id: int) -> Optional[Archived]:
        """Get a specific archived task by ID."""
        try:
            archive = self.db_session.query(Archived).filter_by(id=archive_id).first()
            return archive
        except SQLAlchemyError as e:
            current_app.logger.error(f"Failed to fetch archive {archive_id}: {e}")
            return None

