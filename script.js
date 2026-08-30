// ===== Scroll reveal animations =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
);

revealEls.forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 90 + "ms";
  io.observe(el);
});

// ===== Stagger children inside revealed cards =====
const heroPhoto = document.querySelector(".hero-photo");
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    if (heroPhoto) {
      heroPhoto.style.transform = `translateY(${y * 0.04}px)`;
    }
  },
  { passive: true },
);

// ===== "Подробнее" toggle =====
const moreBtn = document.getElementById("moreBtn");
const descFull = document.getElementById("descFull");
moreBtn.addEventListener("click", () => {
  const hidden = descFull.hasAttribute("hidden");
  if (hidden) {
    descFull.removeAttribute("hidden");
    moreBtn.textContent = "Скрыть";
  } else {
    descFull.setAttribute("hidden", "");
    moreBtn.textContent = "Подробнее";
  }
});

// ===== Specialists data =====
const specialists = [
  {
    name: "Елена",
    role: "Мастер маникюра и педикюра",
    phone: "89041112757",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Виктория",
    role: "Мастер бровей, ресниц и депиляции",
    phone: "89500793837",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80",
  },
];

const track = document.querySelector(".spec-track");
specialists.forEach((s) => {
  const card = document.createElement("div");
  card.className = "spec-card";
  card.innerHTML = `
    <img class="spec-photo" src="${s.img}" alt="${s.name}" loading="lazy" />
    <div class="spec-name">${s.name}</div>
    <div class="spec-role">${s.role}</div>
    <a class="spec-phone" href="tel:${s.phone}">📞 ${s.phone}</a>
  `;
  track.appendChild(card);
});

// ===== Specialists: no paging needed (2 cards) =====
const specScroll = document.getElementById("specScroll");
if (specScroll) specScroll.style.overflow = "visible";
const trackEl = document.querySelector(".spec-track");
if (trackEl) trackEl.style.transform = "none";

// ===== Smooth button feedback =====
document.querySelectorAll(".btn-primary, .btn-outline").forEach((b) => {
  b.addEventListener("click", () => {
    b.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.96)" },
        { transform: "scale(1)" },
      ],
      { duration: 220, easing: "ease" },
    );
  });
});

// ===== Booking modal =====
// URL твоего Google Apps Script (веб-приложение) — вставь сюда после создания
const BOOKING_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyiYdBZr9lz2-9IYuseah6UJDZjOWQDDaNTqzdbs8M6UkVeHqD0kB4v8s7fAOTrNCZc4w/exec";

const bookModal = document.getElementById("bookModal");
const modalClose = document.getElementById("modalClose");
const confirmBtn = document.getElementById("confirmBtn");
const selectedInfo = document.getElementById("selectedInfo");

function openModal() {
  bookModal.hidden = false;
  requestAnimationFrame(() => bookModal.classList.add("show"));
  document.body.style.overflow = "hidden";
}
function closeModal() {
  bookModal.classList.remove("show");
  document.body.style.overflow = "";
  setTimeout(() => {
    bookModal.hidden = true;
  }, 300);
}

document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (e.currentTarget.classList.contains("modal-confirm")) return;
    openModal();
  });
});
modalClose.addEventListener("click", closeModal);
bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !bookModal.hidden) closeModal();
});

// service selection
const priceItems = document.querySelectorAll(".price-item");
const selected = new Map(); // label -> master
function updateSelected() {
  if (selected.size === 0) {
    selectedInfo.textContent = "Выберите услуги";
  } else {
    const masters = new Set([...selected.values()]);
    const mText = [...masters].join(", ");
    selectedInfo.textContent = `Выбрано: ${selected.size} · ${mText}`;
  }
}
priceItems.forEach((item) => {
  item.addEventListener("click", () => {
    const label = item.querySelector("span").textContent;
    const master = item
      .closest(".price-group")
      .querySelector(".cat-master")
      .textContent.trim();
    if (selected.has(label)) {
      selected.delete(label);
      item.classList.remove("selected");
    } else {
      selected.set(label, master);
      item.classList.add("selected");
    }
    updateSelected();
  });
});

confirmBtn.addEventListener("click", () => {
  if (selected.size === 0) {
    selectedInfo.textContent = "Пожалуйста, выберите хотя бы одну услугу";
    return;
  }

  const name = document.getElementById("cName").value.trim();
  const phone = document.getElementById("cPhone").value.trim();
  const date = document.getElementById("cDate").value;
  const time = document.getElementById("cTime").value;
  const tg = document.getElementById("cTg").value.trim().replace(/^@/, "");

  if (!name || !phone || !date || !time || !tg) {
    selectedInfo.textContent = "Заполните все поля данных";
    return;
  }

  if (
    BOOKING_ENDPOINT.includes("ЗАМЕНИ") ||
    BOOKING_ENDPOINT.includes("http") === false
  ) {
    selectedInfo.textContent =
      "Endpoint не настроен (впишите URL Apps Script в BOOKING_ENDPOINT)";
    return;
  }

  const masters = [...new Set([...selected.values()])];

  // группируем выбранные услуги по мастерам
  const byMaster = {};
  selected.forEach((master, label) => {
    (byMaster[master] = byMaster[master] || []).push(label);
  });

  confirmBtn.textContent = "Отправляем...";
  confirmBtn.disabled = true;

  fetch(BOOKING_ENDPOINT, {
    method: "POST",
    // text/plain — простой запрос, без CORS-preflight (Apps Script иначе блокирует)
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ name, phone, date, time, tg, byMaster }),
  })
    .then((r) => {
      if (!r.ok) throw new Error("network");
      closeModal();
      showToast();
    })
    .catch(() => {
      selectedInfo.textContent = "Ошибка отправки, попробуйте ещё раз";
    })
    .finally(() => {
      confirmBtn.textContent = "Подтвердить запись";
      confirmBtn.disabled = false;
    });
});

// ===== Success toast =====
const toast = document.getElementById("toast");
function showToast() {
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.hidden = true;
    }, 400);
  }, 3600);
}
