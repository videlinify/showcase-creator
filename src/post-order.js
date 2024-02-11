window.addEventListener('DOMContentLoaded', () => pscPostOrderInit());

function pscPostOrderInit() {
  const pscData = (typeof PSC_DATA !== 'undefined' ? PSC_DATA : null);
  if (!pscData) { throw('Cannot retrieve data from server.'); }
  let getFocus = document.getElementById('psc-get-focus');
  const key = VID_SelectControl.convert(document.getElementById('key'), { label: pscStr('Order lists'), onChange: onKeySelect, width: '240px' }),
        messageFail = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Failed to update list.'), duration: 3000 }, style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff', top: '100px', transform: 'translate(-50%, 0)' } }),
        messageSuccess = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('List updated.'), duration: 3000 }, style: { fontSize: '1.5em', top: '100px', transform: 'translate(-50%, 0)' } }),
        loading = new VID_Loading(),
        keyChangeDialog = new VID_Dialog({ type: 'confirm', title: pscStr('Changes have been made that have not been saved. Would you like to save them or not?'), options: { confirmBtn: pscStr('Save'), cancelBtn: pscStr('Do not save') }, style: { minWidth: '100px', maxWidth: '300px' } }),
        moveAtDialog = new VID_Dialog({ type: 'number', title: pscStr('Move at...'), options: { min: 1 } }),
        linkDialogEl = document.getElementById('mk-link-dialog');
  const controls = {
    add: document.getElementById('mk-add-btn'),
    rename: document.getElementById('mk-rename-btn'),
    remove: document.getElementById('mk-remove-btn'),
    unlink: document.getElementById('mk-unlink-btn'),
    link: {
      btn: document.getElementById('mk-link-btn'),
      cat: VID_SelectControl.convert(document.getElementById('mk-link-cat'), { dropDownParent: linkDialogEl }),
      type: VID_SelectControl.convert(document.getElementById('mk-link-type'), { onChange: (s) => {
        const newTaxs = s.value === 'any' ? [] : pscData.taxs.filter(f => f.object_type.includes(s.value[0])).map(o => { return { label: o.label, value: o.name } });
        controls.link.tax.setOptions(newTaxs, '', ['']);
        controls.link.term.setOptions([], 0, [0]);
      }, dropDownParent: linkDialogEl }),
      tax: VID_SelectControl.convert(document.getElementById('mk-link-tax'), { onChange: (s) => {
        const newTerms = pscData.terms.filter(f => f.taxonomy === s.value[0]).map(o => { return { label: o.name, value: o.term_id } });
        controls.link.term.setOptions(newTerms, 0, [0]);
      }, dropDownParent: linkDialogEl }),
      term: VID_SelectControl.convert(document.getElementById('mk-link-term'), { dropDownParent: linkDialogEl }),
      author: VID_SelectControl.convert(document.getElementById('mk-link-author'), { dropDownParent: linkDialogEl }),
      pos: VID_SelectControl.convert(document.getElementById('mk-link-pos'), { onChange: (s) => {
        if (s.value[0] === 'custom') { controls.link.posCustom.disabled = false; }
        else { controls.link.posCustom.disabled = true; }
      }, dropDownParent: linkDialogEl }),
      posCustom: VID_NumberControl.convert(document.getElementById('mk-link-pos-custom')),
      submit: document.getElementById('mk-link-submit')
    },
    wipe: VID_ToggleControl.convert(document.getElementById('mk-wipedata'))
  };
  const addInput = VID_Dialog.attachTo(controls.add, {
    title: pscStr('Add a new post order list'),
    type: 'controls',
    options: { confirmBtn: pscStr('Add'), cancelBtn: pscStr('Cancel'),
      controls: [
        new VID_InputControl({ label: pscStr('List label'), onInput: (c) => addInput.options.controls[2].value && (addInput.options.controls[1].value = c.inputEl.value.toLowerCase().replace(/\s+/g,'-').replace(/\-{2,}/g, '-').replace(/[^0-9A-z\-]|^\-/gi, '').slice(0,12).replace(/\-$/, '')) }),
        new VID_InputControl({ label: pscStr('Key'), excludeChars: '^0-9A-z\\-', description: pscStr('Latin letters, digits and hyphen only') }),
        new VID_ToggleControl({ label: pscStr('Auto generate key'), checked: true })
      ]
    },
    onConfirm: (d) => { const lv = d.options.controls[0].inputEl.value, kv = d.options.controls[1].inputEl.value;
      if (!kv.length || !lv.length) { d.error = pscStr('Label and key fields are required.'); return; }
      sendRequest(null, 'add', JSON.stringify([kv, lv])); },
    onOpen: (d) => { d.options.controls[0].value = d.options.controls[1].value = ''; }
  });
  const renameInput = VID_Dialog.attachTo(controls.rename, {
    title: pscStr('Rename a post order list'),
    type: 'controls',
    options: { confirmBtn: pscStr('Rename'), cancelBtn: pscStr('Cancel'),
      controls: [
        new VID_InputControl({ label: pscStr('List label'), onInput: (c) => renameInput.options.controls[2].value && (renameInput.options.controls[1].value = c.inputEl.value.toLowerCase().replace(/\s+/g,'-').replace(/\-{2,}/g, '-').replace(/[^0-9A-z\-]|^\-/gi, '').slice(0,12).replace(/\-$/, '')) }),
        new VID_InputControl({ label: pscStr('Key'), excludeChars: '^0-9A-z\\-', description: pscStr('Latin letters, digits and hyphen only') }),
        new VID_ToggleControl({ label: pscStr('Auto generate key'), checked: false })
      ]
    },
    onConfirm: (d) => { const lv = d.options.controls[0].inputEl.value, kv = d.options.controls[1].inputEl.value;
      if (!kv.length || !lv.length) { d.error = pscStr('Label and key fields are required.'); return; }
      sendRequest(key.value[0], 'rename', JSON.stringify([kv, lv])); },
    onOpen: (d) => {
      const keydata = pscData.metakeys.find(f => f.key === key.value[0]);
      if (!keydata) { d.close(); return; }
      d.options.controls[0].value = keydata.label;
      d.options.controls[1].value = keydata.key;
    }
  });
  const removeConfirm = VID_Dialog.attachTo(
    controls.remove,
    {
      title: pscStr('Remove')+'?',
      onOpen: (d) => { d.title = pscStr('Remove "%1"?', key.value[0]); },
      type: 'confirm',
      options: { message: pscStr('Are you sure you want to continue?'), confirmBtn: pscStr('Remove'), cancelBtn: pscStr('Cancel'), reverseDestructive: true },
      style: { backgroundColor: 'var(--vid-destructive)', color: '#fff' },
      onConfirm: () => { sendRequest(key.value[0], 'remove', null); }
    });
  const unlinkConfirm = VID_Dialog.attachTo(
    controls.unlink,
    {
      title: pscStr('Unassociate')+'?',
      onOpen: (d) => { d.title = pscStr('Unassociate "%1"?', key.value[0]); },
      type: 'confirm',
      options: { confirmBtn: pscStr('Unassociate'), cancelBtn: pscStr('Cancel'), reverseDestructive: true },
      style: { backgroundColor: 'var(--vid-destructive)', color: '#fff' },
      onConfirm: () => { sendRequest(key.value[0], 'unlink', controls.wipe.value ? true : false); }
    });
  controls.link.submit.addEventListener('click', () => {
    const type = linkToSwitch.switched.switch.value;
    let to;
    const pos = (controls.link.pos.value[0] === 'custom' ? controls.link.posCustom.value : controls.link.pos.value[0]);
    switch(type) {
      case 'cat': to = controls.link.cat.value[0]; break;
      case 'term': to = [controls.link.type.value[0], controls.link.tax.value[0], controls.link.term.value[0]]; break;
      case 'author': to = controls.link.author.value[0]; break;
    }
    sendRequest(key.value[0], 'link', to === '' ? '' : JSON.stringify([type, to, pos]));
  });
  const linkToSwitch = new VID_ContentSwitch(
    [ { switch: document.getElementById('mk-link-to-cat'), content: document.getElementById('mk-link-cat-container') },
      { switch: document.getElementById('mk-link-to-term'), content: document.getElementById('mk-link-term-container') },
      { switch: document.getElementById('mk-link-to-author'), content: document.getElementById('mk-link-author-container') },
      { switch: document.getElementById('mk-link-to-unlink') }],
    document.getElementById('mk-link-to-container'),
    { animate: 'scale' }
  );
  const linkedDynamic = new VID_DynamicText(document.getElementById('key-linked-to'));
  const linkedSwitch = new VID_ContentSwitch([document.getElementById('key-unlinked'), document.getElementById('key-linked')], document.getElementById('key-link-state'), { animate: false });
  const linkDialog = VID_Dialog.from(linkDialogEl, { options: { buttons: false }, onOpen: (d) => {
    linkToSwitch.switch(3);
    controls.link.posCustom.disabled = controls.link.pos.value[0] === 'custom' ? false : true;
  } }).attachTo(controls.link.btn);

  let currentKey = key.value[0], initIds = [], keydata;

  //warn if changes in the order of the list were made
  function onKeySelect(c) {
    const reqKey = String(key.value[0]);
    if (initIds.join(',') === list1.items.map(i => i.valueAttr).join(',')) { keySelect(reqKey); return; }
    if (c.value[0] !== currentKey) { c.selector(c.options.find(f => f.value === currentKey), true); }
    keyChangeDialog.onConfirm = () => { saveOrder(); keySelect(reqKey); };
    keyChangeDialog.onCancel = () => keySelect(reqKey);
    keyChangeDialog.open();
  }
  //select the key
  function keySelect(k) {
    keydata = pscData.metakeys.find(f => f.key === k);
    if (!k || !keydata || !key.options.length) { controls.rename.disabled = controls.remove.disabled = controls.link.btn.disabled = controls.unlink.disabled = saveBtn.disabled = true; return; }
    else { controls.rename.disabled = controls.remove.disabled = controls.link.btn.disabled = controls.unlink.disabled = saveBtn.disabled = false; }
    if (key.value[0] !== k) { key.selector(key.options.find(f => f.value === k), true); }
    currentKey = k;
    loading.open();
    if (!keydata) { return; }
    loadList1();
    setLinked(keydata.linked);
  }
  //set linked controls
  function setLinked(linked) {
    linkedSwitch.switch(linked ? 1 : 0);
    if (!linked) { filters.switched = [0]; filterType.value = 'post'; filterTax.value = ''; filterTerm.value = 0; filterAuthor.value = ''; filterPosts(); }
    else if (linked[0] === 'cat') {
      linkedDynamic.content = pscData.terms.find(f => f.term_id === parseInt(linked[1])).name+' ('+pscStr('Category')+')';
      controls.link.posCustom.disabled = parseInt(linked[2]) <= 0 ? true : false;
      controls.link.position
      filters.switched = [0]; filterType.value = 'post'; filterTax.value = 'category'; filterTerm.value = parseInt(linked[1]); filterAuthor.value = ''; filterPosts();
    }
    else if (linked[0] === 'term') {
      const tax = pscData.taxs.find(f => f.name === linked[2]), term = pscData.terms.find(f => f.term_id === parseInt(linked[3]));
      linkedDynamic.content = pscData.types.find(f => f.name === linked[1]).label+(tax && term ? ' > '+tax.label+' > '+term.name : ' ('+pscStr('post type')+')');
      filters.switched = [0]; filterType.value = linked[1]; filterTax.value = linked[2]; filterTerm.value = parseInt(linked[3]); filterAuthor.value = ''; filterPosts();
    }
    else if (linked[0] === 'author') {
      linkedDynamic.content = pscData.authors.find(f => f.id === parseInt(linked[1])).name+' ('+pscStr('Author')+')';
      filters.switched = [2]; filterType.value = ''; filterTax.value = ''; filterTerm.value = 0; filterAuthor.value = parseInt(linked[1]); filterPosts();
    }
  }

  //send meta key update request
  function sendRequest(k, act, req) {
    const data = new FormData();
    data.append('action', 'psc_update_key');
    data.append('key', k);
    data.append('act', act);
    data.append('req', req);
    loading.open();
    pscFetch('ajax', data).then((r) => {
      loading.close();
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { messageSuccess.message = r.comment; messageSuccess.open(); makeChanges(k, act, req); loadList1(); }
      console.log(r);
    });
  }
  //make changes if the meta key request is successful
  function makeChanges(k, act, req) {
    req = req ? (VID_stringIsJson(req) ? JSON.parse(req) : req) : null;
    console.log('make changes | key:',k, 'action:',act, 'request:',req);
    const keyObj = pscData.metakeys.find(f => f.key === k);
    switch(act) {
      case 'add':
        pscData.metakeys.push({ key: req[0], label: req[1], linked: null, at: 0 });
        key.addOption({ label: req[1]+' ('+req[0]+')', value: req[0] });
        key.options.length === 1 && (key.value = key.options[0].value); break;
      case 'remove':
        pscData.metakeys.splice(pscData.metakeys.indexOf(keyObj), 1);
        key.removeOption(key.options.find(f => f.value === k)); break;
      case 'rename':
        const optEl = key.options.find(f => f.value === k);
        key.changeOptionLabel(optEl, req[1]+' ('+req[0]+')');
        keyObj.label = req[1];
        keyObj.key = optEl.value = currentKey = req[0];
        console.log(keyObj, optEl);
        break;
      case 'link':
        req = req.flat();
        keyObj.linked = req;
        setLinked(req); linkDialog.close(); break;
      case 'unlink': keyObj.linked = null; setLinked(null); break;
    }
  }
  //prepare the lists' item options
  function getItemOptions(post, moveBtn = true) {
    let options = [{ type: 'anchor', inline: true, label: pscStr('View'), target: '_blank', href: post.permalink }];
    if (moveBtn) {
      options.push({ type: 'anchor', inline: true, label: pscStr('Move at...'), onClick: (o, e) => {
        moveAtDialog.onOpen = (d) => { d.controls.input.value = o.item.position+1; };
        moveAtDialog.onConfirm = (d) => o.item.move(d.controls.input.value-1);
        moveAtDialog.open(e);
      } });
    }
    return options;
  }
  //load the post order in the list
  function loadList1() {
    pscFetch('rest', 'get=order&meta_key='+currentKey).then((r) => {
      loading.close();
      list1.clearItems();
      list2.clearItems();
      initIds = [];
      if (!currentKey || !(currentKey in r.order)) { return; }
      r.order[currentKey].forEach(i => {
        list1.addItem({ label: i.post_title, valueAttr: i.ID, options: getItemOptions(i) });
        initIds.push(i.ID);
      });
      saveBtn.disabled = true;
      window.removeEventListener('beforeunload', unloadFunc);
      if (getFocus) {
        const focused = list1.items.find(f => f.valueAttr === parseInt(getFocus.value));
        list1.selected = focused;
        focused.element.scrollIntoView({ behaviour: 'smooth', block: 'center' });
        getFocus = null;
      }
    });
  }
  //drag resizer
  const resizer = document.getElementById('psc-resizer'),
        mainWrapper = document.getElementById('psc-main'),
        orderWrapper = document.getElementById('psc-order'),
        extraWrapper = document.getElementById('psc-extra'),
        resizerMove = (e) => {
          const rect = document.querySelector('.psc-resizable-parent').getBoundingClientRect(),
                pos = (e.clientX-rect.x)/rect.width;
          orderWrapper.style.width = parseInt(pos*100)+'%';
          extraWrapper.style.width = 100-parseInt(pos*100)+'%';
        };
  resizer.addEventListener('mousedown', (e) => { if (e.button === 0) { window.addEventListener('mousemove', resizerMove); mainWrapper.style.userSelect = 'none'; } });
  window.addEventListener('mouseup', (e) => { window.removeEventListener('mousemove', resizerMove); mainWrapper.style.userSelect = null; });
  //lists
  const list1 = new VID_ItemsList({ showItemNumber: true, multiSelect: true, useSelectKeys: true, focusable: true, removableItems: true, draggable: true, onChange: () => { window.addEventListener('beforeunload', unloadFunc); saveBtn.disabled = false; } }),
        list2 = new VID_ItemsList({ multiSelect: true, removableItems: true, useSelectKeys: true, focusable: true, draggable: true, transferTo: list1, transferArea: orderWrapper, onTransferStart: (from, to) => addAction(from.drag.item.selected ? undefined : from.drag.item) });
  document.getElementById('psc-order-list').appendChild(list1.element);
  document.getElementById('psc-extra-list').appendChild(list2.element);
  const selectAction = (list) => list.selected = (list.selected.length === list.items.length ? [] : list.items),
        reverseAction = (list) => list.reverse(list.selected),
        removeAction = (list) => list.clearItems(list.selected);
  function addAction(items) {
    items = items === undefined ? (list2.selected.length ? list2.selected.sort((a, b) => a.position < b.position) : list2.items) : [items].flat();
    if (!items.length) { return; }
    list1.setQueue(items.map(i => { return { label: i.valueAttr.post_title, valueAttr: i.valueAttr.ID, options: getItemOptions(i.valueAttr) } }))
    list1.onQueueEnd = () => { items.forEach(i => i.remove(false)); list2.items = list2.items.filter(f => items.indexOf(f) === -1); };
  };
  function setContextMenu(list) {
    let options = [
      { label: (list.selected.length === list.items.length ? pscStr('Unselect') : pscStr('Select')), value: 'select', action: () => selectAction(list) },
      { label: pscStr('Reverse')+(list.selected.length > 1 ? ' '+pscStr('selected') : ' '+pscStr('all')), value: 'reverse', action: () => reverseAction(list) },
      { label: pscStr('Remove')+(list.selected.length > 0 ? ' '+pscStr('selected') : ' '+pscStr('all')), value: 'remove', action: () => removeAction(list) }];
    if (list === list2) { options.splice(0,0,{ label: pscStr('Add')+(list.selected.length ? ' '+pscStr('selected') : ' '+pscStr('all')), value: 'add', action: () => addAction() }); }
    return options;
  }
  const selectBtns = [document.getElementById('select-1'), document.getElementById('select-2')],
        reverseBtns = [document.getElementById('reverse-1'), document.getElementById('reverse-2')],
        removeBtns = [document.getElementById('remove-1'), document.getElementById('remove-2')];
        add2Btn = document.getElementById('add-2'),
        listMenus = [new VID_ContextMenu({ onOpen: (c) => c.setOptions(setContextMenu(list1)) }), new VID_ContextMenu({ onOpen: (c) => c.setOptions(setContextMenu(list2)) })];
  [list1, list2].forEach((list, idx) => {
    selectBtns[idx].addEventListener('click', () => selectAction(list));
    reverseBtns[idx].addEventListener('click', () => reverseAction(list));
    removeBtns[idx].addEventListener('click', () => removeAction(list));
    list.element.addEventListener('contextmenu', (e) => { e.preventDefault(); listMenus[idx].open(e); listMenus[idx === 0 ? 1 : 0].close(); });
  });
  add2Btn.addEventListener('click', () => addAction());
  //week
  function getWeek(date) {
    const year = new Date().getFullYear(), jan1 = new Date(year+'/1/1');
    return Math.ceil((((date-jan1)/86400000)+jan1.getDay()+1)/7);
  }
  //filters
  function getTaxs() { return [{ label: '', value: '' }, ...pscData.taxs.filter(t => t.object_type.includes(filterType.value[0])).map(t => { return { label: t.label, value: t.name } })]; }
  function getTerms() { return [{ label: '', value: 0 }, ...pscData.terms.filter(t => t.taxonomy === filterTax.value[0]).map(t => { return { label: t.name, value: t.term_id } })]; }
  const filterControls = document.getElementById('filter-controls'),
        filterType = new VID_SelectControl({ label: pscStr('Post type'), onChange: () => { filterTax.setOptions(getTaxs()); filterTerm.setOptions(getTerms()); } }, pscData.types.map(t => { return { label: t.label, value: t.name } })),
        filterTax = new VID_SelectControl({ label: pscStr('Taxonomy'), onChange: () => filterTerm.setOptions(getTerms()) }, getTaxs()),
        filterTerm = new VID_SelectControl({ label: pscStr('Term') }, getTerms()),
        filterAuthor = new VID_SelectControl({ label: pscStr('Author'), multiSelect: true }, pscData.authors.map(t => { return { label: t.name, value: t.id } }));
  const now = new Date(), date = { y: now.getFullYear(), m: now.getMonth()+1, d: now.getDate(), w: getWeek(now) },
        filterDate = new VID_SelectControl({ label: pscStr('Date filter'), onChange: (c) => {
            switch (c.value[0]) {
              case 'year': case 'month': case 'week': case 'today': dateSwitch.switched = []; break;
              case 'ymd': dateSwitch.switched = [2,3,4]; break;
              case 'ago': dateSwitch.switched = [0,9,10]; break;
              case 'before-after': dateSwitch.switched = [0,2,3,4]; break;
              case 'between': dateSwitch.switched = [1,2,3,4,5,6,7,8]; break;
            } } }, [
          { label: pscStr('This year'), value: 'year' }, { label: pscStr('This month'), value: 'month' },
          { label: pscStr('This week'), value: 'week' }, { label: pscStr('Today'), value: 'today' }, { label: pscStr('Year/Month/Day'), value: 'ymd' }, { label: pscStr('Some time ago'), value: 'ago' },
          { label: pscStr('Before/after a date'), value: 'before-after' }, { label: pscStr('Between a period of time'), value: 'between' }]),
        filterYear = new VID_NumberControl({ label: pscStr('Year'), value: date.y }),
        filterMonth = new VID_SelectControl({ label: pscStr('Month') }, ['', pscStr('Jan'), pscStr('Feb'), pscStr('Mar'), pscStr('Apr'), pscStr('May'), pscStr('Jun'), pscStr('Jul'), pscStr('Aug'), pscStr('Sep'), pscStr('Oct'), pscStr('Nov'), pscStr('Dec')].map((m,i) => { return { label: m, value: i } })),
        filterDay = new VID_NumberControl({ label: pscStr('Day'), value: '', min: 1, max: 31 }),
        filterYear2 = new VID_NumberControl({ label: pscStr('Year'), value: date.y }),
        filterMonth2 = new VID_SelectControl({ label: pscStr('Month') }, ['', pscStr('Jan'), pscStr('Feb'), pscStr('Mar'), pscStr('Apr'), pscStr('May'), pscStr('Jun'), pscStr('Jul'), pscStr('Aug'), pscStr('Sep'), pscStr('Oct'), pscStr('Nov'), pscStr('Dec')].map((m,i) => { return { label: m, value: i } })),
        filterDay2 = new VID_NumberControl({ label: pscStr('Day'), value: '', min: 1, max: 31 }),
        filterWhen = new VID_SelectControl({ label: pscStr('Time point') }, [{ label: pscStr('After'), value: 'after' }, { label: pscStr('Before'), value: 'before' }]),
        filterSome = new VID_NumberControl({ label: pscStr('Some') }),
        filterTime = new VID_SelectControl({ label: pscStr('time ago') }, [{ label: pscStr('Day(s)'), value: 'day' }, { label: pscStr('Week(s)'), value: 'week' }, { label: pscStr('Month(s)'), value: 'month' }, { label: pscStr('Year(s)'), value: 'year' }]);
  function getDateQuery() {
    switch(filterDate.value[0]) {
      case 'today': return 'year='+date.y+';month='+date.m+';day='+date.d; break;
      case 'month': return 'year='+date.y+';month='+date.m; break;
      case 'week': return 'year='+date.y+';week='+date.w; break;
      case 'year': return 'year='+date.y; break;
      case 'ymd': let temp = [];
        filterYear.value && (temp.push('year='+filterYear.value));
        filterMonth.value[0] && (temp.push('month='+filterMonth.value[0]));
        filterDay.value && (temp.push('day='+filterDay.value));
        return temp.join(';'); break;
      case 'ago':
        return filterWhen.value[0]+'='+filterSome.value+' '+filterTime.value[0]+(filterSome.value === 1 ? '' : 's')+' ago'; break;
      case 'before-after':
        return filterWhen.value[0]+'='+(filterYear.value || date.y)+'/'+(filterMonth.value[0] || '1')+'/'+(filterDay.value || '1'); break;
      case 'between':
        return 'after='+(filterYear.value || date.y)+'/'+(filterMonth.value[0] || '1')+'/'+(filterDay.value || '1')+
          ',before='+(filterYear2.value || date.y)+'/'+(filterMonth.value[0] || '1')+'/'+(filterDay.value || '1'); break;
    }
  }
  const filterSearch = new VID_InputControl({ label: pscStr('Keywords search'), value: '' });
  filterControls.append(filterAuthor.element, filterSearch.element);
  //fetch posts
  const filterBtn = document.getElementById('filter-btn'),
        loading2 = new VID_Loading({ appendTo: filterControls, style: { position: 'absolute' } });
  filterBtn.addEventListener('click', filterPosts);
  const termControls = document.getElementById('term-controls'),
        dateControls = document.getElementById('date-controls');
  termControls.append(filterType.element, filterTax.element, filterTerm.element);
  const fromLabel = VID_NewEl('div', {}, {}, { width: '100%' }), toLabel = VID_NewEl('div', {}, {}, { width: '100%' });
  dateControls.append(filterDate.element, filterWhen.element, fromLabel, filterYear.element, filterMonth.element, filterDay.element,
  toLabel, filterYear2.element, filterMonth2.element, filterDay2.element, filterSome.element, filterTime.element);
  const filters = new VID_ContentSwitch([
    { switch: document.getElementById('term-switch'), content: termControls },
    { switch: document.getElementById('date-switch'), content: dateControls },
    { switch: document.getElementById('author-switch'), content: filterAuthor.element },
    { switch: document.getElementById('search-switch'), content: filterSearch.element }
  ], filterControls, { hideMode: true, multiMode: true, fixedSize: false });
  const dateSwitch = new VID_ContentSwitch([
    filterWhen.element, fromLabel, filterYear.element, filterMonth.element, filterDay.element,
    toLabel, filterYear2.element, filterMonth2.element, filterDay2.element, filterSome.element,
    filterTime.element], dateControls, { hideMode: true, multiMode: true });
  function filterPosts() {
    let query = '';
    if (filters.elements[0].switch.checked) {
      query += '&post_type='+filterType.value[0];
      if (filterTax.value[0] && filterTerm.value[0]) { query += '&tax_query=taxonomy='+filterTax.value[0]+';terms='+filterTerm.value[0]; }
    }
    if (filters.elements[1].switch.checked) { query += '&date_query='+getDateQuery(); }
    if (filters.elements[2].switch.checked) { query += '&author='+filterAuthor.value[0]; }
    if (filters.elements[3].switch.checked) { query += '&s='+filterSearch.value; }
    query += '&fields=post_title,ID,permalink';
    loading2.open();
    pscFetch('rest', 'get=posts'+query).then(r => {
      loading2.close();
      list2.clearItems();
      const inList1 = list1.items.map(m => parseInt(m.valueAttr));
      r.posts.filter(f => !inList1.includes(parseInt(f.ID))).forEach(i => {
        list2.addItem({ label: i.post_title, valueAttr: i, options: getItemOptions(i) });
      });
    });
  }
  function unloadFunc() { event.preventDefault(); return true; }
  //save order
  const saveBtn = document.getElementById('save-order');
  saveBtn.addEventListener('click', () => !saveBtn.disabled && (saveOrder()));
  document.addEventListener('keydown', (e) => { if (!saveBtn.disabled && e.ctrlKey && e.key === 's' && e.ctrlKey) { e.preventDefault(); saveOrder(); } });
  function saveOrder(successCallback = null) {
    const order = list1.items.map(i => i.valueAttr).join(',');
    const data = new FormData();
    data.append('action', 'psc_update_key');
    data.append('key', currentKey);
    data.append('act', 'order');
    data.append('req', order);
    loading.open();
    pscFetch('ajax', data).then((r) => {
      loading.close();
      if (r === 0) { messageFail.open(); }
      if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else {
        messageSuccess.message = r.comment;
        messageSuccess.open();
        saveBtn.disabled = true;
        window.removeEventListener('beforeunload', unloadFunc);
        successCallback && (successCallback.call(null, r));
      }
    });
  }
  keySelect(currentKey);
}
