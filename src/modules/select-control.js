class VID_SelectControl {
  constructor(args = {}, options = []) {
    args = { label: '', id: null, name: null, value: [], multiple: false, classList: '', style: '', labelOnLeft: false, disabled: false,
      onChange: null, afterInit: null, dropDownParent: null, width: null, hint: null, description: null, ...args };
    this.multiple = args.multiple;
    this._disabled = args.disabled;
    this.options = options.map(o => this.getOption(o));
    this.element = VID_NewEl('div', { classList: 'vid-select-wrapper'+(args.classList ? ' '+args.classList : '')+(args.labelOnLeft ? ' row' : '') }),
    this.label = args.label;
    if (args.style) { this.element.style = args.style; }
    this.dropDown = VID_NewEl('div', { classList: 'vid-select-dropdown' }, {}, {}, ...this.options.map(o => o.element));
    this.select = VID_NewEl('div', { classList: 'vid-select'+(args.disabled ? ' disabled' : ''), tabIndex: 0 });
    this.element.appendChild(this.select);
    this.hint = args.hint;
    this.description = args.description;
    this.dropDownParent = args.dropDownParent ? args.dropDownParent : this.element;
    args.id && (this.select.id = args.id);
    args.name && (this.inputHidden = VID_NewEl('input', { name: args.name, type: 'hidden', value: (this.options.filter(o => o.selected) || [{ value: '' }]).map(o => o.value).join(',') }));
    this.inputHidden && (this.element.appendChild(this.inputHidden));
    this.width = args.width;
    this.clickOutside = (e) => {
      if (this.dropDown.contains(e.target) || this.select.contains(e.target)) { return; }
      this.hideOptions();
    };
    this.select.addEventListener('mousedown', (e) => this.select.classList.contains('active') ? this.hideOptions() : this.showOptions());
    this.select.addEventListener('keydown', (e) => {
      if (document.body.contains(this.dropDown)) {
        const active = this.options.find(f => f.element === this.dropDown.querySelector('.active')), index = this.options.indexOf(active);
        if (e.key === 'ArrowUp') { this.hoverOption(index > 0 ? this.options[index-1] : this.options[this.options.length-1]); }
        if (e.key === 'ArrowDown') { this.hoverOption(index >= 0 && index < this.options.length-1 ? this.options[index+1] : this.options[0]); }
        if (['Enter', ' '].includes(e.key)) { this.selector(active) }
      }
      else if (['Enter', ' '].includes(e.key)) { this.showOptions(); }
    });
    args.value && (this.value = args.value);
    this.selected.forEach(o => this.selector(o, true));
    this.onChange = args.onChange;
    if (args.afterInit) { args.afterInit.call(null, this); }
  }
  showOptions() {
    if (this.disabled) { return; }
    this.select.focus();
    this.select.classList.add('active');
    this.dropDownParent.appendChild(this.dropDown);
    const rect = this.select.getBoundingClientRect(), offsetRect = (this.dropDown.offsetParent || document.body).getBoundingClientRect();
    this.dropDown.style.left = rect.left-offsetRect.left+'px';
    this.dropDown.style.top = rect.top-offsetRect.top+rect.height+2+'px';
    window.addEventListener('mousedown', this.clickOutside);
  }
  hideOptions() {
    this.select.classList.remove('active');
    this.dropDown.remove();
    window.removeEventListener('mousedown', this.clickOutside);
  }
  hoverOption(o) {
    if (!document.body.contains(this.dropDown)) { return; }
    if (!this.options.indexOf(o) < 0 && typeof o === 'number') { o = this.options.find(f => f.element === this.dropDown.children[o]); }
    else { this.options.find(f => f.element === o); }
    if (!o) { return; }
    this.options.forEach(e => e.element.classList.remove('active'));
    o.element.classList.add('active');
  }
  getOption(option) {
    const el = VID_NewEl('label', { classList: 'vid-select-option' }, { value: option.value }),
          checkbox = (this.multiple ? VID_NewEl('input', { type: 'checkbox', checked: option.selected, disabled: option.disabled }) : null),
          token = (this.multiple ? VID_NewEl('div', { classList: 'vid-select-token' }, {}) : null),
          tokenLabel = (this.multiple ? VID_NewEl('label', { textContent: option.label }) : null),
          tokenRemove = (this.multiple ? VID_NewEl('span', { classList: 'vid-select-token-remove', textContent: 'x' }) : null),
          label = VID_NewEl('span', { classList: (option.disabled ? 'disabled' : ''), textContent: option.label });
    if (token) { token.append(tokenLabel, tokenRemove); el.appendChild(checkbox); }
    el.appendChild(label);
    const o = { ...option, element: el, checkbox: checkbox, labelEl: label, token: token };
    if (token) { tokenRemove.addEventListener('mousedown', (e) => {
      o.token.remove();
      o.selected = o.checkbox.checked = false;
      if (this.onChange) { this.onChange.call(null,this); }
    }); }
    else if (o.selected === true) { o.element.classList.add('selected'); }
    o.element.addEventListener('mouseover', () => this.hoverOption(o));
    o.element.addEventListener('click', (e) => {
      e.preventDefault();
      this.selector(o, (this.multiple ? undefined : true));
      if (this.onChange) { this.onChange.call(null,this); }
    });
    return o;
  }
  addOption(option, position = this.options.length) {
    const o = this.getOption(option) ;
    this.options.splice(position, 0, o);
    if (!this.options.length) { this.dropDown.appendChild(o.element); }
    else { this.options[Math.max(position-1, 0)].element.after(o.element); }
  }
  removeOption(o, callChange = true) {
    if (!this.options.includes(o)) { return; }
    o.element.remove();
    if (o.token) { o.token.remove(); }
    if (!o.multiple && o.selected === true) { this.select.textContent = ''}
    this.options.splice(this.options.indexOf(o), 1);
    if (o.selected === true && this.onChange && callChange) { this.onChange.call(null,this); }
  }
  setOptions(options, setValue, leaveValues = []) {
    this.options.forEach(o => {
      if (!leaveValues.includes(o.value)) {
        o.element.remove();
        if (o.token) { o.token.remove(); }
        if (!o.multiple && o.selected === true) { this.select.textContent = ''}
      }
    });
    this.options = this.options.filter(o => leaveValues.includes(o.value));
    options.forEach(o => { this.options.push(this.getOption(o)); });
    this.dropDown.append(...this.options.map(o => o.element));
    this.value = (setValue === undefined ? this.selected.map(o => o.value) : setValue);
    this.width = null;
  }
  changeOptionLabel(o, label) {
    if (o.token) { o.token.querySelector('label').textContent = label; }
    if (!o.multiple && o.selected === true) { this.select.textContent = label; }
    o.label = o.labelEl.textContent = label;
  }
  selector(o, state) { //state (true = select, false = deselect, undefined = toggle)
    if (!o) { return; }
    if (o.disabled === true) { return; }
    if (this.multiple === true) {
      if (state === true || (state === undefined && o.selected === false || o.selected === undefined)) {
        o.selected = true;
        o.checkbox.checked = true;
        this.select.appendChild(o.token);
        if (this.inputHidden) {
          const selected = this.inputHidden.value.split(',').push(o.value);
          this.inputHidden.value = selected.join(',');
        }
        return;
      }
      else if (state === false || (state === undefined && o.selected === true)) {
        o.token.remove();
        o.selected = false;
        o.checkbox.checked = false;
        if (this.inputHidden) {
          const selected = this.inputHidden.value.split(',');
          this.inputHidden.value = selected.splice(selected.indexOf(o.value), 1).join(',');
        }
      }
    }
    else {
      if (state === true || (state === undefined && o.selected === false)) {
        this.options.forEach(op => { op.selected = false; op.element.classList.remove('selected'); });
        o.selected = true;
        if (this.inputHidden) { this.inputHidden.value = o.value; }
        this.select.textContent = o.label;
        o.element.classList.add('selected');
        setTimeout(() => this.hideOptions());
      }
      else if (state === false || (state === undefined && o.selected === true)) {
        this.options.forEach(op => { op.selected = false; op.element.classList.remove('selected'); })
        this.select.textContent = '';
        if (this.inputHidden) { this.inputHidden.value = ''; }
      }
    }
  }
  set disabled(v) {
    this._disabled = Boolean(v);
    const current = this.select.classList.contains('disabled');
    current !== this._disabled && (this.select.classList.toggle('disabled'));
  }
  get disabled() { return this._disabled; }
  sanitize(o) { if (['number', 'string'].includes(typeof o)) { o = this.options.find(f => f.value === o); if (!o) { return; } } else return this.options.find(f => f === o); }
  disable(o) {
    if (o === undefined) { this.disabled = true; }
    else {
      o = this.sanitize(o); this.selector(o, false);
      o.element.classList.add('disabled');
      o.disabled = true;
      if (o.checkbox) { o.checkbox.disabled = true; }
    }
  }
  enable(o) {
    if (o === undefined) { this.disabled = false; }
    else {
      o = this.sanitize(o); o.disabled = false;
      o.element.classList.remove('disabled');
      if (o.checkbox) { o.checkbox.disabled = false; }
    }
  }
  get value() { return this.options.filter(f => f.selected === true).map(o => o.value); }
  set value(v) {
    v = [v].flat();
    if (this.value === v || !this.options.filter(f => v.includes(f.value)).length) { return; }
    if (v === this.options.filter(f => f.selected === true).map(o => o.value)) { return; }
    if (this.multiple) {
      this.options.forEach(o => {
        if (v.includes(o.value)) { this.selector(o, true); }
        else { this.selector(o, false); }
      });
      this.inputHidden && (this.inputHidden.value = this.options.filter(o => o.selected).map(o => o.value).join(','));
    }
    else {
      this.selector(this.options.find(o => v[0] === o.value), true);
      this.inputHidden && (this.inputHidden.value = v[0]);
    }
    if (this.onChange) { this.onChange.call(null,this); }
  }
  get selected() { return this.options.filter(o => o.selected); }
  set selected(v) { this.value = v; }
  set width(w) {
    if (w) { this.select.style.width = this.dropDown.style.minWidth = w; }
    else {
      this.select.style.width = this.dropDown.style.minWidth = null;
      document.body.appendChild(this.dropDown);
      const ss = getComputedStyle(this.select), ddw = this.dropDown.getBoundingClientRect().width;
      this.dropDown.remove();
      this.dropDown.style.minWidth = this.select.style.width = parseInt(ddw)+parseInt(ss.paddingLeft)+parseInt(ss.paddingRight)+'px';
    }
  }
  get width() { return this.select.style.width; }
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
  focus() { this.select.focus(); }
  static convert(selectTag, args) {
    const control = new VID_SelectControl({ id: selectTag.id, name: selectTag.name, multiple: selectTag.multiple, disabled: selectTag.disabled, ...args }, Array.from(selectTag.options).map(o => { return { label: o.textContent, value: isNaN(o.value) || o.value === '' ? o.value : Number(o.value), selected: o.selected } }));
    selectTag.replaceWith(control.element);
    return control;
  }
}
