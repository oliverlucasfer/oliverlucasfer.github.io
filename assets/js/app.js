const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const siteConfig = window.__SITE__ || {};

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
};

const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "light" ? "#f4f5f9" : "#0e0e14");
  }
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.setAttribute(
      "aria-label",
      theme === "light" ? btn.dataset.labelDark : btn.dataset.labelLight
    );
  });
}

function initTheme() {
  const stored = safeStorage.get("theme");
  const schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
  const applyScheme = (event) =>
    applyTheme(event.matches ? "light" : "dark");
  applyTheme(
    stored === "light" || stored === "dark"
      ? stored
      : schemeQuery.matches
        ? "light"
        : "dark"
  );
  if (!stored) {
    if (schemeQuery.addEventListener) {
      schemeQuery.addEventListener("change", applyScheme);
    } else if (schemeQuery.addListener) {
      schemeQuery.addListener(applyScheme);
    }
  }
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "light" ? "dark" : "light";
      safeStorage.set("theme", next);
      applyTheme(next);
    });
  });
}

initTheme();

document.querySelectorAll(".bento-foto img").forEach((img) => {
  const hide = () => {
    img.style.display = "none";
  };
  img.addEventListener("error", hide);
  if (img.complete && img.naturalWidth === 0) hide();
});

const container = document.querySelector(".container");
const menuToggle = document.querySelector(".js-menu-toggle");

function setMenu(open) {
  if (!container || !menuToggle) return;
  container.classList.toggle("show-menu", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open
      ? menuToggle.dataset.labelClose || "Fechar menu de navegação"
      : menuToggle.dataset.labelOpen || "Abrir menu de navegação"
  );
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    setMenu(!container.classList.contains("show-menu"));
  });

  document.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (!container.classList.contains("show-menu")) return;
    if (event.target.closest(".sidebar, .js-menu-toggle")) return;
    setMenu(false);
  });
}

const filterChips = document.querySelectorAll(".filter-chip");
const projectCards = document.querySelectorAll(".cards .card");

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const filter = chip.dataset.filter;
    projectCards.forEach((card) => {
      const show = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        card.classList.add("animate");
        card.classList.remove("filter-in");
        requestAnimationFrame(() => card.classList.add("filter-in"));
      }
    });
  });
});

document.querySelectorAll(".tags").forEach((container) => {
  const tags = [...container.querySelectorAll(":scope > .tag")];
  if (tags.length <= 3) return;
  const lessLabel = container.closest(".cards")?.dataset.less || "menos";
  tags.slice(3).forEach((tag) => tag.classList.add("extra"));
  const more = document.createElement("button");
  more.type = "button";
  more.className = "tag tag-more";
  more.textContent = "+" + tags.slice(3).length;
  more.setAttribute("aria-expanded", "false");
  more.addEventListener("click", () => {
    const expanded = container.classList.toggle("expanded");
    more.setAttribute("aria-expanded", String(expanded));
    more.textContent = expanded ? lessLabel : "+" + tags.slice(3).length;
  });
  container.appendChild(more);
});

if (window.Lenis && !prefersReducedMotion) {
  const lenis = new Lenis({ anchors: true });
  window.__lenis = lenis;
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const toggleVisible = () => {
    backToTop.classList.toggle("visible", window.scrollY > 400);
  };
  document.addEventListener("scroll", toggleVisible, { passive: true });
  toggleVisible();
  backToTop.addEventListener("click", () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  });
}

const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
  };
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const typeEl = document.getElementById("typewriter");
if (typeEl) {
  const words = siteConfig.typedWords?.length
    ? siteConfig.typedWords
    : ["Full Stack"];
  if (prefersReducedMotion || words.length === 1) {
    typeEl.textContent = words[0];
  } else {
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = false;
    const step = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      typeEl.textContent = word.slice(0, charIndex);
      let delay = deleting ? 45 : 90;
      if (!deleting && charIndex >= word.length) {
        delay = 2000;
        deleting = true;
      } else if (deleting && charIndex <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400;
      }
      setTimeout(step, delay);
    };
    setTimeout(step, 1600);
  }
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".ButtonCustom, .ButtonSend").forEach((btn) => {
    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

const statNums = document.querySelectorAll(".stat-num");

const yearsExp = Math.max(
  1,
  new Date().getFullYear() - (siteConfig.careerStartYear || 2021)
);

const yearsStat = document.querySelector('[data-stat="anos"]');
if (yearsStat) yearsStat.dataset.target = String(yearsExp);

const yearsHero = document.getElementById("anos-exp");
if (yearsHero) yearsHero.textContent = String(yearsExp);

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        if (!el.dataset.target) return;
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
          return;
        }
        const duration = 1300;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach((el) => counterObserver.observe(el));
} else {
  statNums.forEach((el) => {
    el.textContent = el.dataset.target + (el.dataset.suffix || "");
  });
}

const animatedElements = document.querySelectorAll("[data-anime]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );
  animatedElements.forEach((element) => revealObserver.observe(element));

  const navLinks = document.querySelectorAll(".nav-link");
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + id
            );
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document
    .querySelectorAll("header, section")
    .forEach((section) => spyObserver.observe(section));
} else {
  animatedElements.forEach((element) => element.classList.add("animate"));
}

/* ---------------- GitHub (card do bento) ---------------- */

const githubCard = document.querySelector(".bento-github");
if (githubCard && siteConfig.githubUser) {
  fetch(`https://api.github.com/users/${siteConfig.githubUser}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((user) => {
      const repos = githubCard.querySelector('[data-gh="repos"]');
      if (repos) repos.textContent = user.public_repos ?? "–";
      githubCard.hidden = false;
    })
    .catch(() => {
      githubCard.hidden = true;
    });
}

/* ---------------- Formulário de contato (Formspree) ---------------- */

const contactForm = document.querySelector(".contato-form");
if (contactForm && contactForm.dataset.endpoint) {
  const status = contactForm.querySelector(".form-status");
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const defaultLabel = submitBtn?.textContent;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submitBtn) return;
    submitBtn.disabled = true;
    submitBtn.textContent = siteConfig.sendingLabel || "…";
    if (status) status.textContent = "";
    try {
      const res = await fetch(contactForm.dataset.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm)
      });
      if (res.ok) {
        contactForm.reset();
        if (status) status.textContent = siteConfig.sentLabel || "OK";
        submitBtn.textContent = defaultLabel;
      } else {
        throw new Error(res.status);
      }
    } catch {
      if (status) {
        status.textContent = siteConfig.errorLabel || "Erro ao enviar.";
      }
      submitBtn.textContent = defaultLabel;
    } finally {
      submitBtn.disabled = false;
    }
  });
}
