// DOM Elements
const addTaskForm = document.getElementById('addTaskForm');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskListUl = document.getElementById('taskList');
const archivedTaskListUl = document.getElementById('archivedTaskList');

// Tasks Pagination
const tasksPrevPageBtn = document.getElementById('tasksPrevPage');
const tasksNextPageBtn = document.getElementById('tasksNextPage');
const tasksPageNumSpan = document.getElementById('tasksPageNum');
let currentTasksPage = 1;
const TASKS_PER_PAGE = 10; // Should match backend, or be dynamically set

// Archived Tasks Pagination
const archivedPrevPageBtn = document.getElementById('archivedPrevPage');
const archivedNextPageBtn = document.getElementById('archivedNextPage');
const archivedPageNumSpan = document.getElementById('archivedPageNum');
let currentArchivedPage = 1;
const ARCHIVES_PER_PAGE = 10; // Should match backend, or be dynamically set

// Personalized Greeting Element
const greetingTitle = document.getElementById('greetingTitle');

// State tracking
let tasksState = []; // Keep track of tasks in the current view
let archivesState = []; // Keep track of archives in the current view

// Initialize the transition container for animations
function initializeAnimationContainers() {
    // Create a container for transition animations
    const transitionContainer = document.createElement('div');
    transitionContainer.id = 'task-transition-container';
    transitionContainer.className = 'task-transition-container';
    document.body.appendChild(transitionContainer);
    
    // Create archive folder icon for animation
    const archiveFolder = document.createElement('div');
    archiveFolder.className = 'archive-folder';
    archiveFolder.id = 'archive-folder';
    archiveFolder.style.display = 'none';
    document.body.appendChild(archiveFolder);
}

function setGreeting() {
    let username = localStorage.getItem('todo_username');
    if (!username) {
        username = prompt("Welcome! Please enter your name for a personalized greeting:", "Guest");
        if (!username || username.trim() === "") { // Handle empty or cancelled prompt
            username = "Guest";
        }
        localStorage.setItem('todo_username', username);
    }
    if (greetingTitle) {
        greetingTitle.textContent = `Hello, ${username}! Here's your TODO List`;
    }
}

// --- Loaders and Renderers ---

async function loadInitial() {
    // Initial load of both lists with one API call
    const data = await syncData({
        fetch_tasks: true,
        fetch_archives: true,
        tasks_page: currentTasksPage,
        archives_page: currentArchivedPage
    });
    
    if (data.tasks) {
        tasksState = data.tasks;
        displayTasks(data.tasks, data.tasks.length, currentTasksPage, TASKS_PER_PAGE);
    }
    
    if (data.archives) {
        archivesState = data.archives;
        displayArchivedTasks(data.archives, data.archives.length, currentArchivedPage, ARCHIVES_PER_PAGE);
    }
}

async function loadTasksPage(page = 1) {
    // Only load tasks, don't touch archives
    const data = await syncData({
        fetch_tasks: true,
        tasks_page: page
    });
    
    if (data.tasks) {
        tasksState = data.tasks;
        displayTasks(data.tasks, data.tasks.length, page, TASKS_PER_PAGE);
    }
}

async function loadArchivesPage(page = 1) {
    // Only load archives, don't touch tasks
    const data = await syncData({
        fetch_archives: true,
        archives_page: page
    });
    
    if (data.archives) {
        archivesState = data.archives;
        displayArchivedTasks(data.archives, data.archives.length, page, ARCHIVES_PER_PAGE);
    }
}

function displayTasks(tasks, totalTasks, page, perPage) {
    taskListUl.innerHTML = ''; // Clear existing tasks
    if (tasks.length === 0) {
        taskListUl.innerHTML = '<li class="list-group-item">No tasks to display.</li>';
    }
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center new-item';
        li.textContent = `${task.TODO}`;
        li.setAttribute('data-task-id', task.id);

        const archiveButton = document.createElement('button');
        archiveButton.className = 'btn btn-sm btn-outline-warning ms-2';
        archiveButton.textContent = 'Archive';
        archiveButton.onclick = async () => {
            await animateTaskArchiving(li, task.id);
        };
        li.appendChild(archiveButton);
        taskListUl.appendChild(li);
    });
    tasksPageNumSpan.textContent = `Page ${page}`;
    tasksPrevPageBtn.disabled = page <= 1;
    tasksNextPageBtn.disabled = !(tasks && tasks.length === TASKS_PER_PAGE); 
}

