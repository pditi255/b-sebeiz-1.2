const table = document.getElementById('table').value;
await fetch('/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: punkt, table: parseInt(table) })
});
