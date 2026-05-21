// ============================================================
//  app.js  — To-Do List Logic
// ============================================================


// ============================================================
//  1. STATE — one array holds all tasks
//  Each task: { id: number, text: string, completed: boolean }
// ============================================================
var tasks = [];
var currentFilter = 'all';


// ============================================================
//  2. GET DOM ELEMENTS
// ============================================================
var taskInput  = document.getElementById('taskInput');
var addBtn     = document.getElementById('addBtn');
var taskList   = document.getElementById('taskList');
var emptyMsg   = document.getElementById('emptyMsg');
var notif      = document.getElementById('notification');
var notifText  = document.getElementById('notifText');
var statsText  = document.getElementById('statsText');
var clearBtn   = document.getElementById('clearBtn');
var filterBtns = document.querySelectorAll('.filter-btn');


// ============================================================
//  3. SHOW NOTIFICATION
//  Shows a banner message, then hides it after 2.5 seconds.
//  CSS transition handles the smooth slide in/out.
// ============================================================
function showNotification(message) {
  notifText.textContent = message;
  notif.classList.remove('hidden');      // Show it (CSS transition plays)

  setTimeout(function() {
    notif.classList.add('hidden');       // Hide after 2.5 seconds
  }, 2500);
}


// ============================================================
//  4. RENDER TASKS
//  Clears the list and redraws based on current filter.
//  Called every time tasks change.
// ============================================================
function renderTasks() {
  // Filter which tasks to show
  var toShow = tasks.filter(function(task) {
    if (currentFilter === 'active')    return !task.completed;
    if (currentFilter === 'completed') return  task.completed;
    return true; // 'all'
  });

  // Clear existing task items
  taskList.innerHTML = '';

  // Show/hide the empty message
  if (toShow.length === 0) {
    emptyMsg.classList.remove('hidden');
    if (tasks.length === 0) {
      emptyMsg.textContent = 'No tasks yet. Add one above.';
    } else {
      emptyMsg.textContent = 'No tasks match this filter.';
    }
  } else {
    emptyMsg.classList.add('hidden');

    // Build one <li> for each task
    for (var i = 0; i < toShow.length; i++) {
      var task = toShow[i];

      var li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.setAttribute('data-id', task.id);

      // Checkbox
      var cb = document.createElement('div');
      cb.className = 'checkbox';
      cb.setAttribute('data-id', task.id);
      if (task.completed) cb.textContent = '✓';

      // Text
      var span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      // Delete button
      var del = document.createElement('button');
      del.className = 'del-btn';
      del.setAttribute('data-id', task.id);
      del.textContent = '✕';
      del.title = 'Remove task';

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(del);
      taskList.appendChild(li);
    }
  }

  // Update stats line
  var total     = tasks.length;
  var done      = tasks.filter(function(t) { return t.completed; }).length;
  var remaining = total - done;

  if (total === 0) {
    statsText.textContent = 'No tasks yet';
  } else {
    statsText.textContent = total + ' task' + (total !== 1 ? 's' : '') +
      ' — ' + remaining + ' remaining, ' + done + ' done';
  }
}


// ============================================================
//  5. ADD TASK
// ============================================================
function addTask() {
  var text = taskInput.value.trim();

  if (text === '') {
    showNotification('Please enter a task before adding.');
    taskInput.focus();
    return;
  }

  var newTask = {
    id:        Date.now(),    // unique number based on current time
    text:      text,
    completed: false
  };

  tasks.push(newTask);
  taskInput.value = '';
  taskInput.focus();

  renderTasks();
  showNotification('"' + text + '" has been added to your list.');
}


// ============================================================
//  6. TOGGLE COMPLETE
// ============================================================
function toggleTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      var status = tasks[i].completed ? 'marked as done.' : 'moved back to active.';
      showNotification('"' + tasks[i].text + '" ' + status);
      break;
    }
  }
  renderTasks();
}


// ============================================================
//  7. DELETE TASK
//  Adds .removing class first (triggers CSS slide-out animation),
//  then removes from array after animation ends (0.25s).
// ============================================================
function deleteTask(id) {
  var taskText = '';
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { taskText = tasks[i].text; break; }
  }

  // Find the <li> and animate it out
  var li = taskList.querySelector('[data-id="' + id + '"]');
  if (li) {
    li.classList.add('removing');
    setTimeout(function() {
      // Remove from array after animation
      tasks = tasks.filter(function(t) { return t.id !== id; });
      showNotification('"' + taskText + '" has been removed.');
      renderTasks();
    }, 260);
  }
}


// ============================================================
//  8. CLEAR ALL COMPLETED
// ============================================================
function clearCompleted() {
  var count = tasks.filter(function(t) { return t.completed; }).length;
  if (count === 0) {
    showNotification('There are no completed tasks to clear.');
    return;
  }
  tasks = tasks.filter(function(t) { return !t.completed; });
  showNotification(count + ' completed task' + (count !== 1 ? 's' : '') + ' cleared.');
  renderTasks();
}


// ============================================================
//  9. EVENT LISTENERS
// ============================================================

// Add button click
addBtn.addEventListener('click', function() {
  addTask();
});

// Enter key in input
taskInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Clicks inside the task list (checkbox OR delete button)
// This is called Event Delegation — one listener handles all tasks
taskList.addEventListener('click', function(e) {
  var target = e.target;
  var id = parseInt(target.getAttribute('data-id'));

  if (target.classList.contains('checkbox')) {
    toggleTask(id);
  }

  if (target.classList.contains('del-btn')) {
    deleteTask(id);
  }
});

// Filter buttons
filterBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    filterBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

// Clear completed
clearBtn.addEventListener('click', function() {
  clearCompleted();
});


// ============================================================
//  10. INITIAL RENDER — runs once when page loads
// ============================================================
renderTasks();
