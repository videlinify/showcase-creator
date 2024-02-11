class VID_Loading {
  constructor(args) {
    args = { appendTo: document.body, style: '', ...args };
    this.appendTo = args.appendTo;
    this.circle = VID_NewEl('div', { classList: 'vid-loading', innerHTML: '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>' });
    this.element = VID_NewEl('div', { classList: 'vid-loading-wrapper' }, {}, {}, this.circle);
    this.style = args.style;
  }
  open() {
    if (!document.body.contains(this.element)) { this.appendTo.appendChild(this.element); }
    this.element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms });
  }
  close() {
    this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms });
    setTimeout(() => this.element.remove(), ms);
  }
  set style(v) { typeof v === 'object' && (v = VID_cssObjToStr(v)); this.element.style = v; }
  get style() { return this.element.style; }
}
