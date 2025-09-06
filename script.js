
const state={products:[],cart:JSON.parse(localStorage.getItem('sanaya_cart')||'[]')};

async function loadProducts(){
  const r = await fetch('products.json',{cache:'no-store'});
  state.products = await r.json();
  return state.products;
}

function saveCart(){ localStorage.setItem('sanaya_cart', JSON.stringify(state.cart)); updateCartCount(); }
function updateCartCount(){ const c = state.cart.reduce((a,b)=>a+b.qty,0); document.querySelectorAll('[data-cart-count]').forEach(el=> el.textContent = c); }

function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function money(n){ return 'Rs. ' + Number(n).toLocaleString(); }

function productCard(p){
  return el(`
  <article class="card product">
    <div class="thumb">
      ${p.badge? `<span class="badge">${p.badge}</span>`:''}
      <a href="product.html?id=${p.id}"><img loading="lazy" src="${p.image}" alt="${p.name}"></a>
    </div>
    <div class="content">
      <a class="name" href="product.html?id=${p.id}">${p.name}</a>
      <div class="muted">${p.category.toUpperCase()}</div>
      <div class="price">${money(p.price)}</div>
      <button class="btn" data-add="${p.id}">Add to Cart</button>
    </div>
  </article>`);
}
function mountCards(sel, list){
  const wrap = document.querySelector(sel); if(!wrap) return;
  wrap.innerHTML = '';
  const grid = document.createElement('div'); grid.className='grid'; grid.style.gridTemplateColumns='repeat(auto-fill,minmax(220px,1fr))';
  list.forEach(p=> grid.appendChild(productCard(p)));
  wrap.appendChild(grid);
  wrap.querySelectorAll('[data-add]').forEach(btn=> btn.onclick = (e)=>{
    const id = Number(e.currentTarget.dataset.add);
    addToCart(id, 1);
    e.currentTarget.textContent = 'Added ✓'; setTimeout(()=> e.currentTarget.textContent='Add to Cart', 1200);
  });
}

function addToCart(id, qty=1, size=null){
  const p = state.products.find(x=> x.id===id); if(!p) return;
  const key = id + '|' + (size||'');
  const exist = state.cart.find(x=> x.key===key);
  if(exist) exist.qty += qty;
  else state.cart.push({key, id, size, qty, price:p.price, name:p.name, image:p.image});
  saveCart();
}

function renderCart(){
  const table = document.querySelector('#cartTable');
  const summary = document.querySelector('#cartSummary');
  if(!table) return;
  table.innerHTML='';
  let subtotal = 0;
  state.cart.forEach((it,i)=>{
    subtotal += it.price * it.qty;
    table.appendChild(el(`<tr>
      <td><img src="${it.image}" width="60" style="border-radius:10px"></td>
      <td>${it.name}${it.size?` <small>(${it.size})</small>`:''}</td>
      <td>${money(it.price)}</td>
      <td>
        <button class="btn ghost" data-minus="${i}">-</button>
        <span style="padding:0 10px">${it.qty}</span>
        <button class="btn ghost" data-plus="${i}">+</button>
      </td>
      <td><button class="btn outline" data-remove="${i}">Remove</button></td>
    </tr>`));
  });
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;
  if(summary){
    summary.innerHTML = `<div>Subtotal: <strong>${money(subtotal)}</strong></div>
      <div>Shipping: <strong>${money(shipping)}</strong></div>
      <div style="font-size:20px;margin-top:8px">Total: <strong>${money(total)}</strong></div>
      <a class="btn" href="checkout.html">Checkout</a>`;
  }
  table.querySelectorAll('[data-minus]').forEach(btn=> btn.onclick = (e)=>{ const i=+e.currentTarget.dataset.minus; if(state.cart[i].qty>1) state.cart[i].qty--; saveCart(); renderCart(); });
  table.querySelectorAll('[data-plus]').forEach(btn=> btn.onclick = (e)=>{ const i=+e.currentTarget.dataset.plus; state.cart[i].qty++; saveCart(); renderCart(); });
  table.querySelectorAll('[data-remove]').forEach(btn=> btn.onclick = (e)=>{ const i=+e.currentTarget.dataset.remove; state.cart.splice(i,1); saveCart(); renderCart(); });
}

async function maybeLoadFromSheet(){
  const url = window.SHEETS_CSV_URL || '';
  if(!url) return false;
  try{
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) return false;
    const csv = await r.text();
    const rows = csv.trim().split(/\r?\n/).map(r=> r.split(','));
    const header = rows.shift().map(h=> h.trim().toLowerCase());
    const idx = (name)=> header.indexOf(name);
    state.products = rows.map((r,i)=> ({
      id: Number(r[idx('id')] || i+1),
      name: r[idx('name')] || 'Product',
      category: (r[idx('category')] || 'misc').toLowerCase(),
      price: Number(r[idx('price')] || 0),
      sizes: (r[idx('sizes')] || 'S,M,L').split(/\s*;\s*|,\s*/),
      image: r[idx('image')] || 'images/product_01.png',
      badge: r[idx('badge')] || '',
      description: r[idx('description')] || ''
    }));
    return true;
  }catch(e){
    console.warn('Sheet load failed', e);
    return false;
  }
}

async function boot(){
  updateCartCount();
  const fromSheet = await maybeLoadFromSheet();
  if(!fromSheet) await loadProducts();

  mountCards('#featuredGrid', state.products.slice(0,8));

  const shopWrap = document.querySelector('#shopGrid');
  if(shopWrap){
    const selectCat = document.querySelector('#filterCat');
    const inputQuery = document.querySelector('#searchQuery');
    function apply(){
      const q = (inputQuery.value || '').toLowerCase();
      const c = selectCat.value;
      let list = state.products;
      if(c !== 'all') list = list.filter(p => p.category === c);
      if(q) list = list.filter(p => p.name.toLowerCase().includes(q));
      mountCards('#shopGrid', list);
    }
    ['input','change'].forEach(evt => { selectCat.addEventListener(evt, apply); inputQuery.addEventListener(evt, apply); });
    apply();
  }

  const params = new URLSearchParams(location.search);
  const pid = Number(params.get('id'));
  if(document.querySelector('#productDetail') && pid){
    const p = state.products.find(x=> x.id === pid) || state.products[0];
    const box = document.querySelector('#productDetail');
    box.innerHTML = `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:30px">
        <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:20px;box-shadow:var(--shadow);max-height:520px;object-fit:cover">
        <div>
          <h1>${p.name}</h1>
          <div class="muted">${p.category.toUpperCase()}</div>
          <div class="price" style="font-size:28px;margin:8px 0 16px">${money(p.price)}</div>
          <p>${p.description}</p>
          <label>Size:</label>
          <select id="sizeSelect" class="input">${p.sizes.map(s=> `<option value="${s}">${s}</option>`).join('')}</select>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn" id="addDetail">Add to Cart</button>
            <a class="btn outline" href="cart.html">Go to Cart</a>
          </div>
        </div>
      </div>`;
    document.querySelector('#addDetail').onclick = ()=>{
      const size = document.querySelector('#sizeSelect').value;
      addToCart(p.id, 1, size);
    };
  }

  renderCart();
}

document.addEventListener('DOMContentLoaded', boot);
