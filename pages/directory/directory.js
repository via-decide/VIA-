let savedBusinesses = JSON.parse(localStorage.getItem('kutchmap_saved')) || [];
let currentFilter = 'all';
let searchQuery = '';

function getCards() {
  return Array.from(document.querySelectorAll('.dir-card[data-category]'));
}

function getCardName(card) {
  return card.dataset.name || '';
}

function updateSavedButtons(cards = getCards()) {
  cards.forEach((card) => {
    const saveButton = card.querySelector('.save-btn');
    if (!saveButton) return;

    const isSaved = savedBusinesses.includes(getCardName(card));
    saveButton.textContent = isSaved ? '★' : '☆';
    saveButton.classList.toggle('is-saved', isSaved);
    saveButton.setAttribute('aria-pressed', String(isSaved));
  });
}

function updateFilterCounts(cards = getCards()) {
  const counts = {
    all: cards.length,
    saved: cards.filter((card) => savedBusinesses.includes(getCardName(card))).length,
  };

  cards.forEach((card) => {
    const category = card.dataset.category;
    counts[category] = (counts[category] || 0) + 1;
  });

  document.querySelectorAll('.filter-btn').forEach((button) => {
    const badge = button.querySelector('.filter-count');
    if (!badge) return;
    badge.textContent = counts[button.dataset.cat] || 0;
  });
}

function toggleSave(name) {
  if (savedBusinesses.includes(name)) {
    savedBusinesses = savedBusinesses.filter((businessName) => businessName !== name);
  } else {
    savedBusinesses.push(name);
  }

  localStorage.setItem('kutchmap_saved', JSON.stringify(savedBusinesses));
  updateSavedButtons();
  updateFilterCounts();
  render();
}

function matchesFilter(card) {
  if (currentFilter === 'all') return true;
  if (currentFilter === 'saved') return savedBusinesses.includes(getCardName(card));
  return card.dataset.category === currentFilter;
}

function matchesSearch(card) {
  if (!searchQuery) return true;
  return card.textContent.toLowerCase().includes(searchQuery);
}

function render() {
  const cards = getCards();
  const emptyState = document.getElementById('directoryEmpty');
  let visibleCount = 0;

  cards.forEach((card) => {
    const isVisible = matchesFilter(card) && matchesSearch(card);
    card.style.display = isVisible ? 'flex' : 'none';
    if (isVisible) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}

function bindFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.cat;
      render();
    });
  });
}

function bindSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    render();
  });
}

function bindSaveButtons() {
  document.querySelectorAll('.save-btn').forEach((button) => {
    button.addEventListener('click', () => {
      toggleSave(button.dataset.business || '');
    });
  });
}

function bindClaimButtons() {
  document.querySelectorAll('.claim-btn').forEach((button) => {
    button.addEventListener('click', openModal);
  });
}

function openModal(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('claimModal');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('claimModal');
  if (modal) modal.style.display = 'none';
}

function verifyClaim() {
  const input = document.getElementById('claimInput');
  const value = input ? input.value.trim() : '';

  if (value.length === 12) {
    alert('Thanks! Our Kutch team will verify your UTR and reach out to you shortly to set up your listing.');
    closeModal();
    return;
  }

  alert('Please enter a valid 12-digit UTR code.');
}

function init() {
  const cards = getCards();
  updateSavedButtons(cards);
  updateFilterCounts(cards);
  bindFilterButtons();
  bindSearch();
  bindSaveButtons();
  bindClaimButtons();
  render();
}

window.openModal = openModal;
window.closeModal = closeModal;
window.verifyClaim = verifyClaim;

document.addEventListener('DOMContentLoaded', init);
