class VID_NumberControl {
  constructor(args) {
    args = { label: '', value: '', id: null, name: null, hint: null, description: null, classList: '', min: null, max: null, step: 1, disabled: false, onInput: null, onChange: null, suffix: '', prefix: '', labelOnLeft: false, ...args };
    this._value = typeof Number(args.value) === 'number' ? Number(args.value) : 0;
    this.onInput = args.onInput;
    this.onChange = args.onChange;
    this.step = args.step ? parseFloat(args.step) : 1;
    this.precision = Number.isInteger(this.step) ? 0 : new String(this.step).split(".")[1].length;
    this.min = (args.min === null ? null : Number(args.min));
    this.max = (args.max === null ? null : Number(args.max));
    this.prefix = args.prefix;
    this.suffix = args.suffix;
    this.element = VID_NewEl('div', { classList: 'vid-number-wrapper'+(args.labelOnLeft ? ' row' : '')+(args.classList ? ' '+args.classList : '') });
    this.label = args.label;
    this.inputEl = VID_NewEl('input', { classList: 'vid-number-input', disabled: args.disabled, value: this.prefix+this.value+this.suffix });
    const up = VID_NewEl('div', { classList: 'vid-number-up' }),
          down = VID_NewEl('div', { classList: 'vid-number-down' }),
          upWrap = VID_NewEl('div', { classList: 'vid-number-up-wrapper' }, {}, {}, up),
          downWrap = VID_NewEl('div', { classList: 'vid-number-down-wrapper' }, {}, {}, down),
          arrowsWrap = VID_NewEl('div', { classList: 'vid-number-arrows' }, {}, {}, upWrap, downWrap),
          inputWrapper = VID_NewEl('div', { classList: 'vid-number-input-wrapper' }, {}, {}, this.inputEl, arrowsWrap);
    args.name && (this.inputEl.name = args.name);
    args.id && (this.inputEl.name = args.id);
    this.element.appendChild(inputWrapper);
    this.hint = args.hint;
    this.description = args.description;
    let mouse = {
      startY: 0, relY: 0, timer: null,
      timerFn: () => {
        if (Math.sign(mouse.relY)<0) { upWrap.classList.add('active'); downWrap.classList.remove('active'); }
        else if (Math.sign(mouse.relY)>0) { downWrap.classList.add('active'); upWrap.classList.remove('active'); }
        this.value -= this.step*Math.sign(mouse.relY);
        mouse.timer = setTimeout(mouse.timerFn, Math.min(Math.max(200-Math.abs(mouse.relY),10),200));
      },
      upFn: () => { upWrap.classList.remove('active'); downWrap.classList.remove('active'); mouse.relY = 0; clearTimeout(mouse.timer); clearTimeout(mouse.upArrowTimer); clearTimeout(mouse.downArrowTimer); window.removeEventListener('mousemove', mouse.moveFn); window.removeEventListener('mouseup', mouse.upFn); },
      moveFn: (event) => { mouse.relY = event.clientY-mouse.startY; },
      upArrowFn: () => { this.value += this.step; mouse.upArrowTimer = setTimeout(mouse.upArrowFn, 100); },
      downArrowFn: () => { this.value -= this.step; mouse.downArrowTimer = setTimeout(mouse.downArrowFn, 100); },
      upArrowTimer: null, downArrowTimer: null
    };
    this.inputEl.addEventListener('mousedown', (event) => {
      if (this.disabled) { return; }
      mouse.startY = event.clientY;
      window.addEventListener('mousemove', mouse.moveFn);
      window.addEventListener('mouseup', mouse.upFn);
      mouse.timer = setTimeout(mouse.timerFn);
    });
    upWrap.addEventListener('mousedown', () => { upWrap.classList.add('active'); mouse.upArrowTimer = setTimeout(mouse.upArrowFn); window.addEventListener('mouseup', mouse.upFn); });
    downWrap.addEventListener('mousedown', () => { downWrap.classList.add('active'); mouse.downArrowTimer = setTimeout(mouse.downArrowFn); window.addEventListener('mouseup', mouse.upFn); });
    let touch = {
      timer: () => null,
      timerFn: () => {
        if (Math.sign(touch.relY)<0) { upWrap.classList.add('active'); downWrap.classList.remove('active'); }
        else if (Math.sign(touch.relY)>0) { downWrap.classList.add('active'); upWrap.classList.remove('active'); }
        this.value -= this.step*Math.sign(touch.relY);
        touch.timer = setTimeout(touch.timerFn, Math.min(Math.max(200-Math.abs(touch.relY),10),200));
      },
      relY: 0, startY: 0,
      moveFn: (event) => { event.preventDefault(); const t = event.changedTouches[0]; touch.relY = t.clientY-touch.startY; },
      endFn: (event) => { touch.relY = 0; clearInterval(touch.timer); window.removeEventListener('touchmove', touch.moveFn); window.removeEventListener('touchend', touch.endFn); }
    };
    inputWrapper.addEventListener('touchstart', (event) => {
      if (this.disabled) { return; }
      event.preventDefault();
      const t = event.changedTouches[0];
      touch.startY = t.clientY;
      window.addEventListener('touchmove', touch.moveFn);
      window.addEventListener('touchend', touch.endFn);
      touch.timer = setTimeout(touch.timerFn);
    });
    this.inputEl.addEventListener('input', (event) => { event.target.value = this.prefix+this.validate(event.target.value, false)+this.suffix; if (this.onInput) { this.onInput.call(null, this); } });
    this.inputEl.addEventListener('change', (event) => { this.value = event.target.value; });
    this.disabled = args.disabled;
  }
  validate(v, minmax = true) {
    if (this.precision) { v = v.toFixed(this.precision); }
    let valid = String(v).replace(new RegExp('^'+this.prefix+'|'+this.suffix+'$','g'),'');
    const factor = (valid.lastIndexOf('-') === 0 ? -1 : 1);
    valid = Number(valid.replace(/[^0-9\.]/g, ''))*factor;
    if (minmax && this.min !== null && !isNaN(this.min)) { valid = Math.max(this.min, valid); }
    if (minmax && this.max !== null && !isNaN(this.max)) { valid = Math.min(this.max, valid); }
    return valid;
  }
  set value(v) {
    if (v === this._value) { return; }
    v = this.validate(v);
    this._value = v;
    this.inputEl.value = this.prefix+v+this.suffix;
    if (this.onChange) { this.onChange.call(null,this); }
  }
  get value() { return this._value; }
  set disabled(v) {
    v = Boolean(v);
    if (this._disabled === v) { return; }
    this._disabled = this.inputEl.disabled = v;
  }
  get disabled() { return this._disabled; }
  get label() { return this._label ? this._label.textContent : ''; }
  set label(v) {
    if (this._label && this.element.contains(this._label)) { this._label.textContent = v; }
    else {
      this._label = VID_NewEl('label', { classList: 'vid-label', textContent: v });
      this.element.children.length ? this.element.firstChild.before(this._label) : this.element.appendChild(this._label);
     }
  }
  get hint() { return this._hint.content; }
  set hint(v) {
    if (!v) { if (this._hint && this.element.contains(this._hint.element)) { this._hint.element.remove(); } return; }
    if (this._hint && this.element.contains(this._hint.element)) { this._hint.content = v; }
    else { this._hint = VID_Hint.create(v); this._label.appendChild(this._hint.element); }
  }
  get description() { return this._description.innerHTML; }
  set description(v) {
    if (!v) { if (this._description && this.element.contains(this._description)) { this._description.remove(); } return; }
    if (this._description && this.element.contains(this._description)) { this._description.textContent = v; }
    else { this._description = VID_NewEl('span', { classList: 'vid-description', textContent: v }); this.element.appendChild(this._description); }
  }
  focus() { this.inputEl.focus(); }
  static convert(inputTag, args = {}) {
    const control = new VID_NumberControl({ value: (inputTag.value || ''), id: inputTag.id, name: inputTag.name,
      min: (inputTag.min !== '' ? inputTag.min : null), max: (inputTag.max !== '' ? inputTag.max : null),
      step: (inputTag.step !== '' ? inputTag.step : null), disabled: inputTag.disabled, ...args });
    inputTag.replaceWith(control.element);
    return control;
  }
}
