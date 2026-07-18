const body = document.body;
const header = document.querySelector(".site-header");
const scrollProgress = document.getElementById("scrollProgress");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setThemeToggle = () => {
  const isLight = body.classList.contains("light");
  themeToggle.innerHTML = isLight
    ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
};

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light") body.classList.add("light");
setThemeToggle();

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light");
  localStorage.setItem("portfolio-theme", body.classList.contains("light") ? "light" : "dark");
  setThemeToggle();
});

const closeMenu = () => {
  header.classList.remove("menu-active");
  body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle.addEventListener("click", () => {
  const opening = !header.classList.contains("menu-active");
  header.classList.toggle("menu-active", opening);
  body.classList.toggle("menu-open", opening);
  menuToggle.setAttribute("aria-expanded", String(opening));
});

mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const updateScrollUI = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
document.querySelectorAll(".skill-percent").forEach((element) => element.style.setProperty("--progress", element.dataset.progress));

const navLinks = [...document.querySelectorAll(".nav-links a")];
const navTargets = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });
navTargets.forEach((target) => sectionObserver.observe(target));

const typewriter = document.getElementById("typewriter");
const typePhrases = ["Learning to read numbers with confidence.", "Exploring technology with intention.", "Building a career with discipline."];
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

const runTypewriter = () => {
  if (reduceMotion) {
    typewriter.textContent = typePhrases[0];
    return;
  }
  const phrase = typePhrases[phraseIndex];
  typewriter.textContent = deleting ? phrase.slice(0, characterIndex--) : phrase.slice(0, characterIndex++);
  let delay = deleting ? 26 : 48;
  if (!deleting && characterIndex > phrase.length) {
    deleting = true;
    delay = 1700;
  } else if (deleting && characterIndex < 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % typePhrases.length;
    characterIndex = 0;
    delay = 370;
  }
  window.setTimeout(runTypewriter, delay);
};
runTypewriter();

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("mousemove", (event) => {
    if (reduceMotion) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.17;
    element.style.transform = `translate(${x}px, ${y}px)`;
  });
  element.addEventListener("mouseleave", () => { element.style.transform = ""; });
});

const portraitCard = document.getElementById("portraitCard");
const heroVisual = document.getElementById("heroVisual");
if (portraitCard && heroVisual && !reduceMotion) {
  heroVisual.addEventListener("mousemove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    portraitCard.style.transform = `rotateY(${x * 9}deg) rotateX(${y * -8}deg) translateZ(10px)`;
    portraitCard.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    portraitCard.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
  });
  heroVisual.addEventListener("mouseleave", () => { portraitCard.style.transform = ""; });
}

const cursorGlow = document.getElementById("cursorGlow");
if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
  body.classList.add("has-pointer");
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.suffix || "";
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const ratio = Math.min((now - start) / duration, 1);
      counter.textContent = `${Math.round((1 - Math.pow(1 - ratio, 3)) * target)}${suffix}`;
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(counter);
  });
}, { threshold: 0.65 });
counters.forEach((counter) => counterObserver.observe(counter));

const particleCanvas = document.getElementById("particleField");
if (particleCanvas && !reduceMotion) {
  const context = particleCanvas.getContext("2d");
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  const pointer = { x: -1000, y: -1000 };
  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    particleCanvas.width = canvasWidth * ratio;
    particleCanvas.height = canvasHeight * ratio;
    particleCanvas.style.width = `${canvasWidth}px`;
    particleCanvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const amount = Math.min(65, Math.round((canvasWidth * canvasHeight) / 23000));
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.35 + 0.25
    }));
  };
  const drawParticles = () => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -5 || particle.x > canvasWidth + 5) particle.vx *= -1;
      if (particle.y < -5 || particle.y > canvasHeight + 5) particle.vy *= -1;
      const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
      if (pointerDistance < 130) {
        particle.x += (particle.x - pointer.x) * 0.006;
        particle.y += (particle.y - pointer.y) * 0.006;
      }
      context.fillStyle = index % 4 === 0 ? "rgba(239, 200, 102, .45)" : "rgba(137, 228, 176, .34)";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(drawParticles);
  };
  window.addEventListener("pointermove", (event) => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  drawParticles();
}

const money = new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 });
const ledgerElements = {
  assets: document.getElementById("ledgerAssets"),
  liabilities: document.getElementById("ledgerLiabilities"),
  equity: document.getElementById("ledgerEquity"),
  revenue: document.getElementById("ledgerRevenue"),
  expenses: document.getElementById("ledgerExpenses"),
  status: document.getElementById("ledgerStatus"),
  message: document.getElementById("ledgerMessage"),
  profit: document.getElementById("profitValue"),
  profitNote: document.getElementById("profitNote"),
  position: document.getElementById("positionValue"),
  solvency: document.getElementById("solvencyValue"),
  revenueBar: document.getElementById("revenueBar"),
  expensesBar: document.getElementById("expensesBar"),
  profitBar: document.getElementById("profitBar")
};
const ledgerDefaults = { assets: 100000, liabilities: 60000, equity: 40000, revenue: 70000, expenses: 42000 };
const readLedgerValue = (element) => Math.max(0, Number(element.value) || 0);

