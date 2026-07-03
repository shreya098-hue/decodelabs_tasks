const API_BASE = "http://localhost:5000/api";

// ─── Helper: Get stored token ────────────────────────────────
const getToken = () => localStorage.getItem("ailearn_token");
const getUser = () => JSON.parse(localStorage.getItem("ailearn_user") || "null");

// ─── On Page Load ────────────────────────────────────────────
window.onload = () => {
  console.log("AI Learning Platform Loaded ✅");
  updateNavForAuth();
  loadCoursesFromAPI();
};

// ─── Update Navbar based on login state ──────────────────────
function updateNavForAuth() {
  const user = getUser();
  const navLinks = document.querySelector(".nav-links");

  // Remove old auth buttons if they exist
  const existing = document.getElementById("auth-nav-item");
  if (existing) existing.remove();

  const li = document.createElement("li");
  li.id = "auth-nav-item";

  if (user) {
    li.innerHTML = `<a href="#" id="logoutBtn" style="color:#00d4ff">👤 ${user.name} | Logout</a>`;
    navLinks.appendChild(li);
    document.getElementById("logoutBtn").addEventListener("click", logout);
  } else {
    li.innerHTML = `<a href="#" id="loginNavBtn">Login / Register</a>`;
    navLinks.appendChild(li);
    document.getElementById("loginNavBtn").addEventListener("click", showAuthModal);
  }
}

// ─── Start Learning Button ────────────────────────────────────
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  const user = getUser();
  if (user) {
    document.querySelector("#courses").scrollIntoView({ behavior: "smooth" });
  } else {
    showAuthModal();
  }
});

// ─── Nav Link Active State ────────────────────────────────────
const links = document.querySelectorAll(".nav-links a");
links.forEach((link) => {
  link.addEventListener("click", () => {
    links.forEach((l) => (l.style.color = "white"));
    link.style.color = "#00d4ff";
  });
});

// ─── Load Courses from API ────────────────────────────────────
async function loadCoursesFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    const courses = await res.json();

    const container = document.querySelector(".course-container");
    container.innerHTML = ""; // clear static cards

    courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <p style="color:#00d4ff; font-weight:bold; margin-bottom:15px;">₹${course.price}</p>
        <button onclick="enrollCourse('${course.title}')">Enroll Now</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Could not load courses:", err.message);
    // Fallback: static cards remain if API is not running
  }
}

// ─── Enroll in Course ─────────────────────────────────────────
async function enrollCourse(courseName) {
  const token = getToken();

  if (!token) {
    alert("Please login first to enroll!");
    showAuthModal();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ course_name: courseName }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
    } else {
      showToast(data.error, "error");
    }
  } catch (err) {
    showToast("Server not reachable. Please try again.", "error");
  }
}

// ─── Contact Form ─────────────────────────────────────────────
const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const form = document.querySelector(".contact-form");
  const inputs = form.querySelectorAll("input, textarea");

  const name = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const message = inputs[2].value.trim();

  if (!name || !email || !message) {
    showToast("Please fill all fields!", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      form.reset();
    } else {
      showToast(data.error, "error");
    }
  } catch (err) {
    showToast("Server not reachable. Please try again.", "error");
  }
});

