// script.js

document.addEventListener("DOMContentLoaded", () => {
    const taskNameInput = document.getElementById("taskNameInput");
    const taskDescriptionInput = document.getElementById("taskDescriptionInput");
    const taskDateInput = document.getElementById("taskDateInput");
    const priorityInput = document.getElementById("priorityInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const undoButton = document.getElementById("undoButton");
    const viewTasksButton = document.getElementById("viewTasksButton");
    const getTopPriorityTaskButton = document.getElementById("getTopPriorityTaskButton");
    const taskList = document.getElementById("taskList");
  
    const tasks = [];
    const undoStack = [];
    const taskHashTable = {};
    const priorityQueue = [];
  
    addTaskButton.addEventListener("click", () => {
      const taskName = taskNameInput.value.trim();
      const taskDescription = taskDescriptionInput.value.trim();
      const taskDate = taskDateInput.value.trim();
      const priority = parseInt(priorityInput.value.trim());
      if (taskName !== "" && taskDescription !== "" && taskDate !== "" && !isNaN(priority)) {
        addTask(taskName, taskDescription, taskDate, priority);
        taskNameInput.value = "";
        taskDescriptionInput.value = "";
        taskDateInput.value = "";
        priorityInput.value = "";
      }
    });
  
    undoButton.addEventListener("click", () => {
      undo();
    });
  
    viewTasksButton.addEventListener("click", () => {
      viewTasks();
    });
  
    getTopPriorityTaskButton.addEventListener("click", () => {
      const topTask = getTopPriorityTask();
      alert(`Top Priority Task: \n ${topTask ? `${topTask.name}  - ${topTask.date}` : 'No tasks'}`);
    });
  
    taskList.addEventListener("click", (e) => {
      const taskId = e.target.parentElement.getAttribute("data-id");
      if (e.target.classList.contains("delete")) {
        deleteTask(taskId);
      } else if (e.target.classList.contains("complete")) {
        completeTask(taskId);
      } else if (e.target.classList.contains("incomplete")) {
        incompleteTask(taskId);
      }
    });
  
    function addTask(name, description, date, priority) {
      const id = new Date().getTime().toString();
      const task = { id, name, description, date, priority, completed: false };
  
      tasks.push(task);
      undoStack.push({ action: 'add', task });
      taskHashTable[id] = task;
      priorityQueue.push(task);
      priorityQueue.sort((a, b) => b.priority - a.priority);
  
      displayTask(task);
    }
  
    function viewTasks() {
      taskList.innerHTML = '';
      tasks.forEach(task => displayTask(task));
    }
  
    function completeTask(id) {
      const task = taskHashTable[id];
      if (task) {
        task.completed = true;
        updateTaskElement(task);
        undoStack.push({ action: 'complete', task });
      }
    }
  
    function incompleteTask(id) {
      const task = taskHashTable[id];
      if (task) {
        task.completed = false;
        updateTaskElement(task);
        undoStack.push({ action: 'incomplete', task });
      }
    }
  
    function deleteTask(id) {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        priorityQueue.splice(priorityQueue.findIndex(t => t.id === id), 1);
        delete taskHashTable[id];
        taskList.querySelector(`li[data-id="${id}"]`).remove();
        undoStack.push({ action: 'delete', task });
      }
    }
  
    function undo() {
      const lastAction = undoStack.pop();
      if (lastAction) {
        switch (lastAction.action) {
          case 'add':
            deleteTask(lastAction.task.id);
            undoStack.pop();
            break;
          case 'complete':
            incompleteTask(lastAction.task.id);
            undoStack.pop();
            break;
          case 'incomplete':
            completeTask(lastAction.task.id);
            undoStack.pop();
            break;
          case 'delete':
            const task = lastAction.task;
            tasks.push(task);
            taskHashTable[task.id] = task;
            priorityQueue.push(task);
            priorityQueue.sort((a, b) => b.priority - a.priority);
            displayTask(task);
            undoStack.pop();
            break;
        }
      }
    }
  
    function getTopPriorityTask() {
      return priorityQueue.length ? priorityQueue[0] : null;
    }
  
    function displayTask(task) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${task.name}</strong>
        <p>${task.description}</p>
        <small>${task.date}</small>
        <p>Priority: ${task.priority}</p>
      `;
      li.setAttribute("data-id", task.id);
      if (task.completed) {
        li.classList.add("completed");
      }
  
      const completeButton = document.createElement("button");
      completeButton.textContent = task.completed ? "Incomplete" : "Complete";
      completeButton.classList.add(task.completed ? "incomplete" : "complete");
      li.appendChild(completeButton);
  
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete");
      li.appendChild(deleteButton);
  
      taskList.appendChild(li);
    }
  
    function updateTaskElement(task) {
      const taskElement = taskList.querySelector(`li[data-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.toggle("completed", task.completed);
        taskElement.querySelector("button.complete, button.incomplete").textContent = task.completed ? "Incomplete" : "Complete";
        taskElement.querySelector("button.complete, button.incomplete").classList.toggle("complete", !task.completed);
        taskElement.querySelector("button.complete, button.incomplete").classList.toggle("incomplete", task.completed);
      }
    }
  });
  