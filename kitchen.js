let menu = {};
let orders = [];

async function loadMenu() {
  const res = await fetch('/menu.json');
  menu = await res.json();
  renderMenuEditor();
}

async function loadOrders() {
  const res = await fetch('/orders.json');
  orders = await res.json();
  renderOrders();
  renderSummary();
}

function renderOrders() {
  const list = document.getElementById('order-list');
  list.innerHTML = '';

  // Älteste Bestellungen zuerst
  orders.sort((a, b) => new Date(a.time) - new Date(b.time));

  orders.forEach((order, index) => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <b>Tisch ${order.table}</b><br/>
      ${order.items.map(i => `${i.name} × ${i.count}`).join('<br>')}<br/>
      <i>${new Date(order.time).toLocaleTimeString()}</i><br/>
      <button onclick="markDone(${index})">✅ Erledigt</button>
    `;
    list.appendChild(div);
  });
}

function markDone(index) {
  orders.splice(index, 1);
  saveOrders();
}

function saveOrders() {
  fetch('/orders.json', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(orders)
  }).then(loadOrders);
}

function renderSummary() {
  const summary = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      summary[item.name] = (summary[item.name] || 0) + item.count;
    });
  });

  const sumDiv = document.getElementById('summary');
  sumDiv.innerHTML = Object.entries(summary)
    .map(([name, count]) => `<div>${name}: <b>${count}</b></div>`)
    .join('');
}

function toggleMenu() {
  const panel = document.getElementById('menu-settings');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  renderMenuEditor();
}

function renderMenuEditor() {
  const container = document.getElementById('menu-edit-container');
  container.innerHTML = '';

  ['speisen', 'getraenke'].forEach(type => {
    const title = document.createElement('h3');
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    container.appendChild(title);

    menu[type].forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <input value="${item.name}" onchange="menu['${type}'][${idx}].name = this.value" />
        <input type="number" value="${item.price}" onchange="menu['${type}'][${idx}].price = parseFloat(this.value)" />
      `;
      container.appendChild(div);
    });
  });
}

function saveMenu() {
  fetch('/menu.json', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(menu, null, 2)
  }).then(() => alert("Menü gespeichert"));
}

// Intervall alle 5 Sekunden
loadMenu();
loadOrders();
setInterval(loadOrders, 5000);
