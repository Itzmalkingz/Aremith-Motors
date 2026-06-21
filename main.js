const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "Close" : "Menu";
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      siteNav.classList.remove("open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const parallaxElements = document.querySelectorAll(".parallax");

function updateParallax() {
  const viewportMid = window.innerHeight / 2;
  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.speed || 0.15);
    const rect = element.getBoundingClientRect();
    const offset = (rect.top - viewportMid) * speed;
    const positionX = getComputedStyle(element).getPropertyValue("--bg-x").trim() || "center";
    element.style.backgroundPosition = `${positionX} calc(50% + ${offset}px)`;
  });
}

if (parallaxElements.length) {
  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
}

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll(".vehicle-slide"));
  const next = document.querySelector("[data-carousel-next]");
  const prev = document.querySelector("[data-carousel-prev]");
  let activeIndex = 0;
  let timer;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
  }

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    restartTimer();
  });

  prev?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    restartTimer();
  });

  restartTimer();
}

const filters = document.querySelectorAll("[data-filter]");
const vehicleCards = document.querySelectorAll("[data-vehicle-grid] .vehicle-card");
const emptyState = document.querySelector("[data-empty-state]");

function applyVehicleFilters() {
  const selected = Array.from(filters).reduce((values, filter) => {
    values[filter.dataset.filter] = filter.value;
    return values;
  }, {});

  let visibleCount = 0;

  vehicleCards.forEach((card) => {
    const makeMatch = selected.make === "all" || card.dataset.make === selected.make;
    const typeMatch = selected.type === "all" || card.dataset.type === selected.type;
    const priceMatch = selected.price === "all" || Number(card.dataset.price) <= Number(selected.price);
    const isVisible = makeMatch && typeMatch && priceMatch;

    card.style.display = isVisible ? "" : "none";
    if (isVisible) visibleCount += 1;
  });

  emptyState?.classList.toggle("show", visibleCount === 0);
}

filters.forEach((filter) => filter.addEventListener("change", applyVehicleFilters));

const galleryButtons = document.querySelectorAll("[data-gallery-open]");
const galleryCloseButtons = document.querySelectorAll("[data-gallery-close]");

function closeGallery() {
  document.querySelectorAll("[data-gallery-modal].is-open").forEach((modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });
  document.body.classList.remove("modal-open");
}

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const galleryId = button.dataset.galleryOpen;
    const modal = document.querySelector(`[data-gallery-modal="${galleryId}"]`);
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });
});

galleryCloseButtons.forEach((button) => {
  button.addEventListener("click", closeGallery);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGallery();
  }
});

document.querySelectorAll("[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = "Thanks. Your request has been captured for follow-up.";
    }
    form.reset();
  });
});

const reviewForm = document.querySelector("[data-review-form]");
const reviewList = document.querySelector("[data-review-list]");

if (reviewForm && reviewList) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const reviewer = String(formData.get("reviewer") || "Customer").trim();
    const rating = String(formData.get("rating") || "5").trim();
    const review = String(formData.get("review") || "").trim();
    const status = reviewForm.querySelector(".form-status");

    if (!review) return;

    const card = document.createElement("article");
    card.className = "review-card visible";
    card.innerHTML = `
      <span class="stars">${rating}/5 stars</span>
      <p></p>
      <strong></strong>
    `;

    card.querySelector("p").textContent = review;
    card.querySelector("strong").textContent = `- ${reviewer}`;
    reviewList.prepend(card);

    if (status) {
      status.textContent = "Thanks. Your review has been added.";
    }

    reviewForm.reset();
  });
}
