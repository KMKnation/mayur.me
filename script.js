const yearStamp = document.querySelector("#year-stamp");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const sectionNodes = document.querySelectorAll("main section[id]");
const mainContent = document.querySelector("#main-content");
const rootElement = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const themeColorMeta = document.querySelector("#theme-color-meta");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
const spotlightNodes = document.querySelectorAll(".site-header, .hero-stage, .project-card, .proof-column, .signal-triad article, .button, .orbit-nav, .mobile-dock, .theme-toggle");
const tiltNodes = document.querySelectorAll(".hero-stage, .project-card");
const themeStorageKey = "mayur-theme";
const themeColors = {
  dark: "#070b15",
  light: "#f6f2e9",
};
const urlTheme = new URLSearchParams(window.location.search).get("theme");

const linksByHash = navLinks.reduce((hashMap, link) => {
  const hash = link.getAttribute("href");
  if (!hash || !hash.startsWith("#")) {
    return hashMap;
  }

  if (!hashMap.has(hash)) {
    hashMap.set(hash, []);
  }

  hashMap.get(hash).push(link);
  return hashMap;
}, new Map());

const sectionHashes = Array.from(sectionNodes, (section) => {
  const id = section.getAttribute("id");
  return id ? `#${id}` : null;
}).filter(Boolean);

const defaultHash =
  (linksByHash.has("#hero") && "#hero") ||
  sectionHashes.find((hash) => linksByHash.has(hash)) ||
  Array.from(linksByHash.keys())[0] ||
  "";

let navSyncFrame = 0;
let pageLoaded = document.readyState === "complete";

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  document.documentElement.style.setProperty("--scroll-progress", `${boundedProgress}`);
};

const getSafeHash = (hash) => {
  if (hash && linksByHash.has(hash)) {
    return hash;
  }

  return defaultHash;
};

const setActiveNav = (hash) => {
  const safeHash = getSafeHash(hash);

  navLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  const matchingLinks = linksByHash.get(safeHash) || [];
  matchingLinks.forEach((link) => {
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  });
};

const setTheme = (theme, persist = true) => {
  const safeTheme = theme === "light" ? "light" : "dark";
  rootElement.dataset.theme = safeTheme;

  if (themeToggle) {
    const nextTheme = safeTheme === "light" ? "dark" : "light";
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute("aria-pressed", String(safeTheme === "light"));
  }

  if (themeToggleText) {
    themeToggleText.textContent = safeTheme === "light" ? "Dark" : "Light";
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColors[safeTheme]);
  }

  if (!persist) {
    return;
  }

  try {
    localStorage.setItem(themeStorageKey, safeTheme);
  } catch (error) {
    // Ignore storage failures so the toggle still works for the current session.
  }
};

const getInitialTheme = () => {
  if (urlTheme === "light" || urlTheme === "dark") {
    return urlTheme;
  }

  if (rootElement.dataset.theme === "light" || rootElement.dataset.theme === "dark") {
    return rootElement.dataset.theme;
  }

  try {
    if (localStorage.getItem(themeStorageKey) === "light") {
      return "light";
    }
  } catch (error) {
    // Ignore storage failures and fall back to dark mode.
  }

  return "dark";
};

const getCurrentSectionHash = () => {
  if (!sectionNodes.length) {
    return getSafeHash(window.location.hash);
  }

  if (window.scrollY <= 48) {
    if (!pageLoaded && window.location.hash) {
      return getSafeHash(window.location.hash);
    }

    return defaultHash;
  }

  const viewportAnchor = window.innerHeight * 0.28;
  let closestHash = defaultHash;
  let closestDistance = Number.POSITIVE_INFINITY;

  sectionNodes.forEach((section) => {
    const id = section.getAttribute("id");
    if (!id) {
      return;
    }

    const hash = `#${id}`;
    const rect = section.getBoundingClientRect();

    if (rect.top <= viewportAnchor && rect.bottom >= viewportAnchor) {
      closestHash = hash;
      closestDistance = -1;
      return;
    }

    if (closestDistance < 0) {
      return;
    }

    const distance = rect.top > viewportAnchor ? rect.top - viewportAnchor : viewportAnchor - rect.bottom;
    if (distance < closestDistance) {
      closestHash = hash;
      closestDistance = distance;
    }
  });

  return getSafeHash(closestHash);
};

const syncActiveNav = () => {
  setActiveNav(getCurrentSectionHash());
};

const scheduleNavSync = () => {
  if (navSyncFrame) {
    return;
  }

  navSyncFrame = window.requestAnimationFrame(() => {
    navSyncFrame = 0;
    syncActiveNav();
  });
};

if (yearStamp) {
  yearStamp.textContent = new Date().getFullYear();
}

setTheme(getInitialTheme(), false);
updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("scroll", scheduleNavSync, { passive: true });
window.addEventListener("resize", scheduleNavSync);
window.addEventListener(
  "load",
  () => {
    pageLoaded = true;
    scheduleNavSync();
  },
  { once: true }
);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNav(link.getAttribute("href"));
  });
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(rootElement.dataset.theme === "light" ? "dark" : "light");
  });
}

if (mainContent) {
  document.querySelector('.skip-link')?.addEventListener("click", () => {
    window.requestAnimationFrame(() => {
      mainContent.focus();
    });
  });
}

window.addEventListener("hashchange", () => {
  setActiveNav(getSafeHash(window.location.hash));
  scheduleNavSync();
});

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
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

setActiveNav(getSafeHash(window.location.hash || defaultHash));
scheduleNavSync();

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
