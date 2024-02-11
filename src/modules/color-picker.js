class VID_Color {
  constructor(color, args = {}) {
    args = { defaultColor: '#000', alpha: true, holderStyle: '', onChange: null, insertBtn: false, onInsert: null, copyBtn: false, attachTo: null, ...args };
    this.color = (color ? color : args.defaultColor);
    this.onChange = args.onChange;
    this.onInsert = args.onInsert;
    this.elements = this.getPicker(args);
    this.picker = this.elements.picker;
    this.holder = this.elements.holder;
  }
  get element() { return this.holder; }
  get color() { return this._color; }
  get value() { return this._color; }
  set color(newColor) {
    const validColor = VID_Color.getValidColor(newColor);
    if (!validColor) { throw 'Unknown or invalid color ('+newColor+')'; return; }
    this._color = newColor;
    const rgb = (validColor.type === 'rgb' ? validColor.values : VID_Color.toRgb(validColor.type, validColor.values).values),
          hsl = (validColor.type === 'hsl' ? validColor.values : VID_Color.toHsl(validColor.type, validColor.values).values),
          hex = (validColor.type === 'hex' ? validColor.values : VID_Color.toHex(validColor.type, validColor.values).values);
    this.type = validColor ? validColor.type : null;
    this.values = validColor ? validColor.values : null;
    this.r = rgb[0]; this.g = rgb[1]; this.b = rgb[2];
    this.h = hsl[0]; this.s = hsl[1]; this.l = hsl[2];
    this.a = validColor.values[3];
    this.rgb = 'rgb('+rgb.slice(0,3).join(' ')+(rgb[3] !== undefined ? ' / '+rgb[3] : '')+')';
    this.hsl = 'hsl('+hsl.slice(0,3).join(' ')+(hsl[3] !== undefined ? ' / '+hsl[3] : '')+')';
    this.hex = '#'+hex.join('');
  };
  covert(type) {
    switch(type) {
      case 'hex': this.color = stringify(this.type, VID_Color.toHex(this.type, this.values)); break;
      case 'rgb': this.color = stringify(this.type, VID_Color.toRgb(this.type, this.values)); break;
      case 'hsl': this.color = stringify(this.type, VID_Color.toHsl(this.type, this.values)); break;
    }
    return this.color;
  }
  test() {
    const validColor = VID_Color.getValidColor(this.color),
          rgb = /rgb/.test(validColor.type) ? validColor.values : VID_Color.toRgb(validColor.type, validColor.values).values,
          hsl = /hsl/.test(validColor.type) ? validColor.values : VID_Color.toHsl(validColor.type, validColor.values).values,
          hex = /#/.test(validColor.type) ? validColor.values : VID_Color.toHex(validColor.type, validColor.values).values;
    const str = [VID_Color.stringify('hex',hex),VID_Color.stringify('rgb',rgb),VID_Color.stringify('hsl',hsl)];
    console.log('%cHEX: '+str[0], 'background-color: '+str[0]);
    console.log('%cRGB: '+str[1], 'background-color: '+str[1]);
    console.log('%cHSL: '+str[2], 'background-color: '+str[2]);
  }
  getPicker(args) {
    let hueColors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'],
        hueCurrent = 'rgb('+VID_Color.hslToRgb(this.h,100,50).join(',')+')',
        currentColor = VID_Color.stringify('hex', VID_Color.toHex(this.type, this.values).values),
        slCurrent = currentColor.length < 6 ? currentColor.slice(0,4) : currentColor.slice(0,7),
        alpha = this.a;
    const colorHolder = VID_NewEl('div', { classList: 'vid-color-holder'+(args.holderStyle ? ' '+args.holderStyle : '') }, { value: this.color }, { backgroundColor: this.color }),
          colorPickerWrapper = VID_NewEl('div', { classList: 'vid-color-picker-wrapper' }),
          colorPickerHueWrapper = VID_NewEl('div', { classList: 'vid-color-picker-hue-wrapper' }),
          colorPickerSlWrapper = VID_NewEl('div', { classList: 'vid-color-picker-sl-wrapper' }),
          colorPickerAlphaWrapper = VID_NewEl('div', { classList: 'vid-color-picker-hue-wrapper' }),
          colorPickerHue = VID_NewEl('canvas', { classList: 'vid-color-picker-hue', width: 300, height: 16 }),
          canvasHue = colorPickerHue.getContext('2d'),
          colorPickerHueCursor = VID_NewEl('div', { classList: 'vid-color-picker-hue-cursor' }, {}, { left: Math.round((this.h/360)*canvasHue.canvas.width)+'px', backgroundColor: hueCurrent }),
          colorPickerSl = VID_NewEl('canvas', { classList: 'vid-color-picker-sl', width: 300, height: 300 }),
          canvasSl = colorPickerSl.getContext('2d'),
          colorPickerSlCursor = VID_NewEl('div', { classList: 'vid-color-picker-sl-cursor' }, {}, { left: (this.s/100)*canvasSl.canvas.width+'px', top: (canvasSl.canvas.height-((this.l/100)*canvasSl.canvas.height))+'px' }),
          colorPickerAlpha = VID_NewEl('canvas', { classList: 'vid-color-picker-hue', width: 300, height: 16 }),
          canvasAlpha = colorPickerAlpha.getContext('2d'),
          colorPickerAlphaCursor = VID_NewEl('div', { classList: 'vid-color-picker-hue-cursor' }, {}, { left: (alpha !== undefined ? alpha : 1)*canvasAlpha.canvas.width+'px', backgroundColor: currentColor }),
          colorPickerPreviewWrapper = VID_NewEl('div', { classList: 'vid-color-picker-preview-wrapper' }),
          colorPickerPreview = VID_NewEl('div', { classList: 'vid-color-picker-preview' }, {}, { backgroundColor: currentColor }),
          validGreen = '#cde8b0', invalidRed = '#d10000',
          colorPickerInput = VID_NewEl('input', { classList: 'vid-color-picker-input', value: this.color }, { value: this.color }, { backgroundColor: validGreen }),
          copyBtn = VID_NewEl('button', { classList: 'vid-color-picker-btn vid-color-picker-copy-btn', textContent: '📋', onclick: () => { navigator.clipboard.writeText(this.color); const rect = colorPickerInput.getBoundingClientRect(); VID_Hint.fade(pscStr('Copied to clipbloard'), { x: rect.right+'px', y: rect.bottom+'px' }); } }),
          insertBtn = VID_NewEl('button', { classList: 'vid-color-picker-btn vid-color-picker-insert-btn', textContent: (typeof args.insertBtn === 'string' ? args.insertBtn : 'Insert'), onclick: () => { this.onInsert && (this.onInsert.call(null, this.color)); this.close(); } });
    colorPickerSlCursor.innerHTML =
      `<div class="vid-color-picker-element" style="width: 3px; height: 3px; position: relative;">
        <div class="vid-color-picker-element" style="width: 1px; height: 6px; background-color: #000; outline: #fff solid 1px; position: absolute; left: 1px; bottom: 5px;"></div>
        <div class="vid-color-picker-element" style="width: 1px; height: 6px; background-color: #000; outline: #fff solid 1px; position: absolute; left: 1px; top: 5px;"></div>
        <div class="vid-color-picker-element" style="width: 6px; height: 1px; background-color: #000; outline: #fff solid 1px; position: absolute; right: 5px; top: 1px;"></div>
        <div class="vid-color-picker-element" style="width: 6px; height: 1px; background-color: #000; outline: #fff solid 1px; position: absolute; left: 5px; top: 1px;"></div>
      </div>`;
    this.picker = colorPickerWrapper;
    //args
    if (args.holderColor) { colorHolder.style.borderColor = args.holderColor; }
    if (args.pickerColor) { colorPickerWrapper.style.backgroundColor = args.pickerColor; }
    //Gradients
    function adjustPicker(colorObj) {
      colorPickerHueCursor.style.left = Math.round((colorObj.h/360)*canvasHue.canvas.width)+'px';
      colorPickerHueCursor.style.backgroundColor = hueCurrent;
      colorPickerAlphaCursor.style.left = (alpha !== undefined ? alpha : 1)*canvasAlpha.canvas.width+'px';
      drawSlCanvas();
      drawAlphaCanvas();
      const slCursorPos = findColorXY(canvasSl, colorObj.r, colorObj.g, colorObj.b) || { x: 0, y: 0 };
      colorPickerSlCursor.style.left = slCursorPos.x+'px';
      colorPickerSlCursor.style.top = slCursorPos.y+'px';
      this.onChange && (this.onChange.call(null, this));
    }
    function findColorXY(canvas,r,g,b) {
      for (let x = 0; x <= canvas.canvas.width; x++) {
        for (let y = 0; y <= canvas.canvas.height; y++) {
          let c = canvasSl.getImageData(x, y, 1, 1).data;
          if (c[0] === r && c[1] === g && c[2] === b) {
            return { x: x, y: y };
          }
        }
      }
    }
    let gradHue = canvasHue.createLinearGradient(0, 0, canvasHue.canvas.width, 0);
    hueColors.forEach((c, i) => { gradHue.addColorStop(i / (hueColors.length-1), hueColors[i]); })
    canvasHue.fillStyle = gradHue;
    canvasHue.fillRect(0, 0, canvasHue.canvas.width, canvasHue.canvas.height);
    function drawSlCanvas() {
      canvasSl.clearRect(0, 0, canvasSl.width, canvasSl.height);
      let gradC = canvasSl.createLinearGradient(0, 0, canvasSl.canvas.width, 0);
      gradC.addColorStop(0, '#fff');
      gradC.addColorStop(1, hueCurrent);
      canvasSl.fillStyle = gradC;
      canvasSl.fillRect(0, 0, canvasSl.canvas.width, canvasSl.canvas.height);
      let gradBW = canvasSl.createLinearGradient(0, 0, 0, canvasSl.canvas.height);
      gradBW.addColorStop(0, 'rgb(0 0 0 / 0)');
      gradBW.addColorStop(1, 'rgb(0 0 0 / 1)');
      canvasSl.fillStyle = gradBW;
      canvasSl.fillRect(0, 0, canvasSl.canvas.width, canvasSl.canvas.height);
    }
    drawSlCanvas();
    function drawAlphaCanvas() {
      canvasAlpha.clearRect(0, 0, canvasAlpha.canvas.width, canvasAlpha.canvas.height);
      const sqSize = 5;
      for(let i=0; i<Math.max(1, canvasAlpha.canvas.height/sqSize); i++) {
        for(let j=0; j<Math.max(1, canvasAlpha.canvas.width/sqSize); j++) {
          canvasAlpha.fillStyle = ((i+j)%2==0) ? '#f7f7f7' : '#ddd';
          canvasAlpha.fillRect(j*sqSize, i*sqSize, sqSize, sqSize);
        }
      }
      let gradC = canvasAlpha.createLinearGradient(0, 0, canvasAlpha.canvas.width, 0);
      gradC.addColorStop(0, 'rgb(0 0 0 / 0)');
      gradC.addColorStop(1, slCurrent);
      canvasAlpha.fillStyle = gradC;
      canvasAlpha.fillRect(0, 0, canvasAlpha.canvas.width, canvasAlpha.canvas.height);
    }
    drawAlphaCanvas();
    //Append to the DOM
    colorPickerSlWrapper.append(colorPickerSl, colorPickerSlCursor);
    colorPickerHueWrapper.append(colorPickerHue, colorPickerHueCursor);
    colorPickerAlphaWrapper.append(colorPickerAlpha, colorPickerAlphaCursor);
    colorPickerPreviewWrapper.append(colorPickerPreview, colorPickerInput);
    if (args.copyBtn) { colorPickerPreviewWrapper.appendChild(copyBtn); }
    colorPickerWrapper.append(colorPickerSlWrapper, colorPickerHueWrapper);
    if (args.alpha) { colorPickerWrapper.appendChild(colorPickerAlphaWrapper); }
    colorPickerWrapper.appendChild(colorPickerPreviewWrapper);
    if (args.insertBtn) { colorPickerWrapper.appendChild(insertBtn); }
    //Add events
    let slRect, hueRect, alphaRect;
    const slEvent = (e) => {
      if (e.buttons === 1) {
        slRect = colorPickerSl.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX-slRect.x, slRect.width-1)),
            y = Math.max(0, Math.min(e.clientY-slRect.y, slRect.height-1)),
            pixel = canvasSl.getImageData(x, y, 1, 1).data;
        currentColor = '#'+VID_Color.rgbToHex(...pixel.slice(0,3)).join('')+(alpha !== undefined ? VID_Color.intToHex(Math.round(alpha*255)) : '');
        slCurrent = currentColor.length < 6 ? currentColor.slice(0,4) : currentColor.slice(0,7);
        drawAlphaCanvas();
        colorPickerSlCursor.style.top = y+'px';
        colorPickerSlCursor.style.left = x+'px';
        colorPickerAlphaCursor.style.backgroundColor = colorPickerPreview.style.backgroundColor = colorPickerInput.value = colorHolder.style.backgroundColor = this.color = currentColor;
        colorHolder.setAttribute('value', currentColor);
        colorPickerInput.style.backgroundColor = validGreen;
        this.onChange && (this.onChange.call(null, this));
      }
    }
    const hueEvent = (e) => {
      if (e.buttons === 1) {
        hueRect = colorPickerHue.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX-hueRect.x, hueRect.width)),
            hue = Math.round((x/hueRect.width)*360);
        hueCurrent = 'rgb('+VID_Color.hslToRgb(hue,100,50).join(',')+')';
        drawSlCanvas();
        let slPixel = canvasSl.getImageData(parseInt(colorPickerSlCursor.style.left), parseInt(colorPickerSlCursor.style.top), 1, 1).data;
        currentColor = '#'+VID_Color.rgbToHex(...slPixel.slice(0,3)).join('')+(alpha !== undefined ? VID_Color.intToHex(Math.round(alpha*255)) : '');
        slCurrent = currentColor.length < 6 ? currentColor.slice(0,4) : currentColor.slice(0,7);
        drawAlphaCanvas();
        colorPickerHueCursor.style.left = x+'px';
        colorPickerHueCursor.style.backgroundColor = hueCurrent;
        colorPickerAlphaCursor.style.backgroundColor = colorPickerPreview.style.backgroundColor = colorPickerInput.value = colorHolder.style.backgroundColor = this.color = currentColor;
        colorHolder.setAttribute('value', currentColor);
        colorPickerInput.style.backgroundColor = validGreen;
        this.onChange && (this.onChange.call(null, this));
      }
    }
    const alphaEvent = (e) => {
      if (e.buttons === 1) {
        alphaRect = colorPickerAlpha.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX-alphaRect.x, alphaRect.width)),
            pos = (x/alphaRect.width).toFixed(2);
        alpha = pos;
        currentColor = slCurrent+(alpha !== undefined ? (slCurrent.length < 6 ? Math.round(alpha*15).toString(16) : VID_Color.intToHex(Math.round(alpha*255))) : '');
        this.color = currentColor;
        drawAlphaCanvas();
        colorPickerAlphaCursor.style.left = x+'px';
        colorPickerAlphaCursor.style.backgroundColor = colorPickerPreview.style.backgroundColor = colorPickerInput.value = colorHolder.style.backgroundColor = this.color = currentColor;
        colorHolder.setAttribute('value', currentColor);
        colorPickerInput.style.backgroundColor = validGreen;
        this.onChange && (this.onChange.call(null, this));
      }
    }
    const colorInput = (e) => {
      const validColor = VID_Color.getValidColor(e.target.value);
      if (!validColor) { e.target.style.backgroundColor = invalidRed; return; }
      else { e.target.style.backgroundColor = validGreen; }
      const rgb = (validColor.type === 'rgb' ? validColor.values : VID_Color.toRgb(validColor.type, validColor.values).values),
            hsl = (validColor.type === 'hsl' ? validColor.values : VID_Color.toHsl(validColor.type, validColor.values).values),
            hex = (validColor.type === 'hex' ? validColor.values : VID_Color.toHex(validColor.type, validColor.values).values);
      hueCurrent = 'rgb('+VID_Color.hslToRgb(hsl[0],100,50).join(',')+')';
      currentColor = VID_Color.stringify('hex', hex);
      slCurrent = currentColor.length < 6 ? currentColor.slice(0,4) : currentColor.slice(0,7);
      alpha = (validColor.values[3] !== undefined ? (validColor.type === 'hex' ? (parseInt(validColor.values[3]+(validColor.values[3].length === 1 ? validColor.values[3] : '').slice(0,2),16)/255).toFixed(2) : validColor.values[3]) : 1);
      colorPickerAlphaCursor.style.backgroundColor = colorPickerPreview.style.backgroundColor = colorPickerInput.value = colorHolder.style.backgroundColor = this.color = currentColor;
      colorHolder.setAttribute('value', currentColor);
      adjustPicker(this);
    }
    colorPickerSlWrapper.addEventListener('mousedown', (e) => { if (e.buttons === 1) { slEvent(e); window.addEventListener('mousemove', slEvent); } });
    colorPickerHueWrapper.addEventListener('mousedown', (e) => { if (e.buttons === 1) { hueEvent(e); window.addEventListener('mousemove', hueEvent); } });
    colorPickerAlphaWrapper.addEventListener('mousedown', (e) => { if (e.buttons === 1) { alphaEvent(e); window.addEventListener('mousemove', alphaEvent); } });
    window.addEventListener('mouseup', (e) => { window.removeEventListener('mousemove', slEvent); window.removeEventListener('mousemove', hueEvent); window.removeEventListener('mousemove', alphaEvent); });
    colorPickerInput.addEventListener('change', colorInput);
    colorPickerInput.addEventListener('input', (e) => { e.target.style.backgroundColor = (/^#[\da-f]{3,}|^rgba?\(\d{1,3}[\s,]+?\d{1,3}[\s,]+?\d{1,3}[\s,\/]*?[\d\.]{0,3}%?\)|^hsla?\(\d{1,3}[\s,]+?\d{1,3}[%\s,]+?\d{1,3}[%\s,\/]*?[\d\.]{0,3}%?\)/i.test(e.target.value) ? validGreen : invalidRed); })
    //Color Holder
    const clickOutside = (e) => {
      if (colorPickerWrapper.contains(e.target)) { return; }
      colorPickerWrapper.remove();
      window.removeEventListener('click', clickOutside);
    }
    new MutationObserver((mutations) => {
      mutations.forEach((m) => { console.log(m);
        if ('addedNodes' in m && [...m.addedNodes].some(f => f === colorPickerWrapper)) { setTimeout(() => window.addEventListener('click', clickOutside)); }
      });
    }).observe(document.body, { childList: true });
    this.attachTo(args.attachTo ? args.attachTo : colorHolder);
    return { holder: colorHolder, picker: colorPickerWrapper };
  }
  open(e) {
    if (document.body.contains(this.picker)) { return; }
    let x, y;
    const rect = (e instanceof Node ? e : this.holder).getBoundingClientRect(),
          pickerRect = this.picker.getBoundingClientRect();
    if (e instanceof Event) {
      x = Math.min(window.innerWidth - pickerRect.width, event.clientX);
      y = Math.min(window.innerHeight - pickerRect.height, event.clientY);
    }
    else {
      x = parseInt(rect.x + (rect.x > window.innerWidth - pickerRect.width ? (-1*pickerRect.width) : 0));
      y = parseInt(rect.y + (rect.y > window.innerHeight - pickerRect.height ? (-1*pickerRect.height) : rect.height));
    }
    this.picker.style.left = Math.max(0, Math.min(window.innerWidth-pickerRect.width, x)) + window.scrollX + 'px';
    this.picker.style.top = Math.max(0, Math.min(window.innerHeight-pickerRect.height, y)) + window.scrollY + 'px';
    document.body.appendChild(this.picker);
  }
  close() { picker.remove(); }
  attachTo(v) { if (v && v instanceof Node) { v.onclick = () => this.open(v); } }

  static intToHex(v) { let hex = v.toString(16); return hex.length === 1 ? "0" + hex : hex.slice(0,2); }
  static rgbToHex(r,g,b) {
    let result = [r,g,b].map(v => VID_Color.intToHex(v));
    return result;
  }
  static hexToRgb(hex) {
    let chars = hex.match(/[0-9a-f]/gi).slice(0,8), result;
    if (chars.length < 3) { return false; }
    if (chars.length > 4) { chars = hex.match(/[0-9a-f]{2}/gi).slice(0,4); }
    result = chars.map(c => parseInt((c.length === 1 ? c+c : c), 16));
    if (result[4]) { result[4] = result[4]/255; }
    return result;
  }
  static rgbToHsl(r,g,b) {
    r = Math.max(Math.min(Math.round(r), 255), 0) / 255;
    g = Math.max(Math.min(Math.round(g), 255), 0) / 255;
    b = Math.max(Math.min(Math.round(b), 255), 0) / 255;
    let min = Math.min(r,g,b), max = Math.max(r,g,b), d = max-min,
    h = Math.round((d ? (max === r ? ((g-b)/d)%6 : (max === g ? (b-r)/d+2 : (r-g)/d+4)) : 0)*60),
    l = (min+max)/2,
    s = (d === 0 ? 0 : d/(1-Math.abs(2*l-1)));
    if (h < 0) { h += 360; }
    s = +(s*100).toFixed(1);
    l = +(l*100).toFixed(1);
    return [h,s,l];
  }
  static hslToRgb(h,s,l) {
    h = Math.max(Math.min(Math.round(h), 360), 0);
    s = Math.max(Math.min(s.toFixed(1), 100), 0) / 100;
    l = Math.max(Math.min(l.toFixed(1), 100), 0) / 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h <= 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r,g,b];
  }
  static stringify(type, values) {
    switch (type) {
      case 'hex': return '#'+values.join(''); break;
      case 'rgb': return 'rgb('+values.slice(0,3).join(' ')+(values[3] !== undefined ? ' / '+values[3] : '')+')'; break;
      case 'hsl': return 'hsl('+values[0]+' '+values[1]+'% '+values[2]+'%'+(values[3] !== undefined ? ' / '+values[3] : '')+')'; break;
      default: return '';
    }
  }
  static toHex(type, values) {
    let colorObj = { type: type, values: values },
        alpha = (values[3] ? (type === 'hex' ? parseInt(values[3], 16)/255 : values[3]) : false);
    if (type ==='rgb') { colorObj.type = 'hex'; colorObj.values = [...VID_Color.rgbToHex(...values.slice(0,3)), (alpha !== false ? VID_Color.intToHex(alpha*255) : undefined)]; }
    else if (type === 'hsl') { colorObj.type = 'hex'; colorObj.values = [...VID_Color.rgbToHex(...VID_Color.hslToRgb(...values.slice(0,3))), (alpha !== false ? VID_Color.intToHex(alpha) : '')]; }
    return colorObj;
  }
  static toRgb(type, values) {
    let colorObj = { type: type, values: values },
        alpha = (values[3] ? (type === 'hex' ? parseInt(values[3], 16)/255 : values[3]) : false);
    if (type === 'hex') { colorObj.type = 'rgb'; colorObj.values = VID_Color.hexToRgb(values.join('')); }
    else if (type === 'hsl') { colorObj.type = 'rgb'; colorObj.values = [...VID_Color.hslToRgb(...values.slice(0,3)), (alpha !== false ? alpha : undefined)]; }
    return colorObj;
  }
  static toHsl(type, values) {
    let colorObj = { type: type, values: values },
        alpha = (values[3] ? (type === 'hex' ? parseInt(values[3], 16)/255 : values[3]) : false);
    if (type === 'hex') { colorObj.type = 'hsl'; colorObj.values = VID_Color.rgbToHsl(...VID_Color.hexToRgb(values.join(''))); }
    else if (type ==='rgb') { colorObj.type = 'hsl'; colorObj.values = [...VID_Color.rgbToHsl(...values.slice(0,3)), (alpha !== false ? alpha : undefined)]; }
    return colorObj;
  }
  static getValidColor(colorStr) {
    if (!colorStr) { return false; }
    let colorObj = { type: '', values: [] },
        str = colorStr.trim();
    if (/^#?[0-9a-f]{3,}/i.test(str)) {
      let chars = colorStr.match(/[0-9a-f]+/i)[0].length;
      if (chars === 3 || chars === 4) { colorObj.type = 'hex'; colorObj.values = str.match(/[0-9a-f]/gi).slice(0, chars); }
      else if (chars >= 6) { colorObj.type = 'hex'; colorObj.values = str.match(/[0-9a-f]{2}/gi).slice(0,Math.max(Math.floor(chars/2),4)); }
      else { return false; }
    } else {
      let vals = str.match(/[0-9\.%]+/g);
      if (vals === null || vals.length < 3) { return false; }
      if (/^rgb/i.test(str)) {
        colorObj.type = "rgb";
        colorObj.values = vals.slice(0, 3).map(v => Math.max(0, Math.min(255, parseInt(v.match(/\d+/)[0]))));
        if (vals.length > 3) { colorObj.values[3] = (/%/.test(vals[3]) ? Math.min(100, Math.max(0, parseInt(vals[3].match(/\d+/)[0])))/100 : Math.max(0, Math.min(1, parseFloat(vals[3]))) ); }
      }
      else if (/^hsl/i.test(str)) {
        colorObj.type = "hsl";
        colorObj.values = [Math.max(0, Math.min(360, parseInt(vals[0].match(/\d+/)[0]))), Math.max(0, Math.min(100, parseInt(vals[1].match(/\d+/)[0]))), Math.max(0, Math.min(100, parseInt(vals[2].match(/\d+/)[0])))];
        if (vals.length > 3) { colorObj.values[3] = (/%/.test(vals[3]) ? Math.min(100, Math.max(0, parseInt(vals[3].match(/\d+/)[0]))) : Math.max(0, Math.min(1, parseFloat(vals[3]))) ); }
      }
      else { return false; }
    }
    return colorObj;
  }
  static convert(tag, args) {
    const color = new VID_Color((tag.value ? tag.value : undefined), { alpha: false, ...args });
    tag.replaceWith(color.holder);
    return color;
  }
  static attachTo(tag, args = {}) {
    if (!(tag instanceof Node)) { return; }
    const color = new VID_Color('value' in tag ? tag.value : '', args);
    color.attachTo(tag);
    return color;
  }
}