function displayArchivedTasks(archives, totalArchives, page, perPage) {
    archivedTaskListUl.innerHTML = ''; // Clear existing archived tasks
    if (archives.length === 0) {
        archivedTaskListUl.innerHTML = '<li class="list-group-item">No archived tasks.</li>';
    }
    archives.forEach(archive => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center new-item';
        li.textContent = `${archive.Finished}`;
        li.setAttribute('data-archive-id', archive.id);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger ms-2';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            if (confirm('Are you sure you want to permanently delete this archived task?')) {
                await animateTaskDeletion(li, archive.id);
            }
        };
        li.appendChild(deleteButton);
        archivedTaskListUl.appendChild(li);
    });
    archivedPageNumSpan.textContent = `Page ${page}`;
    archivedPrevPageBtn.disabled = page <= 1;
    archivedNextPageBtn.disabled = !(archives && archives.length === ARCHIVES_PER_PAGE);
}

// --- Animation Functions ---

async function animateTaskArchiving(taskElement, taskId) {
    // Get positions for animation
    const taskRect = taskElement.getBoundingClientRect();
    const archiveContainerRect = document.querySelector('.col-md-6:nth-child(2)').getBoundingClientRect();
    
    // Create a clone of the task for animation
    const clone = taskElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.width = `${taskRect.width}px`;
    clone.style.top = `${taskRect.top}px`;
    clone.style.left = `${taskRect.left}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '1000';
    document.body.appendChild(clone);
    
    // Remove button from clone for cleaner animation
    const button = clone.querySelector('button');
    if (button) button.remove();

    // Prepare the archive folder icon
    const archiveFolder = document.getElementById('archive-folder');
    archiveFolder.style.display = 'flex';
    archiveFolder.style.top = `${archiveContainerRect.top + 20}px`;
    archiveFolder.style.left = `${archiveContainerRect.left + archiveContainerRect.width / 2 - 25}px`;
    
    // Animation timeline
    const timeline = anime.timeline({
        easing: 'easeOutExpo',
        complete: async () => {
            // Clean up
            document.body.removeChild(clone);
            archiveFolder.style.display = 'none';
            
            // Make the API call
            const result = await archiveTask(taskId);
            if (result && result.message) {
                const originalItem = taskListUl.querySelector(`li[data-task-id='${taskId}']`);
                
                if (originalItem) {
                    // Remove task from local state
                    tasksState = tasksState.filter(task => task.id !== taskId);
                    
                    // Animate removal
                    anime({
                        targets: originalItem,
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        complete: () => {
                            originalItem.remove();
                            
                            // If tasks list is empty, check if we need to refresh tasks
                            if (taskListUl.children.length === 0) {
                                if (tasksState.length === 0 && currentTasksPage > 1) {
                                    // Move to previous page if current page is now empty
                                    currentTasksPage--;
                                    loadTasksPage(currentTasksPage);
                                } else {
                                    displayTasks(tasksState, tasksState.length, currentTasksPage, TASKS_PER_PAGE);
                                }
                            }
                            
                            // Get the new archived item without refreshing entire archived list
                            fetchNewArchivedItem(result.archived_task_id);
                        }
                    });
                }
            } else {
                alert('Failed to archive task.');
            }
        }
    });
    
    // First step: move toward archive folder
    timeline.add({
        targets: clone,
        top: archiveContainerRect.top + 'px',
        left: archiveContainerRect.left + archiveContainerRect.width / 2 - taskRect.width / 2 + 'px',
        scale: 0.8,
        duration: 600
    })
    // Second step: fade the task and scale down as it "enters" the archive folder
    .add({
        targets: clone,
        scale: 0.1,
        opacity: 0,
        duration: 400
    })
    // Pulse animation for the archive folder
    .add({
        targets: archiveFolder,
        scale: [1, 1.2, 1],
        duration: 300
    }, '-=200');  // Start 200ms before the previous animation ends
    
    return timeline;
}

async function animateTaskDeletion(taskElement, archiveId) {
    // Add the crossed-out class
    taskElement.classList.add('crossed-out');
    
    // First animate the red line crossing out the text
    await new Promise(resolve => {
        setTimeout(() => {
            taskElement.classList.add('active');
            setTimeout(resolve, 1000); // Wait for line animation
        }, 100);
    });
    
    // Then fade out the task
    anime({
        targets: taskElement,
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        easing: 'easeOutExpo',
        duration: 500,
        complete: async () => {
            // Remove from local state
            archivesState = archivesState.filter(archive => archive.id !== archiveId);
            
            // Remove from DOM
            taskElement.remove();
            
            // Make the API call
            const result = await permanentlyDeleteTask(archiveId);
            if (result && result.message) {
                // If the archived list is now empty, check if we need to refresh archives
                if (archivedTaskListUl.children.length === 0) {
                    if (archivesState.length === 0 && currentArchivedPage > 1) {
                        // Move to previous page if current page is now empty
                        currentArchivedPage--;
                        loadArchivesPage(currentArchivedPage);
                    } else {
                        displayArchivedTasks(archivesState, archivesState.length, currentArchivedPage, ARCHIVES_PER_PAGE);
                    }
                }
            } else {
                alert('Failed to delete task.');
                // If deletion failed, refresh the archives list
                loadArchivesPage(currentArchivedPage);
            }
        }
    });
}

// --- Helper Functions ---

async function fetchNewArchivedItem(archivedTaskId) {
    if (!archivedTaskId) return;
    
    // Fetch only the specific archived item
    const data = await syncData({
        fetch_archive_id: archivedTaskId
    });
    
    if (data.archive) {
        // Add the new archive item to the state
        if (currentArchivedPage === 1) {
            // Only add to DOM if we're on the first page
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center new-item';
            li.textContent = data.archive.Finished;
            li.setAttribute('data-archive-id', data.archive.id);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-outline-danger ms-2';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = async () => {
                if (confirm('Are you sure you want to permanently delete this archived task?')) {
                    await animateTaskDeletion(li, data.archive.id);
                }
            };
            
            li.appendChild(deleteButton);
            
            // Check if "No archived tasks" message is showing
            if (archivedTaskListUl.children.length === 1 && 
                archivedTaskListUl.firstChild.textContent === 'No archived tasks.') {
                archivedTaskListUl.innerHTML = '';
            }
            
            // Add to beginning of list since it's the newest
            if (archivedTaskListUl.firstChild) {
                archivedTaskListUl.insertBefore(li, archivedTaskListUl.firstChild);
            } else {
                archivedTaskListUl.appendChild(li);
            }
            
            // Add to state
            archivesState.unshift(data.archive);
            
            // If we have more items than per page limit, remove the last one
            if (archivedTaskListUl.children.length > ARCHIVES_PER_PAGE) {
                archivedTaskListUl.lastChild.remove();
            }
        }
    }
}

// --- Event Listeners ---

addTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const description = taskDescriptionInput.value.trim();
    if (description) {
        const result = await addTask(description);
        if (result && result.message) {
            taskDescriptionInput.value = ''; 
            
            // Always add new tasks to the first page
            if (currentTasksPage === 1) {
                // Fetch just the latest task without a full refresh
                loadTasksPage(1);
            } else {
                // If not on first page, switch to first page to see new task
                currentTasksPage = 1;
                loadTasksPage(1);
            }
        } else {
            alert('Failed to add task. Check console for details.');
        }
    }
});

// Tasks Pagination Listeners
tasksPrevPageBtn.addEventListener('click', () => {
    if (currentTasksPage > 1) {
        currentTasksPage--;
        loadTasksPage(currentTasksPage);
    }
});

tasksNextPageBtn.addEventListener('click', () => {
    currentTasksPage++;
    loadTasksPage(currentTasksPage);
});

// Archived Tasks Pagination Listeners
archivedPrevPageBtn.addEventListener('click', () => {
    if (currentArchivedPage > 1) {
        currentArchivedPage--;
        loadArchivesPage(currentArchivedPage);
    }
});

archivedNextPageBtn.addEventListener('click', () => {
    currentArchivedPage++;
    loadArchivesPage(currentArchivedPage);
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimationContainers(); // Initialize containers needed for animations
    setGreeting(); // Set greeting
    loadInitial(); // Load both lists initially
});
