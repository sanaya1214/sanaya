// script.js
document.addEventListener('DOMContentLoaded', function(){
  // mobile menu toggle (works for both headers)
  const btn1 = document.getElementById('mobile-menu-btn');
  const nav1 = document.getElementById('main-nav');
  if(btn1 && nav1){
    btn1.addEventListener('click', function(){ nav1.style.display = (nav1.style.display==='block'?'':'block'); });
  }
  const btn2 = document.getElementById('mobile-menu-btn-2');
  const nav2 = document.getElementById('main-nav-2');
  if(btn2 && nav2){
    btn2.addEventListener('click', function(){ nav2.style.display = (nav2.style.display==='block'?'':'block'); });
  }

  // load cart count from localStorage
  updateCartBubble();
});

// simple cart stored in localStorage
function getCart(){
  try{
    const s = localStorage.getItem('sanaya_cart');
    return s? JSON.parse(s): [];
  }catch(e){ return []; }
}
function setCart(cart){
  localStorage.setItem('sanaya_cart', JSON.stringify(cart));
  updateCartBubble();
}
function updateCartBubble(){
  const cart = getCart();
  const n = cart.reduce((acc,item)=>acc+ (item.qty||1),0);
  const el = document.getElementById('cart-bubble');
  const el2 = document.getElementById('cart-bubble-2');
  if(el) el.textContent = n;
  if(el2) el2.textContent = n;
}

// add to cart
function addToCart(name, price){
  const cart = getCart();
  const idx = cart.findIndex(i=>i.name===name);
  if(idx>-1){
    cart[idx].qty = (cart[idx].qty||1)+1;
  } else {
    cart.push({name, price, qty:1});
  }
  setCart(cart);
  alert(name + " added to cart ✅");
}

// View cart (simple)
function viewCart(){
  const cart = getCart();
  if(cart.length===0){ alert("Your cart is empty"); return; }
  let total = 0;
  let lines = cart.map((it, i)=>{
    const line = `${i+1}. ${it.name} — Rs ${it.price} × ${it.qty}`;
    total += it.price * it.qty;
    return line;
  }).join("\n");
  const msg = lines + "\n\nTotal: Rs " + total + "\n\nSend order via WhatsApp?";
  if(confirm(msg)){
    // prepare whatsapp text
    const text = encodeURIComponent("Order from Sanaya:\n\n" + lines + "\n\nTotal: Rs " + total + "\n\nName:\nAddress:\nPhone:");
    window.open("https://wa.me/447308416877?text=" + text, "_blank");
  }
}

// clear cart
function clearCart(){
  if(confirm("Clear cart?")){
    localStorage.removeItem('sanaya_cart');
    updateCartBubble();
    alert("Cart cleared");
  }
}
