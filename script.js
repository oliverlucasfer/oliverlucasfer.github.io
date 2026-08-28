const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const container = document.querySelector(".container");
const menuToggle = document.querySelector(".js-menu-toggle");

function setMenu(open) {
  container.classList.toggle("show-menu", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Fechar menu de navegação" : "Abrir menu de navegação"
  );
}

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
  tags.slice(3).forEach((tag) => tag.classList.add("extra"));
  const more = document.createElement("button");
  more.type = "button";
  more.className = "tag tag-more";
  more.textContent = "+" + tags.slice(3).length;
  more.setAttribute("aria-expanded", "false");
  more.addEventListener("click", () => {
    const expanded = container.classList.toggle("expanded");
    more.setAttribute("aria-expanded", String(expanded));
    more.textContent = expanded ? "menos" : "+" + tags.slice(3).length;
  });
  container.appendChild(more);
});

if (window.Lenis && !prefersReducedMotion) {
  const lenis = new Lenis({ anchors: true });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
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
  const words = ["Full Stack", "Mobile", "Flutter"];
  if (prefersReducedMotion) {
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

const heroTitle = document.querySelector(".banner h1");
if (heroTitle) {
  const words = heroTitle.textContent.trim().split(/\s+/);
  heroTitle.innerHTML = words
    .map(
      (word, i) =>
        `<span class="word" style="animation-delay:${0.25 + i * 0.12}s">${word}</span>`
    )
    .join(" ");
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

const CAREER_START_YEAR = 2021;
const yearsExp = Math.max(1, new Date().getFullYear() - CAREER_START_YEAR);

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

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.level + "%";
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  document
    .querySelectorAll(".skill-fill")
    .forEach((bar) => skillObserver.observe(bar));

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
  document
    .querySelectorAll(".skill-fill")
    .forEach((bar) => (bar.style.width = bar.dataset.level + "%"));
}
