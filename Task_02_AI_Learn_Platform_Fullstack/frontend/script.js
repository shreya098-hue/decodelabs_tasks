const API_BASE = "http://localhost:5000/api";

// ─── Auth Functions ──────────────────────────────────────────────
const getToken = () => localStorage.getItem("ailearn_token");
const getUser = () =>
  JSON.parse(localStorage.getItem("ailearn_user") || "null");

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
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  } else {
    li.innerHTML = `<a href="#" id="loginNavBtn">Login / Register</a>`;
    navLinks.appendChild(li);
    const loginBtn = document.getElementById("loginNavBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", showAuthModal);
    }
  }
}

// ─── On Page Load ──────────────────────────────────────────────
window.onload = () => {
  console.log("AI Learning Platform Loaded ✅");
  updateNavForAuth();
  loadCoursesFromAPI();
  renderFeatures();
  renderPricing();
  renderUserEnrollments();
  setupContactForm();
  setupSmoothSectionNavigation();
};

function setupSmoothSectionNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", targetId);
    });
  });
}

// ─── Start Learning Button ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const user = getUser();
      if (user) {
        document
          .querySelector("#courses")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        showAuthModal();
      }
    });
  }
});

// ─── Load Courses from API ────────────────────────────────────
async function loadCoursesFromAPI() {
  try {
    console.log("Loading courses from API...");
    const res = await fetch(`${API_BASE}/courses`);
    console.log("Response status:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Courses loaded:", data);

    let courses = Array.isArray(data) ? data : data.courses || [];

    const container = document.querySelector(".course-container");
    if (!container) return;

    container.innerHTML = "";

    if (courses.length === 0) {
      container.innerHTML = `
        <div class="course-card">
          <h3>No courses available</h3>
          <p>Check back later for new courses.</p>
        </div>
      `;
      return;
    }

    courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <h3>${course.title}</h3>
        <p>${course.description || "Learn AI with this course"}</p>
        <p style="color:#00d4ff; font-weight:bold; margin-bottom:15px;">${course.price > 0 ? `₹${course.price}` : "Free"}</p>
        <button onclick="enrollCourse(${course.id})">Enroll Now</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Could not load courses:", err.message);
    const container = document.querySelector(".course-container");
    if (container) {
      container.innerHTML = `
        <div class="course-card">
          <h3>⚠️ Cannot connect to server</h3>
          <p>Make sure the backend is running on port 5000</p>
        </div>
      `;
    }
  }
}

// ─── Render Features ────────────────────────────────────────────
function renderFeatures() {
  const featureItems = [
    {
      title: "Live AI Classes",
      description:
        "Learn directly from industry experts through interactive sessions.",
    },
    {
      title: "Industry Projects",
      description: "Work on real-world AI projects and build your portfolio.",
    },
    {
      title: "Certificates",
      description: "Earn recognized certificates after course completion.",
    },
    {
      title: "Placement Support",
      description: "Get career guidance, mock interviews and job assistance.",
    },
  ];

  const container = document.querySelector(".feature-container");
  if (!container) return;

  container.innerHTML = "";
  featureItems.forEach((feature) => {
    const card = document.createElement("div");
    card.className = "feature-card";
    card.innerHTML = `
      <h3>${feature.title}</h3>
      <p>${feature.description}</p>
    `;
    container.appendChild(card);
  });
}

// ─── Render Pricing ─────────────────────────────────────────────
function renderPricing() {
  const pricingPlans = [
    {
      name: "Basic",
      price: "₹999",
      items: ["1 AI Course", "Certificate", "Email Support"],
    },
    {
      name: "Pro",
      price: "₹1999",
      items: ["All AI Courses", "Certificates", "Projects", "Mentorship"],
      featured: true,
    },
    {
      name: "Premium",
      price: "₹2999",
      items: [
        "Everything in Pro",
        "Live Classes",
        "Placement Support",
        "Career Guidance",
      ],
    },
  ];

  const container = document.querySelector(".pricing-container");
  if (!container) return;

  container.innerHTML = "";
  pricingPlans.forEach((plan) => {
    const card = document.createElement("div");
    card.className = `price-card ${plan.featured ? "featured" : ""}`;
    card.innerHTML = `
      <h3>${plan.name}</h3>
      <h1>${plan.price}</h1>
      ${plan.items.map((item) => `<p>${item}</p>`).join("")}
      <button>Get Started</button>
    `;
    container.appendChild(card);
  });
}

