// todo list js file

// this array holds all the tasks
// idk maybe i should use localstorage later
var tasks = [];
var currentFilter = 'all';


// getting all the elements from html
var taskInput  = document.getElementById('taskInput');
var addBtn     = document.getElementById('addBtn');
var taskList   = document.getElementById('taskList');
var emptyMsg   = document.getElementById('emptyMsg');
var notif      = document.getElementById('notification');
var notifText  = document.getElementById('notifText');
var statsText  = document.getElementById('statsText');
var clearBtn   = document.getElementById('clearBtn');
var filterBtns = document.querySelectorAll('.filter-btn');


// shows a small popup message then hides it after 2.5 sec
function showNotification(message) {
  notifText.textContent = message;
  notif.classList.remove('hidden');      // make it visible

  setTimeout(function() {
    notif.classList.add('hidden');       // hide it again
  }, 2500);
}


// this function redraws the whole list
// have to call it every time something changes
function renderTasks() {
  // filter based on what tab is selected
  var toShow = tasks.filter(function(task) {
    if (currentFilter === 'active')    return !task.completed;
    if (currentFilter === 'completed') return  task.completed;
    return true; // show everything
  });

  // clear whatever was there before
  taskList.innerHTML = '';

  // show empty message if nothing to display
  if (toShow.length === 0) {
    emptyMsg.classList.remove('hidden');
    if (tasks.length === 0) {
      emptyMsg.textContent = 'No tasks yet. Add one above.';
    } else {
      emptyMsg.textContent = 'No tasks match this filter.';
    }
  } else {
    emptyMsg.classList.add('hidden');

    // loop and create a list item for each task
    for (var i = 0; i < toShow.length; i++) {
      var task = toShow[i];

      var li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.setAttribute('data-id', task.id);

      // the little checkbox circle thing
      var cb = document.createElement('div');
      cb.className = 'checkbox';
      cb.setAttribute('data-id', task.id);
      if (task.completed) cb.textContent = '✓';

      // the actual task text
      var span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      // x button to delete
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

  // show the count at the bottom
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


// adds a new task to the list
function addTask() {
  var text = taskInput.value.trim();

  // dont add if input is empty
  if (text === '') {
    showNotification('Please enter a task before adding.');
    taskInput.focus();
    return;
  }

  var newTask = {
    id:        Date.now(),    // using timestamp as id, seems to work
    text:      text,
    completed: false
  };

  tasks.push(newTask);
  taskInput.value = '';
  taskInput.focus();

  renderTasks();
  showNotification('"' + text + '" has been added to your list.');
}


// toggle between done and not done
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


// removes a task
// does a small animation before actually deleting it
function deleteTask(id) {
  var taskText = '';
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { taskText = tasks[i].text; break; }
  }

  // find the element and animate it out
  var li = taskList.querySelector('[data-id="' + id + '"]');
  if (li) {
    li.classList.add('removing');
    setTimeout(function() {
      // now remove from the array after animation
      tasks = tasks.filter(function(t) { return t.id !== id; });
      showNotification('"' + taskText + '" has been removed.');
      renderTasks();
    }, 260);
  }
}


// removes all completed tasks at once
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


// all the event listeners below

// when add button is clicked
addBtn.addEventListener('click', function() {
  addTask();
});

// also add on enter key
taskInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

// one listener for the whole list, checks what was clicked
// learned this trick, its called event delegation
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

// filter buttons (all / active / completed)
filterBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    filterBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

// clear completed button
clearBtn.addEventListener('click', function() {
  clearCompleted();
});


// call once so the empty state shows on load
renderTasks();
