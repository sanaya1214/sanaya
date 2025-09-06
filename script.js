
// Basic storefront logic for Sanaya demo
const CART_KEY = 'sanaya_cart_v1';
const PAGE_SIZE = 12;

const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const count = loadCart().reduce((s,i)=>s+i.qty,0);
  const el = $('#cart-count');
  if(el) el.textContent = count;
}

async function fetchProducts(){
  const res = await fetch('products.json');
  return res.json();
}

// Home: Featured products
(async function initHome(){
  const featured = document.getElementById('featured');
  if(!featured) return;
  const products = await fetchProducts();
  const picks = products.slice(0,8);
  featured.innerHTML = picks.map(p => cardHTML(p)).join('');
  updateCartCount();
  // category chips -> go to shop with filter
  $$('.chip').forEach(ch => {
    ch.addEventListener('click', () => {
      localStorage.setItem('sanaya_active_category', ch.dataset.cat || 'All');
      window.location.href = 'shop.html';
    });
  });
})();

// Shop page
(async function initShop(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const products = await fetchProducts();
  const search = $('#search');
  const category = $('#category');
  const sort = $('#sort');
  const pagination = $('#pagination');

  // restore cat from home click
  const savedCat = localStorage.getItem('sanaya_active_category');
  if(savedCat && savedCat !== 'All'){
    category.value = savedCat;
    localStorage.removeItem('sanaya_active_category');
  }

  let page = 1;
  function apply(){
    let list = [...products];
    const q = (search.value || '').toLowerCase();
    if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if(category.value !== 'All') list = list.filter(p => p.category === category.value);
    if(sort.value === 'low') list.sort((a,b)=>a.price-b.price);
    if(sort.value === 'high') list.sort((a,b)=>b.price-a.price);
    if(sort.value === 'new') list.sort((a,b)=>b.id-a.id);
    // pagination
    const total = Math.ceil(list.length / PAGE_SIZE) || 1;
    page = Math.min(page, total);
    const start = (page-1)*PAGE_SIZE;
    const view = list.slice(start, start+PAGE_SIZE);
    grid.innerHTML = view.map(p => cardHTML(p)).join('');
    // controls
    pagination.innerHTML = '';
    for(let i=1;i<=total;i++){
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i===page ? ' active':'');
      btn.textContent = i;
      btn.onclick = ()=>{ page=i; apply(); };
      pagination.appendChild(btn);
    }
    updateCartCount();
  }
  [search,category,sort].forEach(el => el.addEventListener('input', ()=>{ page=1; apply(); }));
  apply();
})();

// Product page
(async function initProduct(){
  const wrap = document.getElementById('product-detail');
  if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id') || '0', 10);
  const products = await fetchProducts();
  const p = products.find(x=>x.id===id) || products[0];

  wrap.innerHTML = `
    <div class="gallery">
      <img src="${p.image}" alt="${p.title}">
      <div class="badge">${p.category}</div>
    </div>
    <div>
      <h1>${p.title}</h1>
      <p class="price">Rs.${p.price.toLocaleString()}</p>
      <p>${p.description}</p>
      <div class="size-row">${p.sizes.map(s=>`<button class="size" data-size="${s}">${s}</button>`).join('')}</div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <input id="qty" type="number" min="1" value="1" style="width:96px">
        <button class="btn" id="add-to-cart">Add to Cart</button>
      </div>
    </div>`;

  let selectedSize = p.sizes[0];
  $$('.size', wrap).forEach(btn=>{
    if(btn.textContent===selectedSize) btn.classList.add('active');
    btn.onclick = ()=>{
      $$('.size', wrap).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    };
  });

  $('#add-to-cart', wrap).onclick = ()=>{
    const qty = Math.max(1, parseInt($('#qty', wrap).value || '1',10));
    const cart = loadCart();
    const found = cart.find(i=>i.id===p.id && i.size===selectedSize);
    if(found) found.qty += qty;
    else cart.push({id:p.id, title:p.title, price:p.price, image:p.image, size:selectedSize, qty});
    saveCart(cart);
    alert('Added to cart!');
  };
  updateCartCount();
})();

