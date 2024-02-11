class VID_Slider {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.maxWidth = '100%';
    this.wrapper.style.position = 'relative';
    this.slider = VID_NewEl('div', { classList: 'vid-slider-inner' }, {}, { display: 'flex', flexFlow: 'row nowrap', width: 'max-content', position: 'absolute', left: '0' });
    this.items = [...wrapper.children].filter(f => { const rect = f.getBoundingClientRect(); return Boolean(rect.width && rect.height); });
    this.items.forEach(i => { i.style.width = window.getComputedStyle(i).width; console.log(i.style.width, window.getComputedStyle(i).width); });
    !this.items.length && (this.unmount());
    this.wrapper.appendChild(this.slider).append(...this.items);
    this.animation = wrapper.getAttribute('data-animate') || 'slide';
    this.delay = parseInt(wrapper.getAttribute('data-delay')) || 5000;
    this.animSpeed = wrapper.getAttribute('data-speed') ? parseInt(wrapper.getAttribute('data-speed')) : 500;
    this.easing = wrapper.getAttribute('data-ease') || 'ease';
    this.startImmediately = wrapper.getAttribute('data-start') === 'true' ? true : false;
    this.sliding = false;
    this.afterSlide = null;
    this.circleColor = wrapper.getAttribute('data-circle-color') || '#5553';
    this.circleColorHover = wrapper.getAttribute('data-circle-color-hover') || '#5556';
    this.circleColorCurrent = wrapper.getAttribute('data-circle-color-current') || '#5559';
    this.current = 0;
    this.timer = this.startImmediately ? setTimeout(() => { this.slide(this.current+1); this.start(); },100) : null;
    this.resizeTimer = null;
    new ResizeObserver(() => {
      if (this.resizeTimer) { clearTimeout(this.resizeTimer); } this.resizeTimer = setTimeout(() => this.resetLayout(), 500);
    }).observe(this.wrapper);
    let startX, startY, threshold = 150;
    this.slider.addEventListener('touchstart', (e) => {
      let touchobj = e.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      this.stop();
      e.preventDefault();
      this.slider.style.transition = 'transform 300ms ease-out';
    }, false);
    this.slider.addEventListener('touchmove', (e) => {
      let touchobj = e.changedTouches[0];
      if (touchobj.pageX - startX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.slider.style.transform = 'translateX(5px) skew(-1deg)'; }
      else if (startX - touchobj.pageX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.slider.style.transform = 'translateX(-5px) skew(1deg)'; }
    });
    this.slider.addEventListener('touchend', (e) => {
      let touchobj = e.changedTouches[0];
      if (touchobj.pageX - startX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.slide(this.current-1); }
      else if (startX - touchobj.pageX >= threshold && Math.abs(touchobj.pageY - startY) <= 100) { this.slide(this.current+1); }
      else { this.start(); }
      this.slider.style.transform = null;
      e.preventDefault();
    }, false);
    this.init();
  }
  init() {
    this.tallest = Math.max(...this.items.map(i => { const style = getComputedStyle(i); return Math.round(i.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom)); }));
    this.wrapper.style.minHeight = this.tallest+'px';
    this.widths = this.items.map(i => { const style = getComputedStyle(i); return Math.round(i.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight)); });
    const wrapperWidth = this.wrapper.getBoundingClientRect().width;
    this.clonedItems = [];
    for (let i = 0, item = this.items[i], sum = 0; sum < wrapperWidth; i++, item = this.items[i]) {
      if (i > this.widths.length-1) { i = 0; }
      sum += this.widths[i];
      this.clonedItems.push(item.cloneNode(true));
      this.slider.appendChild(this.clonedItems[i]);
      const style = getComputedStyle(item);
      this.widths.push(item.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight));
    }
    this.positions = this.widths.map((w, i, a) => a.slice(0,i).reduce((s,e) => s+e, 0));
    this.createCounter();
    this.start();
    this.slide(0);
  }
  createCounter() {
    if (this.counter) { this.wrapper.appendChild(this.counter); return; }
    this.counter = VID_NewEl('div', { classList: 'slider-counter' });
    this.counter.style.marginTop = this.tallest+parseInt(window.getComputedStyle(this.counter).marginTop || 0)+'px';
    this.circles = this.items.map((item, idx) => {
      const circle = VID_NewEl('div', { classList: 'slider-circle'+(idx === this.current ? ' current' : '') });
      circle.addEventListener('click', () => { this.slide(idx); });
      return circle;
    });
    this.wrapper.appendChild(this.counter).append(...this.circles);
    const circleStyle = getComputedStyle(this.circles[0]);
    if (circleStyle.width === '0px') { this.includeStyle('counter'); }
  }
  slide(idx) {
    if (this.sliding === true) { this.afterSlide = idx; return; }
    this.sliding = true;
    this.afterSlide = null;
    let prevPos = this.current, newPos = idx;
    if (idx < 0) {
      prevPos = this.items.length;
      newPos = this.items.length-1;
    }
    else if (idx > this.items.length) { newPos = idx % this.items.length; }
    const leftOld = -1*this.positions[prevPos]+'px', leftNew = -1*this.positions[newPos]+'px';
    switch(this.animation) {
      case 'blur':
        this.slider.animate([{ filter: 'blur(0)' }, { filter: 'blur(100px)' }, { filter: 'blur(0)'}], { duration: this.animSpeed, easing: this.easing });
        this.slider.animate([{ left: leftOld }, { left: leftOld, offset: 0.48 }, { left: leftNew, offset: 0.52 }], { duration: this.animSpeed, easing: this.easing }); break;
      case 'flash':
        const flash = VID_NewEl('div', {}, {}, { position: 'absolute', inset: '0', backgroundColor: '#fff', opacity: 0 });
        this.slider.appendChild(flash);
        flash.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 1}, { opacity: 0 }], { duration: this.animSpeed, easing: this.easing });
        this.slider.animate([{ left: leftOld }, { left: leftOld, offset: 0.5 }, { left: leftNew, offset: 0.5 }], { duration: this.animSpeed, easing: this.easing });
        setTimeout(() => flash.remove(), this.animSpeed); break;
      case 'slide':
      default: this.slider.animate([{ left: leftOld }, { left: leftNew }], { duration: this.animSpeed, easing: this.easing });
    }
    const animEnd = setTimeout(() => { this.sliding = false; if (this.afterSlide) { this.slide(this.afterSlide); } }, this.animSpeed);
    if (idx === this.items.length) { newPos = 0; }
    this.slider.style.left = leftNew;
    this.circles.forEach((c, i) => {
      if (i === idx || (i === 0 && idx === this.items.length) || (i === this.items.length-1 && idx === -1)) { c.classList.add('current'); }
      else { c.classList.remove('current'); }
    });
    this.current = newPos;
    this.stop();
    this.start();
  }
  start() { this.timer = setTimeout(() => { this.slide(this.current+1); }, this.delay); }
  stop() { clearTimeout(this.timer); }
  resetLayout() {
    this.stop();
    this.items.forEach(i => i.style.width = null);
    [...this.items, ...this.clonedItems].forEach(c => c.remove());
    this.wrapper.append(...this.items);
    this.items.forEach(i => i.style.width = window.getComputedStyle(i).width);
    this.slider.append(...this.items);
    this.counter && (this.counter.remove());
    this.init();
  }
  includeStyle(style) {
    let code = '';
    if (style === 'counter') {
      code = '.slider-counter { display: flex; justify-content: center; gap: 5px; width: max-content; max-width: 100%; } '+
      '.slider-circle { width: 20px; height: 20px; border-radius: 50%; background-color: '+this.circleColor+'; } '+
      '.slider-circle.current { background-color: '+this.circleColorCurrent+'; } '+
      '.slider-circle:not(.current):hover { background-color: '+this.circleColorHover+'; }';
    }
    if (code) { document.head.appendChild(Object.assign(document.createElement('style'), { innerHTML: code })); }
  }
  static mount(on) { return new VID_Slider(on); }
  static autoMount() { [...document.querySelectorAll('.vid-slider')].forEach(c => VID_Slider.mount(c)); }
  unmount() { this.wrapper.append(...this.items); this.items.style = null; this.slider.remove(); this.counter.remove(); delete this; }
}

window.addEventListener('load', () => VID_Slider.autoMount());
