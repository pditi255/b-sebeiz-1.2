let codeOK = false;

function checkCode() {
  const input = document.getElementById('kitchenCode').value;
  if (input === '885700') {
    codeOK = true;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('kitchenPanel').style.display = 'block';
    loadOrders();
    loadMenu();
    setInterval(loadOrders, 5000);
  } else {
    alert("Falscher Code");
  }
}

async function loadOrders() {
  const res = await fetch('/orders');
  const data = await res.json();
  const container = document.getElementById('orderList');
  const menuCounter = {};

  container.innerHTML = '';

  data
    .filter(o => o.status !== 'abgeschlossen')
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .forEach((order, i) => {
      const div = document.createElement('div');
      div.className = 'order-block';

      const items = order.items.map(item => {
        if (!menuCounter[item.name]) menuCounter[item.name] = 0;
        menuCounter[item.name] += item.count;
        return `${item.count}× ${item.name}`;
      }).join(', ');

      div.innerHTML = `
        <strong>Tisch ${order.table || '-'}</strong> – ${items}<br>
        Status: ${order.status || 'bestellt'}<br>
        <button onclick="updateStatus(${i}, 'bezahlt')">Bezahlt</button>
        <button onclick="updateStatus(${i}, 'in bearbeitung')">In Bearbeitung</button>
        <button onclick="updateStatus(${i}, 'abholbereit')">Abholbereit</button>
        <button onclick="updateStatus(${i}, 'abgeschlossen')">✔️ Abschliessen</button>
      `;
      container.appendChild(div);
    });

  const menuList = document.getElementById('menuCounts');
  menuList.innerHTML = '';
  for (let key in menuCounter) {
    const li = document.createElement('li');
    li.textContent = `${key}: ${menuCounter[key]}x`;
    menuList.appendChild(li);
  }
}

async function updateStatus(index, status) {
  const res = await fetch(`/update-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, status })
  });
  if (res.ok) loadOrders();
}

function toggleMenuEdit() {
  const editor = document.getElementById('menuEdit');
  editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
}

async function loadMenu() {
  const res = await fetch('/menu.json');
  const data = await res.json();
  const container = document.getElementById('menuEditor');
  container.innerHTML = '';

  data.forEach((item, index) => {
    container.innerHTML += `
      <div>
        <input value="${item.name}" id="name-${index}">
        <input type="number" value="${item.price}" id="price-${index}" style="width:60px;"> CHF
      </div>
    `;
  });
}

async function saveMenu() {
  const res = await fetch('/menu.json');
  const data = await res.json();

  const newMenu = data.map((_, i) => ({
    name: document.getElementById(`name-${i}`).value,
    price: parseFloat(document.getElementById(`price-${i}`).value)
  }));

  await fetch('/save-menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMenu)
  });

  alert("Menü gespeichert");
}
