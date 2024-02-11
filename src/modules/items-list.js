class VID_ItemsList {
  constructor(args = {}) {
    args = {
      idAttr: null, nameAttr: null, classList: '', focusable: false, showItemNumber: false, disabled: false, style: {}, itemTypes: [],
      removableItems: false, addItemBtn: false, addItemDialog: null, newItemArgs: {}, onItemAdd: null, onItemRemove: null,
      labels: { addBtn: '+', removeBtn: '–', addItemTypeMenu: 'Insert a new item:' },
      selectable: true, multiSelect: false, useSelectKeys: false, preventUnselected: false, onSelect: null, onDeselect: null, onChange: null,
      draggable: false, levels: 0, onDragStart: null, onDragEnd: null,
      editableLabels: false, onLabelInput: null, onLabelChange: null,
      itemsQueue: [], onQueueStart: null, onQueueEnd: null, transferTo: null, transferArea: null, onTransferStart: null, ...args };
    this.itemTypes = args.itemTypes;
    this.selectable = args.selectable;
    this.multiSelect = args.multiSelect;
    this.useSelectKeys = args.useSelectKeys;
    this.lastSelected = null;
    this.itemNumber = args.showItemNumber;
    this.draggable = args.draggable;
    this.itemsQueue = args.itemsQueue;
    this.onDragStart = args.onDragStart;
    this.onDragEnd = args.onDragEnd;
    this.onQueueStart = args.onQueueStart;
    this.onQueueEnd = args.onQueueEnd;
    this.removableItems = args.removableItems;
    this.editableLabels = args.editableLabels;
    if (this.editableLabels) { this.onLabelInput = args.onLabelInput; this.onLabelChange = args.onLabelChange; }
    this.drag = {
      active: false, index: VID_NewEl('div', {}, {}, {}, VID_NewEl('div', { classList: 'drag-index' })),
      item: null, children: null, over: null, at: null, level: 0, events: {}, shiftKey: false
    };
    this.transferTo = args.transferTo;
    this.transferArea = args.transferArea ? args.transferArea : (args.transferTo ? args.transferTo.element : null);
    this.onTransferStart = args.onTransferStart;
    if (this.transferTo) {
      this.drag.events.transfer = (e) => {
        if (this.transferArea.contains(e.target)) {
          this.onTransferStart && (this.onTransferStart.call(null, this, this.transferTo));
          this.dragEnd(false);
        }
      };
    }
    this.levels = args.levels;
    this.items = [];
    this.labels = args.labels;
    if (this.itemTypes.length) { this.addItemTypeMenu = new VID_ContextMenu({ label: args.labels.addItemTypeMenu, style: ('display: grid; grid: auto-flow /'+(' 1fr'.repeat(Math.ceil((this.itemTypes.length+1)/8)))+';') }, []); }
    this.onSelect = args.onSelect;
    this.onDeselect = args.onDeselect;
    this.onChange = args.onChange;
    this.preventUnselected = args.preventUnselected;
    if (this.preventUnselected && !this.selected.length && this.items.length) { this.items[0].selected = true; }
    this.onItemRemove = args.onItemRemove;
    this.onItemAdd = args.onItemAdd;
    this.newItemArgs = args.newItemArgs;
    this.addItemDialog = args.addItemDialog;
    this.listEl = VID_NewEl('div', { classList: 'vid-items-list'+(args.classList ? ' '+args.classList : '') }, {}, args.style);
    this.element = VID_NewEl('div', { classList: 'vid-items-list-wrapper' }, {}, {}, this.listEl);
    if (args.focusable) {
      this.listEl.tabindex = 0;
      this.focused = false;
      window.addEventListener('mousedown', (e) => this.focused = this.listEl.contains(e.target));
      this.listEl.addEventListener('focus', () => this.focused = true);
      document.addEventListener('keydown', (e) => {
        if (this.focused && !this.element.contains(document.activeElement)) {
          if (this.multiSelect && e.ctrlKey && e.key === 'a') { e.preventDefault(); this.selected = this.selected.length === this.items.length ? [] : this.items; }
          else if (this.removableItems && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); this.selected.forEach(i => !i.static && (this.removeItem(i))); }
          else if (this.draggable && e.key === 'ArrowUp') { e.preventDefault(); if (e.ctrlKey) { this.shiftSelected(-1); } else { this.selectUp(e.shiftKey); } }
          else if (this.draggable && e.key === 'ArrowDown') { e.preventDefault(); if (e.ctrlKey) { this.shiftSelected(1); } else { this.selectDown(e.shiftKey); } }
          else if (this.draggable && this.levels && e.key === 'ArrowLeft') { e.preventDefault(); this.selected.forEach(i => i.appendLeft()); }
          else if (this.draggable && this.levels && e.key === 'ArrowRight') { e.preventDefault(); this.selected.forEach(i => i.appendRight()); }
        }
      });
    }
    if (this.removableItems && args.addItemBtn) {
      const addItemBtn = VID_NewEl('button', { classList: 'button-secondary', textContent: this.labels.addBtn }),
            addItemWrapper = VID_NewEl('div', { classList: 'vid-items-list-add-item-wrapper' }, {}, {}, addItemBtn);
      addItemBtn.addEventListener('click', ((this.addItemDialog || this.itemTypes) ? (e) => this.showAddItemMenu(e) : () => this.addItem()));
      this.element.append(addItemWrapper);
    }
    args.idAttr && (this.element.id = args.idAttr);
    args.nameAttr && (this.inputHidden = VID_NewEl('input', { name: args.nameAttr, type: 'hidden', value: [this.selected].flat().map(i => (i.valueAttr === null ? i.id : i.valueAttr)).join(',') }));
    this.inputHidden && (this.element.appendChild(this.inputHidden));
    this.disabled = args.disabled;
  }
  set disabled(v) {
    if (v) { this._disabled = true; this.listEl.classList.add('disabled'); }
    else { this._disabled = false; this.listEl.classList.remove('disabled'); }
  }
  get disabled() { return this._disabled; }
  get selected() { return this.items.filter(f => f.selected).sort((a,b) => a.position > b.position); }
  set selected(v) {
    v = [v].flat().filter(f => this.items.indexOf(f) !== -1).sort((a,b) => a.position > b.position);
    if (!this.multiSelect) { v[0].selected = true; }
    else {
      this.items.forEach((item) => {
        if (v.includes(item)) { item.selected = true; }
        else { item.selected = false; }
      });
    }
  }
  get value() { return this.inputHidden ? this.inputHidden.value : this.selected.map(i => i.valueAttr === null ? i.id : i.valueAttr).join(','); }
  get types() { return this.itemTypes; }
  set focused(v) { v = Boolean(v); this._focused = v; v ? this.listEl.classList.add('focus') : this.listEl.classList.remove('focus'); }
  get focused() { return this._focused; }
  get lastItem() { return this.items[this.items.length-1]; }
  addItem(args = {}) {
    const newItem = new VID_Item(this, { ...this.newItemArgs, ...args });
    this.onItemAdd && (this.onItemAdd.call(null, newItem));
    this.onChange && (this.onChange.call(null, this));
    return newItem;
  }
  removeItem(item) {
    this.onItemRemove && (this.onItemRemove.call(null, item));
    item.remove();
  }
  clearItems(items = []) {
    items = items.length ? items : this.items;
    items.forEach(i => i.remove(false));
    this.items = this.items.filter(f => !items.includes(f));
    this.itemNumber && (this.resetItemNumber());
  }
  reverse(items = []) {
    if (items.length <= 1) { this.items = this.items.reverse(); }
    else {
      items.map(i => this.items.indexOf(i)).forEach((p) => this.items.splice(p,1,items.pop()));
    }
    this.listEl.append(...this.items.map(i => i.element));
    this.itemNumber && (this.resetItemNumber());
    this.onChange && (this.onChange.call(null, this));
  }
  shiftSelected(move) {
    move = parseInt(move);
    if (!move) { return; }
    const items = this.selected.filter(f => !f.static);
    if (!items.length) { return; }
    const itemsBefore = this.items.slice(0, items[0].position).filter(f => !f.static).length,
          itemsAfter = this.items.slice(items[items.length-1].position+1).filter(f => !f.static).length;
    if (move < 0) { items.forEach(i => itemsBefore && (i.position += move-1)); }
    else { items.reverse().forEach(i => itemsAfter && (i.position += move)); }
  }
  selectUp(add = false) {
    !this.multiSelect && (add = false);
    const current = this.items.indexOf(this.selected[0]),
          prev = this.items[current === 0 ? this.items.length-1 : current-1];
    this.selected = add ? [prev, ...this.selected] : prev;
  }
  selectDown(add = false) {
    const current = this.items.indexOf(this.selected[this.selected.length-1]),
          next = this.items[current === this.items.length-1 ? 0 : current+1];
    this.selected = add ? [...this.selected, next] : next;
  }
  setQueue(items = []) {
    if (!this.draggable || this.drag.active) { return; }
    this.itemsQueue = [items].flat();
    this.dragStart(null);
  }
  resetQueue() {
    this.itemsQueue = [];
    dragEnd(false);
  }
  dragStart(item) {
    const dragMode = !this.itemsQueue.length;
    this.drag.active = true;
    this.drag.item = item;
    this.drag.at = item;
    this.drag.level = item ? item.level : 0;
    this.drag.children = (dragMode ? item.allChildren : []);
    dragMode && (item.element.classList.add('dragged'));
    item ? this.drag.item.element.before(this.drag.index) : this.listEl.append(this.drag.index);
    this.drag.level = (item ? this.drag.item.level : 0);
    this.drag.index.setAttribute('data-level', this.drag.level);
    this.drag.shiftKey = false;
    this.drag.events.onMouseUp = (e) => { if (this.drag.active && e.button === 0) { this.drag.shiftKey = e.shiftKey; this.dragEnd(true); } };
    this.drag.events.onEsc = (e) => { if (this.drag.active && e.key === 'Escape') { this.dragEnd(false); } };
    this.drag.events.onMouseMove = (e) => this.dragMode(e);
    window.addEventListener('mouseup', this.drag.events.onMouseUp);
    window.addEventListener('keydown', this.drag.events.onEsc);
    window.addEventListener('mousemove', this.drag.events.onMouseMove);
    dragMode && this.onDragStart && (this.onDragStart.call(null, item, this));
    !dragMode && this.onQueueStart && (this.onQueueStart.call(null, this));
  }
  dragOver(item) { if (this.drag.active) { this.drag.over = item; } }
  dragMode(e) {
    this.drag.shiftKey = e.shiftKey;
    if (this.drag.active && this.drag.over) {
      if (!this.drag.children.includes(this.drag.over)) {
        let rect = this.drag.over.element.getBoundingClientRect(),
            relX = e.clientX - rect.left,
            relY = e.clientY - rect.top;
        let dragIdxPrevEl, dragIdxNextEl;
        if (this.drag.over !== this.drag.item && relY > rect.height/2) {
          this.drag.over.element.after(this.drag.index);
          dragIdxPrevEl = this.drag.over;
          dragIdxNextEl = this.drag.over.nextItem;
        }
        else {
          this.drag.over.element.before(this.drag.index);
          dragIdxPrevEl = this.drag.over.previousItem;
          dragIdxNextEl = this.drag.over;
        }
        let nextSib = (dragIdxNextEl ? (dragIdxNextEl.getSibling(1) || 'last') : 'last'),
            prevSib = (dragIdxNextEl ? (dragIdxNextEl.getSibling(-1) || 'first') : 'last');
        if (this.levels) {
          let level = (dragIdxNextEl ? dragIdxNextEl.level : this.lastItem.level),
              maxLevel = Math.min(level, this.levels), minLevel = level,
              mouseLevel = Math.round(relX / (parseFloat(getComputedStyle(document.body).fontSize)*2));
          if ((this.drag.item === dragIdxNextEl && dragIdxNextEl.isLastChild()) || !dragIdxNextEl || (this.drag.item === dragIdxNextEl && nextSib === 'last')) { minLevel = (nextSib === 'last' ? this.items.slice(0,dragIdxPrevEl.position).reverse().find(f => f.static && f.isParent).level+1 : nextSib.level); }
          if (typeof prevSib !== 'string' && prevSib.isParent && prevSib !== this.drag.item) { maxLevel = Math.max(prevSib.level+1, maxLevel); }
          if (dragIdxPrevEl && dragIdxPrevEl.level > this.drag.item.level) { maxLevel = Math.max(dragIdxPrevEl.level+(dragIdxPrevEl.isParent ? 1 : 0), maxLevel); }
          if (!dragIdxNextEl) { minLevel = Math.max(...this.items.filter(f => f.static).map(i => i.level))+1; }
          this.drag.level = Math.max(Math.min(maxLevel, mouseLevel), minLevel);
          this.drag.index.setAttribute('data-level', this.drag.level);
        }
        this.drag.at = dragIdxPrevEl ? dragIdxPrevEl : null;
        if (prevSib === this.drag.item) { this.drag.at = prevSib; }
      }
    }
  }
  dragEnd(success) {
    const dragMode = !this.itemsQueue.length;
    this.drag.active = false;
    window.removeEventListener('mouseup', this.drag.events.onMouseUp);
    window.removeEventListener('keydown', this.drag.events.onEsc);
    window.removeEventListener('mousemove', this.drag.events.onMouseMove);
    this.drag.events.transfer && (window.removeEventListener('mousemove', this.drag.events.transfer));
    if (success === true) {
      if (dragMode) {
        if (this.multiSelect && this.drag.shiftKey && this.drag.item.selected) {
          const items = this.selected;
          this.selected.forEach(i => i.remove());
          items.forEach((args, idx) => this.addItem({ ...args, selected: true, label: args._label, level: Math.min(this.drag.level, ...items.map(m => m._level)), position: this.drag.at ? this.drag.at.position+1+idx : (this.lastItem && this.drag.index.parentNode.lastChild === this.drag.index ? this.lastItem.position+1+idx : 0) }));
        }
        else {
          this.drag.item.move(this.drag.at, this.drag.level);
          this.onDragEnd && (this.onDragEnd.call(null, this.drag.item, this))
        }
      }
      else {
        this.itemsQueue.forEach((args, idx) => this.addItem({ ...args, position: this.drag.at ? this.drag.at.position+1 : (this.lastItem && this.drag.index.parentNode.lastChild === this.drag.index ? this.lastItem.position+1 : 0) }));
        this.onQueueEnd && (this.onQueueEnd.call(null, this));
        this.itemNumber && (this.resetItemNumber());
      }
    }
    this.itemsQueue = [];
    dragMode && (this.drag.item.element.classList.remove('dragged'));
    this.drag.index.remove();
    this.drag.over = null;
  }
  showAddItemMenu(mouseEvent, hostItem = null) {
    if (!this.itemTypes && this.addItemDialog) { this.addItemDialog.open(mouseEvent); }
    else {
      const options = this.itemTypes.filter(type => !type.static).map((type) => {
        const lastChild = this.levels ? (hostItem.lastChild || hostItem) : hostItem;
        const action = (o) => {
          const newItem = this.addItem({ type: type, parent: this.levels && hostItem ? hostItem.id : null, position: (lastChild ? lastChild.position+1 : null) });
          const newItemHeight = newItem.element.getBoundingClientRect().height;
          newItem.element.animate([{ height: 0 }, { height: newItemHeight+'px' }], { duration: ms });
        }
        return { label: type.label, value: type.value, action: action };
      });
      this.addItemTypeMenu.setOptions(options);
      setTimeout(() => this.addItemTypeMenu.open(mouseEvent));
    }
  }
  resetItemNumber() { if (!this.itemNumber) { return; } this.items.forEach((i, n) => { i.numberEl.textContent = n+1; }); }
  static convert(selectTag, args) {
    const list = new VID_ItemsList({ id: selectTag.id, nameAttr: selectTag.name, multiSelect: selectTag.multiple, disabled: selectTag.disabled, ...args });
    Array.from(selectTag.options).filter(o => o.textContent).map(o => { return { label: o.textContent, valueAttr: o.value, selected: o.selected } }).forEach((o) => { list.addItem(o); });
    selectTag.replaceWith(list.element);
    return list;
  }
  debug(code = 1) {
    if (code === 1) { console.log(this.items.map(m => { return m.label+' ('+m.id+')'+(m.parent ? '\t\tparent: '+m.parent.label+' ('+m.parent.id+')' : '') }).join('\n')); }
  }
}