const updateLedger = () => {
  const values = Object.fromEntries(Object.entries(ledgerElements).filter(([, element]) => element?.tagName === "INPUT").map(([key, element]) => [key, readLedgerValue(element)]));
  const difference = values.assets - values.liabilities - values.equity;
  const balanced = Math.abs(difference) < 0.01;
  const profit = values.revenue - values.expenses;
  const margin = values.revenue ? (profit / values.revenue) * 100 : 0;
  const solvency = values.liabilities ? values.assets / values.liabilities : 0;
  const maximum = Math.max(values.revenue, values.expenses, Math.abs(profit), 1);
  ledgerElements.status.classList.toggle("is-unbalanced", !balanced);
  ledgerElements.status.innerHTML = balanced
    ? '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Balance sheet reconciled</span>'
    : '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Balance sheet needs adjustment</span>';
  ledgerElements.message.textContent = balanced
    ? "Assets equal liabilities plus owner's equity. The position is balanced."
    : `There is an NPR ${money.format(Math.abs(difference))} difference. Adjust assets, liabilities, or equity to reconcile the balance sheet.`;
  ledgerElements.profit.textContent = `NPR ${money.format(profit)}`;
  ledgerElements.profitNote.textContent = `${margin.toFixed(1)}% margin`;
  ledgerElements.position.textContent = `NPR ${money.format(values.assets)}`;
  ledgerElements.solvency.textContent = values.liabilities ? `${solvency.toFixed(2)}x` : "—";
  ledgerElements.revenueBar.style.height = `${Math.max((values.revenue / maximum) * 88, 3)}%`;
  ledgerElements.expensesBar.style.height = `${Math.max((values.expenses / maximum) * 88, 3)}%`;
  ledgerElements.profitBar.style.height = `${Math.max((Math.abs(profit) / maximum) * 88, 3)}%`;
  ledgerElements.profitBar.style.background = profit >= 0
    ? "linear-gradient(180deg, var(--purple), rgba(173,155,255,.3))"
    : "linear-gradient(180deg, var(--danger), rgba(245,162,122,.3))";
};

Object.values(ledgerElements).filter((element) => element?.tagName === "INPUT").forEach((input) => input.addEventListener("input", updateLedger));
document.getElementById("ledgerReset").addEventListener("click", () => {
  Object.entries(ledgerDefaults).forEach(([key, value]) => { ledgerElements[key].value = value; });
  updateLedger();
});
document.getElementById("downloadLedger").addEventListener("click", () => {
  const rows = [["Metric", "Amount (NPR)"], ...Object.entries({
    Assets: readLedgerValue(ledgerElements.assets), Liabilities: readLedgerValue(ledgerElements.liabilities), Equity: readLedgerValue(ledgerElements.equity), Revenue: readLedgerValue(ledgerElements.revenue), Expenses: readLedgerValue(ledgerElements.expenses), "Net Profit": readLedgerValue(ledgerElements.revenue) - readLedgerValue(ledgerElements.expenses)
  })];
  const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
  const download = document.createElement("a");
  download.href = URL.createObjectURL(blob);
  download.download = "ledger-lab-summary.csv";
  download.click();
  URL.revokeObjectURL(download.href);
});
document.getElementById("printLedger").addEventListener("click", () => window.print());
updateLedger();

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const fields = [
  { input: document.getElementById("from_name"), error: document.getElementById("nameError"), message: "Please enter your name." },
  { input: document.getElementById("from_email"), error: document.getElementById("emailError"), message: "Please enter a valid email address." },
  { input: document.getElementById("message"), error: document.getElementById("messageError"), message: "Please write a short message." }
];
const validateField = ({ input, error, message }) => {
  const valid = input.validity.valid && input.value.trim().length > 0;
  input.classList.toggle("is-invalid", !valid);
  input.setAttribute("aria-invalid", String(!valid));
  error.textContent = valid ? "" : message;
  return valid;
};
fields.forEach((field) => field.input.addEventListener("input", () => validateField(field)));

if (window.emailjs) window.emailjs.init("7Jo_3LJgp6PY9gz8g");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const isValid = fields.map(validateField).every(Boolean);
  if (!isValid) {
    formStatus.textContent = "Please check the highlighted fields.";
    fields.find((field) => field.input.classList.contains("is-invalid"))?.input.focus();
    return;
  }
  const submit = contactForm.querySelector('button[type="submit"]');
  const initial = submit.innerHTML;
  if (!window.emailjs) {
    formStatus.textContent = "The email service is unavailable. Please email me directly.";
    return;
  }
  submit.disabled = true;
  submit.textContent = "Sending…";
  formStatus.textContent = "Sending your message…";
  window.emailjs.sendForm("service_y9waaf6", "template_tkorcow", contactForm)
    .then(() => {
      contactForm.reset();
      fields.forEach(({ input, error }) => { input.classList.remove("is-invalid"); input.removeAttribute("aria-invalid"); error.textContent = ""; });
      formStatus.textContent = "Message sent successfully. Thank you.";
    })
    .catch(() => { formStatus.textContent = "Message could not be sent. Please try again or email me directly."; })
    .finally(() => { submit.disabled = false; submit.innerHTML = initial; });
});

const nepalTime = document.getElementById("nepalTime");
const updateNepalTime = () => {
  nepalTime.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
};
document.getElementById("footerYear").textContent = new Date().getFullYear();
updateNepalTime();
window.setInterval(updateNepalTime, 30000);

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
window.addEventListener("load", () => { body.classList.add("is-ready"); });
