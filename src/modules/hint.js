class VID_Hint {
  constructor(content, attachTo = null, args = {}) {
    this.args = { position: 'mouse', maxWidth: 240, duration: null, ...args };
    this.hint = VID_NewEl('div', { classList: 'vid-hint', innerHTML: content });
    this.element = attachTo;
    if (attachTo) {
      this.element.addEventListener('mouseenter', (e) => this.open(this.args.position === 'mouse' ? e : this.args.position));
      this.element.addEventListener('mousemove', (e) => this.setPosition(e));
      this.element.addEventListener('mouseleave', () => this.close());
      this.element.style.cursor = 'help';
    }
    this.hint.style.maxWidth = this.args.maxWidth + 'px';
  }
  open(e) {
    document.body.appendChild(this.hint);
    this.setPosition(e);
    if (this.args.duration && !isNaN(parseInt(this.args.duration))) {
      setTimeout(() => {
        this.hint.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
        setTimeout(() => this.close(), 500);
      }, parseInt(this.args.duration));
    }
    this.onOpen && (this.onOpen.call(null, this, e));
  }
  close() { this.hint.remove(); this.onClose && this.onClose.call(null, this); }
  setPosition(e) {
    const rect = this.hint.getBoundingClientRect();
    this.hint.style.position = 'fixed';
    if (e instanceof Event) {
      this.hint.style.left = Math.min(pos.clientX+1, window.innerWidth-rect.width) + 'px';
      this.hint.style.top = Math.min(pos.clientY+1, window.innerHeight-rect.height) + 'px';
    }
    else if (e === 'centered') { this.hint.style.left = '50%'; this.hint.style.top = '50%'; this.hint.style.transform = 'translate(-50%, -50%)'; }
    else if (this.element) { const rect2 = this.element.getBoundingClientRect(); this.hint.style.left = rect2.x + 'px'; this.hint.style.top = rect2.bottom + 'px'; }
    else {
      'position' in e && (this.hint.style.position = e.position);
      'x' in e && (this.hint.style.left = e.x);
      'y' in e && (this.hint.style.top = e.y);
    }
  }
  set content(v) { this.hint.innerHTML = v; }
  get content() { return this.hint.innerHTML; }
  static convert(content, attachTo, args = {}) {
    const control = new VID_Hint(content.innerHTML, attachTo, { position: 'mouse', ...args });
    content.remove();
    return control;
  }
  static create(str, args = {}) {
    const content = VID_NewEl('span', { textContent: str }),
          attachTo = VID_NewEl('div', { classList: 'vid-hint-on-hover', textContent: '?' }),
          control = new VID_Hint(content.innerHTML, attachTo, { position: 'mouse', ...args });
    return control;
  }
  static fade(str, pos = 'centered', dur = 1000) {
    const content = VID_NewEl('span', { textContent: str }),
          control = new VID_Hint(content.innerHTML, null, { position: pos, onClose: (c) => delete this, duration: 1000 });
    control.open(pos);
    return control;
  }
}
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.vid-hint-auto').forEach((h) => {
    const hoh = VID_NewEl('div', { classList: 'vid-hint-on-hover', textContent: '?' });
    h.before(hoh);
    VID_Hint.convert(h, hoh);
  });
});