class VID_Item {
  constructor(list, args = {}) {
    if (!list instanceof VID_ItemsList) { delete this; return; }
    args = { label: '', valueAttr: null, selected: false, disabled: false, options: [], link: null, classList: '',
      id: null, type: null, static: false, parent: null, isParent: false, hasAddBtn: list.removableItems, editableLabel: list.editableLabels,
      position: list.items.length, ...args };
    const position = args.position < 0 ? Math.max(0, list.items.length - args.position) : Math.min(args.position, list.items.length);
    list.items.splice(position, 0, this);
    this.list = list;
    this.id = (args.id !== null && !list.items.some(f => f.id === args.id) ? parseInt(args.id) : Math.max(0, ...list.items.filter(i => i.id).map(i => i.id !== null && (parseInt(i.id))))+1);
    this.valueAttr = args.valueAttr;
    this.type = args.type ? (typeof args.type === 'string' ? list.types.find(f => f.type === args.type) : args.type) : null;
    this._label = args.label ? args.label : (this.type ? this.type.label : '');
    this._selected = args.selected;
    this.disabled = args.disabled;
    if (args.editableLabel) {
      this.editableLabel = true;
      this.onLabelInput = args.onLabelInput || list.onLabelInput;
      this.onLabelChange = args.onLabelChange || list.onLabelChange;
      this.labelControl = new VID_InputControl({ inscribed: true, value: String(this.label),
        onInput: (this.onLabelInput ? (c) => { this.label = c.inputEl.value; this.onLabelInput && (this.onLabelInput.call(null, this, c)); } : null),
        onChange: (c) => { this.label = c.value; this.onLabelChange && (this.onLabelChange.call(null, this, c)); }
      });
    }
    this.link = args.link;
    this.parent = list.items.find(i => i.id === args.parent);
    this.isParent = (this.type ? ('isParent' in this.type ? this.type.isParent : false) : args.isParent);
    this.static = (this.type && ('static' in this.type) ? this.type.static : args.static);
    const hasAddBtn = this.isParent && (this.type ? ('hasAddBtn' in this.type ? this.type.hasAddBtn : true) : args.hasAddBtn),
          hasRemoveBtn = (list.removableItems ? (this.static ? false : (this.type && this.type.removable ? this.type.removable : true)) : false);
    this._level = 0;
    if (this.parent && list.levels) { this._level = this.parent.level+1; }
    this.options = [];
    if (this.type && typeof args.options === 'object') { ('options' in this.type) && (this.type.options.forEach(o => this.addOption(o, (o.name in args.options ? args.options[o.name] : o.default)))); }
    else if (Array.isArray(args.options) && args.options.length) { args.options.forEach(o => this.addOption(o)); }
    //Build the element
    const el = VID_NewEl('div', { classList: 'item'+(args.isParent ? ' is-parent' : '')+(args.selected ? ' selected' : '')+(args.disabled ? ' disabled' : '')+(args.classList ? ' '+args.classList : '') }, { 'data-level': this.level }),
          body = VID_NewEl('div', { classList: 'item-body' }),
          main = VID_NewEl('div', { classList: 'item-main' }),
          label = VID_NewEl('div', { classList: 'item-label', textContent: args.editableLabel ? '' : this.label });
    if (this.list.itemNumber) {
      this.numberEl = VID_NewEl('div', { classList: 'item-number' });
      main.appendChild(this.numberEl);
      list.resetItemNumber();
    }
    if (this.editableLabel) { label.appendChild(this.labelControl.element); }
    el.appendChild(body).appendChild(main);
    if (list.draggable && !this.static) {
      const dragger = VID_NewEl('div', { classList: 'item-drag', innerHTML: '<span>:::</span>' });
      main.appendChild(dragger);
      dragger.addEventListener('mousedown', (e) => {
        if (!list.disabled && !this.disabled && list.draggable && !list.drag.active && e.button === 0 && (list.selected.every((e, i, a) => e.level === a[0].level))) {
          list.dragStart(this);
          if (list.transferTo && list.drag.events.transfer) { window.addEventListener('mousemove', list.drag.events.transfer); }
        }
      });
      el.addEventListener('mousemove', (e) => { if (!list.disabled && list.draggable && list.drag.active) { this.list.dragOver(this); } });
    }
    label.addEventListener('click', (e) => {
      if (!list.disabled && !this.disabled) {
        if (this.list.preventUnselected && this.list.selected.length <= 1 && this.selected) { return; }
        if (list.useSelectKeys) {
          if (e.ctrlKey) { this.selected = !this.selected }
          else if (e.shiftKey && list.lastSelected) {
            const from = Math.min(list.lastSelected.position, this.position), to = Math.max(list.lastSelected.position, this.position)+1,
                  range = list.items.slice(from, to), selected = range.every(i => i.selected);
            range.forEach(i => i.selected = selected ? false : true); }
          else { list.selected = list.selected.length === 1 && this.selected ? [] : this; }
          list.lastSelected = this;
        }
        else { this.selected = !this.selected; }
      }
    });
    main.appendChild(label);
    if (hasRemoveBtn) {
      const removeBtn = VID_NewEl('button', { classList: 'button-secondary is-destructive', textContent: list.labels.removeBtn });
      removeBtn.addEventListener('click', (e) => { !this.disabled && (list.removeItem(this)); });
      main.appendChild(removeBtn);
    }
    if (hasAddBtn) {
      this.addBtn = VID_NewEl('button', { classList: 'button-secondary', textContent: list.labels.addBtn });
      this.addBtn.addEventListener('click', (e) => { !this.disabled && (list.showAddItemMenu(e, this)) });
      main.appendChild(this.addBtn);
    }
    if (this.options.length) {
      const expand = this.options.filter(f => !f.inline),
            inline = this.options.filter(f => f.inline);
      if (expand.length) {
        const optionsWrap = VID_NewEl('div', { classList: 'item-options' }, {}, { height: 0 }),
              insideWrap = VID_NewEl('div', { classList: 'item-options-inside' });
        body.appendChild(optionsWrap).appendChild(insideWrap).append(...expand.map(o => o.control.element));
      }
      if (inline.length) {
        const inlineWrap = VID_NewEl('div', { classList: 'item-options-inline' });
        label.appendChild(inlineWrap).append(...inline.map(o => o.control.element));
      }
    }
    if (this.inputHidden) { el.appendChild(this.inputHidden); }
    this.element = el;
    //Append it to the Items List element
    let after = list.items[this.position-1], before = after ? null : list.items[this.position+1];
    if (after) { after.element.after(this.element); }
    else if (before) { before.element.before(this.element); }
    else { list.listEl.appendChild(this.element); }
  }
  get position() { return this.list.items.indexOf(this); }
  set position(v) {
    if (isNaN(v)) { return; }
    v = parseInt(v);
    const movingUp = v < this.position;
    let item = (v >= 0 ? (v < this.list.items.length-1 ? this.list.items[v] : this.list.lastItem) : 0);
    if (this.children.length && this.children.includes(item)) { item = this.getSibling(movingUp ? -1 : 1); }
    if (item === undefined) { return; }
    const level = item ? (item.parent ? (item.isParent ? item.level+1 : item.level) : item.level) : this.list.items[0].level;
    if ((item.nextItem && item.nextItem.static) || (v <= 0 && this.list.items[0].static)) { return; }
    this.move(item, level);
  }
  set selected(v) {
    if (!this.list.selectable) { return; }
    v = Boolean(v);
    if (v === this._selected) { return; }
    const options = this.element.querySelector('.item-options');
    if (options) { options.style.height = '100%'; }
    const height = (options ? options.getBoundingClientRect().height : null);
    if (v) {
      if (!this.list.multiSelect) { this.list.selected.forEach(i => { i.selected = false; }); }
      this.element.classList.add('selected');
      this._selected = true;
      if (options) { options.animate([{ height: 0 }, { height: height+'px' }], { duration: ms }); }
      this.list.onSelect && (this.list.onSelect.call(null, this, this.list));
    }
    else {
      this.element.classList.remove('selected');
      this._selected = false;
      if (options) {
        options.animate([{ height: height+'px' }, { height: 0 }], { duration: ms });
        options.style.height = 0;
      }
      this.list.onDeselect && (this.list.onDeselect.call(null, this, this.list));
    }
    if (this.list.inputHidden) { this.list.inputHidden.value = this.list.selected.map((i) => i.valueAttr === null ? i.id : i.valueAttr).join(','); }
  }
  get selected() { return this._selected; }
  set label(v) { this._label = this.element.querySelector('.item-label').textContent = v; this.list.onChange && (this.list.onChange.call(null, this.list)); }
  get label() { return this._label; }
  remove(splice = true) {
    const itemHeight = this.element.getBoundingClientRect().height;
    this.element.animate([{ height: itemHeight+'px' }, { height: 0 }], { duration: ms });
    setTimeout(() => { this.element.remove(); delete this; }, ms);
    const children = this.allChildren;
    children.forEach((c) => c.remove(false));
    splice && (this.list.items = this.list.items.filter(f => ![this, ...children].includes(f)));
    splice && this.list.itemNumber && (this.list.resetItemNumber());
    this.list.onChange && (this.list.onChange.call(null, this.list));
  }
  addOption(opCfg, value) { this.options.push(new VID_ItemOption(this, opCfg, value)); }
  getOption(name) { return this.options.find(f => f.name === name); }
  hasChildren() { return this.list.items.some(f => f.parent === this); }
  get children() { return this.list.items.filter(f => f.parent === this); }
  get allChildren() {
    let children = [];
    this.list.items.forEach(i => {
      if (!i.parent) { return; }
      let temp = i.parent.id;
      while (temp) {
        if (temp === this.id) { children.push(i); break; }
        else {
          temp = this.list.items.find(f => f.id === temp);
          if (temp && temp.parent) { temp = temp.parent.id; } else { break; }
        }
      }
    });
    return children;
  }
  get previousItem() { return this.list.items[this.position-1]; }
  get nextItem() { return this.list.items[this.position+1]; }
  get lastChild() { return [...this.allChildren].pop(); }
  getNeighbor(rel) { return this.list.items[this.position+rel]; }
  getAncestors() {
    let temp = this,
        ancestors = [];
    while (temp.parent.id !== 1) {
      temp = this.list.items.find(f => f.id === temp.parent.id);
      ancestors.push(temp);
    }
    return ancestors;
  }
  isLastChild() {
    const children = this.list.levels && this.parent ? this.parent.children : this.list.items;
    if (children.indexOf(this) === children.length-1) { return true; }
    return false;
  }
  getSibling(rel = 1) {
    rel = (rel >= 0 ? 1 : -1);
    let siblings = this.list.levels && this.parent ? this.parent.children : this.list.items;
    if (rel === 1 && siblings.indexOf(this) === siblings.length-1) {
      for (let i = this.list.items.indexOf(this); this.list.items[i]; i++) {
        if (this.level > this.list.items[i].level) { return this.list.items[i]; }
      }
    }
    if (rel === -1 && siblings.indexOf(this) === 0) {
      return this.list.items[this.list.items.indexOf(this)-1];
    }
    return siblings[(siblings.indexOf(this))+rel];
  }
  set level(v) { if (isNaN(v)) { return; } v = parseInt(v); this._level = v; this.element.setAttribute('data-level', v); }
  get level() { return this._level; }
  appendLeft() {
    if (!this.list.levels || !this.list.draggable || this.level <= 0) { return; }
    if (this.parent && !this.parent.static && this.isLastChild()) { this.move(this, this.level-1); }
  }
  appendRight() {
    if (!this.list.levels || !this.list.draggable || this.list.levels <= this.level) { return; }
    const prev = this.previousItem;
    if (prev && (prev.level > this.level || (prev.isParent && this.level === prev.level))) { this.move(this, this.level+1); }
  }
  move(at, level = this.level) {
    const isFirst = at ? false : true;
    at = (typeof at === 'number' ? this.list.items[Math.min(this.list.items.length-1, Math.max(0, at))] : at);
    const currentLevel = this.level;
    [this, ...this.allChildren].reverse().forEach((item, idx) => {
      const levelDiff = (item.level-currentLevel);
      if (this !== at) {
        this.list.items.splice(item.position,1);
        this.list.items.splice(isFirst ? 0 :at.position+1,0,item);
      }
      item.level = level+levelDiff;
    });
    for (let i=this.position; i>0; i--) { if (this.list.items[i].level < this.level) { this.parent = this.list.items[i]; break; } }
    this.list.listEl.append(...this.list.items.map(i => i.element));
    this.list.itemNumber && (this.list.resetItemNumber());
    this.list.onChange && (this.list.onChange.call(null, this.list));
  }
}

