
const products = [
  {id:1, name:"Red Dress", price:"$49", image:"images/product1.png"},
  {id:2, name:"Blue Kurta", price:"$35", image:"images/product2.png"},
  {id:3, name:"Green Saree", price:"$59", image:"images/product3.png"},
  {id:4, name:"Black Abaya", price:"$65", image:"images/product4.png"},
  {id:5, name:"White Scarf", price:"$15", image:"images/product5.png"},
  {id:6, name:"Casual Shirt", price:"$25", image:"images/product6.png"},
  {id:7, name:"Denim Jeans", price:"$40", image:"images/product7.png"},
  {id:8, name:"Formal Suit", price:"$80", image:"images/product8.png"},
  {id:9, name:"Yellow Gown", price:"$70", image:"images/product9.png"},
  {id:10, name:"Pink Top", price:"$30", image:"images/product10.png"}
];

let container = document.getElementById("products");
products.forEach(p => {
  let div = document.createElement("div");
  div.className = "product";
  div.innerHTML = `<img src="${p.image}" width="150"><h3>${p.name}</h3><p>${p.price}</p>`;
  container.appendChild(div);
});