// ─── Auth Modal ───────────────────────────────────────────────
function showAuthModal(mode = "login") {
  const existingModal = document.getElementById("authModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.7);
    display:flex; justify-content:center; align-items:center; z-index:9999;
  `;

  modal.innerHTML = `
    <div style="background:#1e293b; border-radius:16px; padding:40px; width:400px;
                max-width:90vw; border:1px solid #00d4ff; position:relative;">
      <button onclick="document.getElementById('authModal').remove()"
        style="position:absolute; top:15px; right:20px; background:none; border:none;
               color:white; font-size:1.5rem; cursor:pointer;">✕</button>

      <div style="display:flex; gap:20px; margin-bottom:30px;">
        <button id="tabLogin" onclick="switchTab('login')"
          style="flex:1; padding:10px; border:none; border-radius:8px; cursor:pointer;
                 background:${mode === "login" ? "#00d4ff" : "#334155"}; color:${mode === "login" ? "#0f172a" : "white"}; font-weight:bold;">
          Login
        </button>
        <button id="tabRegister" onclick="switchTab('register')"
          style="flex:1; padding:10px; border:none; border-radius:8px; cursor:pointer;
                 background:${mode === "register" ? "#00d4ff" : "#334155"}; color:${mode === "register" ? "#0f172a" : "white"}; font-weight:bold;">
          Register
        </button>
      </div>

      <div id="loginForm" style="display:${mode === "login" ? "flex" : "none"}; flex-direction:column; gap:15px;">
        <h2 style="color:white; margin-bottom:5px;">Welcome Back 👋</h2>
        <input id="loginEmail" type="email" placeholder="Email" style="padding:12px; border-radius:8px; border:none; outline:none; font-size:1rem;">
        <input id="loginPassword" type="password" placeholder="Password" style="padding:12px; border-radius:8px; border:none; outline:none; font-size:1rem;">
        <button onclick="handleLogin()"
          style="padding:12px; background:#00d4ff; border:none; border-radius:8px;
                 font-weight:bold; cursor:pointer; font-size:1rem;">
          Login
        </button>
      </div>

      <div id="registerForm" style="display:${mode === "register" ? "flex" : "none"}; flex-direction:column; gap:15px;">
        <h2 style="color:white; margin-bottom:5px;">Create Account 🚀</h2>
        <input id="regName" type="text" placeholder="Full Name" style="padding:12px; border-radius:8px; border:none; outline:none; font-size:1rem;">
        <input id="regEmail" type="email" placeholder="Email" style="padding:12px; border-radius:8px; border:none; outline:none; font-size:1rem;">
        <input id="regPassword" type="password" placeholder="Password (min 6 chars)" style="padding:12px; border-radius:8px; border:none; outline:none; font-size:1rem;">
        <button onclick="handleRegister()"
          style="padding:12px; background:#00d4ff; border:none; border-radius:8px;
                 font-weight:bold; cursor:pointer; font-size:1rem;">
          Register
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

function switchTab(tab) {
  document.getElementById("loginForm").style.display = tab === "login" ? "flex" : "none";
  document.getElementById("registerForm").style.display = tab === "register" ? "flex" : "none";
  document.getElementById("tabLogin").style.background = tab === "login" ? "#00d4ff" : "#334155";
  document.getElementById("tabLogin").style.color = tab === "login" ? "#0f172a" : "white";
  document.getElementById("tabRegister").style.background = tab === "register" ? "#00d4ff" : "#334155";
  document.getElementById("tabRegister").style.color = tab === "register" ? "#0f172a" : "white";
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) return showToast("Fill all fields!", "error");

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("ailearn_token", data.token);
      localStorage.setItem("ailearn_user", JSON.stringify(data.user));
      document.getElementById("authModal").remove();
      showToast(`Welcome back, ${data.user.name}! 🎉`, "success");
      updateNavForAuth();
    } else {
      showToast(data.error, "error");
    }
  } catch (err) {
    showToast("Server not reachable.", "error");
  }
}

async function handleRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !email || !password) return showToast("Fill all fields!", "error");
  if (password.length < 6) return showToast("Password must be at least 6 characters", "error");

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("ailearn_token", data.token);
      localStorage.setItem("ailearn_user", JSON.stringify(data.user));
      document.getElementById("authModal").remove();
      showToast(`Welcome to AI Learn, ${data.user.name}! 🚀`, "success");
      updateNavForAuth();
    } else {
      showToast(data.error, "error");
    }
  } catch (err) {
    showToast("Server not reachable.", "error");
  }
}

function logout() {
  localStorage.removeItem("ailearn_token");
  localStorage.removeItem("ailearn_user");
  showToast("Logged out successfully!", "success");
  updateNavForAuth();
}

// ─── Toast Notification ───────────────────────────────────────
function showToast(message, type = "success") {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:30px; right:30px; z-index:9999;
    padding:14px 24px; border-radius:10px; font-weight:bold;
    background:${type === "success" ? "#00d4ff" : "#ef4444"};
    color:${type === "success" ? "#0f172a" : "white"};
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;

  const style = document.createElement("style");
  style.textContent = `@keyframes slideIn { from { transform: translateX(100px); opacity:0; } to { transform: translateX(0); opacity:1; } }`;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
