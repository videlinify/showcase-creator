class VID_ToggleControl {
  constructor(args) {
    args = { label: '', id: null, classList: '', name: null, checked: false, disabled: false, hint: null, description: null, onChange: null, labelOnLeft: false, ...args };
    this._checked = args.checked;
    this.onChange = args.onChange;
    this.element = VID_NewEl('div', { classList: 'vid-toggle-wrapper'+(args.labelOnLeft ? ' row' : '')+(args.classList ? ' '+args.classList : '') });
    this.label = args.label;
    this.toggleEl = VID_NewEl('div', { classList: 'vid-toggle', tabIndex: 0 }, { checked: args.checked });
    args.id && (this.toggleEl.id = args.id);
    args.name && (this.inputHidden = VID_NewEl('input', { type: 'hidden', name: args.name, value: args.checked }));
    this.name = args.name;
    if (this.inputHidden) { this.element.appendChild(this.inputHidden); }
    this.toggleEl.addEventListener('click', () => { if (!this.disabled) { this.checked = !this.checked; } });
    this.toggleEl.addEventListener('keydown', (e) => { if (document.activeElement === this.toggleEl && ['Enter', ' '].includes(e.key)) { this.checked = !this.checked; } });
    this.element.appendChild(this.toggleEl);
    this.hint = args.hint;
    this.description = args.description;
    this.disabled = args.disabled;
  }
  set value(v) { this.checked = v; }
  get value() { return this._checked; }
  set checked(v) {
    v = Boolean(v);
    if (v === this._checked) { return; }
    this._checked = v;
    this.toggleEl.setAttribute('checked', this._checked);
    this.name && (this.inputHidden.value = this._checked);
    this.onChange && (this.onChange.call(null, this));
  }
  get checked() { return this._checked; }
  set disabled(v) {
    v = Boolean(v);
    this._disabled = v;
    v ? this.toggleEl.classList.add('disabled') : this.toggleEl.classList.remove('disabled');
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
  focus() { this.toggleEl.focus(); }
  static convert(checkbox, args = {}) {
    if (!checkbox) { throw('Failed to convert a checkbox to Toggle control.'); return; }
    const control = new VID_ToggleControl({ id: checkbox.id, name: checkbox.name, checked: checkbox.checked, disabled: checkbox.disabled, ...args });
    checkbox.replaceWith(control.element);
    return control;
  }
}
