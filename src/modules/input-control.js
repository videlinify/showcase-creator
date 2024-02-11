class VID_InputControl {
  constructor(args) {
    args = { label: '', id: null, nameAttr: null, value: '', classList: '', excludeChars: '', max: null, disabled: false, labelOnLeft: false, inscribed: false,
      hint: null, description: null, suggestions: [], maxSuggestions: 6, minLength: 1, popular: [], caseSensitive: false, style: {}, inputStyle: {}, inputGrow: false,
      addList: [], addMenuLabel: '', onInput: null, onChange: null, onEnter: null, ...args };
    this._value = args.value;
    this._disabled = args.disabled;
    this.excludeChars = args.excludeChars;
    this.inscribed = args.inscribed;
    this.suggEl = VID_NewEl('div', { classList: 'vid-input-suggestions' });
    this.suggestions = args.suggestions;
    this.maxSuggestions = args.maxSuggestions;
    this.caseSensitive = args.caseSensitive;
    this.inputGrow = args.inputGrow;
    this.minLength = args.minLength;
    this.popular = args.popular;
    this.element = VID_NewEl('div', { classList: 'vid-input-wrapper'+(args.labelOnLeft ? ' row' : '')+(args.classList ? ' '+args.classList : '') }, {}, args.style);
    this.label = args.label;
    this.inputEl = VID_NewEl('input', { classList: 'vid-input'+(this.inscribed ? '-inscribed' : ''), maxlength: args.max, disabled: args.disabled, value: args.value }, {}, args.inputStyle);
    this.inputWrapper = VID_NewEl('div', { classList: 'vid-input-wrapper row' }, {}, {}, this.inputEl);
    this.onChange = args.onChange;
    this.onInput = args.onInput;
    this.onEnter = args.onEnter;
    this.element.appendChild(this.inputWrapper);
    this.hint = args.hint;
    this.description = args.description;
    this.addBtn = this.addMenu = null;
    this.addList = args.addList;
    this.addMenuLabel = args.addMenuLabel;
    this.inputEl.addEventListener('input', (e) => {
      if (this.excludeChars) { e.target.value = e.target.value.replace(new RegExp('['+this.excludeChars+']','g'), ''); }
      if (e.target.value.length >= this.minLength) { this.showSuggestions(); this.suggest(e.target.value); }
      else { this.hideSuggestions(); }
      if (this.inputGrow) { this.resizeInput(); }
      this.onInput && (this.onInput.call(null,this));
    });
    this.inputEl.addEventListener('change', (e) => { this.value = e.target.value; });
    this.element.addEventListener('keydown', (e) => {
      if (document.activeElement === this.inputEl) {
        if (e.key === 'Enter' && this.onEnter) { this.onEnter.call(null, this); }
        if (this.suggestions.length && document.body.contains(this.suggEl)) {
          const active = this.suggEl.querySelector('.active'), index = Array.from(this.suggEl.children).indexOf(active);
          if (e.key === 'ArrowUp') { this.activeSuggestion(index > 0 ? index-1 : this.suggestions.length-1); }
          if (e.key === 'ArrowDown') { this.activeSuggestion(index >= 0 && index < this.suggestions.length-1 ? index+1 : 0); }
          if (active && ['Enter', ' '].includes(e.key)) { this.value = active.textContent; this.hideSuggestions(); }
        }
      }
    });
    const clickOutside = (e) => {
      if (this.suggEl.contains(e.target) || this.inputEl.contains(e.target)) { return; }
      this.suggEl.remove();
      window.removeEventListener('mousedown', clickOutside);
    };
    this.suggEl.addEventListener('mouseover', (e) => {
      const over = this.suggestions.indexOf(e.target);
      if (over >= 0) { this.activeSuggestion(this.suggestions[over]); }
    });
    args.id && (this.inputEl.id = args.id);
    args.nameAttr && (this.inputEl.name = args.nameAttr);
    if (this.inputGrow) { this.resizeInput(); }
  }
  get value() { return this._value; }
  set value(v) {
    if (v === this._value) { return; }
    this._value = this.inputEl.value = v;
    this.onChange && (this.onChange.call(null, this));
  }
  set suggestions(v) {
    v = [v].flat();
    this._suggestions = v.map(s => {
      const sugg = VID_NewEl('label', { textContent: s, tabIndex: -1 });
      sugg.addEventListener('click', () => { this.value = s; this.hideSuggestions(); });
      return sugg;
    });
  }
  get suggestions() { return this._suggestions; }
  suggest(str) {
    if (typeof str !== 'string' || !str.length || !this.suggestions.length) { return; }
    !this.caseSensitive && (str = str.toLowerCase());
    const startsWith = this.suggestions.filter(f => (this.caseSensitive ? f.textContent : f.textContent.toLowerCase()).split(' ').some(w => w.startsWith(str))),
          contains = this.suggestions.filter(f => (this.caseSensitive ? f.textContent : f.textContent.toLowerCase()).search(str) >= 0 && !startsWith.includes(f)),
          popular = this.popular.length ? this.suggestions.filter(f => this.popular.includes(this.caseSensitive ? f.textContent : f.textContent.toLowerCase()) && ![...startsWith, ...contains].includes(f)) : [],
          suggest = [...startsWith, ...contains, ...popular].filter(f => !this.value.includes(this.caseSensitive ? f.textContent : f.textContent.toLowerCase())).slice(0,this.maxSuggestions);
    suggest.forEach(s => s.innerHTML = (this.caseSensitive ? s.textContent : s.textContent.toLowerCase()).replace(' ','&nbsp;').split(str).join('<strong>'+str+'</strong>'));
    Array.from(this.suggEl.children).forEach(c => c.remove());
    this.suggEl.append(...suggest);
  }
  showSuggestions() {
    if (!this.suggestions.length) { return; }
    const rect = this.inputEl.getBoundingClientRect();
    if (!document.body.contains(this.suggEl)) { document.body.appendChild(this.suggEl); }
    this.suggEl.style.left = rect.left+window.scrollX+'px';
    this.suggEl.style.top = rect.top+window.scrollY+rect.height+2+'px';
  }
  hideSuggestions() { this.suggEl.remove(); }
  activeSuggestion(value) {
    if (!document.body.contains(this.suggEl)) { return; }
    if (typeof value === 'number') { value = this.suggEl.children[value]; }
    if (this.suggestions.indexOf(value) < 0) { return; }
    this.suggestions.forEach(s => s.classList.remove('active'));
    value.classList.add('active');
  }
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
  set addList(v) {
    if (!Array.isArray(v)) { return; }
    if (v.length) {
      const items = v.map(o => typeof o === 'string' ? { label: o, value: o } : o);
      items.forEach(o => { o.action = (i) => { let val = this.inputEl.value; this.inputEl.value = val.slice(0,this.inputEl.selectionStart)+o.value+val.slice(this.inputEl.selectionEnd); console.log(o.value, 'current', val); } });
      if (!this.addMenu) { this.addMenu = new VID_ContextMenu({ label: this.addMenuLabel || '' }, items); }
      else { this.addMenu.setOptions(items); }
      if (!this.addBtn) {
        this.addBtn = VID_NewEl('button', { classList: 'button-secondary', textContent: '+', onclick: (event) => this.addMenu.open(event) });
        this.inputWrapper.appendChild(this.addBtn);
      }
    }
    else { this.addBtn && (this.addBtn.remove()); }
  }
  get addList() { return this.addMenu ? this.addMenu.getOptions(['label', 'value']) : []; }
  resizeInput() {
    this.ch = this.ch || VID_customRect('', { width: '1ch' }, this.element).width;
    this.inputEl.style.width = Math.round(Math.max(this.inputEl.value.length*this.ch, this.ch))+'px';
  }
  focus() { this.inputEl.focus(); }
  static convert(inputTag, args = {}) {
    const control = new VID_InputControl({ id: inputTag.id, name: inputTag.name, value: inputTag.value, max: inputTag.maxlength, disabled: inputTag.disabled, ...args });
    inputTag.replaceWith(control.element);
    return control;
  }
}
