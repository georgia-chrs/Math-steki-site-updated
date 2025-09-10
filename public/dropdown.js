
// Dropdown arrow rotation & close on outside click
function setupDropdownArrow(dropdownId, menuId, allDropdowns) {
  const dropdown = document.getElementById(dropdownId);
  const menu = document.getElementById(menuId);
  const link = dropdown.querySelector('a');
  const arrow = dropdown.querySelector('.arrow');
  link.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // Κλείσε όλα τα άλλα dropdown
    allDropdowns.forEach(obj => {
      if (obj.menu !== menu) {
        obj.menu.classList.remove('open');
        const otherArrow = obj.dropdown.querySelector('.arrow');
        if (otherArrow) otherArrow.classList.remove('open');
      }
    });
    // Άνοιξε/κλείσε το τρέχον
    menu.classList.toggle('open');
    arrow.classList.toggle('open');
  });
}
const dropdowns = [
  {dropdown: document.getElementById('dropdownBtn'), menu: document.getElementById('dropdownMenu')},
  {dropdown: document.getElementById('dropdownBtn2'), menu: document.getElementById('dropdownMenu2')}
];
dropdowns.forEach(obj => setupDropdownArrow(obj.dropdown.id, obj.menu.id, dropdowns));

// Κλείσιμο όλων των dropdown όταν πατάς εκτός
window.addEventListener('click', function() {
  dropdowns.forEach(obj => {
    obj.menu.classList.remove('open');
    const arrow = obj.dropdown.querySelector('.arrow');
    if (arrow) arrow.classList.remove('open');
  });
});
