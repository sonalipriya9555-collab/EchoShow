// =====================================================
// EchoShow – script.js
// Each section below does one job. Read from top to bottom.
// =====================================================

// ---------- Helpers ----------

// Short way to find one element by its id
function byId(id) {
  return document.getElementById(id);
}

// Does the visitor prefer less motion? (accessibility setting)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Save and load small bits of data in the browser.
// try/catch keeps the page working even if storage is blocked.
function saveData(key, value) {
  try {
    localStorage.setItem("echoshow-" + key, JSON.stringify(value));
  } catch (error) {
    // Storage not available: ignore
  }
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem("echoshow-" + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

// Show a small message at the bottom of the screen
let toastTimer = null;
function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}


// ---------- 1. Live clock and date ----------

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function updateClock() {
  const now = new Date();

  // padStart adds a leading zero: 7 becomes "07"
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const dayName = dayNames[now.getDay()];
  const fullDate = now.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  byId("clock-time").textContent = hours + ":" + minutes;
  byId("clock-seconds").textContent = seconds;
  byId("clock-day").textContent = dayName;
  byId("clock-date").textContent = fullDate;

  // The same time is shown in the hero device and the preview device
  byId("hero-time").textContent = hours + ":" + minutes;
  byId("hero-date").textContent = dayName;
  byId("preview-time").textContent = hours + ":" + minutes;
  byId("preview-date").textContent = dayName + ", " + fullDate;
}

updateClock();
setInterval(updateClock, 1000); // run again every 1000 ms (1 second)


// ---------- 2. Weather (demo data, ready for a real API) ----------

// Demo data. Temperatures are stored in Celsius.
const demoWeather = {
  city: "San Francisco, CA",
  icon: "⛅",
  condition: "Partly cloudy",
  tempC: 21,
  feelsC: 20,
  humidity: 62,
  windKmh: 14,
  forecast: [
    { day: "Tue", icon: "☀️", tempC: 23 },
    { day: "Wed", icon: "🌤️", tempC: 22 },
    { day: "Thu", icon: "🌧️", tempC: 17 },
    { day: "Fri", icon: "⛅", tempC: 19 }
  ]
};

let weatherData = demoWeather;
let useCelsius = true;

// To use a real weather API later, change this function.
// Example (needs your own API key):
//   const response = await fetch("https://api.example.com/weather?city=Paris&key=YOUR_KEY");
//   const data = await response.json();
//   return { city: data.name, tempC: data.temp, ... };  // match the shape of demoWeather
async function getWeatherData() {
  return demoWeather;
}

// Convert and format a temperature for the chosen unit
function formatTemp(celsius) {
  if (useCelsius) {
    return Math.round(celsius) + "°";
  }
  return Math.round(celsius * 9 / 5 + 32) + "°";
}

function renderWeather() {
  const unitLabel = useCelsius ? "C" : "F";

  byId("weather-icon").textContent = weatherData.icon;
  byId("weather-temp").textContent = formatTemp(weatherData.tempC) + unitLabel;
  byId("weather-condition").textContent = weatherData.condition;
  byId("weather-location").textContent = weatherData.city;
  byId("weather-feels").textContent = formatTemp(weatherData.feelsC) + unitLabel;
  byId("weather-humidity").textContent = weatherData.humidity + "%";
  byId("weather-wind").textContent = weatherData.windKmh + " km/h";
  byId("unit-toggle").textContent = "°" + unitLabel;

  // Forecast row
  let forecastHtml = "";
  weatherData.forecast.forEach(function (item) {
    forecastHtml +=
      '<div class="forecast-day"><div class="text-muted">' + item.day + "</div>" +
      '<div class="text-xl">' + item.icon + "</div>" +
      "<strong>" + formatTemp(item.tempC) + "</strong></div>";
  });
  byId("forecast").innerHTML = forecastHtml;

  // Hero device + preview device
  byId("hero-temp").textContent = formatTemp(weatherData.tempC);
  byId("preview-weather-icon").textContent = weatherData.icon;
  byId("preview-weather-temp").textContent = formatTemp(weatherData.tempC) + unitLabel;
  byId("preview-weather-city").textContent = weatherData.city;
}

byId("unit-toggle").addEventListener("click", function () {
  useCelsius = !useCelsius;
  renderWeather();
});

getWeatherData().then(function (data) {
  weatherData = data;
  renderWeather();
});


// ---------- 3. Mobile menu ----------

const menuButton = byId("menu-btn");
const mobileMenu = byId("mobile-menu");

function setMenuOpen(isOpen) {
  mobileMenu.classList.toggle("open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

menuButton.addEventListener("click", function () {
  setMenuOpen(!mobileMenu.classList.contains("open"));
});

// Close the menu after tapping a link
mobileMenu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    setMenuOpen(false);
  });
});

