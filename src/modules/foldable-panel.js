class VID_FoldablePanel {
  constructor(header, body, args) {
    args = { classList: '', active: true, disabled: false, arrow: true, style: {}, ...args };
    this.headerEl = VID_NewEl('div', { classList: 'vid-foldable-panel-header' });
    this.bodyEl = VID_NewEl('div', { classList: 'vid-foldable-panel-body' });
    this.header = header;
    this.body = body;
    this.headerEl.addEventListener('click', () => this.active = !this.active);
    this.element = VID_NewEl('div', { classList: (args.classList ? args.classList+' ' : '')+'vid-foldable-panel' }, { 'data-active': Boolean(args.active) }, args.style, this.headerEl, this.bodyEl);
    this.arrowEl = VID_NewEl('div', { classList: 'vid-foldable-panel-arrow' });
    this.arrow = args.arrow;
    this.active = args.active;
  }
  set header(v) {
    if (typeof v === 'object' && 'tagName' in v) { this.headerEl.classList.add(...v.classList); v = v.innerHTML; }
    const inner = this.headerEl.querySelector('vid-foldable-panel-inner') || VID_NewEl('div', { classList: 'vid-foldable-panel-inner' });
    inner.innerHTML = v;
    this.headerEl.appendChild(inner);
    this.arrow && (this.headerEl.appendChild(this.arrowEl));
  }
  get header() {
    return this.headerEl.querySelector('.vid-foldable-panel-inner').innerHTML;
  }
  set body(v) {
    if (typeof v === 'object' && 'tagName' in v) { this.bodyEl.classList.add(...v.classList); v = v.innerHTML; }
    const inner = this.bodyEl.querySelector('vid-foldable-panel-inner') || VID_NewEl('div', { classList: 'vid-foldable-panel-inner' });
    inner.innerHTML = v;
    this.bodyEl.appendChild(inner);
  }
  get body() {
    return this.bodyEl.querySelector('.vid-foldable-panel-inner').innerHTML;
  }
  set arrow(v) {
    v = Boolean(v);
    this._arrow = v;
    v ? this.headerEl.appendChild(this.arrowEl) : this.arrowEl.remove();
  }
  get arrow() { return this._arrow; }
  set active(v) {
    v = Boolean(v);
    this.element.setAttribute('data-active', v);
    this.arrowEl.innerHTML = (v ? '&#9650;' : '&#9660;');
    v ? this.open() : this.close();
  }
  get active() { return this.element.getAttribute('data-active') === 'false' ? false : true; }
  open() {
    const current = this.bodyEl.getBoundingClientRect().height;
    this.bodyEl.style.height = '100%';
    const full = this.bodyEl.getBoundingClientRect().height;
    if (current === full) { return; }
    this.bodyEl.animate([{ height: current+'px' }, { height: full+'px' }], { duration: ms, easing: 'ease' });
  }
  close() {
    const current = this.bodyEl.getBoundingClientRect().height;
    if (current === 0) { return; }
    this.bodyEl.animate([{ height: current+'px' }, { height: 0 }], { duration: ms, easing: 'ease' });
    this.bodyEl.style.height = 0;
  }
  static convert(container, header = container.children[0], body = Array.from(container.children).pop(), args = { classList: container.classList, style: container.style }) {
    const el = new VID_FoldablePanel(header, body, args);
    container.replaceWith(el.element);
  }
}
window.addEventListener('DOMContentLoaded', () => {
  Array.from(document.querySelectorAll('.vid-foldable-panel')).forEach(fp => VID_FoldablePanel.convert(fp));
});
