"""
API endpoints.
"""
from flask import Blueprint, request, jsonify
from .models import MainLogic

api = Blueprint("controls", __name__)
controller = MainLogic()

@api.route('/add', methods=['POST'])
def add_task():
    """Add a new task to TODO List."""
    data = request.json
    if not data or 'task_description' not in data:
        return jsonify({'error' : 'task description is required'}), 400
    
    task = data['task_description']
    controller.add_todo(task)
    return jsonify({'message': 'Task added successfully'}), 201

@api.route('/archive', methods=['POST'])
def archive():
    """Archive a task."""
    data = request.json
    if not data or 'task_id' not in data:
        return jsonify({'error' : 'task_id is required'}), 400
    
    target_id = data['task_id']
    archived_task = controller.archive(target_id)
    if archived_task:
        return jsonify({'message': 'Task archived successfully', 'archived_task_id': archived_task.id}), 200
    else:
        return jsonify({'error': 'Failed to archive task or task not found'}), 404

@api.route('/perm_delete', methods=['POST'])
def delete_from_archive():
    """Permenanatly delete a task from archive."""
    data = request.json
    if not data or 'archive_id' not in data:
        return jsonify({'error' : 'archive_id is required'}), 400

    target_id = data['archive_id']
    if controller.perm_delete(target_id):
        return jsonify({'message': 'Archive permanently deleted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to delete archive or archive not found'}), 404

@api.route('/tasks', methods=['GET'])
def get_tasks():
    """Get tasks."""
    page = request.args.get('page', default=1, type=int)
    tasks = controller.get_tasks(page=page)
    # Serialize tasks for JSON response
    result = [
        {'id': t.id, 'TODO': t.TODO}
        for t in tasks
    ]
    return jsonify(result)

@api.route('/archives', methods=['GET']) 
def get_archives():
    """Get Archives."""
    page = request.args.get('page', default=1, type=int)
    archives = controller.get_archives(page=page)
    # Serialize archives for JSON response
    result = [
        {'id': a.id, 'Finished': a.Finished}
        for a in archives
    ]
    return jsonify(result)