// Profile button
byId("profile-btn").addEventListener("click", function () {
  showToast("Signed in as Demo User");
});


// ---------- 4. Theme switcher (dark / light) ----------

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  byId("theme-icon").textContent = theme === "dark" ? "☾" : "☀";
  saveData("theme", theme);
}

byId("theme-toggle").addEventListener("click", function () {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

applyTheme(loadData("theme", "dark"));


// ---------- 5. Calendar ----------

function buildCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  byId("calendar-month").textContent = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const firstWeekday = new Date(year, month, 1).getDay();      // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();  // day 0 of next month = last day of this month

  // Demo: days that have events (today and two other days)
  const eventDays = [today.getDate(), Math.min(today.getDate() + 3, daysInMonth), Math.min(today.getDate() + 7, daysInMonth)];

  let html = "";
  for (let i = 0; i < firstWeekday; i++) {
    html += "<span></span>"; // empty cells before day 1
  }
  for (let day = 1; day <= daysInMonth; day++) {
    let classes = "";
    if (day === today.getDate()) classes = "today";
    else if (eventDays.includes(day)) classes = "has-event";
    html += '<span class="' + classes + '">' + day + "</span>";
  }
  byId("calendar-grid").innerHTML = html;
}

buildCalendar();


// ---------- 6. To-do list ----------

const defaultTasks = [
  { id: 1, text: "Review dashboard design", done: true },
  { id: 2, text: "Reply to hackathon team", done: false },
  { id: 3, text: "Prepare demo for Friday", done: false }
];

let tasks = loadData("tasks", defaultTasks);

// Escape text so users can't inject HTML into the page
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderTasks() {
  const list = byId("todo-list");
  list.innerHTML = "";

  tasks.forEach(function (task) {
    const item = document.createElement("li");
    item.className = "todo-item" + (task.done ? " done" : "");
    item.innerHTML =
      "<label>" +
      '<input type="checkbox" ' + (task.done ? "checked" : "") + ' data-id="' + task.id + '" />' +
      "<span>" + escapeHtml(task.text) + "</span>" +
      "</label>" +
      '<button class="delete-btn" type="button" data-delete="' + task.id + '" aria-label="Delete task">✕</button>';
    list.appendChild(item);
  });

  const remaining = tasks.filter(function (task) { return !task.done; }).length;
  byId("todo-count").textContent = remaining + " left";

  updateStats();
  saveData("tasks", tasks);
}

byId("todo-form").addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  const input = byId("todo-input");
  const text = input.value.trim();
  if (text === "") {
    showToast("Type a task first");
    return;
  }
  tasks.push({ id: Date.now(), text: text, done: false });
  input.value = "";
  renderTasks();
});

// One listener for the whole list (works for tasks added later too)
byId("todo-list").addEventListener("click", function (event) {
  const deleteId = event.target.getAttribute("data-delete");
  if (deleteId) {
    tasks = tasks.filter(function (task) { return String(task.id) !== deleteId; });
    renderTasks();
  }
});

byId("todo-list").addEventListener("change", function (event) {
  const checkId = event.target.getAttribute("data-id");
  if (checkId) {
    tasks.forEach(function (task) {
      if (String(task.id) === checkId) task.done = event.target.checked;
    });
    renderTasks();
  }
});


// ---------- 7. Productivity stats (ring follows the to-do list) ----------

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(function (task) { return task.done; }).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  byId("ring").style.setProperty("--percent", percent);
  byId("ring-text").textContent = percent + "%";
  byId("ring").setAttribute("aria-label", percent + " percent of tasks completed");
}


// ---------- 8. Music player (demo, no real audio) ----------

const playlist = [
  { title: "Violet Skyline", artist: "Neon Harbor", seconds: 214 },
  { title: "Glitter Static", artist: "Lavender Ghost", seconds: 187 },
  { title: "Midnight Dashboard", artist: "Echo Circuit", seconds: 242 }
];

let trackIndex = 0;
let isPlaying = false;
let secondsPlayed = 0;
let musicTimer = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function renderTrack() {
  const track = playlist[trackIndex];
  byId("track-title").textContent = track.title;
  byId("track-artist").textContent = track.artist;
  byId("time-total").textContent = formatTime(track.seconds);
  byId("preview-track").textContent = isPlaying ? track.title : track.title + " (paused)";
  renderProgress();
}

function renderProgress() {
  const track = playlist[trackIndex];
  byId("time-current").textContent = formatTime(secondsPlayed);
  byId("progress-bar").style.width = (secondsPlayed / track.seconds) * 100 + "%";
}

function goToTrack(newIndex) {
  trackIndex = (newIndex + playlist.length) % playlist.length; // wraps around the list
  secondsPlayed = 0;
  renderTrack();
}

