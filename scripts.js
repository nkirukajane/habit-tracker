const STORAGE_KEY = "habit-tracker-data";
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
function loadHabits() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === null) {
    return [];
  }

  return JSON.parse(saved);
}

let habits = loadHabits();
let editingId = null;

const habitInput = document.querySelector("#habit-input");
const addBtn = document.querySelector("#add-btn");
const habitList = document.querySelector("#habit-list");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getToday() {
  return formatDate(new Date());
}

function parseDate(dateString) {
  const parts = dateString.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function getLastDays(count) {
  const days = [];

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

function getStreak(habit) {
  let streak = 0;
  const date = new Date();

  if (!habit.completedDates.includes(formatDate(date))) {
    date.setDate(date.getDate() - 1);
  }

  while (habit.completedDates.includes(formatDate(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function getBestStreak(habit) {
  if (habit.completedDates.length === 0) {
    return 0;
  }

  const sorted = habit.completedDates.slice().sort();
  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const expected = parseDate(sorted[i - 1]);
    expected.setDate(expected.getDate() + 1);

    if (formatDate(expected) === sorted[i]) {
      current++;
    } else {
      current = 1;
    }

    if (current > best) {
      best = current;
    }
  }

  return best;
}

//add another button(to mark if a habit is done today) to the project through js
function markDone(id) {
  const habit = habits.find(function (h) {
    return h.id === id;
  });
  const today = getToday();

  if (!habit.completedDates.includes(today)) {
    habit.completedDates.push(today);
  }

  saveHabits();
  renderHabits();
}

// for the delete button
function deleteHabit(id) {
  habits = habits.filter(function (h) {
    return h.id !== id;
  });

  saveHabits();
  renderHabits();
}

function startEditing(id) {
  editingId = id;
  renderHabits();
}

function cancleEditing() {
  editingId = null;
  renderHabits();
}

function saveName(id, newName) {
  const name = newName.trim();

  if (name !== "") {
    const habit = habits.find(function (h) {
      return h.id === id;
    });
    habit.name = name;
    saveHabits();
  }
  editingId = null;
  renderHabits();
}

// to display habit list
function renderHabits() {
  habitList.innerHTML = "";

  if (habits.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-message");
    emptyItem.textContent = "No habits yet. Add your first one above!";
    habitList.appendChild(emptyItem);
    return;
  }

  const today = getToday();

  habits.forEach(function (habit) {
    const li = document.createElement("li");
    const isEditing = habit.id === editingId; //why not isEditing = editingId...this is boolean

    const info = document.createElement("div");
    info.classList.add("habit-info");

    let nameElement;

    if (isEditing) {
      nameElement = document.createElement("Input");
      nameElement.type = "text";
      nameElement.value = habit.name;
      nameElement.classList.add("edit-input");

      nameElement.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          saveName(habit.id, nameElement.value);
        } else if (event.key === "Escape") {
          cancleEditing();
        }
      });
    } else {
      nameElement = document.createElement("span");
      nameElement.textContent = habit.name;
    }

    const streak = getStreak(habit);
    const streakSpan = document.createElement("span");
    streakSpan.classList.add("streak");
    streakSpan.textContent = "🔥 " + streak + (streak === 1 ? " day" : " days");

    if (streak >= 7) {
      streakSpan.classList.add("hot");
    }

    const best = getBestStreak(habit);
    const bestSpan = document.createElement("span");
    bestSpan.classList.add("best");
    bestSpan.textContent = "🏆 Best: " + best + (best === 1 ? "day" : " days");

    const calendar = document.createElement("div");
    calendar.classList.add("calendar");

    getLastDays(7).forEach(function (date) {
      const dateString = formatDate(date);
      const dayBox = document.createElement("div");
      dayBox.classList.add("day");
      dayBox.textContent = WEEKDAY_LETTERS[date.getDay()];
      dayBox.title = dateString;

      if (habit.completedDates.includes(dateString)) {
        dayBox.classList.add("filled");
      }
      if (dateString === today) {
        dayBox.classList.add("today");
      }
      calendar.appendChild(dayBox);
    });

    info.appendChild(nameElement);
    info.appendChild(streakSpan);
    info.appendChild(bestSpan);
    info.appendChild(calendar);

    // creats box to hold both buttons side by side
    const actions = document.createElement("div");
    actions.classList.add("actions");

    // creatts done button
    const doneBtn = document.createElement("button");
    const isDone = habit.completedDates.includes(today);

    if (isDone) {
      doneBtn.textContent = "Done ✓";
      doneBtn.disabled = true;
      li.classList.add("done");
    } else {
      doneBtn.textContent = "Mark done";
    }

    doneBtn.addEventListener("click", function () {
      markDone(habit.id);
    });

    const editBtn = document.createElement("button");

    if (isEditing) {
      editBtn.textContent = "Save";
      editBtn.title = "Save name";
      editBtn.addEventListener("click", function () {
        saveName(habit.id, nameElement.value);
      });
    } else {
      editBtn.textContent = "✎";
      editBtn.title = "Edit name";
      editBtn.addEventListener("click", function () {
        startEditing(habit.id);
      });
    }

    // creats delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete habit"; //responsible for the tooltip on hover
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {
      if (confirm("Delete " + habit.name + "?")) deleteHabit(habit.id);
    });

    actions.appendChild(doneBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    habitList.appendChild(li);

    if (isEditing) {
      nameElement.focus();
      nameElement.select();
    }
  });
}

function addHabit() {
  const name = habitInput.value.trim();

  if (name === "") {
    return;
  }

  const newHabit = {
    id: Date.now(),
    name: name,
    completedDates: [],
  };

  habits.push(newHabit);
  saveHabits();
  habitInput.value = "";
  habitInput.focus();
  renderHabits();
}

addBtn.addEventListener("click", addHabit);

habitInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addHabit();
  }
});

renderHabits();

const THEME_KEY = "habit-tracker-theme";
const themeToggle = document.querySelector("#theme-toggle");

function appplyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved !== null) {
    return saved;
  }

  if (window.matchMedia("(prefers-color-scheme: dark").matches) {
    return "dark";
  }
  return "light";
}
themeToggle.addEventListener("click", function () {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  appplyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});
appplyTheme(loadTheme());
