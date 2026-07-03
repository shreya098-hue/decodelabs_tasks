
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  alert("Welcome to AI Learn Platform!");
});

const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  alert("Message Sent Successfully!");

  form.reset();
});

const links = document.querySelectorAll(".nav-links a");

links.forEach(link => {
  link.addEventListener("click", () => {

    links.forEach(l => {
      l.style.color = "white";
    });

    link.style.color = "#00d4ff";
  });
});
window.onload = () => {
  console.log("AI Learning Platform Loaded Successfully");
};