function setPlaying(playing) {
  isPlaying = playing;
  const playButton = byId("play-btn");
  playButton.textContent = playing ? "⏸" : "▶";
  playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
  byId("equalizer").classList.toggle("playing", playing);

  clearInterval(musicTimer);
  if (playing) {
    musicTimer = setInterval(function () {
      secondsPlayed++;
      if (secondsPlayed >= playlist[trackIndex].seconds) {
        goToTrack(trackIndex + 1); // next song automatically
      }
      renderProgress();
    }, 1000);
  }
  renderTrack();
}

byId("play-btn").addEventListener("click", function () { setPlaying(!isPlaying); });
byId("next-btn").addEventListener("click", function () { goToTrack(trackIndex + 1); });
byId("prev-btn").addEventListener("click", function () { goToTrack(trackIndex - 1); });

renderTrack();


// ---------- 9. Smart home controls ----------

let lightOn = false;
let fanOn = false;
let fanSpeed = 2;

function renderSmartHome() {
  const brightness = byId("brightness").value;

  // Light
  byId("light-toggle").classList.toggle("on", lightOn);
  byId("light-toggle").setAttribute("aria-checked", String(lightOn));
  byId("light-icon").classList.toggle("on", lightOn);
  byId("light-icon").style.opacity = lightOn ? 0.4 + brightness / 100 * 0.6 : 1;
  byId("light-status").textContent = lightOn ? "On · " + brightness + "%" : "Off";
  byId("brightness-value").textContent = brightness + "%";
  byId("preview-light").textContent = lightOn ? "On · " + brightness + "%" : "Off";

  // Fan
  const speedNames = { 1: "Low", 2: "Medium", 3: "High" };
  const fanIcon = byId("fan-icon");
  byId("fan-toggle").classList.toggle("on", fanOn);
  byId("fan-toggle").setAttribute("aria-checked", String(fanOn));
  fanIcon.classList.toggle("on", fanOn);
  fanIcon.classList.remove("speed-1", "speed-2", "speed-3");
  if (fanOn) fanIcon.classList.add("speed-" + fanSpeed);
  byId("fan-status").textContent = fanOn ? "On · " + speedNames[fanSpeed] : "Off";

  document.querySelectorAll(".fan-speed").forEach(function (button) {
    button.classList.toggle("active", Number(button.dataset.speed) === fanSpeed);
  });
}

byId("light-toggle").addEventListener("click", function () {
  lightOn = !lightOn;
  renderSmartHome();
});

byId("brightness").addEventListener("input", function () {
  if (!lightOn) lightOn = true; // moving the slider turns the light on
  renderSmartHome();
});

byId("fan-toggle").addEventListener("click", function () {
  fanOn = !fanOn;
  renderSmartHome();
});

document.querySelectorAll(".fan-speed").forEach(function (button) {
  button.addEventListener("click", function () {
    fanSpeed = Number(button.dataset.speed);
    fanOn = true; // choosing a speed turns the fan on
    renderSmartHome();
  });
});

renderSmartHome();


// ---------- 10. Notifications ----------

const defaultNotifications = [
  { id: 1, text: "Design review moved to 13:00", time: "5 min ago" },
  { id: 2, text: "Weather alert: light rain on Thursday", time: "1 hour ago" },
  { id: 3, text: "You finished 5 hours of focus time", time: "Today" },
  { id: 4, text: "Living room light was left on", time: "Yesterday" }
];

let notifications = defaultNotifications.slice(); // a copy of the list

function renderNotifications() {
  const list = byId("notification-list");
  list.innerHTML = "";

  notifications.forEach(function (note) {
    const item = document.createElement("li");
    item.className = "notification-item";
    item.innerHTML =
      '<div class="note-text">' + escapeHtml(note.text) + "<small>" + escapeHtml(note.time) + "</small></div>" +
      '<button class="delete-btn" type="button" data-note="' + note.id + '" aria-label="Dismiss notification">✕</button>';
    list.appendChild(item);
  });

  byId("notification-count").textContent = notifications.length;
  byId("notification-empty").classList.toggle("hidden", notifications.length > 0);
}

byId("notification-list").addEventListener("click", function (event) {
  const noteId = event.target.getAttribute("data-note");
  if (noteId) {
    notifications = notifications.filter(function (note) { return String(note.id) !== noteId; });
    renderNotifications();
  }
});

byId("clear-notifications").addEventListener("click", function () {
  notifications = [];
  renderNotifications();
  showToast("Notifications cleared");
});

renderNotifications();


// ---------- 11. Settings: show or hide widgets ----------

