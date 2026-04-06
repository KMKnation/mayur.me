const statusPhrases = [
  "Training neural instincts",
  "Deploying autonomous workflows",
  "Refining deterministic outputs",
  "Engineering calm under pressure",
];

const statusRotator = document.querySelector("#status-rotator");
const yearStamp = document.querySelector("#year-stamp");
const revealItems = document.querySelectorAll(".reveal");
const navToggle = document.querySelector("#nav-toggle");
const topbar = document.querySelector(".topbar");
const navLinks = document.querySelectorAll(".nav a");
const progressBar = document.querySelector("#scroll-progress-bar");
const sectionNodes = document.querySelectorAll("main section[id]");
const countUpNodes = document.querySelectorAll(".count-up");
const tiltNodes = document.querySelectorAll("[data-tilt]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (statusRotator) {
  let phraseIndex = 0;

  window.setInterval(() => {
    phraseIndex = (phraseIndex + 1) % statusPhrases.length;
    statusRotator.textContent = statusPhrases[phraseIndex];
  }, 2400);
}

if (yearStamp) {
  yearStamp.textContent = new Date().getFullYear();
}

const updateScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${Math.min(Math.max(progress, 0), 1)}`);
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

if (navToggle && topbar) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    topbar.classList.toggle("nav-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      topbar.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
    });
  });
}

if (!reduceMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      document.documentElement.style.setProperty("--pointer-x", x);
      document.documentElement.style.setProperty("--pointer-y", y);
    },
    { passive: true }
  );
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 60}ms`;
    revealObserver.observe(item);
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const activeId = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${activeId}`;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-15% 0px -35% 0px",
    }
  );

  sectionNodes.forEach((section) => {
    sectionObserver.observe(section);
  });

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const node = entry.target;
        const target = Number(node.getAttribute("data-target") || "0");
        const suffix = node.getAttribute("data-suffix") || "";
        const duration = 1100;
        const startTime = performance.now();

        const tick = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          node.textContent = `${String(value).padStart(2, "0")}${suffix}`;

          if (progress < 1) {
            window.requestAnimationFrame(tick);
          }
        };

        window.requestAnimationFrame(tick);
        countObserver.unobserve(node);
      });
    },
    {
      threshold: 0.55,
    }
  );

  countUpNodes.forEach((node) => {
    countObserver.observe(node);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  tiltNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width;
      const offsetY = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (offsetX - 0.5) * 8;
      const rotateX = (0.5 - offsetY) * 8;

      node.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}
