let menu = [];
let cart = [];
const tableSelect = document.getElementById("table");
const menuContainer = document.getElementById("menuContainer");
const totalDisplay = document.getElementById("total");
const statusDisplay = document.getElementById("status");

async function loadMenu() {
  const res = await fetch("/menu.json");
  menu = await res.json();

  const food = menu.filter(item => item.type === "essen");
  const drinks = menu.filter(item => item.type === "getränk");

  menuContainer.innerHTML = "<h3>Menü</h3>";
  food.forEach(item => {
    const el = document.createElement("div");
    el.innerHTML = `${item.name} – ${item.price} CHF 
      <input type="number" min="0" value="0" data-name="${item.name}" data-price="${item.price}" onchange="updateCart()">`;
    menuContainer.appendChild(el);
  });

  menuContainer.innerHTML += "<h3>Getränke</h3>";
  drinks.forEach(item => {
    const el = document.createElement("div");
    el.innerHTML = `${item.name} – ${item.price} CHF 
      <input type="number" min="0" value="0" data-name="${item.name}" data-price="${item.price}" onchange="updateCart()">`;
    menuContainer.appendChild(el);
  });
}

function updateCart() {
  const inputs = menuContainer.querySelectorAll("input[type='number']");
  cart = [];
  let sum = 0;
  inputs.forEach(input => {
    const count = parseInt(input.value);
    if (count > 0) {
      const name = input.dataset.name;
      const price = parseFloat(input.dataset.price);
      sum += count * price;
      for (let i = 0; i < count; i++) cart.push(name);
    }
  });
  totalDisplay.textContent = sum.toFixed(2);
}

async function submitOrder() {
  const table = parseInt(tableSelect.value);
  const res = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, items: cart })
  });
  document.getElementById("status").textContent = "Bestellt";
}

async function updateStatus() {
  const table = parseInt(tableSelect.value);
  const res = await fetch("/status/" + table);
  const data = await res.json();
  statusDisplay.textContent = data.status || "-";
}

loadMenu();
setInterval(updateStatus, 4000);