const widgetOptions = [
  { key: "clock", label: "Live clock" },
  { key: "weather", label: "Weather" },
  { key: "calendar", label: "Calendar" },
  { key: "todo", label: "To-do list" },
  { key: "music", label: "Music player" },
  { key: "home", label: "Smart home" },
  { key: "stats", label: "Productivity" },
  { key: "notifications", label: "Notifications" }
];

let hiddenWidgets = loadData("hidden-widgets", []);

function applyWidgetVisibility() {
  widgetOptions.forEach(function (option) {
    const card = document.querySelector('[data-widget="' + option.key + '"]');
    if (card) card.classList.toggle("widget-hidden", hiddenWidgets.includes(option.key));
  });
  saveData("hidden-widgets", hiddenWidgets);
}

function buildWidgetOptions() {
  const container = byId("widget-options");
  container.innerHTML = "";

  widgetOptions.forEach(function (option) {
    const row = document.createElement("label");
    row.className = "option-row";
    row.innerHTML =
      '<input type="checkbox" data-key="' + option.key + '" ' + (hiddenWidgets.includes(option.key) ? "" : "checked") + " />" +
      "<span>" + option.label + "</span>";
    container.appendChild(row);
  });
}

byId("widget-options").addEventListener("change", function (event) {
  const key = event.target.getAttribute("data-key");
  if (!key) return;
  if (event.target.checked) {
    hiddenWidgets = hiddenWidgets.filter(function (item) { return item !== key; });
  } else {
    hiddenWidgets.push(key);
  }
  applyWidgetVisibility();
});

buildWidgetOptions();
applyWidgetVisibility();


// ---------- 12. Particles (glittering purple dust) ----------

const canvas = byId("particles");
const context = canvas.getContext("2d");
let particles = [];
let particlesEnabled = loadData("particles", true) && !prefersReducedMotion;
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  // Fewer particles on small screens keeps things fast
  const count = window.innerWidth < 640 ? 35 : 70;
  const colors = ["#c4b5fd", "#a855f7", "#e9d5ff", "#8b5cf6"];
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.35 - 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function drawParticles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (p) {
    p.x += p.speedX;
    p.y += p.speedY;
    p.twinkle += 0.03;

    // When a particle leaves the screen, put it back at the bottom
    if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
    if (p.x < -5) p.x = canvas.width + 5;
    if (p.x > canvas.width + 5) p.x = -5;

    context.globalAlpha = 0.35 + Math.abs(Math.sin(p.twinkle)) * 0.65; // twinkle effect
    context.fillStyle = p.color;
    context.shadowColor = p.color;
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    context.fill();
  });

  animationId = requestAnimationFrame(drawParticles);
}

function startParticles() {
  if (animationId === null) {
    resizeCanvas();
    createParticles();
    drawParticles();
  }
}

function stopParticles() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", function () {
  if (particlesEnabled) {
    resizeCanvas();
    createParticles();
  }
});

// Settings switch for particles
function renderParticlesSwitch() {
  const toggle = byId("particles-toggle");
  toggle.classList.toggle("on", particlesEnabled);
  toggle.setAttribute("aria-checked", String(particlesEnabled));
}

byId("particles-toggle").addEventListener("click", function () {
  if (prefersReducedMotion) {
    showToast("Particles are off because your device prefers reduced motion");
    return;
  }
  particlesEnabled = !particlesEnabled;
  saveData("particles", particlesEnabled);
  renderParticlesSwitch();
  if (particlesEnabled) startParticles(); else stopParticles();
});

renderParticlesSwitch();
if (particlesEnabled) startParticles();


// ---------- 13. Reset settings ----------

byId("reset-settings").addEventListener("click", function () {
  hiddenWidgets = [];
  buildWidgetOptions();
  applyWidgetVisibility();
  applyTheme("dark");
  if (!prefersReducedMotion) {
    particlesEnabled = true;
    saveData("particles", true);
    renderParticlesSwitch();
    startParticles();
  }
  showToast("Settings reset");
});

// "Customize Widgets" button in the hero scrolls to settings (the link does the scrolling)
byId("customize-btn").addEventListener("click", function () {
  showToast("Choose which widgets to show");
});


// ---------- 14. Scroll reveal ----------

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  // No animation: just show everything
  revealItems.forEach(function (item) { item.classList.add("visible"); });
} else {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(function (item) { observer.observe(item); });
}


// ---------- 15. Gallery image fallback ----------

// If a gallery image can't load, show the purple gradient box instead
document.querySelectorAll(".gallery-item img").forEach(function (image) {
  function markFailed() {
    image.parentElement.classList.add("img-failed");
  }
  image.addEventListener("error", markFailed);
  // The image may have already failed before this code ran
  if (image.complete && image.naturalWidth === 0) markFailed();
});


// ---------- 16. Footer year ----------

byId("year").textContent = new Date().getFullYear();

// Draw the stats ring once at start (renderTasks does this too)
renderTasks();