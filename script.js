// Simple Add to Cart System
let cart = [];

function addToCart(product) {
  cart.push(product);
  alert(product + " added to cart!");
  console.log("Cart:", cart);
}

function showCart() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
  } else {
    alert("Items in cart:\n" + cart.join("\n"));
  }
}