// ─── Render User Enrollments ──────────────────────────────────
async function renderUserEnrollments() {
  const container = document.querySelector(".my-learning-container");
  if (!container) return;

  const user = getUser();
  if (!user) {
    container.innerHTML = `
      <div class="learning-card">
        <p>Login to see your enrolled courses, progress, and personalized recommendations.</p>
      </div>
    `;
    return;
  }

  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/enroll/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `<div class="learning-card"><p>${data.error || "Unable to load your courses."}</p></div>`;
      return;
    }

    const enrollments = Array.isArray(data) ? data : data.enrollments || [];

    if (enrollments.length === 0) {
      container.innerHTML = `
        <div class="learning-card">
          <h3>Welcome, ${user.name}</h3>
          <p>You're not enrolled in any courses yet. Explore the courses section to get started.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    enrollments.forEach((enrollment) => {
      const card = document.createElement("div");
      card.className = "learning-card";
      card.innerHTML = `
        <h3>${enrollment.title || "Enrolled Course"}</h3>
        <p>Enrolled on ${new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
        ${enrollment.completed_percent !== undefined ? `<p>Progress: ${enrollment.completed_percent}%</p>` : ""}
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="learning-card"><p>Unable to load enrollments.</p></div>`;
  }
}

// ─── Enroll in Course ─────────────────────────────────────────
async function enrollCourse(courseId) {
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
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message || "Enrolled successfully!", "success");
      loadCoursesFromAPI();
      renderUserEnrollments();
    } else {
      showToast(data.message || data.error || "Enrollment failed", "error");
    }
  } catch (err) {
    showToast("Server not reachable. Please try again.", "error");
  }
}

// ─── Contact Form ─────────────────────────────────────────────
function setupContactForm() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const form = document.querySelector(".contact-form");
    if (!form) return;

    const inputs = form.querySelectorAll("input, textarea");
    if (inputs.length < 3) return;

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
        showToast(data.message || "Message sent successfully!", "success");
        form.reset();
      } else {
        showToast(
          data.message || data.error || "Failed to send message",
          "error",
        );
      }
    } catch (err) {
      showToast("Server not reachable. Please try again.", "error");
    }
  });
}

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
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ─── Switch Tab ────────────────────────────────────────────────
function switchTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");

  if (loginForm) loginForm.style.display = tab === "login" ? "flex" : "none";
  if (registerForm)
    registerForm.style.display = tab === "register" ? "flex" : "none";
  if (tabLogin) {
    tabLogin.style.background = tab === "login" ? "#00d4ff" : "#334155";
    tabLogin.style.color = tab === "login" ? "#0f172a" : "white";
  }
  if (tabRegister) {
    tabRegister.style.background = tab === "register" ? "#00d4ff" : "#334155";
    tabRegister.style.color = tab === "register" ? "#0f172a" : "white";
  }
}

// ─── Handle Login ──────────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    showToast("Fill all fields!", "error");
    return;
  }

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
      document.getElementById("authModal")?.remove();
      showToast(`Welcome back, ${data.user.name}! 🎉`, "success");
      updateNavForAuth();
      renderUserEnrollments();
    } else {
      showToast(data.message || data.error || "Login failed", "error");
    }
  } catch (err) {
    showToast("Server not reachable.", "error");
  }
}

// ─── Handle Register ──────────────────────────────────────────
async function handleRegister() {
  const name = document.getElementById("regName")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  if (!name || !email || !password) {
    showToast("Fill all fields!", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

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
      document.getElementById("authModal")?.remove();
      showToast(`Welcome to AI Learn, ${data.user.name}! 🚀`, "success");
      updateNavForAuth();
    } else {
      showToast(data.message || data.error || "Registration failed", "error");
    }
  } catch (err) {
    showToast("Server not reachable.", "error");
  }
}

// ─── Logout ────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem("ailearn_token");
  localStorage.removeItem("ailearn_user");
  showToast("Logged out successfully!", "success");
  updateNavForAuth();
  renderUserEnrollments();
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
