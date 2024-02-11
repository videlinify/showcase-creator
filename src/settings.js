function pscSettingsInit() {
  let settings = (typeof PSC_SETTINGS !== 'undefined' ? PSC_SETTINGS : null);
  if (!settings) { throw('Cannot retrieve data from server.'); }
  const controls = {
    integrate: {
      search: VID_ToggleControl.convert(document.getElementById('integration_search'), { onChange: (c) => { settings.integrate.search = Number(c.value); } }),
      tax: VID_ToggleControl.convert(document.getElementById('integration_tax'), { onChange: (c) => { settings.integrate.tax = Number(c.value); } }),
      author: VID_ToggleControl.convert(document.getElementById('integration_author'), { onChange: (c) => { settings.integrate.author = Number(c.value); } }),
      layout: VID_SelectControl.convert(document.getElementById('integration_layout'), { onChange: (c) => { settings.integrate.layout = Number(c.value); } })
    },
    lightbox: {
      light: VID_Color.convert(document.getElementById('lightbox_colorLight'), { onChange: (c) => { settings.lightbox.light = c.value; } }),
      dark: VID_Color.convert(document.getElementById('lightbox_colorDark'), { onChange: (c) => { settings.lightbox.dark = c.value; } }),
      alpha: VID_NumberControl.convert(document.getElementById('lightbox_alphaValue'), { onChange: (c) => { settings.lightbox.alpha = parseFloat(c.value); } }),
      zoom: VID_ToggleControl.convert(document.getElementById('lightbox_enableZoom'), { onChange: (c) => { settings.lightbox.zoom = Number(c.value); } })
    }
  };
  const forms = {
    defaultLayouts: {
      form: document.getElementById('restore_default_layouts'),
      btn: document.getElementById('restore_default_layouts_submit')
    },
    defaultSettings: {
      form: document.getElementById('restore_default_settings'),
      btn: document.getElementById('restore_default_settings_submit')
    },
    clearKeys: {
      form: document.getElementById('clear_all_keys'),
      btn: document.getElementById('clear_all_keys_submit')
    },
    clearLayouts: {
      form: document.getElementById('clear_all_layouts'),
      btn: document.getElementById('clear_all_layouts_submit')
    }
  };
  Object.keys(forms).forEach((form) => {
    forms[form].dialog = VID_Dialog.attachTo(forms[form].btn, {
      title: forms[form].btn.textContent,
      type: 'confirm',
      options: { message: forms[form].btn.getAttribute('data-ask'), confirmBtn: forms[form].btn.textContent, reverseDestructive: true },
      style: { backgroundColor: 'var(--vid-destructive)', color: '#fff' },
      onConfirm: () => forms[form].form.submit()
    });
  });
  const updateBtn = document.getElementById('update-settings');
  updateBtn.addEventListener('click', () => sendRequest());

  const messageFail = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Settings cannot be updated.'), duration: 3000 }, style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff', top: '100px', transform: 'translate(-50%, 0)' } });
  const messageSuccess = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Settings are updated.'), duration: 3000 }, style: { fontSize: '1.5em', top: '100px', transform: 'translate(-50%, 0)' } });
  const loading = new VID_Loading();
  function sendRequest() {
    const data = new FormData();
    data.append('action', 'psc_update_settings');
    data.append('settings', JSON.stringify(settings));
    loading.open();
    pscFetch('ajax', data).then((r) => {
      loading.close();
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { messageSuccess.message = r.comment; messageSuccess.open(); }
    });
  }

  //export layouts
  document.getElementById('export-layouts').addEventListener('click', () => {
    pscFetch('rest', 'get=layouts&fields=name,slug,items,css').then((r) => {
      const content = JSON.stringify(r.layouts),
            el = VID_NewEl('a', { href: 'data:text/plain;charset=utf-8,'+encodeURIComponent(content), download: 'showcase-creator-exported-layouts.json' }, {}, { display: 'none' });
      document.body.appendChild(el);
      el.click();
      el.remove();
    });
  });
  //import layouts
  function importLayouts(content) {
    const data = new FormData();
    data.append('action', 'psc_import_layouts');
    data.append('layouts', content);
    pscFetch('ajax', data).then(r => {
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { messageSuccess.message = r.comment; messageSuccess.open(); }
    });
  }
  layoutsImport = new VID_FileList({ dropArea: false, fromUrl: false, hideList: true, labels: { browse: pscStr('Import layouts') }, validate: (name, content) => { if (VID_stringIsJson(content) && [JSON.parse(content)].flat().some(j => 'slug' in j && 'name' in j && 'items' in j && 'css' in j)) { importLayouts(content); return true; } VID_Dialog.fadeMessage(pscStr('No valid layouts.'), { style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff' } }); } });
  layoutsImport.browseBtn.style = null;
  document.getElementById('import-layouts').replaceWith(layoutsImport.browseBtn);
  //export order lists
  document.getElementById('export-metakeys').addEventListener('click', () => {
    pscFetch('rest', 'get=order&fields=post_type,post_name').then(r => {
      const content = JSON.stringify(r.order),
            el = VID_NewEl('a', { href: 'data:text/plain;charset=utf-8,'+encodeURIComponent(content), download: 'showcase-creator-exported-order-lists.json' }, {}, { display: 'none' });
      document.body.appendChild(el);
      el.click();
      el.remove();
    });
  });
  //import order lists
  function importOrderLists(content) {
    const data = new FormData();
    data.append('action', 'psc_import_order_lists');
    data.append('lists', content);
    pscFetch('ajax', data).then((r) => {
      if (r === 0) { messageFail.message = pscStr('Failed. No response.'); messageFail.open(); }
      else if (r.status === 'error') { messageFail.message = r.comment; messageFail.open(); }
      else { messageSuccess.message = r.comment; messageSuccess.open(); }
    });
  }
  const orderImport = new VID_FileList({ dropArea: false, fromUrl: false, hideList: true, labels: { browse: pscStr('Import order lists') }, validate: (name, content) => { if (VID_stringIsJson(content)) { importOrderLists(content); return true; } VID_Dialog.fadeMessage(pscStr('No valid order lists found.'), { style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff' } }) } });
  orderImport.browseBtn.style = null;
  document.getElementById('import-metakeys').replaceWith(orderImport.browseBtn);
}
window.addEventListener('DOMContentLoaded', pscSettingsInit);