// Cart page
(async function initCart(){
  const wrap = document.getElementById('cart-items');
  if(!wrap) return;
  const products = await fetchProducts();
  function render(){
    const cart = loadCart();
    if(cart.length===0){
      wrap.innerHTML = '<p>Your cart is empty.</p>';
      $('#cart-total').textContent = '';
      return;
    }
    wrap.innerHTML = cart.map((i,idx)=>`
      <div class="card" style="flex-direction:row;gap:12px;padding:12px;margin-bottom:12px">
        <img src="${i.image}" alt="${i.title}" style="width:110px;height:auto">
        <div class="body" style="flex:1">
          <strong>${i.title}</strong><br>
          Size: ${i.size} &nbsp; Qty: 
          <input type="number" min="1" value="${i.qty}" data-idx="${idx}" class="qty-input" style="width:80px">
          <div class="price">Rs.${(i.price*i.qty).toLocaleString()}</div>
        </div>
        <button class="page-btn remove" data-idx="${idx}">Remove</button>
      </div>
    `).join('');
    $$('.qty-input', wrap).forEach(inp => inp.onchange = ()=>{
      const cart = loadCart();
      cart[inp.dataset.idx].qty = Math.max(1, parseInt(inp.value||'1',10));
      saveCart(cart); render();
    });
    $$('.remove', wrap).forEach(btn => btn.onclick = ()=>{
      const cart = loadCart();
      cart.splice(parseInt(btn.dataset.idx,10),1);
      saveCart(cart); render();
    });
    const total = loadCart().reduce((s,i)=>s+i.price*i.qty,0);
    $('#cart-total').textContent = 'Total: Rs.' + total.toLocaleString();
  }
  render();
  updateCartCount();
})();

// Checkout page
(function initCheckout(){
  const form = $('#checkout-form');
  if(!form) return;
  const sum = $('#summary');
  const cart = loadCart();
  if(cart.length===0) sum.innerHTML = '<p>No items in cart.</p>';
  else {
    sum.innerHTML = cart.map(i=>`
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span>${i.title} (${i.size}) × ${i.qty}</span>
        <strong>Rs.${(i.price*i.qty).toLocaleString()}</strong>
      </div>`).join('') + 
      `<hr><div style="display:flex;justify-content:space-between">
        <span>Total</span><strong>Rs.${cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()}</strong></div>`;
  }
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Order placed! (Demo) We will contact you on WhatsApp to confirm.');
    saveCart([]);
    window.location.href = 'index.html';
  });
  updateCartCount();
})();

// Gallery page
(async function initGallery(){
  const g = document.getElementById('gallery');
  if(!g) return;
  const products = await fetchProducts();
  g.innerHTML = products.map(p=>`<img class="rounded" src="${p.image}" alt="${p.title}">`).join('');
  updateCartCount();
})();

function cardHTML(p){
  return `
    <div class="card">
      <a href="product.html?id=${p.id}">
        <div style="position:relative">
          <img src="${p.image}" alt="${p.title}">
          <span class="badge">${p.category}</span>
        </div>
      </a>
      <div class="body">
        <a href="product.html?id=${p.id}"><strong>${p.title}</strong></a>
        <div class="price">Rs.${p.price.toLocaleString()}</div>
        <button class="btn" onclick="addQuick(${p.id})">Add to Cart</button>
      </div>
    </div>`;
}

async function addQuick(id){
  const products = await fetchProducts();
  const p = products.find(x=>x.id===id);
  const cart = loadCart();
  const found = cart.find(i=>i.id===p.id && i.size==='M');
  if(found) found.qty += 1;
  else cart.push({id:p.id, title:p.title, price:p.price, image:p.image, size:'M', qty:1});
  saveCart(cart);
  alert('Added to cart!');
}

// Contact form (demo only)
(function initContact(){
  const form = $('#contact-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Message sent! (Demo) We will reply to your email soon.');
    form.reset();
  });
})();
