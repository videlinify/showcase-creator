class VID_ContentSwitch {
  constructor(elements = [], insertTo = document.body, args = {}) {
    args = { switched: [], insertFunc: 'append', switchProp: 'checked', onSwitch: null, disabled: false, hideMode: false, multiMode: false, animate: false, duration: 100, easing: 'ease', fixedSize: true, ...args };
    this.elements = elements.map(e => {
      let obj = { switch: null, content: null };
      if (typeof e === 'object' && !e.tagName) {
        obj.switch = e.switch;
        obj.content = ('content' in e ? [e.content].flat() : []);
      }
      else { obj.content = [e].flat(); }
      return obj;
    });
    this.switchProp = args.switchProp;
    this.fixedSize = args.fixedSize;
    this.insertFunc = args.insertFunc;
    if (this.fixedSize && this.insertFunc === 'append') {
      let els = [], widths = [], heights = [];
      this.elements.forEach(e => { els.push(...e.content); });
      els.forEach(e => { const rect = e.getBoundingClientRect(); widths.push(rect.width); heights.push(rect.height); });
      insertTo.style.minWidth = Math.max(...widths)+'px';
      insertTo.style.minHeight = Math.max(...heights)+'px';
    }
    this.hideMode = args.hideMode;
    this.multiMode = args.multiMode;
    this.insertTo = insertTo;
    this.anim = { prop: args.animate, duration: args.duration, easing: args.easing };
    this.removing = null;
    this.switched = args.switched.length ? args.switched : this.elements.filter(el => el.switch && el.switch[this.switchProp]);
    args.onSwitch && (this.onSwitch = args.onSwitch);
    this.elements.forEach((el, i) => {
      if (el.switch) { el.switch.addEventListener('change', () => this.switch(el, el.switch[this.switchProp])); }
    });
    this.disabled = args.disabled;
  }
  get switched() { return this.multiMode ? this._switched : this._switched[0]; }
  set switched(els) {
    this._switched = [els].flat().filter(el => this.elements.indexOf(el) !== -1 || typeof el === 'number').map(el => typeof el === 'number' ? this.elements[el] : el);
    if (!this.multiMode) { this._switched = this._switched.slice(0,1); }
    this.elements.filter(f => !this._switched.includes(f) && this.isOn(f)).forEach(el => this.delete(el));
    this._switched.forEach(el => {
      if (!this.multiMode && this.removing) { setTimeout(() => this.insert(el), this.anim.duration); }
      else { this.insert(el); }
    });
    if (this.onSwitch) { this.onSwitch.call(null, this); }
  }
  isOn(el) {
    el = this.getElement(el);
    if (!el) { return null; }
    return el.content.every(f => this.hideMode ? !f.classList.contains('vid-hidden') : document.body.contains(f));
  }
  get index() { return this.multiMode ? this._switched.map(s => this.elements.indexOf(s)) : this.elements.indexOf(this._switched[0]); }
  getElement(el) { return (typeof el === 'number' ? this.elements[el] : el); }
  get disabled() { return this._disabled; }
  set disabled(v) { this._disabled = v; this.elements.filter(e => e.switch).forEach(e => { e.switch.disabled = v; }); }
  switch(el, state = this.multiMode ? null : true) {
    el = this.getElement(el);
    if (!el) { return; }
    state = state === null ? (this._switched.indexOf(el) === -1 ? true : false) : Boolean(state);
    const idx = this._switched.indexOf(el);
    if (!state && idx !== -1) { this.switched = this._switched.filter(f => f !== el); }
    if (state && idx === -1) { this.switched = this.multiMode ? [...this._switched, el] : el; }
  }
  insert(el, anim = Boolean(this.anim.prop)) {
    el = this.getElement(el);
    if (!el) { return; }
    el.switch && (el.switch[this.switchProp] = true);
    if (this.isOn(el)) { return; }
    if (this.hideMode) { el.content.forEach(c => c.classList.remove('vid-hidden')); }
    else {
      this.insertFunc === 'before' && (this.insertTo.before(...(el.content)));
      this.insertFunc === 'after' && (this.insertTo.after(...(el.content)));
      this.insertFunc === 'append' && (this.insertTo.append(...(el.content)));
    }
    if (anim) { this.animate(el, true); }
  }
  delete(el, anim = Boolean(this.anim.prop)) {
    el = this.getElement(el);
    if (!el) { return; }
    el.switch && (el.switch[this.switchProp] = false);
    if (!this.isOn(el)) { return; }
    if (anim) {
      this.removing = el;
      this.animate(el, false);
    }
    else { el.content.forEach(c => this.hideMode ? c.classList.add('vid-hidden') : c.remove()); }
  }
  animate(el, switched) {
    el = this.getElement(el);
    if (!el || !this.anim.prop) { return; }
    const options = { duration: this.anim.duration, easing: this.anim.easing };
    el.content.forEach(c => {
      const rect = c.getBoundingClientRect();
      let keyframes = [];
      switch(this.anim.prop) {
        case 'width': keyframes = [{ width: rect.width+'px' }, { width: 0 }]; break;
        case 'height': keyframes = [{ height: rect.height+'px' }, { height: 0 }]; break;
        case 'scale': keyframes = [{ transform: 'scale(1)' }, { transform: 'scale(0)' }]; break;
        case 'from-left': keyframes = [{ transform: 'translateX(0)' }, { transform: 'translateX(-'+window.innerWidth+'px)' }]; break;
        case 'from-top': keyframes = [{ transform: 'translateY(0)' }, { transform: 'translateY(-'+window.innerHeight+'px)' }]; break;
        case 'opacity': keyframes = [{ opacity: 0 }, { opacity: 1 }]; break;
      }
      if (switched) { keyframes.reverse(); }
      c.style.overflow = 'hidden';
      c.animate(keyframes, options);
      setTimeout(() => {
        c.style.overflow = null;
        if (!switched) { this.hideMode ? c.classList.add('vid-hidden') : c.remove(); this.removing = null; }
      }, options.duration);
    });
  }
}
