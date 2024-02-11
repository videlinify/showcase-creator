class VID_ContextMenu {
  constructor(args = {}, options = []) {
    this.args = { title: '', style: '', class: '', action: null, onOpen: null, onClose: null, ...args };
    const wrapper = VID_NewEl('div', { classList: 'vid-context-menu'+(args.class ? ' '+args.class : '') }),
          title = VID_NewEl('div', { classList: 'vid-context-menu-title', textContent: args.label });
    if (args.style) { wrapper.style = args.style; }
    if (this.args.title) { wrapper.appendChild(title); }
    this.options = [];
    this.element = wrapper;
    this.action = args.action;
    this.onOpen = args.onOpen;
    this.onClose = args.onClose;
    this.clickOutside = (e) => {
      if (this.element.contains(e.target)) { return; }
      this.close();
    };
    options.forEach(o => this.insertOption(o));
  }
  insertOption(o, position = this.options.length) {
    o = { value: '', label: '', disabled: false, action: null, ...o };
    const el = VID_NewEl('div', { classList: (o.action === null ? 'vid-context-menu-label' : 'vid-context-menu-option')+(o.disabled ? ' disabled' : ''), textContent: o.label });
    o.element = el;
    if (!o.disabled) { el.addEventListener('click', (e) => {
      this.close();
      this.action && (this.action.call(null, o, e));
      o.action && (o.action.call(null, o, e));
    }); }
    this.options.splice(position, 0, o);
    this.element.appendChild(o.element);
  }
  removeOption(o) {
    o.element.remove();
    this.options.splice(this.options.indexOf(o), 1);
  }
  removeAllOptions() {
    this.options.forEach(o => { o.element.remove(); });
    this.options = [];
  }
  setOptions(options) {
    this.removeAllOptions();
    options.forEach(o => this.insertOption(o));
  }
  getOptions(props = ['label', 'value', 'action', 'disabled']) {
    if (!props || !props.length) { return this.options; }
    return this.options.map(o => {
      const obj = {};
      props.forEach(p => p in o && (obj.p = o.p));
      return obj;
    });
  }
  open(position) {
    document.body.appendChild(this.element);
    this.onOpen && (this.onOpen.call(null, this));
    setTimeout(() => {
      const rect = this.element.getBoundingClientRect();
      if (position instanceof Event) {
        this.element.style.left = Math.max(0,(window.innerWidth < rect.width ? 0 : position.clientX - (window.innerWidth - position.clientX < rect.width ? rect.width : 0)))+'px';
        this.element.style.top = Math.max(0,(window.innerHeight < rect.height ? 0 : position.clientY - rect.height + (window.innerHeight - position.clientY > rect.height ? rect.height : 0)))+'px';
        this.element.animate([{ height: 0 }, { height: rect.height+'px' }], { duration: ms });
      }
      else if (Array.isArray(position)) {
        this.element.style.left = this.args.position[0]+'px';
        this.element.style.top = this.args.position[1]+'px';
      }
      else {
        this.element.style.left = ((window.innerWidth/2)-(rect.width/2))+'px';
        this.element.style.top = ((window.innerHeight/2)-(rect.height/2))+'px';
      }
      window.addEventListener('click', this.clickOutside);
    });
  }
  close() {
    this.element.remove();
    window.removeEventListener('click', this.clickOutside);
    this.onClose && (this.onClose.call(null, this));
  }
}
