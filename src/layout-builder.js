window.addEventListener('DOMContentLoaded', () => pscLayoutBuilderInit());
let test;
async function pscLayoutBuilderInit() {
  //get layout data or use the defaults for a new layout
  let layoutOptions = { id: null, name: '', slug: '', post_type: '' },
      layoutItems = [
        { id: 1, parent: 0, type: "container", options: { class: ["_slug"] } },
        { id: 2, parent: 1, type: "post", options: { class: ["_slug-post"] } },
        { id: 3, parent: 2, type: "wrapper", options: { class: ["_slug-text-wrapper"] }},
        { id: 4, parent: 3, type: "title", options: { class: ["_slug-title"] }},
        { id: 5, parent: 3, type: "excerpt", options: { class: ["_slug-excerpt"] }}
      ],
      layoutCss = '';
  if (typeof PSC_LAYOUT !== 'undefined') {
    layoutOptions = { id: PSC_LAYOUT.id, name: PSC_LAYOUT.name, slug: PSC_LAYOUT.slug, post_type: 'post_type' in PSC_LAYOUT ? PSC_LAYOUT.post_type : '' };
    layoutItems = PSC_LAYOUT.items;
    layoutCss = PSC_LAYOUT.css;
  }

  //fetch post types and taxonomies
  const dataFetch = await pscFetch('rest', 'get=taxs'),
        taxonomies = (dataFetch ? dataFetch.taxs : [{ label: 'Categories', name: 'category' }]).map(t => { return { label: t.label, value: t.name } });

  //define the possible types of the constructor elements
  const exclChrs = '\^\\w\\-',
      allTypes = [
        { type: 'container', label: pscStr('Layout container'), static: true, isParent: true, hasAddBtn: false, options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'div', options: [{ label: '<div>', value: 'div' }, { label: '<main>', value: 'main' }] },
          { name: 'special', type: 'select', label: pscStr('Enable a special layout:'), default: '',
            unlocks: [{ name: 'fill', on: 'masonry' }, { name: 'hint_masonry', on: 'masonry' }, { name: 'delay', on: 'slider' }, { name: 'animate', on: 'slider' }, { name: 'speed', on: 'slider' }, { name: 'start', on: 'slider' }, { name: 'ease', on: 'slider' }],
            options: [{ label: pscStr('No special layout'), value: '' }, { label: pscStr('Masonry'), value: 'masonry' }, { label: pscStr('Slider / Carousel'), value: 'slider' }] },
          { name: 'hint_masonry', type: 'hint', label: '* '+pscStr('For the masonry layout to work, all posts must be of the same width.') },
          { name: 'delay', label: pscStr('Stop on each slide for'), type: 'number', default: 5, min: 0, step: 0.1, suffix: ' sec' },
          { name: 'animate', label: pscStr('Animation type'), type: 'select', default: 'slide', options: [{ label: 'Slide', value: 'slide' }, { label: 'Flash', value: 'flash' }, { label: 'Blur', value: 'blur' }] },
          { name: 'speed', label: pscStr('Animation duration'), type: 'number', default: 0.5, min: 0, step: 0.1, suffix: ' sec' },
          { name: 'ease', label: pscStr('Easing'), type: 'select', default: 'ease', options: [{ label: pscStr('Ease'), value: 'ease' }, { label: pscStr('Linear'), value: 'linear' }, { label: pscStr('Ease in & out'), value: 'ease-in-out' }, { label: pscStr('Ease out'), value: 'ease-out' }, { label: pscStr('Ease in'), value: 'ease-in' }] },
          { name: 'start', label: pscStr('Start immediately?'), type: 'toggle', default: false },
          { name: 'fill', label: pscStr('Fill in the least occupied columns?'), type: 'toggle', default: true }] },

        { type: 'post', label: 'Post', static: true, isParent: true, options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug-item'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'article', options: [{ label: '<article>', value: 'article' }, { label: '<div>', value: 'div' }] },
          { name: 'no_thumbnail_class', type: 'input', excludeChars: exclChrs, label: pscStr('Class if no thumbnail found'), default: '' }] },

        { type: 'wrapper', label: pscStr('Wrapper'), isParent: true, options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'div', options: [{ label: '<div>', value: 'div' }, { label: '<header>', value: 'header' }, { label: '<footer>', value: 'footer' }] }] },

        { type: 'title', label: pscStr('Title'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug-title'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'h2', options: [
            { label: '<h1>', value: 'h1' },{ label: '<h2>', value: 'h2' }, { label: '<h3>', value: 'h3' }, { label: '<h4>', value: 'h4' }, { label: '<h5>', value: 'h5' },
            { label: '<h6>', value: 'h6' }, { label: '<div>', value: 'div' }, { label: '<span>', value: 'span' }] } ] },

        { type: 'date', label: pscStr('Date (created)'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'span', options: [{ label: '<span>', value: 'span' }, { label: '<div>', value: 'div' }] } ] },

        { type: 'datemodified', label: pscStr('Date (modified)'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'span', options: [{ label: '<span>', value: 'span' }, { label: '<div>', value: 'div' }] } ] },

        { type: 'author', label: pscStr('Author'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'a', options: [{ label: '<a> (link to author page)', value: 'a' }, { label: '<span>', value: 'span' }, { label: '<div>', value: 'div' }] } ] },

        { type: 'avatar', label: pscStr('Author\'s avatar'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'img', options: [{ label: '<img>', value: 'img' }, { label: '<div> (as background)', value: 'div' }] },
          { name: 'size', type: 'number', label: pscStr('Size'), default: 96, min: 8 },
          { name: 'default', type: 'select', label: pscStr('Fallback'), default: '', options: [
            { label: pscStr('Default'), value: '' }, { label: pscStr('Mystery'), value: 'mystery' }, { label: pscStr('Transparent GIF'), value: 'blank' },
            { label: pscStr('404'), value: '404' }, { label: pscStr('Retro'), value: 'retro' }, { label: pscStr('Robot'), value: 'robohash' },
            { label: pscStr('Monster'), value: 'monsterid' }, { label: pscStr('Cartoon face'), value: 'wavatar' },
            { label: pscStr('Geometric pattern'), value: 'identicon' }, { label: pscStr('Gravatar logo'), value: 'gravatar_default' } ] },
          { name: 'force_default', type: 'toggle', label: pscStr('Force fallback'), default: false } ] },

        { type: 'categories', label: pscStr('Categories'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), disabled: true, default: 'div', options: [{ label: '<div>', value: 'div' }] },
          { name: 'hyperlink', type: 'toggle', label: pscStr('Hyperlinks?'), default: true }] },

        { type: 'tags', label: pscStr('Tags'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), disabled: true, default: 'div', options: [{ label: '<div>', value: 'div' }] },
          { name: 'hyperlink', type: 'toggle', label: pscStr('Hyperlinks?'), default: true },
          { name: 'hashtag', type: 'toggle', label: pscStr('Hashtag?'), default: true }
        ] },

        { type: 'thumbnail', label: pscStr('Thumbnail image'), options: [
          { name: 'hint', type: 'hint', label: pscStr('Shows the featured image of the post or the image of the attachment if the post is of media type.'), inline: true },
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug-img'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'img', options: [{ label: '<img>', value: 'img' }, { label: '<div> (as background)', value: 'div' }] },
          { name: 'size', type: 'select', label: pscStr('Thumbnail size'), default: 'medium', options: [
            { label: pscStr('Thumbnail'), value: 'thumbnail' }, { label: pscStr('Medium'), value: 'medium' }, { label: pscStr('Medium-large'), value: 'medium_large' },
            { label: pscStr('Large'), value: 'large' }, { label: pscStr('Full'), value: 'full' }] } ] },

        { type: 'image', label: pscStr('Custom image'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'img', options: [{ label: '<img>', value: 'img' }, { label: '<div> (as background)', value: 'div' }], unlocks: [{ name: 'alt', on: 'img' }] },
          { name: 'url', type: 'input', label: pscStr('URL'), default: '', excludeChars: '"', hint: pscStr('Click on + to add generated string.'),
            addList: ['%site_url%', '%post_id%', '%post_slug%', '%author_id%', { label: '%meta_key=KEY%', value: '%meta_key=%' }] }
        ] },

        { type: 'embed', label: pscStr('Media embedding'), options: [
          { name: 'hint', type: 'hint', label: pscStr('Embeds audio/video for a media post type or searches the post content for embeds and displays them.'), inline: true },
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug-embed'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'div', options: [{ label: '<div>', value: 'div' }] },
          { name: 'types', type: 'select', label: pscStr('Apply for media types'), default: ['audio'], multiple: true, options: [{ label: pscStr('Audio'), value: 'audio' }, { label: pscStr('Video'), value: 'video' }] },
          { name: 'in_content', type: 'toggle', label: pscStr('Search post content for embeds?'), default: false, unlocks: [{ name: 'max', on: true }] },
          { name: 'max', type: 'number', label: pscStr('Max. number of embeds'), min: 1, step: 1, default: 1 },
        ] },

        { type: 'excerpt', label: pscStr('Excerpt'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: ['_slug-excerpt'] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'div', options: [{ label: '<div>', value: 'div' }, { label: '<span>', value: 'span' }] },
          { name: 'source', type: 'select', label: pscStr('Source'), default: 'excerpt', options: [{ label: pscStr('Excerpt'), value: 'excerpt' }, { label: 'Content', value: 'content' }, { label: 'Excerpt (otherwise content)', value: 'mix' }] },
          { name: 'cut', type: 'toggle', label: pscStr('Cut length?'), default: true, unlocks: [{ name: 'limit', on: true }] },
          { name: 'limit', type: 'number', label: pscStr('Words limit'), default: 30, hint: pscStr('If a negative number is used, it will sample up to the last N words.') },
          { name: 'more_text', type: 'input', label: pscStr('Read more link'), default: '' },
          { name: 'force_more', type: 'toggle', label: pscStr('Always show the Read more link?'), default: false, hint: pscStr('When turned off, the Read more link will only be displayed if the excerpt is incomplete.') } ] },

        { type: 'link', label: pscStr('Link'), isParent: true, options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), disabled: true, default: 'a', options: [{ label: '<a>', value: 'a' }] },
          { name: 'leads_to', type: 'select', label: pscStr('The link leads to'), default: 'post', unlocks: [{ name: 'custom_url', on: 'custom' }], options: [
            { label: pscStr('Post'), value: 'post' }, { label: pscStr('Author page'), value: 'author_page' }, { label: pscStr('Attachment permalink'), value: 'media_page' },
            { label: pscStr('Attachment download link'), value: 'download' }, { label: pscStr('Show thumbnail in a Lightbox'), value: 'img_lightbox' },
            { label: pscStr('All thumbnails as a Gallery'), value: 'query_gallery' }, { label: pscStr('Images in post content as a Gallery'), value: 'content_gallery' },
            { label: pscStr('The home page'), value: 'home' }, { label: pscStr('Custom URL'), value: 'custom' }] },
          { name: 'custom_url', type: 'input', label: pscStr('Custom URL'), default: '', excludeChars: '"', hint: pscStr('Click on + to add generated string.'),
            addList: ['%site_url%', '%post_permalink%', '%post_id%', '%post_slug%', '%author_id%', '%attachment_url%', { label: '%meta_key=KEY%', value: '%meta_key=%' }, { label: '%gallery=[\'URL1\', \'URL2\'...]%', value: '%gallery=[]%' }] },
          { name: 'target_blank', type: 'toggle', label: pscStr('Open in a new window'), default: false } ] },

        { type: 'text', label: pscStr('Text'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'span', options: [{ label: '<span>', value: 'span' }, { label: '<div>', value: 'div' }] },
          { name: 'content', type: 'input', label: pscStr('Text content'), default: '', hint: pscStr('Click on + to add generated string.'),
            addList: ['%site_title%', '%site_tagline%', '%post_title%', '%post_slug%', { label: '%meta_key=KEY%', value: '%meta_key=%' }] } ] },

        { type: 'terms', label: pscStr('Custom terms'), options: [
          { name: 'class', type: 'tokens', excludeChars: exclChrs, multiple: true, label: pscStr('Class list'), default: [''] },
          { name: 'tag', type: 'select', label: pscStr('HTML Tag'), default: 'div', options: [{ label: '<div>', value: 'div' }, { label: '<span>', value: 'span' }] },
          { name: 'taxonomies', type: 'select', label: pscStr('Taxonomy'), default: '', options: taxonomies },
          { name: 'hyperlink', type: 'toggle', label: pscStr('Hyperlinks?'), default: true } ] }
        ];

  //define variables needed later
  const unloadFunc = (event) => { event.preventDefault(); return true; };
  let itemsList, preview, changes = false, saveButton;

  //set up code editor
  const editor = wp.codeEditor.initialize(document.getElementById('code-editor'), wp.codeEditor.defaultSettings);
  editor.codemirror.on('change', () => { layoutCss = editor.codemirror.doc.getValue(); editor.unmark(); setChanges(true); });
  editor.codemirror.on('blur', () => updateSuggestions());
  editor.mark = (search) => {
    const cursor = editor.codemirror.getSearchCursor(search);
    while (cursor.findNext()) { editor.codemirror.markText(cursor.from(), cursor.to(), { className: 'psc-highlighted' }); }
  };
  editor.unmark = () => { editor.codemirror.doc.getAllMarks().forEach(m => m.clear()); };
  editor.insert = (code, afterCursor = false) => {
    const cursor = afterCursor ? editor.codemirror.doc.getCursor() : null;
    if (cursor) { editor.codemirror.doc.replaceRange(code, cursor); }
    else { editor.codemirror.doc.setValue(editor.codemirror.doc.getValue()+code); }
  };

  //define context menus
  const addItemMenu = new VID_ContextMenu({ label: 'Insert new item:', style: 'display: grid; grid: auto-flow / 1fr 1fr;' }, []);
  const addCssMenu = new VID_ContextMenu({}, [
    { label: pscStr('Pagination')+'...', value: 'pagination', action: (addCssMenu, e) => paginationCss.open(e) },
    { label: pscStr('Slider counter')+'...', value: 'slider', action: (addCssMenu, e) => sliderCss.open(e) }
  ]);
  const paginationCss = new VID_ContextMenu({ label: pscStr('Pagination')+':' }, [
    { label: pscStr('Pagination wrapper'), value: 'wrapper', action: () => editor.insert('\n.paging-navigation .nav-links {\n\t\n}') },
    { label: pscStr('Pagination element (all)'), value: 'element', action: () => editor.insert('\n.paging-navigation .page-numbers {\n\t\n}') },
    { label: pscStr('Current element'), value: 'current', action: () => editor.insert('\n.paging-navigation .page-numbers.current {\n\t\n}') },
    { label: pscStr('Previous element'), value: 'prev', action: () => editor.insert('\n.paging-navigation .prev.page-numbers {\n\t\n}') },
    { label: pscStr('Next element'), value: 'next', action: () => editor.insert('\n.paging-navigation .next.page-numbers {\n\t\n}') },
    { label: pscStr('Dots element'), value: 'dots', action: () => editor.insert('\n.paging-navigation .page-numbers.dots {\n\t\n}') }
  ]);
  const sliderCss = new VID_ContextMenu({ label: pscStr('Slider counter')+':' }, [
    { label: pscStr('Counter wrapper'), value: 'counter', action: () => editor.insert('\n._slug .slider-counter {\n\t\n}') },
    { label: pscStr('Counter circles'), value: 'circles', action: () => editor.insert('\n._slug .slider-circle {\n\t\n}') },
    { label: pscStr('Current circle'), value: 'circle', action: () => editor.insert('\n._slug .slider-circle.current {\n\t\n}') },
    { label: pscStr('Circle on hover'), value: 'hover', action: () => editor.insert('\n._slug .slider-circle:hover {\n\t\n}') }
  ]);

  //define dialogs
  const messageSaveSuccess = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Layout saved.'), duration: 2000 }, style: { fontSize: '1.5em' } }),
        messageSaveFail = new VID_Dialog({ type: 'fade_message', options: { message: pscStr('Failed to save layout.'), duration: 2000 }, style: { fontSize: '1.5em', backgroundColor: 'var(--vid-destructive)', color: '#fff' } }),
        confirmLayoutDelete = new VID_Dialog({ type: 'confirm', onConfirm: () => { document.getElementById('delete-layout-form').submit(); }, options: { message: pscStr('Are you sure?'), reverseDestructive: true, confirmBtn: pscStr('Delete layout') }, style: { backgroundColor: 'var(--vid-destructive)', color: '#fff' } }),
        mqInput = new VID_InputControl({ label: '@media', labelOnLeft: true, style: 'gap: 5px;', excludeChars: '\^\\w\\-\\(\\)\:\%' }),
        mqSelect = new VID_SelectControl({ label: pscStr('Sample rules'), value: '', style: 'width: 100%; margin-bottom: 10px', onChange: (c) => mqInput.value = c.value[0] }, [
          { label: pscStr('Custom'), value: '' }, { label: pscStr('Mobiles'), value: '(max-width: 480px)' },
          { label: pscStr('Tablets and mobiles'), value: '(max-width: 768px)' }, { label: pscStr('Tablets only'), value: '(min-width: 481px and max-width: 810px)' },
          { label: pscStr('Small desktop screens'), value: '(max-width: 1024px)' }, { label: pscStr('Large desktop screens'), value: '(min-width: 2000px)' },
          { label: pscStr('With touch screen'), value: '(pointer: coarse)' }, { label: pscStr('Dark colored themes prefered'), value: '(prefers-color-scheme: dark)' },
          { label: pscStr('Portrait orientation'), value: '(orientation: portrait)' }, { label: pscStr('JavaScript disabled'), value: '(scripting: none)' }]),
        mqDialog = new VID_Dialog({ type: 'controls', onOpen: (d) => { mqInput.value = mqSelect.value = ''; }, onConfirm: (d) => { editor.insert('\n@media '+mqInput.value+' {\n\t\n}') }, options: { controls: [mqSelect, mqInput], confirmBtn: pscStr('Add'), cancelBtn: pscStr('Cancel') } }),
        loading = new VID_Loading();

  //define layout name controls
  const layoutNameInput = VID_InputControl.convert(document.getElementById('layout-name'), { value: layoutOptions.name, onChange: (i) => { layoutOptions.name = i.value; slugGenerator.value && (layoutSlugInput.value = sanitizeSlug(i.value, true)) } }),
        layoutSlugInput = VID_InputControl.convert(document.getElementById('layout-slug'), { value: layoutOptions.slug, onInput: (i) => i.value = sanitizeSlug(i.inputEl.value, true), onChange: (i) => updateSlug(i.value) }),
        slugGenerator = VID_ToggleControl.convert(document.getElementById('slug-generator'), { onChange: (c) => { if (c.value) { layoutSlugInput.value = sanitizeSlug(layoutNameInput.value, true); layoutSlugInput.disabled = true; } else { layoutSlugInput.disabled = false; } } }),
        forPostType = VID_SelectControl.convert(document.getElementById('for-post-type'), { value: layoutOptions.post_type, onChange: (c) => { layoutOptions.post_type = c.value[0]; preview && (preview.controls.postType.value = c.value[0]); } });

  //set up constructor elements list
  itemsList = new VID_ItemsList({ idAttr: 'items-list', itemTypes: allTypes, removableItems: true, draggable: true, levels: 10,
    labels: { addBtn: '+', removeBtn: '–', addItemTypeMenu: pscStr('Insert a new item')+':' }, focusable: true,
    onChange: () => setChanges(true),
    onSelect: (item, list) => {
      const option = item.options.find(f => f.name === 'class'), value = option ? option.value[0] : null;
      if (!value) { return; }
      editor.mark('/\.'+value+'\s*\{/');
    }
  });
  document.getElementById('items-list').replaceWith(itemsList.element);
  layoutItems.forEach(item => itemsList.addItem({ type: item.type, id: item.id, parent: item.parent, options: item.options }));
  test = itemsList;

  //resize code editor to list's height
  new ResizeObserver(() => itemsList && (editor.codemirror.setSize('100%', Math.max(itemsList.element.getBoundingClientRect().height-100, 400)+'px'))).observe(itemsList.element);

  //define layout preview class
  class PSCPreview {
    constructor() {
      this.active = false;
      this.changes = false;
      this._width = 1280;
      this._height = 768;
      this._scale = 50;
      this.query = { postType: layoutOptions.post_type || 'post', order: 'DESC', orderBy: 'date', limit: 10 };
      this.query.toString = () => pscUrls.site+'/?showcase_creator_block_preview&layout=_preview&postType='+this.query.postType+'&orderBy='+this.query.orderBy+'&order='+this.query.order+'&postsToDisplay='+this.query.limit;
      this.controls = {
        width: new VID_NumberControl({ label: pscStr('Width')+':', value: this.width, suffix: 'px', min: 300, onChange: (c) => this.width = c.value }),
        height: new VID_NumberControl({ label: pscStr('Height')+':', value: this.height, suffix: 'px', min: 300, onChange: (c) => this.height = c.value }),
        scale: new VID_NumberControl({ label: pscStr('Scale the preview')+':', value: this.scale, suffix: '%', min: 20, max: 100, step: 1, onChange: (c) => this.scale = c.value }),
        postType: new VID_SelectControl({ label: pscStr('Post type')+':', value: this.query.postType, onChange: (c) => { this.query.postType = c.value[0]; this.update(); } }, forPostType.options.filter(o => o.value).map(o => { return { label: o.label, value: o.value } })),
        orderBy: new VID_SelectControl({ label: pscStr('Order by')+':', value: this.query.orderBy, onChange: (c) => { this.query.orderBy = c.value[0]; this.update(); } }, [{ label: pscStr('Date'), value: 'date' }, { label: pscStr('Title'), value: 'title' }, { label: pscStr('Randomize'), value: 'rand' }]),
        order: new VID_SelectControl({ label: pscStr('Order')+':', value: this.query.order, onChange: (c) => { this.query.order = c.value[0]; this.update(); } }, [{ label: pscStr('Ascending'), value: 'ASC' }, { label: pscStr('Descending'), value: 'DESC' }]),
        limit: new VID_NumberControl({ label: pscStr('Post count limit')+':', value: this.query.limit, min: -1, step: 1, onChange: (c) => { this.query.limit = c.value; this.update(); } })
      };
      this.fakeBox = VID_NewEl('div', { classList: 'psc-preview-resizer-fake' });
      this.resizers = ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((r, i) => VID_NewEl('div', { classList: 'psc-preview-resizer '+r, onmousedown: () => this.startResize(i) }));
      this.scr = VID_NewEl('iframe', { id: 'psc-preview-screen', classList: 'psc-preview-screen', src: this.query.toString(),
        onload: () => {
          const els = [this.scr.contentWindow.document.querySelector('#wpadminbar'), this.scr.contentWindow.document.querySelector('#masthead'), this.scr.contentWindow.document.querySelector('.site-footer')];
          const links = [...this.scr.contentWindow.document.querySelectorAll('a, button')];
          els.forEach((el) => { if (el) { el.remove(); } });
          links.forEach((l) => { l.href = 'javascript:void(0)'; });
          this.loading.close();
        } });
      this.scrWrapper = VID_NewEl('div', { classList: 'psc-preview-screen-wrapper' }, {}, {}, this.scr, ...this.resizers);
      const topBar = VID_NewEl('div', { classList: 'psc-preview-topbar' }, {}, {}, VID_NewEl('div', { classList: 'psc-preview-label', textContent: '::: '+pscStr('Preview')+' :::' })),
            closeBtn = VID_NewEl('div', { classList: 'psc-preview-close-button', innerHTML: '<span>X</span>' }),
            refreshBtn = VID_NewEl('button', { classList: 'button-secondary psc-preview-refresh-button', innerHTML: '<span style="font-size: 1.2em; line-height: 1.2em; font-weight: bold;">↻</span>' }),
            scrControlsLabel = VID_NewEl('div', { classList: 'psc-preview-screen-controls-label', textContent: pscStr('Screen size')+':' }),
            scrControls = VID_NewEl('div', { classList: 'psc-preview-screen-controls' }, {}, {}, scrControlsLabel, this.controls.width.element, this.controls.height.element, this.controls.scale.element, closeBtn),
            queryLabel = VID_NewEl('div', { classList: 'psc-preview-screen-controls-label', textContent: pscStr('Query')+':' }),
            queryControls = VID_NewEl('div', { classList: 'psc-preview-screen-controls' }, {}, {}, queryLabel, this.controls.postType.element, this.controls.orderBy.element, this.controls.order.element, this.controls.limit.element, refreshBtn),
            wrapper = VID_NewEl('div', { classList: 'psc-preview-wrapper' }, {}, {}, scrControls, queryControls, this.scrWrapper);

      this.element = VID_NewEl('div', { classList: 'psc-preview' }, {}, { left: this.closed.x+'px', top: this.closed.y+'px' }, topBar, wrapper);
      this.resize(this.width, this.height, this.scale);
      this.loading = new VID_Loading({ appendTo: this.scrWrapper, style: { position: 'absolute' } });
      //open preview
      topBar.addEventListener('click', (event) => { if (this.active === false && event.target !== closeBtn) { this.open(); } });
      //mouse drag event
      let rect, relX, relY;
      const moveEvent = (event) => {
        const x = event.clientX-relX, y = Math.min(window.innerHeight, Math.max(32,event.clientY-relY));
        if (x >= window.innerWidth || y >= window.innerHeight) { this.close(); }
        else { this.move(x,y); }
      };
      //trigger mouse drag
      topBar.addEventListener('mousedown', (event) => {
        if (this.active) {
          rect = this.element.getBoundingClientRect();
          relX = event.clientX-rect.left;
          relY = event.clientY-rect.top;
          window.addEventListener('mousemove', moveEvent);
        }
      });
      window.addEventListener('mouseup', () => window.removeEventListener('mousemove', moveEvent));
      window.addEventListener('resize', () => { this.close(); this.x = this.opened.x; this.y = this.opened.y; });
      closeBtn.addEventListener('click', () => this.close());
      refreshBtn.addEventListener('click', () => this.update());
      wrapper.append();
    }

    get closed() { return { x: window.innerWidth/2-((this._width*(this._scale/100))/2), y: window.innerHeight }; }
    get opened() { const h = parseInt(this.element.getBoundingClientRect().height); return { x: window.innerWidth/2-((this.width*(this.scale/100))/2), y: window.innerHeight-h } }
    move(x,y) { this.x = parseInt(x); this.y = parseInt(y); }
    set x(x) {
      this._x = Math.max(0, Math.min(window.innerWidth-(this._width*(this._scale/100)), parseInt(x)));
      this.active && (this.element.style.left = this._x+'px');
    }
    set y(y) {
      this._y = Math.max(0, Math.min(window.innerHeight-32, parseInt(y)));
      this.active && (this.element.style.top = this._y+'px');
    }
    get x() { return this._x; }
    get y() { return this._y; }

    resize(w,h,s) { this.width = w; this.height = h, this.scale = s; }
    set width(w) {
      this._width = parseInt(w);
      this.scrWrapper.style.width = this.width*(this.scale/100)+'px';
      this.scr.style.width = this.width+'px';
    }
    set height(h) {
      this._height = parseInt(h);
      this.scrWrapper.style.height = this.height*(this.scale/100)+'px';
      this.scr.style.height = this.height+'px';
    }
    set scale(s) {
      this._scale = parseInt(s);
      this.scrWrapper.style.width = this.width*(this._scale/100)+'px';
      this.scrWrapper.style.height = this.height*(this._scale/100)+'px';
      this.scr.style.transform = 'scale('+this.scale+'%)';
    }
    get width() { return this._width; }
    get height() { return this._height; }
    get scale() { return this._scale; }

    startResize(i) {
      const blockScr = VID_NewEl('div', {}, {}, { position: 'absolute', inset: 0, zIndex: 9999 });
      const rect = this.scr.getBoundingClientRect(), rect2 = this.element.getBoundingClientRect();
      let x = rect.x, y = rect.y, w = rect.width, h = rect.height;
      const fakeResize = (x,y,w,h) => {
        this.fakeBox.style.left = parseInt(x)+'px';
        this.fakeBox.style.top = parseInt(y)+'px';
        this.fakeBox.style.width = parseInt(w)+'px';
        this.fakeBox.style.height = parseInt(h)+'px';
      }
      fakeResize(x,y,w,h);
      document.body.appendChild(this.fakeBox);
      const onMouseMove = (event) => {
        const cx = event.clientX, cy = event.clientY;
        if ([0,1].includes(i)) {
          y = Math.min(cy, rect.bottom-2);
          h = Math.max(rect.y+rect.height-cy, 0); }
        if ([1,2].includes(i)) {
          w = Math.max(cx-+rect.x, 0); }
        if ([2,3].includes(i)) {
          h = Math.max(cy-rect.y, 0); }
        if ([3,0].includes(i)) {
          x = Math.min(cx, rect.right-2);
          w = Math.max(rect.x+rect.width-cx, 0); }
        fakeResize(x,y,w,h);
      };
      const onMouseUp = (event) => {
        const frect = this.fakeBox.getBoundingClientRect(), min = 300*(this.scale/100);
        let right = frect.right, bottom = frect.bottom;
        w = Math.max(w, min), h = Math.max(h, min);
        if ([0,3].includes(i) && frect.width < this.minWidth) { x = right-this.minWidth; }
        if ([0,1].includes(i) && frect.height < this.minHeight) { y = bottom-this.minHeight; }
        finishResize(true);
      };
      const onEsc = (event) => { event.key === 'Escape' && (finishResize(false)) };
      const finishResize = (success) => {
        this.fakeBox.remove();
        if (success) {
          this.controls.width.value = parseInt(w/(this.scale/100));
          this.controls.height.value = parseInt(h/(this.scale/100));
          const rect = this.scr.getBoundingClientRect();
          if ([0,3].includes(i)) { this.x -= rect.x-x; }
          if ([0,1].includes(i)) { this.y -= rect.y-y; }
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('keydown', onEsc);
        blockScr.remove();
      }
      this.scrWrapper.appendChild(blockScr);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('keydown', onEsc);
    }
    open() {
      const rect = this.element.getBoundingClientRect();
      if (!('_x' in this) || !('_y' in this)) { this.move(this.opened.x, this.opened.y); }
      this.element.animate([{ left: rect.left+'px', top: rect.top+'px' }, { left: this.x+'px', top: this.y+'px' }], { ease: 'ease', duration: ms });
      this.element.style = 'left: '+this.x+'px; top: '+this.y+'px';
      this.active = true;
      this.element.classList.add('active');
      this.update();
    }
    close() {
      const rect = this.element.getBoundingClientRect(), closed = this.closed;
      this.element.animate([{ left: rect.left+'px', top: rect.top+'px' }, { left: closed.x+'px', top: closed.y+'px' }], { ease: 'ease', duration: ms });
      this.element.style = 'left: '+closed.x+'px; top: '+closed.y+'px;';
      this.active = false;
      this.element.classList.remove('active');
    }
    update() {
      if (this.active === false) { return; }
      this.loading.open();
      const layout = getLayout();
      const data = new FormData();
      data.append('action', 'psc_preview_layout');
      data.append('slug', layout.slug);
      data.append('name', layout.name);
      data.append('items', JSON.stringify(layout.items));
      data.append('css', layout.css);
      pscFetch('ajax', data).then((r) => r && r.status !== 'error' && (this.scr.src = this.query.toString()));
      this.changes = false;
    }
  }

  //new preview object
  preview = new PSCPreview();

  //set up buttons functionality
  const addCssBtn = document.getElementById('add-css-btn'),
        trashButton = document.getElementById('trash-button');
  saveButton = document.getElementById('save-button');
  addCssBtn.addEventListener('click', (event) => addCssMenu.open(event));
  trashButton.addEventListener('click', (event) => confirmLayoutDelete.open());
  saveButton.addEventListener('click', (event) => !saveButton.disabled && (saveLayout()));
  document.getElementById('media-query-btn').addEventListener('click', () => mqDialog.open());
  const colorPicker = VID_Color.attachTo(document.getElementById('color-picker-btn'), { insertBtn: pscStr('Insert'), copyBtn: true, defaultColor: '#fff', onInsert: (c) => editor.insert(c, true) });
  document.getElementById('to-file-button').addEventListener('click', () => {
    const layout = getLayout();
    delete layout.id;
    const content = JSON.stringify(layout),
          el = VID_NewEl('a', { href: 'data:text/plain;charset=utf-8,'+encodeURIComponent(content), download: layout.slug+'.json' }, {}, { display: 'none' });
    document.body.appendChild(el);
    el.click();
    el.remove();
  });
  saveButton.parentNode.addEventListener('submit', (event) => event.preventDefault());

  //initial slug update
  layoutOptions.slug.length && (updateSlug(layoutOptions.slug));
  updateSuggestions();

  //ctrl+s = shortkey for saving the layout
  document.addEventListener('keydown', (event) => {
    if (event.key === 's' && event.ctrlKey) {
      event.preventDefault();
      !saveButton.disabled && (saveLayout());
    }
  }, false);

  //draggable resizer between constructor and style editor
  const resizer = document.getElementById('psc-resizer'),
        mainWrapper = document.getElementById('layout-builder'),
        itemsWrapper = document.getElementById('constructor'),
        styleWrapper = document.getElementById('style-editor'),
        resizerMove = (event) => {
          const rect = mainWrapper.getBoundingClientRect(),
                pos = (event.clientX-rect.x)/rect.width;
          itemsWrapper.style.width = parseInt(pos*100)+'%';
          styleWrapper.style.width = 100-parseInt(pos*100)+'%';
        };
  resizer.addEventListener('mousedown', (event) => { if (event.button === 0) { window.addEventListener('mousemove', resizerMove); mainWrapper.style.userSelect = 'none'; } });
  window.addEventListener('mouseup', (event) => { window.removeEventListener('mousemove', resizerMove); mainWrapper.style.userSelect = null; });

  //bring the layout's preview
  document.body.appendChild(preview.element);
  preview.update();

  //FUNCTIONS

  //sanitize slug
  function sanitizeSlug(str, lowercase = false) {
    return (lowercase ? str.toLowerCase() : str).replaceAll(' ','-').replaceAll(/[^A-z0-9\-\_]/g,'').replaceAll(/([-_][-_]?){2,}/g,'$1');
  }

  //update layout's slug
  function updateSlug(str) {
    let slug = sanitizeSlug(str);
    slug = slug.replaceAll(/^[\-\_]|[\-\_]$/g, '');
    if (layoutSlugInput.value !== slug) { layoutSlugInput.value = slug; }
    if (layoutOptions.slug.length) {
      replaceInTokens([], layoutOptions.slug, slug);
      replaceInCode('.'+layoutOptions.slug, '.'+slug);
    }
    layoutOptions.slug = slug;
    if (slug === '') { saveButton.disabled = true; }
    else { saveButton.disabled = false; }
  }

  //the next 3 functions are used when the layout's slug is updated
  function replaceInTokens(options = [], match, repl) {
    if (!match || !repl) { return; }
    if (!options || !options.length) { options = []; itemsList.items.forEach(i => options.push(...i.options.filter(f => f.name === 'class' && f.type === 'tokens'))); }
    options.forEach(o => Array.isArray(o.value) && (o.value = o.value.map(v => v.replace(match, repl))));
  }

  function replaceInCode(match, repl) {
    if (!match || !repl) { return; }
    let code = editor.codemirror.doc.getValue();
    code.replaceAll(match, repl);
    editor.codemirror.doc.setValue(code);
  }

  function updateSuggestions() {
    const code = editor.codemirror.doc.getValue();
    const suggestions = [code.match(/(?<=\.)[\w_-]+/gm)].flat().filter(f => f);
    let options = [];
    itemsList.items.forEach(i => options.push(...i.options.filter(f => ['class', 'no_thumbnail_class', 'anchor_class'].includes(f.name))));
    options.forEach(o => { o.control.suggestions = suggestions; });
  }

  //processes the layout's data and returns it
  function getLayout() {
    const getItems = itemsList.items.map((item) => {
      let options = {};
      item.options.forEach((o) => { if (!o.control.disabled && ['select', 'toggle', 'number', 'tokens', 'input'].includes(o.type)) { options[o.name] = o.value; } });
      return { id: parseInt(item.id), parent: item.parent ? parseInt(item.parent.id) : null, type: item.type.type, options: options }
    });
    const getStyles = layoutCss;
    const layout = { id: layoutOptions.id, name: layoutOptions.name, slug: layoutOptions.slug, items: getItems, css: getStyles, post_type: layoutOptions.post_type };
    Object.keys(layout).forEach((k) => { if (layout[k] === null) { delete layout[k]; } });
    return layout;
  }

  //save the layout's data
  async function saveLayout() {
    const layout = getLayout();
    const data = new FormData();
    data.append('action', 'psc_save_layout');
    'id' in layout && (data.append('id', layout.id));
    'slug' in layout && (data.append('slug', layout.slug));
    'name' in layout && (data.append('name', layout.name));
    'items' in layout && (data.append('items', JSON.stringify(layout.items)));
    'css' in layout && (data.append('css', layout.css));
    'post_type' in layout && layout.post_type && (data.append('post_type', layout.post_type));
    loading.open();
    pscFetch('ajax', data).then((r) => {
      loading.close();
      if (r === 0) { messageSaveFail.open(); }
      if (r.status === 'error') { messageSaveFail.message = r.comment; messageSaveFail.open(); }
      else { messageSaveSuccess.message = r.comment; messageSaveSuccess.open(); trashButton.disabled = false; setChanges(false); }
    });
  }

  //ask whether to unload window or not if changes were made but are not saved
  function setChanges(state) {
    changes = Boolean(state);
    if (changes) {
      window.addEventListener('beforeunload', unloadFunc);
      saveButton && (saveButton.disabled = false);
      preview && (preview.changes = true);
    }
    else {
      window.removeEventListener('beforeunload', unloadFunc);
      saveButton && (saveButton.disabled = true);
    }
  }
}
