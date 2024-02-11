function VID_NewEl(tag, args = {}, atts = {}, style = {}, ...append) {
  const el = document.createElement(tag);
  for (key in args) { el[key] = args[key]; };
  for (key in atts) { el.setAttribute(key, atts[key]); };
  if (typeof style === 'string') { style = VID_strToCssObj(style); }
  for (key in style) { el.style[key] = style[key]; }
  if (append) { el.append(...append); }
  return el;
}

function VID_strToCssObj(str) {
  let obj = {};
  [...str.matchAll(/([a-z0-9\-_]+)\s*:\s*([^;]*)/gmi)].forEach(p => { if (p.length >= 2) { obj[p[1]] = p[2]; } });
  return obj;
}

function VID_cssObjToStr(obj) {
  if (typeof obj !== 'object') { return; }
  let str = '';
  for (key in obj) { str += key.replace(/[A-Z]/g, (m) => '-'+m.toLowerCase())+': '+obj[key]+'; '; }
  return str.trim();
}

function VID_customRect(content = '', style = {}, appendTo = document.body) {
  if (typeof style === 'string') { style = VID_strToCssObj(style); }
  const el = VID_NewEl('div', { innerHTML: content }, {}, { visibility: 'none', ...style });
  appendTo.appendChild(el);
  const rect = el.getBoundingClientRect();
  el.remove();
  return rect;
}

function VID_stringIsJson(str) {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
}

const ms = 150;
