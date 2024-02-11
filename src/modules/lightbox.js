class VID_Lightbox {
  constructor(args, data) {
    this.args = { colorDark: '#000', colorLight: '#fff', alphaValue: 0.5, current: 0, zoom: true, scaleMode: 'fit', ...args };
    const colors = [this.args.colorDark, this.args.colorDark, this.args.colorLight, this.args.colorLight, this.args.colorDark].map((color, i) => {
        let c = color.replace(/#|[^a-f0-9]/gi, '');
        if (c.length === 3 || c.length === 4) { c = Array.from(c).slice(0,3).map(l => l+l).join(''); }
        else { c = c.slice(0,6); }
        if (i === 1 || i === 3) { c += (Math.max(0, Math.min(255, parseInt(this.args.alphaValue*255)))).toString(16); }
        else if (i === 4) { c += '55'; }
        return '#'+c;
      }),
          styleTagCnt = ':root { --vid-lightbox-dark: '+colors[0]+' !important; --vid-lightbox-dark-alpha: '+colors[1]+
            ' !important; --vid-lightbox-light: '+colors[2]+' !important; --vid-lightbox-light-alpha: '+colors[3]+' !important; --vid-lightbox-shadow: '+colors[4]+' !important; }',
          styleTag = Object.assign(document.createElement('style'), { id: 'vid-gallery-style-tag', textContent: styleTagCnt }),
          el = Object.assign(document.createElement('div'), { classList: 'vid-lightbox' }),
          prev = Object.assign(document.createElement('div'), { classList: 'vid-lightbox-prev', textContent: '❰' }),
          next = Object.assign(document.createElement('div'), { classList: 'vid-lightbox-next', textContent: '❱' }),
          x = Object.assign(document.createElement('div'), { classList: 'vid-lightbox-x', textContent: '×' }),
          imgs = data.map(entry => {
            let obj = {};
            if (entry.url) {
              obj.img = Object.assign(document.createElement('img'), { classList: 'vid-lightbox-image', src: entry.url });
              if (entry.desc) { obj.desc = Object.assign(document.createElement('div'), { classList: 'vid-lightbox-description', textContent: entry.desc }); }
            }
            return obj;
          }).filter(f => f.img);
    el.append(...(imgs[this.args.current].desc ? [imgs[this.args.current].img, imgs[this.args.current].desc] : [imgs[this.args.current].img]), x);
    if (imgs.length > 1) { el.append(prev, next); }
    this.imgs = imgs;
    this.current = imgs[this.args.current];
    this.count = imgs.length;
    this.lightbox = el;
    if ('colorDark' in args || 'colorLight' in args || 'alphaValue' in args) { !document.getElementById('vid-gallery-style-tag') && (document.head.appendChild(styleTag)); }
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target === x) { this.close(); }
      else if (e.target === prev) { this.prev(); }
      else if (e.target === next) { this.next(); }
    });
    this.keyEvent = (e) => {
      if (e.key === 'Escape') { this.close(); }
      if (e.key === 'ArrowLeft') { this.prev(); }
      if (e.key === 'ArrowRight') { this.next(); }
    };
    let startX, startY, threshold = 150;
    el.addEventListener('touchstart', (e) => {
      let touchobj = e.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      e.preventDefault();
    }, false);
    el.addEventListener('touchend', (e) => {
      let touchobj = e.changedTouches[0];
      if (touchobj.pageX - startX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.prev(); }
      else if (startX - touchobj.pageX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.next(); }
      e.preventDefault();
    }, false);
    if (this.args.zoom) {
      el.onwheel = (e) => {
        e.preventDefault();
        let scale = this.current.img.style.scale;
        if (!scale) { this.current.img.style.scale = 1; scale = 1; }
        if (e.deltaY < 0) { scale = parseFloat(scale)+0.05; this.current.img.style.scale = scale; }
        if (e.deltaY > 0) { scale = parseFloat(scale)-0.05; this.current.img.style.scale = scale; }
      };
    }
  }
  open() {
    document.body.appendChild(this.lightbox);
    window.addEventListener('keydown', this.keyEvent);
    this.scale(this.current.img);
  }
  close() {
    this.lightbox.remove();
    window.removeEventListener('keydown', this.keyEvent);
  }
  prev() {
    if (this.count <= 1) { return; }
    const oldImg = this.current;
    this.args.current = (this.imgs[this.args.current-1] ? this.args.current-1 : this.imgs.length-1);
    const newImg = this.current = this.imgs[this.args.current];
    oldImg.img.animate([{ left: '50%' }, { left: '150%' }], { duration: 250 });
    if (oldImg.desc) { oldImg.desc.animate([{ left: '50%' }, { left: '150%' }], { duration: 250 }); }
    this.lightbox.append(...(newImg.desc ? [newImg.img, newImg.desc] : [newImg.img]));
    this.scale(newImg.img);
    newImg.img.animate([{ left: '-50%' }, { left: '50%' }], { duration: 250 });
    if (newImg.desc) { newImg.desc.animate([{ left: '-50%' }, { left: '50%' }], { duration: 250 }); }
    setTimeout(() => { oldImg.img.remove(); if (oldImg.desc) { oldImg.desc.remove(); } }, 250);
  }
  next() {
    if (this.count <= 1) { return; }
    const oldImg = this.current;
    this.args.current = (this.imgs[this.args.current+1] ? this.args.current+1 : 0);
    const newImg = this.current = this.imgs[this.args.current];
    oldImg.img.animate([{ left: '50%' }, { left: '-50%' }], { duration: 250 });
    if (oldImg.desc) { oldImg.desc.animate([{ left: '50%' }, { left: '-50%' }], { duration: 250 }); }
    this.lightbox.append(...(newImg.desc ? [newImg.img, newImg.desc] : [newImg.img]));
    this.scale(newImg.img);
    newImg.img.animate([{ left: '150%' }, { left: '50%' }], { duration: 250 });
    if (newImg.desc) { newImg.desc.animate([{ left: '150%' }, { left: '50%' }], { duration: 250 }); }
    setTimeout(() => { oldImg.img.remove(); if (oldImg.desc) { oldImg.desc.remove(); } }, 250);
  }
  scale(img, mode = this.args.scaleMode) {
    if (!mode) { return; }
    if (!img.complete) { img.onload = () => this.scale(img, mode); return; }
    const style = window.getComputedStyle(img),
          w = window.innerWidth / parseInt(style.width), h = window.innerHeight / parseInt(style.height),
          tall = Math.min(w, h), short = Math.max(w, h);
    if (mode === 'fit' && tall < 1) { img.style.scale = tall; }
    if (mode === 'contain') { img.style.scale = tall; }
    if (mode === 'cover') { img.style.scale = short; }
  }
}

//Processes images: a url (string) or array of strings, or array of objects with keys 'url' and 'desc'
function vid_lightbox(args = {}, ...data) {
  data = [data].flat();
  data = data.map(d => { if (typeof d === 'string') { return { url: d }; } else { return d; } });
  const lightbox = new VID_Lightbox(args, data);
  lightbox.open();
}

function vid_lightbox_gallery(args) {
  if (!VID_GALLERY) { return; }
  const lightbox = new VID_Lightbox(args, VID_GALLERY);
  lightbox.open();
}
