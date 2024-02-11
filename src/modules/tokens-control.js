class VID_TokensControl {
  constructor(args = {}) {
    args = { label: '', id: null, name: null, value: [], tokens: [], excludeChars: '', allowDuplicates: false, maxTokens: null,
      suggestions: [], maxSuggestions: 6, minLength: 1, popular: [], caseSensitive: false, keyboardAdd: ['Enter', ' ', ','],
      classList: '', disabled: false, hint: null, description: null, onChange: null, onInput: null, labelOnLeft: false, ...args };
    this.maxTokens = args.maxTokens;
    this.inputEl = VID_NewEl('input', { type: 'text', classList: 'vid-tokens-input', tabIndex: -1 });
    this.mainEl = VID_NewEl('div', { classList: 'vid-tokens', tabIndex: 0 }, {}, {}, this.inputEl);
    this.element = VID_NewEl('div', { classList: 'vid-tokens-wrapper'+(args.classList ? ' '+args.classList : '')+(args.labelOnLeft ? ' row' : '') }, {}, {}, this.mainEl);
    this.label = args.label;
    this.hint = args.hint;
    this.description = args.description;
    this.excludeChars = args.excludeChars;
    if (args.style) { this.element.style = args.style; }
    this.tokens = args.tokens.map(t => this.addToken(t));
    this.suggEl = VID_NewEl('div', { classList: 'vid-tokens-suggestions' });
    this.suggestions = args.suggestions;
    this.maxSuggestions = args.maxSuggestions;
    this.caseSensitive = args.caseSensitive;
    this.minLength = args.minLength;
    this.popular = args.popular;
    this.mainEl.addEventListener('focus', () => this.inputEl.focus());
    this.resizeInput();
    this.inputEl.addEventListener('input', () => {
      this.excludeChars && (this.inputEl.value = this.inputEl.value.replace(new RegExp('['+this.excludeChars+']','g'), ''));
      this.resizeInput();
      if (this.inputEl.value.length >= this.minLength) { this.showSuggestions(); this.suggest(this.inputEl.value); }
      else { this.hideSuggestions(); }
      this.onInput && (this.onInput.call(null, this));
    });
    this.keyboardAdd = args.keyboardAdd;
    this.mainEl.addEventListener('keydown', (e) => {
      const active = this.suggEl.querySelector('.active'), index = Array.from(this.suggEl.children).indexOf(active);
      if (document.activeElement === this.inputEl) {
        if (!active && this.keyboardAdd.includes(e.key)) { this.addToken(this.inputEl.value); }
        if (!this.inputEl.value.length && e.key === 'Backspace') { const prev = this.inputEl.previousSibling; prev && (this.removeToken(prev)); }
        if (!this.inputEl.value.length && e.key === 'Delete') { const next = this.inputEl.nextSibling; next && (this.removeToken(next)); }
        if (!this.inputEl.value.length && e.key === 'ArrowLeft') { const prev = this.inputEl.previousSibling; if (prev) { prev.before(this.inputEl); this.inputEl.focus(); } }
        if (!this.inputEl.value.length && e.key === 'ArrowRight') { const next = this.inputEl.nextSibling; if (next) { next.after(this.inputEl); this.inputEl.focus(); } }
      }
      if (document.body.contains(this.suggEl)) {
        if (active && ['Enter', ' '].includes(e.key)) { this.addToken(active.textContent); }
        if (e.key === 'ArrowUp') { this.activeSuggestion(index > 0 ? index-1 : this.suggestions.length-1); }
        if (e.key === 'ArrowDown') { this.activeSuggestion(index >= 0 && index < this.suggestions.length-1 ? index+1 : 0); }
      }
    });
    this.inputEl.addEventListener('blur', () => this.inputEl.value && (this.addToken(this.inputEl.value)));
    this.value = args.value;
    args.id && (this.mainEl.id = args.id);
    args.name && (this.inputHidden = VID_NewEl('input', { name: args.name, type: 'hidden', value: this.value }));
    if (this.inputHidden) { this.element.appendChild(this.inputHidden); }
    const clickOutside = (e) => {
      if (this.suggEl.contains(e.target) || this.mainEl.contains(e.target)) { return; }
      this.mainEl.classList.remove('active');
      this.suggEl.remove();
      window.removeEventListener('mousedown', clickOutside);
    };
    this.suggEl.addEventListener('mouseover', (e) => {
      const over = this.suggestions.indexOf(e.target);
      if (over >= 0) { this.activeSuggestion(this.suggestions[over]); }
    });
    this.mainEl.addEventListener('mousedown', (e) => {
      if (this.disabled && !this.mainEl.classList.contains('active')) { return; }
      this.mainEl.classList.toggle('active');
      if (this.mainEl.classList.contains('active')) {
        if (this.inputEl.value.length >= this.minLength) { this.showSuggestions(); }
        window.addEventListener('mousedown', clickOutside);
      }
      else {
        this.mainEl.classList.remove('active');
        this.suggEl.remove();
        window.removeEventListener('mousedown', clickOutside);
      }
    });
    this.disabled = args.disabled;
    this.onInput = args.onInput;
    this.onChange = args.onChange;
  }
  addToken(value, position = null) {
    if (this.maxTokens && this.tokens.length >= this.maxTokens) { return; }
    if (!this.allowDuplicates && this.value.includes(value)) { this.inputEl.value = ''; this.hideSuggestions(); return; }
    if (!value.length || !value.trim().length) { return; }
    const token = VID_NewEl('div', { classList: 'vid-tokens-token' }),
          tokenLabel = VID_NewEl('label', { textContent: value }),
          tokenRemove = VID_NewEl('span', { classList: 'vid-tokens-x', textContent: 'x' });
    token.append(tokenLabel, tokenRemove);
    const obj = { value: value, element: token, labelEl: tokenLabel };
    tokenRemove.addEventListener('click', (e) => this.removeToken(obj));
    if (position === null || position >= this.tokens.length) { this.tokens.push(obj); this.inputEl.before(token); }
    else { this.tokens.splice(position, 0, obj); this.tokens[position].element.before(token); }
    this.inputEl.value = '';
    this.hideSuggestions();
    this.onChange && (this.onChange.call(null,this));
  }
  removeToken(token) {
    if (!this.tokens.length) { return; }
    token = this.getToken(token) || this.tokens[this.tokens.length-1];
    token.element.remove();
    this.tokens.splice(this.tokens.indexOf(token), 1);
    this.onChange && (this.onChange.call(null,this));
  }
  getToken(token) {
    if (typeof token === 'object') {
      if ('tagName' in token) { return this.tokens.find(f => f.element === token); }
      return this.tokens.find(f => f === token);
    }
    else if (typeof token === 'string') { return this.tokens.find(f => f.value === token); }
    else if (typeof token === 'number') { return this.tokens[token]; }
  }
  clearTokens() { this.tokens.forEach(t => t.element.remove()); this.tokens = []; this.onChange && (this.onChange.call(null, this)); }
  set suggestions(v) {
    v = [v].flat().filter((f,i) => f && v.indexOf(f) === i);
    this._suggestions = v.map(s => {
      const sugg = VID_NewEl('label', { textContent: s, tabIndex: -1 });
      sugg.addEventListener('click', () => this.addToken(s));
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
    const rect = this.mainEl.getBoundingClientRect();
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
    this._disabled = Boolean(v);
    const current = this.mainEl.classList.contains('disabled');
    current !== this._disabled && (this.mainEl.classList.toggle('disabled'));
    this.inputEl.disabled = v;
  }
  get disabled() { return this._disabled; }
  get value() { return this.tokens.map(m => m.value); }
  set value(v) {
    v = [v].flat();
    if (this.tokens.map(t => t.value) === v) { return; }
    this.clearTokens();
    v.forEach(t => this.addToken(t));
    this.inputHidden && (this.inputHidden.value = v.join(','));
    this.onChange && (this.onChange.call(null,this));
  }
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
  resizeInput() { this.inputEl.style.width = (Math.max(Math.min(20,this.inputEl.value.length),1)+1)+'ch'; }
  focus() { this.inputEl.focus(); }
  static convert(tag, args) {
    const control = new VID_TokensControl({ id: tag.id, name: tag.name, disabled: tag.disabled, suggestions: tag.tagName === 'SELECT' ? Array.from(tag.options).map(o => o.textContent) : [], ...args });
    tag.replaceWith(control.element);
    return control;
  }
}
