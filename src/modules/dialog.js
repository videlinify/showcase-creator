class VID_Dialog {
  constructor(args) {
    args = { title: '', type: 'message', options: {}, style: {}, appendTo: document.body, classList: '',
      onConfirm: null, onCancel: null, error: null, onOpen: null, onClose: null, closeOutside: true, ...args };
    this.type = args.type;
    this.options = args.options,
    this.onConfirm = args.onConfirm;
    this.onCancel = args.onCancel;
    this.onOpen = args.onOpen;
    this.onClose = args.onClose;
    this.error = args.error;
    this.appendTo = args.appendTo;
    this.controls = {};
    this.element = VID_NewEl('div', { classList: 'vid-dialog'+(args.classList ? ' '+args.classList : '') });
    this.titleElement = VID_NewEl('div', { classList: 'vid-dialog-title', textContent: args.title });
    this.element.append(this.titleElement, this.getContent());
    this.style = args.style;
    this.closeOutside = args.closeOutside;
    this.clickOutside = (e) => {
      if (this.element.contains(e.target) || !this.closeOutside) { return; }
      this.close();
    };
    this.onKeyDown = (e) => {
      if (e.key === 'Enter') { this.onConfirm && (this.onConfirm.call(null, this)); this.close(); }
      else if (e.key === 'Escape') { this.close(); }
    };
  }
  getContent() {
    const content = VID_NewEl('div', { classList: 'vid-dialog-content' });
    let options = { buttons: true, confirmBtn: (this.type === 'message' ? 'Okey' : 'Confirm'), cancelBtn: 'Cancel', reverseDestructive: false, ...this.options };
    this.buttons = {
      confirm: VID_NewEl('button', { classList: 'button-secondary'+(options.reverseDestructive ? ' is-destructive' : ''), textContent: options.confirmBtn, onclick: () => { this.onConfirm && (this.onConfirm.call(null, this)); this.close(); } } ),
      cancel: VID_NewEl('button', { classList: 'button-secondary'+(options && this.options.reverseDestructive ? '' : ' is-destructive'), textContent: options.cancelBtn, onclick: () => { this.onCancel && (this.onCancel.call(null, this)); this.close(); } }),
    };
    const buttonsRow = VID_NewEl('div', { classList: 'vid-dialog-buttons-row' });
    if (this.type === 'input' || this.type === 'number') {
      options = { ...options, label: '', value: '', message: '', excludeChars: '', min: null, max: null, step: null, disabled: false, onChange: null, cancelBtn: null, hint: '', ...this.options };
      if (options.message) { this.controls.message = VID_NewEl('div', { classList: 'vid-dialog-message', textContent: options.message }, {}, { color: this.options.color, fontSize: options.fontSize }); content.appendChild(this.controls.message); }
      if (this.type === 'number') { this.controls.input = new VID_NumberControl({ label: options.label, value: options.value, min: options.min, max: options.max, step: options.step, disabled: options.disabled, onInput: options.onChange }); }
      else {
        this.controls.input = new VID_InputControl({ label: options.label, value: options.value, excludeChars: options.excludeChars, max: options.max, disabled: options.disabled, onInput: options.onChange });
        this.controls.input.inputEl.style.width = this.controls.input.inputEl.style.maxWidth = '100%';
      }
      this.controls.hint = VID_NewEl('div', { classList: 'vid-dialog-hint', textContent: options.hint || '' });
      this.buttons.confirm.onclick = () => { this.controls.input.value = this.controls.input.inputEl.value; this.onConfirm && (this.onConfirm.call(null, this)); this.close(); };
      content.append(this.controls.input.element, this.controls.hint);
      options.confirmBtn && (buttonsRow.appendChild(this.buttons.confirm));
      options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
    }
    else if (['confirm', 'message', 'fade_message'].includes(this.type)) {
      if ('message' in options && options.message) {
        this.controls.message = VID_NewEl('div', { classList: 'vid-dialog-message'+(this.type === 'fade_message' ? ' fade' : ''), textContent: options.message }, {}, { color: this.options.color, fontSize: options.fontSize });
        content.appendChild(this.controls.message);
      }
      ['message', 'confirm'].includes(this.type) && (buttonsRow.appendChild(this.buttons.confirm));
      this.type === 'confirm' && options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
    }
    else if (this.type === 'controls') {
      options = { ...options, confirmBtn: 'Confirm', cancelBtn: 'Cancel', reverseDestructive: false, controls: [], ...this.options };
      options.confirmBtn && (buttonsRow.appendChild(this.buttons.confirm));
      options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
      content.append(...options.controls.map(f => f.element));
    }
    else if (this.type === 'table-edit') {
      options = { ...options, buttons: false, columns: [], rows: [], ...this.options };
      const labels = VID_NewEl('div', { classList: 'vid-dialog-row' });
      options.columns.forEach((col) => { labels.appendChild(VID_NewEl('div', { classList: 'vid-dialog-col labels', textContent: col.label }, {}, col.style || {})); });
      content.appendChild(labels);
      const addNewRow = (row) => {
        const rowEl = VID_NewEl('div', { classList: 'vid-dialog-row' }, {}, row.style || {});
        options.columns.forEach((col) => {
          const colEl = VID_NewEl('div', { classList: 'vid-dialog-col'}, {}, col.style || {});
          rowEl.appendChild(colEl);
          if (col.type === 'input') {
            if (row[col.key].editable === false) { colEl.appendChild(VID_NewEl('div', { classList: 'vid-not-editable', textContent: row[col.key].value })); }
            else { row[col.key].control = new VID_InputControl({ value: row[col.key].value, ...(col.control || {}), classList: 'vid-control', onChange: (col.onChange ? (input) => { col.onChange(input, row); } : null) }); colEl.appendChild(row[col.key].control.element); }
          }
          if (col.type === 'number') {
            if (row[col.key].editable === false) { colEl.appendChild(VID_NewEl('div', { classList: 'vid-not-editable', textContent: row[col.key].value })); }
            else { row[col.key].control = new VID_NumberControl({ value: row[col.key].value, ...(col.control || {}), classList: 'vid-control', onChange: (col.onChange ? (input) => { col.onChange(input, row); } : null) }); colEl.appendChild(row[col.key].control.element); }
          }
          else if (col.type === 'select') {
            row[col.key].control = new VID_SelectControl({ ...(col.control || {}), classList: 'vid-control', onChange: (col.onChange ? (input) => { if (col.onChange) col.onChange(input, row); } : null), ...(row.args ? row.args : []) }, row.options.map(o => { if (row[col.key].value === o.value) { o.selected = true; } return o; }));
            colEl.appendChild(row[col.key].control.element);
          }
        });
        if (row.removable !== false) {
          const removeRowBtn = VID_NewEl('button', { classList: 'button-secondary is-destructive', textContent: '–' });
          removeRowBtn.addEventListener('click', () => {
            setTimeout(() => {
              if (this.options.onRemoveRow) { this.options.onRemoveRow.call(null, row); }
              this.options.rows.splice(this.options.rows.indexOf(row), 1);
              rowEl.remove();
            });
          });
          rowEl.appendChild(removeRowBtn);
        }
        lastRow.before(rowEl);
      }
      const lastRow = VID_NewEl('div', { classList: 'vid-dialog-row' }),
            addRowBtn = VID_NewEl('button', { classList: 'button-secondary', textContent: 'Add new' }, {}, { flexGrow: 1 });
      addRowBtn.addEventListener('click', () => {
        const row = {};
        options.columns.forEach(col => row[col.key] = { value: (col.initialValue || '') });
        addNewRow(row);
        this.options.rows.push(row);
        if (this.options.onNewRow) { this.options.onNewRow.call(null, row); }
      });
      content.appendChild(lastRow).appendChild(addRowBtn);
      options.rows.forEach((row) => { addNewRow(row); });
      options.confirmBtn && (buttonsRow.appendChild(this.buttons.confirm));
      options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
    }
    else if (this.type === 'items-list') {
      options = { ...options, list: {}, items: [], ...this.options };
      this.control = new VID_ItemsList(options.list);
      options.items.forEach(i => this.control.addItem(i));
      content.appendChild(this.control.element);
      options.confirmBtn && (buttonsRow.appendChild(this.buttons.confirm));
      options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
    }
    else if (this.type === 'tag' && ('content' in this.options) && this.options.content) {
      content.append(this.options.content);
      options.confirmBtn && (buttonsRow.appendChild(this.buttons.confirm));
      options.cancelBtn && (buttonsRow.appendChild(this.buttons.cancel));
    }
    options.buttons && (content.appendChild(buttonsRow));
    return content;
  }
  set title(v) { this.titleElement.textContent = v; }
  get title() { return this.titleElement.textContent; }
  set message(v) { if ('message' in this.controls) { this.controls.message.textContent = v; } }
  get message() { if ('message' in this.controls) { return this.controls.message; } return null; }
  set style(v) { if (typeof v === 'object') { v = VID_cssObjToStr(v); } this.element.style = v; }
  get style() { return this.element.style; }
  disable() { this.buttons.confirm.disabled = true; }
  enable() { this.buttons.confirm.disabled = false; }
  open(position = null) {
    if (!this.element.isConnected) { this.appendTo.appendChild(this.element); }
    this.setPosition(position);
    this.element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms });
    if (['input', 'number'].includes(this.type)) { this.controls.input.value = (this.options.initialValue || ''); this.controls.input.focus(); }
    if (this.type === 'controls') { this.options.controls[0].focus(); }
    if (['input', 'number', 'confirm', 'controls'].includes(this.type)) { window.addEventListener('keydown', this.onKeyDown); }
    if (this.type !== 'fade_message') { setTimeout(() => window.addEventListener('click', this.clickOutside)); }
    else { setTimeout(() => this.close(), this.options.duration); }
    this.onOpen && (this.onOpen.call(null, this));
  }
  close() {
    if (this.error) { VID_Dialog.fadeMessage(this.error, { options: { duration: 1000 }, style: { backgroundColor: 'var(--vid-destructive)', color: '#fff', top: '100px', transform: 'translate(-50%, 0)' } }); this.error = null; return; }
    this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms });
    setTimeout(() => this.element.remove(), ms);
    window.removeEventListener('click', this.clickOutside);
    window.removeEventListener('keydown', this.onKeyDown);
    this.onClose && (this.onClose.call(null, this));
  }
  setPosition(position) {
    const rect = this.element.getBoundingClientRect();
    if (position instanceof Event) {
      this.element.style.left = Math.max(0, Math.min(position.clientX, window.innerWidth - rect.width))+'px';
      this.element.style.top = Math.max(0,Math.min(position.clientY, window.innerHeight - rect.height))+'px';
    }
    else if (position && typeof position === 'object') {
      ['top', 'right', 'bottom', 'left'].forEach((p) => p in position && (this.element.style[p] = position[p]));
    }
  }
  attachTo(tag) { tag.onclick = (event) => { event.preventDefault(); this.open(); }; return this; }
  static attachTo(tag, args) {
    const dialog = new VID_Dialog(args);
    tag.onclick = (event) => { event.preventDefault(); dialog.open(); }
    return dialog;
  }
  static fadeMessage(msg, args = {}, open = true) {
    args.type = 'fade_message';
    args.options = args.options || {};
    args.options.message = msg;
    args.options.duration = 3000;
    const dialog = new VID_Dialog(args);
    if (open) { dialog.open(); }
    return dialog;
  }
  static from(tag, args = {}, removeOriginal = true) {
    args.type = 'tag';
    args.options = args.options || {};
    args.options.content = tag;
    removeOriginal && (tag.remove());
    return new VID_Dialog(args);
  }
}

window.addEventListener('DOMContentLoaded', () => { Array.from(document.querySelectorAll('.psc-fade-message')).forEach(msg => { VID_Dialog.fadeMessage(msg.textContent, { classList: msg.classList, style: msg.style }); msg.remove(); }); });
