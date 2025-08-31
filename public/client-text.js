document.querySelectorAll('.footer-links').forEach(el => {
  el.addEventListener('blur', async () => {
    const id = el.getAttribute('data-id');
    const content = el.innerText;
    await fetch('/save-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content })
    });
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/footer-links');
  const data = await res.json();
  document.querySelectorAll('.footer-links').forEach(el => {
    const id = el.getAttribute('data-id');
    if (data[id]) el.innerText = data[id];
  });
});