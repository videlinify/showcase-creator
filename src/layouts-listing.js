async function pscLayoutsListingInit() {
  //FUNCTIONS
  function loadLayouts() {
    loading.open();
    pscFetch('rest', 'get=layouts&fields=name,slug,id,post_type').then(r => {
      if (!('layouts' in r)) { messageFail.message = pscStr('Cannot get layouts data.'); messageFail.open(); loading.close(); setTimeout(() => loadLayouts(), 2000); }
      else { list.clearItems(); layouts = r.layouts; layouts.forEach((l) => list.addItem(getItem(l))); loading.close(); }
    });
  }
  function getItem(layout) {
    const id = layout.id,
          postType = layout.post_type,
          ptLabel = (postTypes.types.find(f => f.name === postType) || { label: '' }).label,
          delDlg = new VID_Dialog({ type: 'confirm', title: pscStr('Delete layout "%1"?', layout.name), onConfirm: () => sendRequest(id, 'delete'), options: { reverseDestructive: true, submitBtn: pscStr('Delete') } }),
          dupDlg = new VID_Dialog({ type: 'input', title: pscStr('Duplicating "%1..."', layout.name), onConfirm: (d) => sendRequest(id, 'copy', d.controls.input.inputEl.value+'_###_'+sanitizeSlug(d.controls.input.inputEl.value, true)), options: { label: pscStr('Enter a new name')+':', confirmBtn: pscStr('Duplicate') } });
    return { label: layout.name, valueAttr: id, options: [
      { type: 'label', inline: true, label: ptLabel ? pscStr('Recommended for %1', ptLabel) : '' },
      { type: 'label', inline: true, label: pscStr('Slug')+': '+layout.slug },
      { type: 'label', inline: true, label: pscStr('ID')+': '+id },
      { type: 'anchor', classList: 'button-primary', label: pscStr('Edit'), href: pscUrls.admin+'admin.php?page=showcase-creator-layouts&layout='+id+'&action=edit' },
      { type: 'anchor', classList: 'button-secondary', label: pscStr('Preview'), href: pscUrls.site+'/?showcase='+id+(postType ? '&post_type='+postType : ''), target: '_blank' },
      { type: 'anchor', classList: 'button-secondary', label: pscStr('Duplicate'), onClick: () => dupDlg.open() },
      { type: 'anchor', classList: 'button-secondary is-destructive psc-margin-auto-left', label: pscStr('Remove'), onClick: () => delDlg.open() }
    ] };
  }
  function previewLoad() {
    const els = [previewFrame.contentWindow.document.querySelector('#wpadminbar'), previewFrame.contentWindow.document.querySelector('#masthead'), previewFrame.contentWindow.document.querySelector('.site-footer')];
    const links = Array.from(previewFrame.contentWindow.document.querySelectorAll('a, button'));
    els.forEach((el) => el && (el.remove()));
    links.forEach((l) => l.href = 'javascript:void(0)');
    setTimeout(() => { previewFrame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease' }); previewFrame.style.opacity = 1; loadingPreview.close(); }, 300);
    previewFrame.removeEventListener('load', previewLoad);
  }
  function updatePreview(id, postType) {
    postType = postType || 'post';
    const url = pscUrls.site+'/?showcase_creator_block_preview&layout='+id+'&postType='+postType+'&order=DESC&orderBy=date';
    if (previewFrame.src === url) { return; }
    loadingPreview.open();
    previewFrame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease' });
    previewFrame.style.opacity = 0;
    setTimeout(() => { previewFrame.addEventListener('load', previewLoad); previewFrame.src = url; }, 300);
  }
  function previewSlide(state) {
    previewDiv.style.width = '50%';
    const rect = previewDiv.getBoundingClientRect();
    const keyframes = [{ width: 0, opacity: 0 }, { width: rect.width+'px', opacity: 1 }];
    previewDiv.animate(state ? keyframes : keyframes.reverse(), { easing: 'ease', duration: 300 });
    previewDiv.style.width = state ? '50%' : 0;
    previewFrame.style.width = (rect.width-20)+'px';
    previewFrame.style.height = rect.height+'px';
    if (state && list.selected.length) {
      const id = list.selected[0].valueAttr;
      updatePreview(id, layouts.find(f => f.id === id).post_type);
    }
  }
  function sanitizeSlug(str, lowercase = false) {
    return (lowercase ? str.toLowerCase() : str).replaceAll(' ','-').replaceAll(/[^A-z0-9\-\_]/g,'').replaceAll(/([-_][-_]?){2,}/g,'$1');
  }
  function sendRequest(id, act, req) {
    const data = new FormData();
    data.append('action', 'psc_update_layouts');
    data.append('id', id);
    data.append('act', act);
    data.append('req', req);
    pscFetch('ajax', data).then(r => {
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { loadLayouts(); }
    });
  }
  function importLayouts(files) {
    const data = new FormData();
    data.append('action', 'psc_import_layouts');
    data.append('layouts', JSON.stringify(files.map(m => m.content)));
    pscFetch('ajax', data).then(r => {
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { loadLayouts(); }
    });
  }
  //INITIALIZE
  let layouts = [];
  const loading = new VID_Loading(),
        messageFail = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Failed.'), duration: 3000 }, style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff', top: '100px', transform: 'translate(-50%, 0)' } }),
        postTypes = await pscFetch('rest', 'get=types');
  //List
  const list = new VID_ItemsList({ removable: false, onSelect: () => { if (togglePreview.value) { const id = list.selected[0].valueAttr; updatePreview(id, layouts.find(f => f.id === id).post_type); } } });
  document.getElementById('layouts-list').appendChild(list.element);
  //Preview
  const togglePreview = VID_ToggleControl.convert(document.getElementById('preview-toggle'), { onChange: (c) => previewSlide(c.value) });
  const previewDiv = document.getElementById('layout-preview');
  const previewFrame = document.getElementById('preview-frame');
  const loadingPreview = new VID_Loading({ appendTo: previewDiv, style: { position: 'absolute' } });
  previewFrame.style.opacity = 0;
  previewFrame.src = '';
  previewFrame.addEventListener('load', previewLoad);
  previewSlide(true);
  //Import
  importer = new VID_FileList({ labels: { dropArea: pscStr('Drop files here'), browse: pscStr('Browse'), urlLabel: pscStr('From URL'), urlBtn: pscStr('Add') }, validate: (name, content) => { const json = VID_stringIsJson(content) ? JSON.parse(content) : {}; return [json].flat().some(j => 'slug' in j && 'name' in j && 'items' in j && 'css' in j); } });
  const importDialog = new VID_Dialog({ type: 'tag', style: { minWidth: '70vw', minHeight: '70vh' }, options: { content: importer.element, buttons: true, confirmBtn: pscStr('Import layouts'), cancelBtn: pscStr('Cancel') }, onConfirm: () => importLayouts(importer.files), onCancel: () => importer.files = [] });
  const importBtn = document.getElementById('import-btn');
  importBtn.addEventListener('click', () => importDialog.open());
  loadLayouts();
}
window.addEventListener('DOMContentLoaded', () => pscLayoutsListingInit());
