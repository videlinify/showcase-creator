class VID_Masonry {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.items = Array.from(wrapper.children).filter(f => { const rect = f.getBoundingClientRect(); return Boolean(rect.width && rect.height); });
    !this.items.length && (this.unmount());
    const equalWidths = this.items.map(i => i.offsetWidth
      ).every((e, i, a) => {
        if (i === 0) { return true; }
        else if (e === a[i-1]) { return true; }
        else { return false; } }
      );
    if (!equalWidths) { delete this; }
    this.rows = [];
    this.fill = (['false', '0'].includes(this.wrapper.getAttribute('data-fill') || 'true') ? false : true);
    this.initialStyle = window.getComputedStyle(this.wrapper);
    this.wrapper.style.display = 'flex';
    this.wrapper.style.flexFlow = 'row wrap';
    this.wrapper.style.gap = 0;
    this.resizeTimer = null;
    window.addEventListener('resize', () => {
      if (this.resizeTimer) { clearTimeout(this.resizeTimer); }
      this.resizeTimer = setTimeout(() => this.resetLayout(), 500);
    });
    this.arrangeItems();
  }
  arrangeItems() {
    if (!this.items[0]) { return; }
    const item1style = window.getComputedStyle(this.items[0]),
          itemWidth = this.items[0].offsetWidth + parseFloat(item1style.marginLeft) + parseFloat(item1style.marginRight),
          itemsPerRow = Math.floor(this.wrapper.offsetWidth / itemWidth);
    let heights = [];
    for (let i=0; i<itemsPerRow; i++) {
      this.rows[i] = document.createElement('div');
      this.rows[i].classList.add('vid-masonry-row');
      this.rows[i].style.display = 'flex';
      this.rows[i].style.flexFlow = 'column nowrap';
    }
    this.wrapper.append(...this.rows);
    this.items.forEach((item, idx) => {
      const itemStyle = window.getComputedStyle(item);
      let column = Math.floor(idx % itemsPerRow);
      heights[column] = heights[column] || 0;
      const lowestColumn = heights.indexOf(Math.min(...heights));
      if (this.fill && (heights[column] > heights[lowestColumn])) { column = lowestColumn; }
      heights[column] += item.offsetHeight + parseFloat(itemStyle.marginTop) + parseFloat(itemStyle.marginBottom);
      this.rows[column] && (this.rows[column].appendChild(item));
    });
  }
  resetLayout() {
    this.wrapper.append(...this.items);
    this.rows.forEach(r => r && (r.remove()));
    this.rows = [];
    setTimeout(() => this.arrangeItems());
  }
  static mount(on) { return new VID_Masonry(on); }
  static autoMount() { [...document.querySelectorAll('.vid-masonry')].forEach(ml => VID_Masonry.mount(ml)); }
  unmount() {
    this.wrapper.append(...this.items);
    this.rows.forEach(r => r.remove());
    this.wrapper.display = this.initialStyle.display;
    this.wrapper.flexFlow = this.initialStyle.flexFlow;
    this.wrapper.gap = this.initialStyle.gap;
    delete this;
  }
}

window.addEventListener('load', () => VID_Masonry.autoMount());
