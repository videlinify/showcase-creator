class VID_DynamicText {
  constructor(tag, args = {}) {
    if (!tag.tagName) { delete this; return; }
    args = { onChange: null, style: null, ...args }
    this.tag = tag;
    if (args.style) { tag.style = args.style; }
    this.regex = args.regex;
    this.onChange = args.onChange;
  }
  set style(v) { this.tag.style = v; }
  get style() { return this.tag.style; }
  set content(v) {
    const old = this.tag.innerHTML;
    this.tag.innerHTML = v;
    if (this.onChange && old !== v) { this.onChange.call(null, this); }
  }
  get content() { return this.tag.innerHTML; }
}
