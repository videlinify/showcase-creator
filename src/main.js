function pscStr(str, ...subs) {
  str = wp ? wp.i18n.__(str, 'showcase-creator') : str;
  if (subs.length) { subs.forEach((s,i) => str = str.replace('%'+(i+1), s)); }
  return str;
}

const pscUrls = typeof SHOWCASE_CREATOR !== 'undefined' ? SHOWCASE_CREATOR.urls : { site: window.location.hostname, admin: window.location.hostname+'/wp-admin/', rest: window.location.hostname+'/?rest_route=', plugin: window.location.hostname+'/wp-content/plugins/showcase-creator/' };

async function pscFetch(type = 'rest', request = '', options = {}) {
  const symbol = request ? (pscUrls.rest.includes('?') ? '&' : '?') : '';
  if (type !== 'ajax') { return await fetch(pscUrls.rest+'showcase-creator/v2/data'+symbol+request, options).then(r => Promise.resolve(r.json())); }
  else { return await fetch(ajaxurl ? pscUrls.site+ajaxurl : pscUrls.admin+'admin-ajax.php', { method: 'POST', credentials: 'same-origin', body: request, ...options }).then(r => Promise.resolve(r.json())); }
}

async function pscGetUrlContent(url, options = {}) {
  try {
    const r = await fetch(url, options);
    if (!r) { throw(r); }
    const cnt = await r.text();
    if (!cnt) { throw cnt; }
    return new Promise((res) => res(cnt));
  }
  catch(e) { return new Promise((res, rej) => rej(e)); }
}

async function pscGetBlockPreview(atts) {
  try {
    const copy = { ...atts };
    ['postTypes', 'taxonomies', 'terms', 'posts', 'authors', 'orderLists', 'layouts'].forEach(a => a in copy && (delete copy[a]));
    const data = new FormData();
    data.append('attributes', JSON.stringify(copy));
    const cnt = await pscGetUrlContent(pscUrls.site+'/?showcase_creator_block_preview=min', { method: 'POST', credentials: 'same-origin', body: data }),
          doc = document.implementation.createHTMLDocument('preview');
    doc.write(cnt);
    const html = doc.querySelector('#psc-layout-html'),
          css = doc.querySelector('#psc-layout-css');
    return new Promise((res, rej) => res({ html: html ? html.innerHTML : null, css: css ? css.innerHTML : null }));
  }
  catch(e) { return new Promise((res, rej) => rej(e)); }
}

function pscMetaboxChange(key, value, where) {
  const el = Object.assign(document.createElement('input'), { type: 'number', name: 'psc_update_key_'+key, value: value });
  el.style = 'max-width: 80px;'
  where.replaceWith(el);
}

function pscMetaboxUnlist(key) {
  const el = Object.assign(document.createElement('input'), { type: 'hidden', name: 'psc_metabox_unlist_'+key, value: true });
  event.target.parentNode.parentNode.replaceWith(el);
}

function pscMetaboxAssociations() {
  const el = Object.assign(document.createElement('input'), { type: 'hidden', name: 'psc_metabox_associated', value: true }),
        re = Object.assign(document.createElement('div'), { textContent: pscStr('Update post and reload') });
  event.target.after(el);
  event.target.replaceWith(re);
}

function pscIsEqual(a, b) {
  if (a === b) { return true; }
  if (typeof a !== typeof b) { return false; }
  if (['string', 'number', 'bigint', 'boolean'].includes(typeof a)) { return a === b; }
  if (['function', 'symbol'].includes(typeof a)) { return a.toString() === b.toString(); }
  if (typeof a === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) { return false; }
    for(prop in a) { if (!(prop in b) || !pscIsEqual(a[prop], b[prop])) { return false; } }
    return true;
  }
  throw new Error('Unknown type given.');
}
