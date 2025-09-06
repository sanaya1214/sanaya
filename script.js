/* =============================
   Sanaya / Cultural-Fusion Script
   File: script.js
   ============================= */

/* ---------- Mobile Menu ---------- */
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".main-nav");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
    hamburger.classList.toggle("active");
  });
}

/* ---------- Product Image Gallery ---------- */
const thumbs = document.querySelectorAll(".thumb img");
const mainImg = document.querySelector(".gallery .main-img img");

if (thumbs && mainImg) {
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
      thumbs.forEach(t => t.parentElement.classList.remove("active"));
      thumb.parentElement.classList.add("active");
    });
  });
}

/* ---------- Tabs (Description, Details, Shipping) ---------- */
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

if (tabBtns && tabContents) {
  tabBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      tabContents[i].classList.add("active");
    });
  });
}

/* ---------- Size Selector ---------- */
const sizeBtns = document.querySelectorAll(".size-options button");
if (sizeBtns) {
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

/* ---------- Quantity Counter ---------- */
const qtyInputs = document.querySelectorAll(".qty-row input");
const qtyBtns = document.querySelectorAll(".qty-row .qty-btn");

if (qtyInputs && qtyBtns) {
  qtyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".qty-row").querySelector("input");
      let value = parseInt(input.value) || 1;
      if (btn.dataset.action === "plus") value++;
      if (btn.dataset.action === "minus" && value > 1) value--;
      input.value = value;
    });
  });
}

/* ---------- Cart Modal ---------- */
const cartBtns = document.querySelectorAll(".add-to-cart");
const cartModal = document.querySelector(".modal");
const cartBody = document.querySelector(".modal .modal-body");
const cartClose = document.querySelector(".modal .close-btn");
const cartTotal = document.querySelector(".cart-total");

let cartItems = [];

function updateCart() {
  cartBody.innerHTML = "";
  let total = 0;

  cartItems.forEach((item, index) => {
    total += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "cart-item row";
    row.innerHTML = `
      <img src="${item.img}" width="60" height="60" style="border-radius:6px; object-fit:cover">
      <div style="flex:1">
        <div><strong>${item.title}</strong></div>
        <div>Qty: ${item.qty} × Rs. ${item.price}</div>
      </div>
      <button class="remove-btn" data-index="${index}">✕</button>
    `;
    cartBody.appendChild(row);
  });

  cartTotal.textContent = "Rs. " + total;

  // remove buttons
  const removeBtns = cartBody.querySelectorAll(".remove-btn");
  removeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.index;
      cartItems.splice(idx, 1);
      updateCart();
    });
  });
}

if (cartBtns) {
  cartBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const title = card.querySelector("h4").textContent;
      const price = parseInt(card.querySelector(".price").textContent.replace(/\D/g, ""));
      const img = card.querySelector("img").src;

      cartItems.push({ title, price, img, qty: 1 });
      updateCart();

      cartModal.classList.add("open");
    });
  });
}

if (cartClose) {
  cartClose.addEventListener("click", () => {
    cartModal.classList.remove("open");
  });
}

/* ---------- Smooth Scroll for internal links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ---------- Auto Year in Footer ---------- */
const yearSpan = document.querySelector(".year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
