class VID_FileList {
  constructor(args) {
    args = { files: [], fromUrl: true, browseBtn: true, dropArea: true, hideList: false, labelAttr: 'name', readAs: 'text',
      processContent: null, onFileRead: (reader, file) => reader.readAsText(file), onUrlFetch: (response) => response.text(), validate: null,
      labels: { dropArea: 'Drop files here', browse: 'Browse', urlLabel: 'From URL', urlBtn: 'Add' }, ...args };
    this.onUrlFetch = args.onUrlFetch;
    this.onFileRead = args.onFileRead;
    this.processContent = args.processContent;
    args.validate = args.validate ? args.validate : () => true;
    this.validate = args.validate;
    this.element = VID_NewEl('div', { classList: 'vid-file-list' });
    this.list = new VID_ItemsList({ removableItems: true, selectable: false });
    const dropArea = VID_NewEl('div', { classList: 'vid-file-list-drop-area', textContent: args.labels.dropArea }),
          browseDialog = VID_NewEl('input', { type: 'file', classList: 'vid-hidden', onchange: (e) => Array.from(e.target.files).forEach(f => this.addFile(f)) }),
          browseBtn = VID_NewEl('button', { classList: 'button-secondary', textContent: args.labels.browse, onclick: () => browseDialog.click() }, {}, { alignSelf: 'flex-end' }),
          urlDiv = VID_NewEl('div', { classList: 'vid-file-list-url-wrapper' }),
          urlAdd = VID_NewEl('button', { classList: 'button-secondary', textContent: args.labels.urlBtn, disabled: true, onclick: () => this.addUrl(urlInput.value) }),
          urlInput = new VID_InputControl({ label: args.labels.urlLabel, labelOnLeft: true, onInput: (i) => urlAdd.disabled = !i.inputEl.value.length, onEnter: (i) => urlAdd.click() });
    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('over');
      if (!e.dataTransfer || !e.dataTransfer.files.length) { return; }
      Array.from(e.dataTransfer.files).forEach(f => this.addFile(f));
    });
    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('over'); });
    dropArea.addEventListener('dragleave', (e) => { e.preventDefault(); dropArea.classList.remove('over'); });
    args.dropArea && (this.element.appendChild(dropArea));
    (args.dropArea ? dropArea : this.element).appendChild(this.list.element);
    if (args.browseBtn) { this.element.append(browseDialog, browseBtn); this.browseBtn = browseBtn; };
    args.fromUrl && (this.element.appendChild(urlDiv).append(urlInput.element, urlAdd));
    args.hideList && (this.list.element.classList.add('vid-hidden'));
    this.files = args.files;
  }
  addFile(file) {
    const label = file.name;
    this.fileRead(file).then(cnt => this.add(label, cnt));
  }
  fileRead(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr);
      this.onFileRead && (this.onFileRead.call(null, fr, file));
    });
  }
  addUrl(url) {
    const label = /[^\/]+$/.test(url) ? url.match(/[^\/]+$/)[0] : url;
    fetch(url, { mode: 'no-cors' }).then(r => this.onUrlFetch ? this.onUrlFetch.call(null, r) : r).then(r => this.add(label, r));
  }
  add(name, content) {
    this.processContent && (content = this.processContent.call(null, content));
    //const valid = this.validate ? this.validate.call(null, name, content, this) : true;
    new Promise((resolve, reject) => { resolve(this.validate(name,content,this)); }).then(r => this.list.addItem({ label: name, link: content, classList: r ? '' : 'invalid' }));
  }
  remove(file) {
    if (typeof file === 'number') { file = this.list.items[parseInt(file)]; }
    else if (typeof file === 'string' || this.list.items.indexOf(file) === -1) { file = this.list.items.find(f => f.link === file) || this.list.items.find(f => f.label === file); }
    if (this.list.items.indexOf(file) === -1) { return; }
    this.list.removeItem(file);
  }
  set validate(callback) { if (typeof callback === 'function') {this._validate = callback; } }
  get validate() { return this._validate; }
  get files() { return this.list.items.filter(f => !f.element.classList.contains('invalid')).map(m => { return { name: m.label, content: m.link }; }); }
  set files(files) {
    this.list.clearItems();
    files.forEach(f => {
      if (typeof f === 'string') { this.addUrl(f); }
      else if (f instanceof File) { this.addFile(f); }
      else if (typeof f === 'object' && 'name' in f && 'content' in f) { this.add(f.name, f.content); }
    });
  }
}
