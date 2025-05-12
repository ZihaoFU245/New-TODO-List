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
    new_task = controller.add_todo(task)
    return jsonify({
        'message': 'Task added successfully', 
        'id': new_task.id,
        'task': task
    }), 201

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
    
@api.route('/unArchive', methods=['POST'])
def unArchive():
    """UnArchive a task"""
    data = request.json
    if not data or 'archive_id' not in data:
        return jsonify({'error' : 'archive_id is required'}), 400
    
    target_id = data['archive_id']
    unArchived_task = controller.unArchive(target_id)
    if unArchived_task:
        return jsonify({'message': 'Task unArchived succesfully', 'task_id': unArchived_task.id}), 200
    else:
        return jsonify({'error': 'Failed to unArchived task or task not found'}), 404

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

@api.route('/sync', methods=['POST'])
def sync_data():
    """Sync data from the server based on request params.
    
    This endpoint allows for flexible syncing of specific items or lists
    to reduce unnecessary data transfer.
    """
    data = request.json
    response = {}
    
    # Check if specific task requested
    if data.get('fetch_task_id'):
        task_id = data.get('fetch_task_id')
        task = controller.get_task_by_id(task_id)
        if task:
            response['task'] = {'id': task.id, 'TODO': task.TODO}
    
    # Check if specific archive requested
    if data.get('fetch_archive_id'):
        archive_id = data.get('fetch_archive_id')
        archive = controller.get_archive_by_id(archive_id)
        if archive:
            response['archive'] = {'id': archive.id, 'Finished': archive.Finished}
    
    # Check if tasks list requested
    if data.get('fetch_tasks'):
        page = data.get('tasks_page', 1)
        tasks = controller.get_tasks(page=page)
        response['tasks'] = [
            {'id': t.id, 'TODO': t.TODO}
            for t in tasks
        ]
        
    # Check if archives list requested
    if data.get('fetch_archives'):
        page = data.get('archives_page', 1)
        archives = controller.get_archives(page=page)
        response['archives'] = [
            {'id': a.id, 'Finished': a.Finished}
            for a in archives
        ]
        
    return jsonify(response)


