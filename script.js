let currentOrderId = null;

async function loadMenu() {
  const res = await fetch('/menu.json');
  const menu = await res.json();

  const container = document.getElementById('menuContainer');
  container.innerHTML = '';

  for (const section of ['speisen', 'getraenke']) {
    const title = document.createElement('h2');
    title.textContent = section === 'speisen' ? 'Speisen' : 'Getränke';
    container.appendChild(title);

    menu[section].forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = 'menu-item';

      const label = document.createElement('label');
      label.textContent = `${item.name} – CHF ${item.price}`;

      const input = document.createElement('input');
      input.type = 'number';
      input.min = 0;
      input.max = 10;
      input.value = 0;
      input.name = item.name;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      container.appendChild(wrapper);
    });
  }
}

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const tableNumber = form.tableNumber.value;
  const inputs = form.querySelectorAll('input[type="number"]');
  const items = [];

  inputs.forEach(input => {
    const count = parseInt(input.value);
    if (count > 0) {
      items.push({ name: input.name, quantity: count });
    }
  });

  if (items.length === 0) return alert('Bitte wähle mindestens ein Menü oder Getränk.');

  const res = await fetch('/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: tableNumber, items })
  });

  const data = await res.json();
  currentOrderId = data.id;

  document.getElementById('orderStatus').innerHTML = `<p>Bestellung aufgenommen. <strong>Status:</strong> <span class="status status-bestellt">Bestellt</span></p>`;
});

async function pollStatus() {
  if (!currentOrderId) return;
  const res = await fetch(`/status/${currentOrderId}`);
  const data = await res.json();
  const status = data.status;

  let text = 'Bestellt';
  let className = 'status-bestellt';

  if (status === 'bezahlt') {
    text = 'Bezahlt';
    className = 'status-bezahlt';
  } else if (status === 'in_bearbeitung') {
    text = 'In Bearbeitung';
    className = 'status-bereit';
  } else if (status === 'abholbereit') {
    text = 'Abholbereit';
    className = 'status-erledigt';
  }

  document.getElementById('orderStatus').innerHTML = `<p><strong>Status:</strong> <span class="status ${className}">${text}</span></p>`;
}

setInterval(pollStatus, 5000);
loadMenu();
