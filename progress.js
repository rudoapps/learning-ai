// Progress tracking via localStorage
const PROGRESS = {
  KEY: 'ia-learning-progress',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { return {}; }
  },

  markSeen(id) {
    const p = this.get();
    if (!p[id]) {
      p[id] = Date.now();
      localStorage.setItem(this.KEY, JSON.stringify(p));
    }
    this.updateUI();
  },

  isSeen(id) {
    return !!this.get()[id];
  },

  count() {
    return Object.keys(this.get()).length;
  },

  updateUI() {
    // Update badge in nav if exists
    const badge = document.querySelector('.progress-badge');
    if (badge) {
      const total = typeof CONCEPTS !== 'undefined' ? CONCEPTS.length : 26;
      const seen = this.count();
      badge.textContent = `${seen}/${total}`;
      badge.style.display = seen > 0 ? 'inline-block' : 'none';
    }
    // Update cheatsheet cards
    document.querySelectorAll('.card[data-id]').forEach(card => {
      if (this.isSeen(card.dataset.id)) {
        card.classList.add('seen');
      }
    });
  },

  injectNavBadge() {
    const nav = document.querySelector('.gnav');
    if (!nav) return;
    const badge = document.createElement('span');
    badge.className = 'progress-badge';
    badge.style.display = 'none';
    nav.appendChild(badge);
    this.updateUI();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  PROGRESS.injectNavBadge();

  // If on a concept page, mark as seen
  if (typeof CONCEPT_ID !== 'undefined') {
    PROGRESS.markSeen(CONCEPT_ID);
  }
});
