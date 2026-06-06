/* =========================================================
   Noori.dev
   Handles: data, rendering, search, category filter, image
   filter, lightbox with keyboard nav, theme toggle, counter.
   ========================================================= */

/* ---------- 1. Sample image dataset ----------
   Each object describes a single image. Add or remove
   freely — the gallery rebuilds from this array. */
const IMAGES = [
  // Nature
  { id: 1,  title: "Misty Mountains",   category: "nature",     src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80" },
  { id: 2,  title: "Forest Light",      category: "nature",     src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80" },
  { id: 3,  title: "Ocean Waves",       category: "nature",     src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=80" },
  { id: 4,  title: "Autumn Trail",      category: "nature",     src: "https://images.unsplash.com/photo-1507783548227-544c3b8fc065?w=900&q=80" },

  // Animals
  { id: 5,  title: "Curious Fox",       category: "animals",    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&q=80" },
  { id: 6,  title: "Wise Owl",          category: "animals",    src: "./OIP.png" },
  { id: 7,  title: "Sleeping Tiger",    category: "animals",    src: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=900&q=80" },
  { id: 8,  title: "Wild Horses",       category: "animals",    src: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&q=80" },

  // Technology
  { id: 9,  title: "Circuit Board",     category: "technology", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80" },
  { id: 10, title: "Studio Desk",       category: "technology", src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80" },
  { id: 11, title: "Code on Screen",    category: "technology", src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80" },
  { id: 12, title: "Vintage Camera",    category: "technology", src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80" },

  // Travel
  { id: 13, title: "Santorini Blues",   category: "travel",     src: "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=900&q=80" },
  { id: 14, title: "Tokyo at Night",    category: "travel",     src: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=900&q=80" },
  { id: 15, title: "Desert Caravan",    category: "travel",     src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=80" },
  { id: 16, title: "Mountain Village",  category: "travel",     src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80" },
];

/* ---------- 2. DOM references ---------- */
const galleryEl   = document.getElementById("gallery");
const loaderEl    = document.getElementById("loader");
const emptyEl     = document.getElementById("empty");
const searchInput = document.getElementById("searchInput");
const filterSel   = document.getElementById("filterSelect");
const counterEl   = document.getElementById("counter");
const chips       = document.querySelectorAll(".chip");
const themeBtn    = document.getElementById("themeToggle");
const lightbox    = document.getElementById("lightbox");
const lbImage     = document.getElementById("lbImage");
const lbTitle     = document.getElementById("lbTitle");
const lbMeta      = document.getElementById("lbMeta");
const lbClose     = document.getElementById("lbClose");
const lbPrev      = document.getElementById("lbPrev");
const lbNext      = document.getElementById("lbNext");
const lbFilters   = document.getElementById("lbFilters");

/* Per-image filter overrides: { [imageId]: filterName } */
const perImageFilters = {};

/* ---------- 3. State ---------- */
let activeCategory = "all";
let activeFilter   = "none";
let searchTerm     = "";
let currentList    = [];   // currently visible images
let lbIndex        = 0;    // current lightbox image index

/* ---------- 4. Core rendering ----------
   Filters IMAGES by category + search, applies image filter
   class, and re-renders the grid. */
function render() {
  const term = searchTerm.trim().toLowerCase();
  currentList = IMAGES.filter((img) => {
    const matchesCat = activeCategory === "all" || img.category === activeCategory;
    const matchesTerm = !term || img.title.toLowerCase().includes(term);
    return matchesCat && matchesTerm;
  });

  // Update counter
  counterEl.textContent = `${currentList.length} image${currentList.length === 1 ? "" : "s"}`;

  // Empty state
  if (currentList.length === 0) {
    galleryEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");

  // Build cards. Using innerHTML once is faster than many appendChild calls.
  const filterClass = activeFilter !== "none" ? `f-${activeFilter}` : "";
  galleryEl.innerHTML = currentList
    .map(
      (img, i) => `
      <article class="card" data-index="${i}" style="animation-delay:${Math.min(i * 40, 400)}ms">
        <div class="card-img-wrap">
          <img src="${img.src}" alt="${img.title}" loading="lazy" class="${filterClass}" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${img.title}</h3>
          <span class="card-tag">${img.category}</span>
        </div>
      </article>`
    )
    .join("");

  // Attach click handlers for lightbox
  galleryEl.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(Number(card.dataset.index)));
  });
}

/* ---------- 5. Search ---------- */
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

/* ---------- 6. Category chips ---------- */
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.category;
    render();
  });
});

/* ---------- 7. Visual filter ---------- */
filterSel.addEventListener("change", (e) => {
  activeFilter = e.target.value;
  render();
});

/* ---------- 8. Lightbox ---------- */
function openLightbox(index) {
  lbIndex = index;
  updateLightbox();
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function currentFilterFor(img) {
  return perImageFilters[img.id] || (activeFilter !== "none" ? activeFilter : "none");
}

function updateLightbox() {
  const img = currentList[lbIndex];
  if (!img) return;
  lbImage.src = img.src;
  lbImage.alt = img.title;
  const f = currentFilterFor(img);
  lbImage.className = f !== "none" ? `f-${f}` : "";
  lbTitle.textContent = img.title;
  lbMeta.textContent = `${img.category} · ${lbIndex + 1} / ${currentList.length}`;
  // Sync filter button active state
  lbFilters.querySelectorAll(".lb-filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === f);
  });
}

/* Per-image filter buttons */
lbFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".lb-filter-btn");
  if (!btn) return;
  const img = currentList[lbIndex];
  if (!img) return;
  const f = btn.dataset.filter;
  if (f === "none") delete perImageFilters[img.id];
  else perImageFilters[img.id] = f;
  updateLightbox();
  // Reflect on the grid card too
  const card = galleryEl.querySelector(`.card[data-index="${lbIndex}"] img`);
  if (card) card.className = f !== "none" ? `f-${f}` : "";
});

function nextImage() {
  lbIndex = (lbIndex + 1) % currentList.length;
  updateLightbox();
}
function prevImage() {
  lbIndex = (lbIndex - 1 + currentList.length) % currentList.length;
  updateLightbox();
}

lbClose.addEventListener("click", closeLightbox);
lbNext.addEventListener("click", nextImage);
lbPrev.addEventListener("click", prevImage);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "Escape")      closeLightbox();
  if (e.key === "ArrowRight")  nextImage();
  if (e.key === "ArrowLeft")   prevImage();
});

/* ---------- 9. Theme toggle (persisted) ---------- */
const savedTheme = localStorage.getItem("lumen-theme");
if (savedTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");

themeBtn.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("lumen-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("lumen-theme", "dark");
  }
});

/* ---------- 10. Boot ---------- */
window.addEventListener("load", () => {
  // Small artificial delay so the loader is visible briefly
  setTimeout(() => {
    loaderEl.classList.add("hidden");
    render();
  }, 350);
});
