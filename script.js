const mobileButton = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
function closeMenu() {
  mobileMenu.hidden = true;
  mobileButton.setAttribute('aria-expanded', 'false');
}
mobileButton.addEventListener('click', () => {
  mobileMenu.hidden = !mobileMenu.hidden;
  mobileButton.setAttribute('aria-expanded', String(!mobileMenu.hidden));
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!mobileMenu.hidden && !event.target.closest('nav')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    mobileButton.focus();
  }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    const dialog = document.getElementById(button.dataset.dialog);
    if (button.classList.contains('artwork')) {
      const image = dialog.querySelector('.detail-image img');
      const title = button.dataset.title || 'Sample Work';
      const source = button.dataset.image ?? '/assets/sample-work.jpg';
      image.hidden = !source;
      if (source) image.src = source;
      image.alt = title;
      dialog.querySelector('h2').textContent = title;
      dialog.querySelector('.body-copy').textContent = button.dataset.description || 'Share your story with us, and we will turn your name into a one-of-a-kind hand-drawn artwork. From your favorite sports and music to your biggest dreams, every detail is sketched right into the letters.';
      let fallback = dialog.querySelector('.image-unavailable');
      if (!fallback) {
        fallback = document.createElement('p');
        fallback.className = 'image-unavailable';
        fallback.textContent = 'Karthik — Studio Draft · Image coming soon';
        image.after(fallback);
      }
      fallback.hidden = Boolean(source);
    }
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.scrollTop = 0;
    dialog.querySelector('h2').focus({ preventScroll: true });
  });
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
});


// Estimates stay in the browser; the visitor sends the brief through WhatsApp.
const calculatorOptions = document.querySelectorAll('.calc-opt');
function selectedOption(group) {
  return document.querySelector(`.calc-opt[data-group="${group}"][aria-pressed="true"]`).dataset;
}
function currentEstimate() {
  const size = selectedOption('size');
  const density = selectedOption('density');
  const frame = selectedOption('frame');
  return { size, density, frame, total: Number(size.price) + Number(density.price) + Number(frame.price) };
}
const rupees = value => `₹${value.toLocaleString('en-IN')}`;
calculatorOptions.forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll(`.calc-opt[data-group="${button.dataset.group}"]`).forEach(option => {
    option.setAttribute('aria-pressed', String(option === button));
  });
  const { size, density, total } = currentEstimate();
  const hours = Number(size.hours) + Number(density.hours);
  document.getElementById('est-hours').textContent = `${hours} to ${hours + (Number(size.hours) === 2 ? 1 : 3)} Hours`;
  document.getElementById('est-days').textContent = size.days;
  document.getElementById('est-price').textContent = rupees(total);
}));
document.getElementById('lock-commission')?.addEventListener('click', () => {
  const { size, density, frame, total } = currentEstimate();
  document.getElementById('disc-tier').value = `${size.label} • ${density.label} • ${frame.label} — Est. ${rupees(total)}`;
  document.getElementById('discovery').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.getElementById('disc-name').focus({ preventScroll: true });
});
document.getElementById('disc-name')?.addEventListener('input', event => {
  const container = document.getElementById('letter-pills-container');
  container.replaceChildren();
  const letters = Array.from(event.target.value.toUpperCase()).filter(letter => /\p{L}/u.test(letter));
  if (!letters.length) {
    container.textContent = 'Live motif breakdown will appear here as you type...';
  }
  letters.forEach((letter, index) => {
    const pill = document.createElement('span');
    pill.className = 'motif-pill';
    pill.textContent = `${letter} (Motif #${index + 1})`;
    container.append(pill);
  });
});
document.getElementById('discovery-brief')?.addEventListener('submit', event => {
  event.preventDefault();
  const nameInput = document.getElementById('disc-name');
  const name = nameInput.value.trim();
  nameInput.setCustomValidity(name ? '' : 'Please enter the name to be illustrated.');
  if (!nameInput.reportValidity()) {
    nameInput.addEventListener('input', () => nameInput.setCustomValidity(''), { once: true });
    return;
  }
  const tier = document.getElementById('disc-tier').value;
  const stories = document.getElementById('disc-stories').value.trim();
  const message = `*NAMACHITRA - STORY BRIEF DISCOVERY*\n\n*Name to Illustrate:* ${name}\n*Specification:* ${tier}\n\n${stories ? `*Story Motifs & Milestones:*\n${stories}\n\n` : ''}_Sent via Namachitra Web Brief Builder_`;
  window.open(`https://wa.me/918904696566?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
