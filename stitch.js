const menu = document.querySelector('.stitch-menu');
const nav = document.querySelector('#site-nav');
const mobile = matchMedia('(max-width: 1024px)');
const drawer = document.createElement('dialog');
if (typeof drawer.showModal === 'function') {
  drawer.id = 'navigation-drawer';
  drawer.className = 'nav-drawer';
  drawer.setAttribute('aria-labelledby', 'drawer-title');
  drawer.innerHTML = `
    <div class="drawer-top">
      <p id="drawer-title">Explore Sanct Group</p>
      <button type="button" class="drawer-close" autofocus aria-label="Close menu">×</button>
    </div>
  `;
  const drawerNav = nav.cloneNode(true);
  drawerNav.removeAttribute('id');
  drawer.append(drawerNav);
  document.body.append(drawer);

  menu.setAttribute('aria-controls', drawer.id);
  menu.setAttribute('aria-haspopup', 'dialog');
  menu.hidden = false;
  nav.classList.add('drawer-enabled');

  menu.addEventListener('click', () => {
    drawer.showModal();
    menu.setAttribute('aria-expanded', 'true');
  });
  drawer.querySelector('.drawer-close').addEventListener('click', () => drawer.close());
  drawerNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) drawer.close();
  });
  drawer.addEventListener('close', () => menu.setAttribute('aria-expanded', 'false'));
  drawer.addEventListener('click', (event) => {
    if (event.target !== drawer) return;
    const bounds = drawer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX >= bounds.right) drawer.close();
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches || !drawer.open) return;
    drawer.close();
    nav.querySelector('[aria-current="page"]').focus();
  });
}

const inquiry = document.querySelector('#inquiry');
inquiry?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(inquiry);
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('details')}`;
  document.querySelector('#inquiry-status').textContent = 'Send the draft from your email app when it opens.';
  window.location.href = `${inquiry.getAttribute('action')}?subject=RF%20antenna%20inquiry&body=${encodeURIComponent(body)}`;
});

const calculator = document.querySelector('#calculator');
if (calculator) {
  const frequency = calculator.elements.frequency;
  const unit = calculator.elements.unit;
  const error = document.querySelector('#frequency-error');
  const presets = calculator.querySelector('.frequency-presets');
  const outputs = ['full', 'half', 'quarter'].map((id) => document.getElementById(id));

  function updateLengths(showError = false) {
    const entry = frequency.value.trim();
    const value = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(entry)
      ? Number(entry.replace(',', '.'))
      : NaN;
    const wavelength = 299792458000 / (value * Number(unit.value));
    const valid = Number.isFinite(wavelength) && wavelength > 0;
    const message = !valid && showError ? 'Enter a frequency greater than zero, such as 2.4.' : '';
    if (error.textContent !== message) error.textContent = message;
    if (message) frequency.setAttribute('aria-invalid', 'true');
    else frequency.removeAttribute('aria-invalid');

    outputs.forEach((output, index) => {
      const length = wavelength / 2 ** index;
      const display = length < 0.01 || length >= 1e9 ? length.toExponential(2) : length.toFixed(2);
      const result = valid ? `${display} mm` : '—';
      if (output.textContent !== result) output.textContent = result;
    });
    return valid;
  }

  calculator.noValidate = true;
  presets.hidden = false;
  frequency.addEventListener('input', () => updateLengths());
  frequency.addEventListener('blur', () => updateLengths(Boolean(frequency.value.trim())));
  unit.addEventListener('change', () => updateLengths());
  presets.addEventListener('click', (event) => {
    const preset = event.target.closest('button[data-frequency]');
    if (!preset) return;
    frequency.value = preset.dataset.frequency;
    unit.value = preset.dataset.unit;
    updateLengths();
  });
  calculator.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!updateLengths(true)) frequency.focus();
  });
  updateLengths();
}


const motion = matchMedia('(prefers-reduced-motion: no-preference)');
if (motion.matches && 'IntersectionObserver' in window) {
  const details = document.querySelectorAll(
    '.hero-media, [data-reveal] > :is(.kicker, h1, h2, .intro, .actions, .pill, figure, .panel), .tiles article, .scene-inner > .rows > div, .faq details'
  );
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
  details.forEach((element) => observer.observe(element));
}
