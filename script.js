let cart = [];
let menu = [];

const menuContainer = document.getElementById("menuContainer");
const totalDisplay = document.getElementById("total");
const statusDisplay = document.getElementById("status");
const tableSelect = document.getElementById("table");

async function loadMenu() {
  const res = await fetch("/menu.json");
  menu = await res.json();

  const essen = menu.filter(item => item.type === "essen");
  const getraenke = menu.filter(item => item.type === "getränk");

  menuContainer.innerHTML = "<h3>Speisen</h3>";
  essen.forEach(item => {
    menuContainer.innerHTML += `
      <div>${item.name} (${item.price} CHF)
        <input type="number" min="0" value="0" data-name="${item.name}" data-price="${item.price}" onchange="updateCart()">
      </div>`;
  });

  menuContainer.innerHTML += "<h3>Getränke</h3>";
  getraenke.forEach(item => {
    menuContainer.innerHTML += `
      <div>${item.name} (${item.price} CHF)
        <input type="number" min="0" value="0" data-name="${item.name}" data-price="${item.price}" onchange="updateCart()">
      </div>`;
  });
}

function updateCart() {
  cart = [];
  let sum = 0;
  const inputs = document.querySelectorAll("input[type='number']");
  inputs.forEach(input => {
    const count = parseInt(input.value);
    if (count > 0) {
      const name = input.dataset.name;
      const price = parseFloat(input.dataset.price);
      for (let i = 0; i < count; i++) {
        cart.push(name);
        sum += price;
      }
    }
  });
  totalDisplay.textContent = sum.toFixed(2);
}

async function submitOrder() {
  const table = parseInt(tableSelect.value);
  await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, items: cart })
  });
  statusDisplay.textContent = "Bestellt";
}

async function updateStatus() {
  const table = tableSelect.value;
  const res = await fetch(`/status/${table}`);
  const data = await res.json();
  statusDisplay.textContent = data.status || "-";
}

loadMenu();
setInterval(updateStatus, 4000);
