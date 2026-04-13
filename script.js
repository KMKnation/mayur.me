const yearStamp = document.querySelector("#year-stamp");
const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector("#menu-toggle");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");
const sectionNodes = document.querySelectorAll("main section[id]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
const spotlightNodes = document.querySelectorAll(".site-header, .hero-stage, .project-card, .proof-column, .signal-triad article, .button");
const tiltNodes = document.querySelectorAll(".hero-stage, .project-card");

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${Math.min(Math.max(progress, 0), 1)}`);
};

if (yearStamp) {
  yearStamp.textContent = new Date().getFullYear();
}

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteHeader.classList.toggle("nav-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteHeader.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
    });
  });
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
      threshold: 0.16,
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 50}ms`;
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
      rootMargin: "-16% 0px -36% 0px",
    }
  );

  sectionNodes.forEach((section) => {
    sectionObserver.observe(section);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

if (!reduceMotion && hasFinePointer) {
  spotlightNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
      const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
      node.style.setProperty("--mx", `${pointerX}%`);
      node.style.setProperty("--my", `${pointerY}%`);
    });

    node.addEventListener("pointerleave", () => {
      node.style.removeProperty("--mx");
      node.style.removeProperty("--my");
    });
  });

  tiltNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width;
      const offsetY = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (offsetX - 0.5) * 6;
      const rotateX = (0.5 - offsetY) * 6;
      node.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}