class VID_ItemOption {
  constructor(item, args = {}, value) {
    if (!item instanceof VID_Item) { delete this; return; }
    args = { default: '', value: '', label: '', inline: false, options: [], unlocks: [], nameAttr: '', disabled: false, excludeChars: '', hint: '',
      prefix: '', suffix: '', labelOnLeft: false, href: null, classList: '', target: '', suggestions: [], minLength: 1, maxTokens: null, maxSuggestions: 6,
      addList: [], addMenuLabel: '', onChange: null, onInput: null, onClick: null, ...args };
    this.item = item;
    this.list = item.options;
    this.name = args.name;
    this.label = args.label;
    this.type = args.type;
    this._value = value ? value : (args.value ? args.value : args.default);
    if (this._value) { args.options.forEach(o => { o.selected = [this._value].flat().includes(o.value); }); }
    this.inline = args.inline;
    this.unlocks = args.unlocks;
    this._locked = false;
    this.onChange = args.onChange;
    this.onInput = args.onInput;
    this.onClick = args.onClick;
    switch(this.type) {
      case 'input': this.control = new VID_InputControl(
        { label: this.label, value: this.value, labelOnLeft: args.labelOnLeft, max: args.max, excludeChars: args.excludeChars,
          suggestions: args.suggestions, minLength: args.minLength, maxSuggestions: args.maxSuggestions, hint: args.hint,
          addList: args.addList, addMenuLabel: args.addMenuLabel, onChange: (c) => { this.value = c.value; },
          onInput: (c) => { this.value = c.inputEl.value; this.onInput && (this.onInput.call(null, this, c)); }
        }); break;
      case 'select': this.control = new VID_SelectControl(
        { label: this.label, name: args.nameAttr, multiple: args.multiple || false, hint: args.hint, classList: args.classList, labelOnLeft: args.labelOnLeft, dropDownParent: this.item.list.element,
          onChange: (s) => { this.value = s.value; this.unlocks.length && (this.watch()); }
        }, args.options); break;
      case 'toggle': this.control = new VID_ToggleControl(
        { label: this.label, name: args.nameAttr, checked: this.value, hint: args.hint, classList: args.classList, labelOnLeft: args.labelOnLeft,
          onChange: (c) => { this.value = c.checked; this.unlocks.length && (this.watch()); }
        }); break;
      case 'number': this.control = new VID_NumberControl(
        { label: this.label, name: args.nameAttr, value: this.value, hint: args.hint, classList: args.classList, labelOnLeft: args.labelOnLeft, min: args.min, max: args.max, step: args.step, prefix: args.prefix, suffix: args.suffix,
          onChange: (c) => { this.value = c.value; },
          onInput: (c) => { this.value = c.inputEl.value; this.onInput && (this.onInput.call(null, this, c)); }
        }); break;
      case 'tokens': this.control = new VID_TokensControl(
        { label: this.label, name: args.nameAttr, value: this.value, hint: args.hint, classList: args.classList, labelOnLeft: args.labelOnLeft, excludeChars: args.excludeChars, suggestions: args.suggestions, minLength: args.minLength, maxTokens: args.maxTokens, maxSuggestions: args.maxSuggestions, value: this.value,
          onChange: (c) => { this.value = c.value; this.onChange && (this.onChange.call(null, this, c)); this.item.list.onChange && (this.item.list.onChange.call(null, this.item.list)); },
          onInput: (c) => this.onInput && (this.onInput.call(null, this, c))
        }); break;
      case 'anchor': this.control = { element: VID_NewEl('a', { classList: args.classList, textContent: this.label, target: args.target, href: args.href ? args.href : 'javascript:void(0);', onclick: (e) => this.onClick && (this.onClick.call(null, this, e)) }) }; break;
      case 'hint': this.control = VID_Hint.create(this.label ? this.label : this.value); break;
      case 'break': this.control = { element: VID_NewEl('div', {}, {}, { width: '100%' }) }; break;
      case 'html': this.control = { element: VID_NewEl('div', { classList: 'vid-html', innerHTML: this.value }) }; break;
      default: this.control = { element: VID_NewEl('div', { classList: 'vid-label', textContent: this.label })};
    };
    const locker = this.list.find(f => f.unlocks && f.unlocks.some(ff => ff.name === this.name));
    if (locker) {
      const on = locker.unlocks.find(f => f.name === this.name).on;
      if (![locker.value].flat().includes(on)) { this.locked = true; }
    }
  }
  set value(v) {
    const prev = this._value;
    this._value = v;
    if (prev === this._value) { return; }
    this.onChange && (this.onChange.call(null, this, this.control));
    this.item.list.onChange && (this.item.list.onChange.call(null, this.item.list));
  }
  get value() { return this._value; }
  watch() {
    this.unlocks.forEach(u => {
      const o = this.list.find(f => f.name === u.name);
      const prev = o ? o.locked : null;
      o && (o.locked = (![this.value].flat().includes(u.on)));
    });
  }
  set locked(v) {
    v = Boolean(v);
    this.control.disabled = this._locked = v;
    v ? this.control.element.classList.add('vid-hidden') : this.control.element.classList.remove('vid-hidden');
  }
  get locked() { return this._locked; }
}
