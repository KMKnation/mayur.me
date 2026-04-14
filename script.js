const root = document.documentElement;
const mainContent = document.querySelector("#main-content");
const skipLink = document.querySelector(".skip-link");
const yearStamp = document.querySelector("#year-stamp");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const themeColorMeta = document.querySelector("#theme-color-meta");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const themeStorageKey = "mayur-theme";
const themeColors = {
  dark: "#070b15",
  light: "#f6f2e9",
};

const urlTheme = new URLSearchParams(window.location.search).get("theme");
const linksByHash = new Map();
const visibleRatios = new Map();

let scrollProgressFrame = 0;
let activeHash = "";

navLinks.forEach((link) => {
  const hash = link.getAttribute("href");
  if (!hash || !hash.startsWith("#")) {
    return;
  }

  if (!linksByHash.has(hash)) {
    linksByHash.set(hash, []);
  }

  linksByHash.get(hash).push(link);
});

const sectionHashes = sections
  .map((section) => section.id ? `#${section.id}` : "")
  .filter((hash) => hash && linksByHash.has(hash));

const defaultHash =
  (linksByHash.has("#hero") && "#hero") ||
  sectionHashes[0] ||
  Array.from(linksByHash.keys())[0] ||
  "";

const getSafeHash = (hash) => {
  if (hash && linksByHash.has(hash)) {
    return hash;
  }

  return defaultHash;
};

const setActiveNav = (hash) => {
  const nextHash = getSafeHash(hash);
  if (!nextHash || nextHash === activeHash) {
    return;
  }

  activeHash = nextHash;

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === nextHash;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

const setTheme = (theme, persist = true) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  const nextAction = nextTheme === "light" ? "dark" : "light";

  root.dataset.theme = nextTheme;
  themeColorMeta?.setAttribute("content", themeColors[nextTheme]);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "light"));
    themeToggle.setAttribute("aria-label", `Switch to ${nextAction} theme`);
  }

  if (themeToggleText) {
    themeToggleText.textContent = nextAction[0].toUpperCase() + nextAction.slice(1);
  }

  if (!persist) {
    return;
  }

  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch (error) {
    // Ignore storage failures so the toggle still works in-session.
  }
};

const getInitialTheme = () => {
  if (urlTheme === "light" || urlTheme === "dark") {
    return urlTheme;
  }

  if (root.dataset.theme === "light" || root.dataset.theme === "dark") {
    return root.dataset.theme;
  }

  try {
    return localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
  } catch (error) {
    return "dark";
  }
};

const updateScrollProgress = () => {
  scrollProgressFrame = 0;

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  const boundedProgress = Math.min(Math.max(progress, 0), 1);

  root.style.setProperty("--scroll-progress", boundedProgress.toFixed(4));
};

const scheduleScrollProgress = () => {
  if (scrollProgressFrame) {
    return;
  }

  scrollProgressFrame = window.requestAnimationFrame(updateScrollProgress);
};

const getLayoutDrivenHash = () => {
  if (!sections.length) {
    return getSafeHash(window.location.hash || defaultHash);
  }

  if (window.scrollY <= 24 && !window.location.hash) {
    return defaultHash;
  }

  const anchorLine = window.innerHeight * 0.32;
  const rankedSections = sections
    .map((section) => {
      const hash = `#${section.id}`;
      const ratio = visibleRatios.get(section.id) ?? 0;
      const rect = section.getBoundingClientRect();
      const containsAnchor = rect.top <= anchorLine && rect.bottom >= anchorLine;
      const distance = containsAnchor
        ? 0
        : Math.min(Math.abs(rect.top - anchorLine), Math.abs(rect.bottom - anchorLine));

      return {
        hash,
        ratio,
        distance,
        containsAnchor,
        topOffset: Math.abs(rect.top),
      };
    })
    .sort((left, right) => {
      if (left.containsAnchor !== right.containsAnchor) {
        return left.containsAnchor ? -1 : 1;
      }

      if (Math.abs(left.ratio - right.ratio) > 0.015) {
        return right.ratio - left.ratio;
      }

      if (Math.abs(left.distance - right.distance) > 2) {
        return left.distance - right.distance;
      }

      return left.topOffset - right.topOffset;
    });

  return getSafeHash(rankedSections[0]?.hash || window.location.hash || defaultHash);
};

const syncActiveNav = () => {
  setActiveNav(getLayoutDrivenHash());
};

const scrollSectionIntoView = (hash) => {
  const safeHash = getSafeHash(hash);
  if (!safeHash) {
    return false;
  }

  const targetSection = document.querySelector(safeHash);
  if (!targetSection) {
    return false;
  }

  targetSection.scrollIntoView({
    block: "start",
    behavior: "auto",
  });
  setActiveNav(safeHash);
  return true;
};

if (yearStamp) {
  yearStamp.textContent = new Date().getFullYear();
}

setTheme(getInitialTheme(), false);
setActiveNav(getSafeHash(window.location.hash || defaultHash));
updateScrollProgress();

window.addEventListener("scroll", scheduleScrollProgress, { passive: true });
window.addEventListener("resize", () => {
  scheduleScrollProgress();
  syncActiveNav();
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNav(link.getAttribute("href"));
  });
});

themeToggle?.addEventListener("click", () => {
  const preservedHash = getSafeHash(window.location.hash || activeHash || defaultHash);

  setTheme(root.dataset.theme === "light" ? "dark" : "light");

  window.requestAnimationFrame(() => {
    if (!scrollSectionIntoView(preservedHash)) {
      syncActiveNav();
    }
  });
});

skipLink?.addEventListener("click", () => {
  if (!mainContent) {
    return;
  }

  window.requestAnimationFrame(() => {
    mainContent.focus({ preventScroll: true });
  });
});

window.addEventListener("hashchange", () => {
  setActiveNav(getSafeHash(window.location.hash || defaultHash));
  syncActiveNav();
});

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (!id) {
          return;
        }

        visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      syncActiveNav();
    },
    {
      rootMargin: "-18% 0px -52% 0px",
      threshold: [0, 0.12, 0.24, 0.4, 0.58, 0.76, 1],
    }
  );

  sections.forEach((section) => {
    visibleRatios.set(section.id, 0);
    sectionObserver.observe(section);
  });
} else {
  window.addEventListener("scroll", syncActiveNav, { passive: true });
  window.addEventListener("load", syncActiveNav, { once: true });
}

if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index, 10) * 70}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

window.addEventListener(
  "load",
  () => {
    window.requestAnimationFrame(() => {
      if (!window.location.hash || !scrollSectionIntoView(window.location.hash)) {
        syncActiveNav();
      }

      scheduleScrollProgress();
    });
  },
  { once: true }
);
