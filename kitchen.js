let orders = [];
let menu = {};
let mode = 'kueche';

async function loadOrders() {
  const res = await fetch('/orders');
  orders = await res.json();
  renderOrders();
  renderSummary();
}

async function loadMenu() {
  const res = await fetch('/menu.json');
  menu = await res.json();
  renderMenuEdit();
}

function renderOrders() {
  const list = document.getElementById('order-list');
  list.innerHTML = '';

  // Älteste zuerst
  orders
    .filter(o => o.status !== 'abgeschlossen')
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .forEach(order => {
      const div = document.createElement('div');
      div.className = 'order-block';

      const statusClass = `status ${order.status.replace(/\s/g, '')}`;

      div.innerHTML = `
        <strong>Tisch: ${order.tisch || '—'}</strong><br>
        ${order.items.map(i => `${i.menge}x ${i.name}`).join('<br>')}
        <br><span class="${statusClass}">${order.status}</span>
        <br>
        <button onclick="updateStatus('${order.id}', 'bezahlt')">Bezahlt</button>
        <button onclick="updateStatus('${order.id}', 'inBearbeitung')">In Bearbeitung</button>
        <button onclick="updateStatus('${order.id}', 'abholbereit')">Abholbereit</button>
        <button onclick="updateStatus('${order.id}', 'abgeschlossen')">✓ Abgeschlossen</button>
      `;
      list.appendChild(div);
    });
}

function renderSummary() {
  const map = new Map();
  orders
    .filter(o => o.status !== 'abgeschlossen')
    .forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        map.set(key, (map.get(key) || 0) + item.menge);
      });
    });

  const div = document.getElementById('summary');
  div.innerHTML = '';
  map.forEach((count, name) => {
    const p = document.createElement('p');
    p.textContent = `${name}: ${count}x`;
    div.appendChild(p);
  });
}

async function updateStatus(id, newStatus) {
  await fetch('/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: newStatus })
  });
  loadOrders();
}

function toggleMenu() {
  const panel = document.getElementById('menu-settings');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  loadMenu();
}

function renderMenuEdit() {
  const container = document.getElementById('menu-edit-container');
  container.innerHTML = '';

  const addRow = (item, type, index) => {
    const row = document.createElement('div');
    row.className = 'menu-item';
    row.innerHTML = `
      <input type="text" value="${item.name}" onchange="menu['${type}'][${index}].name = this.value">
      <input type="number" value="${item.preis}" onchange="menu['${type}'][${index}].preis = parseFloat(this.value)">
    `;
    container.appendChild(row);
  };

  ['speisen', 'getraenke'].forEach(type => {
    const title = document.createElement('h3');
    title.textContent = type === 'speisen' ? 'Speisen' : 'Getränke';
    container.appendChild(title);

    menu[type].forEach((item, index) => addRow(item, type, index));
  });
}

async function saveMenu() {
  await fetch('/menu/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menu)
  });
  alert('Menü gespeichert');
  loadOrders();
}

loadOrders();
setInterval(loadOrders, 5000);
