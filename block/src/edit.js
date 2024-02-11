/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, BaseControl, TextControl, SelectControl, Button, FormTokenField, ToggleControl, __experimentalNumberControl as NumberControl, RadioControl, TabPanel} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
  const blockProps = useBlockProps(),
        [postData, setPostData] = useState({ layouts: [], types: [], taxs: {}, terms: {}, authors: [], metakeys: [] }),
        [posts, setPosts] = useState([]);

  async function getPostData() {
    let data = await pscFetch();
    if (!data) { setTimeout(() => getPostData(), 1000); return; }
    //prepare objects
    let taxs = {}, terms = {};
    data.types.map(t => t.name).forEach(t => taxs[t] = []);
    data.taxs.map(f => f.name).forEach(t => terms[t] = []);
    //process layouts
    data.layouts = data.layouts.map(d => { return { label: d.name, value: d.id } });
    //process types
    data.types = data.types;
    //process taxonomies
    data.taxs.forEach(tax => { tax.object_type.forEach(type => {
      if (!(type in taxs)) { taxs[type] = []; }
      taxs[type].push({ label: tax.label, value: tax.name }); }); });
    data.taxs = taxs;
    //process terms
    data.terms.forEach(t => {
      if (!(t.taxonomy in terms)) { terms[t.taxonomy] = []; }
      terms[t.taxonomy].push({ label: t.name+(data.terms.filter(f => f.name === o.name).length > 1 ? ' (ID: '+o.id+')' : ''), value: t.term_id }); });
    data.terms = terms;
    //process authors
    data.authors = data.authors.map(o => { return { label: o.name+(data.authors.filter(f => f.name === o.name).length > 1 ? ' (ID: '+o.id+')' : ''), value: o.id } });
    //process order lists
    data.metakeys = data.metakeys.map(k => { return { label: k.label, value: k.key } });
    setPostData(data);
  }

  async function getPosts(type) {
    let data = await pscFetch('rest', 'get=posts&post_type='+type);
    if (!data || !('posts' in data)) { setTimeout(() => getPosts(type), 1000); return []; }
    data = await data.posts.map(o => { if (data.posts.filter(f => f.post_title === o.post_title).length > 1) { return { label: o.post_title + ' (ID: '+ o.ID +')', value: o.ID } } else { return { label: o.post_title, value: o.ID } } });
    setPosts(data);
  }

  function t(text) { return __(text, 'showcase-creator'); }
  function op(label,value,disabled = false) { let option = { label: __(label, 'showcase-creator'), value: value }; if (disabled === true) option.disabled = true; return option; }

  //initial data call
  if (!Object.values(postData).some(e => Object.keys(e).length)) { getPostData(); }

  let taxQueryControls = attributes.taxQueries.map((query, i, all) => {
    return <li key={ i }>
      <PanelRow>
        <SelectControl label={ t('Taxonomy') } style={{ margin: '0' }} value={ query.taxonomy } options={ [op('Any taxonomy', '', false), ...(attributes.postType in postData.taxs ? postData.taxs[attributes.postType] : [])] }
          onChange={ (v) => { let temp = [...all]; temp[i].taxonomy = v; temp[i].terms = []; setAttributes({ taxQueries: temp }); } } />
      </PanelRow>
      { query.taxonomy && (
      <PanelRow>
        <FormTokenField label={ t('Terms') } style={{ margin: '0' }} value={ query.terms.map(v => postData.terms[query.taxonomy].find(f => f.value === v).label) } suggestions={ postData.terms[query.taxonomy].map(t => t.label) } __experimentalExpandOnFocus
          onChange={ (v) => {
            let taxTerms = postData.terms[query.taxonomy].map(t => t.label),
                filtered = v.filter(f => taxTerms.includes(f)).map(l => postData.terms[query.taxonomy].find(f => f.label === l).value),
                temp = [...all];
            temp[i].terms = filtered;
            setAttributes({ taxQueries: temp }) } } />
      </PanelRow> )}
      { query.taxonomy && (
      <PanelRow>
        <SelectControl label={ t('Operator') } style={{ margin: '0' }} value={ query.operator } options={ [ op('IN any of the selected term(s)', 'IN'), op('NOT IN the selected term(s)', 'NOT IN'), op('AND - present in all terms', 'AND') ] }
          onChange={ (v) => { let temp = [...attributes.taxQueries]; temp[i].operator = v; setAttributes({ taxQueries: temp }); } } />
      </PanelRow> )}
      <Button variant='secondary' isDestructive={ true } isSmall={ true } style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '8px' }}
        onClick={ () => { let temp = [...attributes.taxQueries]; temp.splice(i,1); setAttributes({ taxQueries: temp }); } }>Remove tax. query</Button>
    </li>
  });

  const PSC_CP_Query = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <SelectControl label={ t('Post type') } value={ attributes.postType } options={ [op('Select a post type', '', true), ...postData.types.map(t => { return { label: t.label, value: t.name } })] }
            onChange={ (v) => { setAttributes({ postType: v, taxQueries: [{ taxonomy: '', terms: [], operator: 'IN' }] }); getPosts(v); } } />
        </PanelRow>
        { attributes.postType === 'attachment' && (
        <PanelRow>
          <FormTokenField label={ t('Mime types') } value={ attributes.mimeTypes } onChange={ (v) => { setAttributes( { mimeTypes: v } ); } }
            suggestions={['image/jpeg','image/pjpeg','image/jpeg','image/pjpeg','image/png','image/gif','image/x-icon','application/pdf',
            'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/mspowerpoint',
            'application/powerpoint','application/vnd.ms-powerpoint','application/x-mspowerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/mspowerpoint','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.slideshow',
            'application/vnd.oasis.opendocument.text','application/excel','application/vnd.ms-excel','application/x-excel','application/x-msexcel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/octet-stream','audio/mpeg3','audio/x-mpeg-3','video/mpeg',
            'video/x-mpeg','audio/m4a','audio/ogg,','audio/wav','audio/x-wav','video/mp4','video/x-m4v','video/quicktime','video/x-ms-asf','video/x-ms-wmv',
            'application/x-troff-msvideo','video/avi','video/msvideo','video/x-msvideo','audio/mpeg','video/mpeg','video/ogg','video/3gpp','audio/3gpp',
            'video/3gpp2','audio/3gpp2']} tokenizeOnSpace />
        </PanelRow> ) }
        { attributes.taxQueries.length > 0 && (
        <ol className={ 'psc-inspector-controls-taxqueries' }>
          { taxQueryControls }
        </ol> ) }
        { attributes.postType !== '' && (
        <PanelRow>
          <Button style={{ width: '100%', display: 'flex', justifyContent: 'center' }} variant='primary' isSmall={ true }
            onClick={ () => { setAttributes({ taxQueries: [...attributes.taxQueries, { taxonomy: '', terms: [], operator: 'IN' }] }); } }>
          { t('Add new tax. query') }</Button>
        </PanelRow> )}
        { attributes.taxQueries.length > 0 && (
        <PanelRow>
          <RadioControl label={ t('Taxonomies relationship') } selected={ attributes.taxRelation } onChange={ (v) => { setAttributes({ taxRelation: v }); } }
            options={[ op('AND = All must be TRUE', 'AND'), op('OR = at least one must be TRUE', 'OR') ]} />
        </PanelRow> )}
      </PanelBody>
    </Panel>
  }

  const PSC_CP_Order = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <SelectControl label={ t('Order') } value={ attributes.order } options={ [ op('Ascending', 'ASC'), op('Descending', 'DESC') ] }
            onChange={ (v) => { setAttributes({ order: v }); } } />
        </PanelRow>
        <PanelRow>
          <SelectControl label={ t('Order by') } value={ attributes.orderBy } options={ [ op('Order List',  'custom_order_list'), op('Date',  'date'),
            op('Date - modified',  'modified'), op('Title',  'title'), op('Author',  'author'), op('Random',  'rand'), op('Page order (Menu order)',  'menu_order'),
            op('Meta value (alphabetical)',  'meta_value'), op('Meta value (number)',  'meta_value_num'), op('Post ID',  'ID'), op('Parent ID',  'parent'), op('Comment count',  'comment_count') ] }
            onChange={ (v) => { setAttributes({ orderBy: v }); } } />
        </PanelRow>
        { (attributes.orderBy === 'custom_order_list') && (
        <PanelRow>
          <SelectControl label={ t('Order list') } value={ attributes.orderList } options={ [postData.metakeys.length ? op('Select an order list', '', true) : op('No order lists', '', true), ...postData.metakeys] } onChange={ (v) => { setAttributes( { orderList: v } ); } } />
        </PanelRow> ) }
        { ['meta_value_num', 'meta_value'].includes(attributes.orderBy) && (
        <PanelRow>
          <TextControl label={ t('Meta key') } value={ attributes.metaKey } onChange={ (v) => { setAttributes({ metaKey: v }); } } />
        </PanelRow> ) }
      </PanelBody>
    </Panel>
  }

  const PSC_CP_Authors = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <SelectControl label={ t('Filter by post author') } value={ attributes.author } options={ [ op('Any author', ''), ...postData.authors ] }
            onChange={ (v) => { setAttributes({ author: v }); } } />
        </PanelRow>
        <PanelRow>
          <FormTokenField label={ t('Authors to include') } __experimentalExpandOnFocus maxSuggestions={ 5 } value={ attributes.includeAuthors.map(v => postData.authors.find(f => f.value === v).label) } suggestions={ postData.authors.map(a => a.label) }
            onChange={ (v) => { setAttributes({ includeAuthors: v.map(l => postData.authors.find(a => a.label === l).value) }); } } />
        </PanelRow>
        <PanelRow>
          <FormTokenField label={ t('Authors to exclude') } __experimentalExpandOnFocus maxSuggestions={ 5 } value={ attributes.excludeAuthors.map(v => postData.authors.find(f => f.value === v).label) } suggestions={ postData.authors.map(a => a.label) }
            onChange={ (v) => { setAttributes({ excludeAuthors: v.map(l => postData.authors.find(a => a.label === l).value) }); } } />
        </PanelRow>
      </PanelBody>
    </Panel>
  }

  const PSC_CP_Posts = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <BaseControl help={ t('-1 to show all posts') } __nextHasNoMarginBottom={ true }>
            <NumberControl label={ t('Posts to display') } min={-1} value={ Number(attributes.postsToDisplay) }
              onChange={(v) => { setAttributes({ postsToDisplay: String(v) }); }} required />
          </BaseControl>
        </PanelRow>
        { attributes.postType !== '' && (
          <PanelRow>
          <FormTokenField __experimentalExpandOnFocus maxSuggestions={ 5 } label={ t('Posts to include') } value={ attributes.includePosts.map(p => posts.find(f => f.value === p).label) } suggestions={ posts.map(a => a.label) }
            onChange={(v) => { setAttributes({ includePosts: v.map(l => posts.find(p => p.label === l).value) }); }} />
          </PanelRow> ) }
        { attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && (
          <PanelRow>
            <ToggleControl help={ t('Ignore posts that are children of others') } label={ t('Top level posts only?') } checked={ attributes.topLevelOnly } onChange={ (v) => { setAttributes({ topLevelOnly: v }); } } />
          </PanelRow> ) }
        { attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && !attributes.topLevelOnly && (
        <PanelRow>
          <FormTokenField __experimentalExpandOnFocus maxSuggestions={ 5 } label={ t('Include posts that are within') } value={ attributes.includeInParents.map(p => posts.find(f => f.value === p).label) } suggestions={ posts.map(a => a.label) }
            onChange={(v) => { setAttributes({ includeInParents: v.map(l => posts.find(p => p.label === l).value) }); }} />
          </PanelRow> ) }
        { (attributes.includePosts.length || attributes.includeInParents.length) > 0 && (
        <PanelRow>
          <RadioControl label={ t('Where to put included posts') } selected={ attributes.includePostsWhere } onChange={ (v) => { setAttributes({ includePostsWhere: v }); }}
            options={[ op('Above others', 'above'), op('Below others', 'below'), op('Among others', 'among'), op('Show selected posts only', 'alone')]} />
          </PanelRow> ) }
        { attributes.postType !== '' && (
          <PanelRow>
            <FormTokenField __experimentalExpandOnFocus maxSuggestions={ 5 } label={ t('Posts to exclude') } value={ attributes.excludePosts.map(p => posts.find(f => f.value === p).label) } suggestions={ posts.map(a => a.label) }
              onChange={(v) => { setAttributes({ excludePosts: v.map(l => posts.find(p => p.label === l).value) }); }} />
          </PanelRow> ) }
        { attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && !attributes.topLevelOnly && (
          <PanelRow>
            <FormTokenField __experimentalExpandOnFocus maxSuggestions={ 5 } label={ t('Exclude posts that are within') } value={ attributes.excludeInParents.map(p => posts.find(f => f.value === p).label) } suggestions={ posts.map(a => a.label) }
              onChange={(v) => { setAttributes({ excludeInParents: v.map(l => posts.find(p => p.label === l).value) }); }} />
            </PanelRow> ) }
        <PanelRow>
          <ToggleControl label={ t('Ignore sticky posts?') } checked={ attributes.ignoreSticky } onChange={ (v) => { setAttributes({ ignoreSticky: v }); } } />
        </PanelRow>
      </PanelBody>
    </Panel>
  }

  const PSC_CP_Date = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <SelectControl label={ t('Filter posts by date') } value={ attributes.dateFilter } options={ [ op('Any date', ''), op('From today', 'today'), op('From this week', 'thisweek'),
            op('From this month', 'thismonth'), op('From this year', 'thisyear'), op('Year / Month / Day', 'ymd'), op('Some time ago', 'ago'), op('After / Before / Between dates', 'between')] }
            onChange={ (v) => { setAttributes({ dateFilter: v, date: ["","","","","",""] }); } } />
        </PanelRow>
        { ['ymd', 'between'].includes(attributes.dateFilter) && (
        <BaseControl label={ { ymd: t('From an year, month or/and day'), between: t('After this date') }[attributes.dateFilter] }
          hint={ attributes.dateFilter === 'ymd' ? t('Fill only the desired fields') : '' }>
          <PanelRow className={ 'psc-inspector-controls-row-gap' }>
            <TextControl label={ t('Year') } value={ attributes.date[0] } onChange={ (v) => { let temp = [...attributes.date]; temp[0] = v; setAttributes({ date: temp }); } } />
            <SelectControl label={ t('Month') } value={ attributes.date[1] } options={ [ op('', ''), op('Jan', '1'), op('Feb', '2'), op('Mar', '3'), op('Apr', '4'), op('May', '5'), op('Jun', '6'), op('Jul', '7'), op('Aug', '8'), op('Sep', '9'), op('Oct', '10'), op('Nov', '11'), op('Dec', '12') ] } onChange={ (v) => { let temp = [...attributes.date]; temp[1] = v; setAttributes({ date: temp }); } } />
            <NumberControl label={ t('Day') } value={ attributes.date[2] } min={1} max={31} onChange={ (v) => { let temp = [...attributes.date]; temp[2] = v; setAttributes({ date: temp }); } } />
          </PanelRow>
        </BaseControl> ) }
        { attributes.dateFilter === 'between' && (
        <BaseControl label={ t('Before this date') }>
          <PanelRow className={ 'psc-inspector-controls-row-gap' }>
            <TextControl label={ t('Year') } value={ attributes.date[3] } onChange={ (v) => { let temp = [...attributes.date]; temp[3] = v; setAttributes({ date: temp }); } } />
            <SelectControl label={ t('Month') } value={ attributes.date[4] } options={ [ op('', ''), op('Jan', '1'), op('Feb', '2'), op('Mar', '3'), op('Apr', '4'), op('May', '5'), op('Jun', '6'), op('Jul', '7'), op('Aug', '8'), op('Sep', '9'), op('Oct', '10'), op('Nov', '11'), op('Dec', '12') ] } onChange={ (v) => { let temp = [...attributes.date]; temp[4] = v; setAttributes({ date: temp }); } } />
            <NumberControl label={ t('Day') } value={ attributes.date[5] } min={1} max={31} onChange={ (v) => { let temp = [...attributes.date]; temp[5] = v; setAttributes({ date: temp }); } } />
          </PanelRow>
        </BaseControl> ) }
        { attributes.dateFilter === 'ago' && (
        <BaseControl label={ t('Some time ago') }>
          <PanelRow className={ 'psc-inspector-controls-row-gap' }>
            <SelectControl value={ attributes.date[0] } options={ [ op('', '', true), op('Before', 'before'), op('After', 'after') ] } onChange={ (v) => { let temp = [...attributes.date]; temp[0] = v; setAttributes({ date: temp }); } } />
            <NumberControl value={ attributes.date[1] } onChange={ (v) => { let temp = [...attributes.date]; temp[1] = v; setAttributes({ date: temp }); } } />
            <SelectControl value={ attributes.date[2] } options={ [ op('', '', true), op('Year(s)', 'year'), op('Month(s)', 'month'), op('Week(s)', 'week'), op('Day(s)', 'day') ] } onChange={ (v) => { let temp = [...attributes.date]; temp[2] = v; setAttributes({ date: temp }); } } />
          </PanelRow>
        </BaseControl> ) }
        { attributes.dateFilter && (
        <PanelRow>
          <ToggleControl label={ t('Apply filter to last modified date?') } help={ t('If not checked, the date of publication is used') } checked={ attributes.dateModified } onChange={ (v) => { setAttributes({ dateModified: v }); } } />
        </PanelRow>
        ) }
      </PanelBody>
    </Panel>
  }

  const PSC_CP_More = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <ToggleControl label={ t('Posts with thumbnails only') } help={ t('If checked, will show posts with featured image only') } checked={ attributes.withThumbnail } onChange={ (v) => { setAttributes({ withThumbnail: v }) } } />
        </PanelRow>
        <BaseControl label={ t('Comments count') } help={ t('Leave blank to not count comments') }>
          <PanelRow className={ 'psc-inspector-controls-row-gap' }>
            <SelectControl value={ attributes.comments[1] } options={ [ op('= (equal to)',  '='), op('< (less than)',  '<'),
              op('> (greater than)',  '>'), op('<= (equal or less)',  '<='), op('>= (equal or greater)',  '>='), op('!= (not equal to)',  '!=') ] }
              onChange={ (v) => { let temp = [...attributes.comments]; temp[1] = v; setAttributes({ comments: temp }); } } />
            <NumberControl min={0} value={ attributes.comments[0] } onChange={(v) => { let temp = [...attributes.comments]; temp[0] = String(v); setAttributes({ comments: temp }); }} />
          </PanelRow>
        </BaseControl>
      </PanelBody>
    </Panel>
  }

  const PSC_CP_Pagination = () => {
    return <Panel>
      <PanelBody>
        <PanelRow>
          <RadioControl label={ t('Pagination') } onChange={(v) => { setAttributes({ pagination: v }); }} options={ [ op('No pagination',  'disabled'),
            op('Above posts',  'above'), op('Below posts',  'below'), op('Both',  'both') ] } selected={ attributes.pagination } />
        </PanelRow>
        { attributes.pagination !== 'disabled' && (
        <PanelRow>
          <NumberControl label={ t('Posts per page') } min={1} value={ Number(attributes.postsPerPage) } onChange={(v) => { setAttributes({ postsPerPage: String(v) }); }} required />
        </PanelRow> ) }
        <PanelRow>
          <TextControl label={ t('Text to display when no posts found') } value={ attributes.noPostsText } onChange={ (v) => { setAttributes( { noPostsText: v } ); } } />
        </PanelRow>
      </PanelBody>
    </Panel>
  }

  const [renderData, setRenderData] = useState({ html: '', css: '', reload: true, atts: {} });

  class PSC_Render extends React.Component {
    constructor(props) {
      super(props);
      this.ref = React.createRef();
      this.script = null;
    }
    setHTML(ref, html) {
      ref.innerHTML = html;
      const htmlEl = document.getElementById(blockProps.id).querySelector('.psc-block-preview-html');
      [...htmlEl.querySelectorAll('a', 'button')].forEach((l) => l.href = 'javascript:void(0)');
      htmlEl.querySelector('.vid-masonry') && !htmlEl.querySelector('.vid-masonry-row') && typeof VID_Masonry !== 'undefined' && (this.script = VID_Masonry.mount(htmlEl.querySelector('.vid-masonry')));
      htmlEl.querySelector('.vid-slider') && !htmlEl.querySelector('.vid-slider-inner') && typeof VID_Slider !== 'undefined' && (this.script = VID_Slider.mount(htmlEl.querySelector('.vid-slider')));
    }
    async reloadPreview() {
      const ref = this.ref.current;
      if (ref) {
        if ((!renderData.reload && renderData.html) || pscIsEqual(renderData.atts, attributes)) { this.setHTML(ref, renderData.html); return; }
        pscGetBlockPreview(attributes).then(r => {
          if ([r.css, r.html].includes(null)) { return; }
          if (r.css !== renderData.css || r.html !== renderData.html) { setRenderData({ css: r.css, html: r.html, reload: renderData.reload, atts: { ...attributes } }); }
          this.setHTML(ref, renderData.html);
        });
      }
    }
    componentDidMount() { this.reloadPreview(); }
    componentWillUnmount() { this.script && (this.script.unmount()); }
    render() {
      return (
        <div className={ "psc-block-preview" }>
          <div className={ "psc-block-preview-options" }><ToggleControl label={ t('Refresh preview?') } checked={ renderData.reload } onChange={ (v) => { setRenderData({ css: renderData.css, html: renderData.html, reload: v, atts: renderData.atts }); } } /></div>
          <style className={ "psc-block-preview-css" }>{ renderData.css }</style>
          <div className={ "psc-block-preview-html" } ref={ this.ref }></div>
        </div>);
    }
  }

  return (
    <div { ...blockProps }>
      <InspectorControls>
        <PanelBody title='Layout'>
          <PanelRow>
            <SelectControl label={ t('Layout') } value={ attributes.layout } options={ [postData.layouts.length ? op('Select a layout', '', true) : op('No layouts found', '', true), ...postData.layouts] } onChange={ (v) => { setAttributes({ layout: v }); } } />
          </PanelRow>
        </PanelBody>
        <TabPanel className={ 'psc-inspector-controls-tab-panel' } activeClass='psc-controls-tab-active' tabs={ [
          { name: 'query', title: t('Taxonomy'), content: <PSC_CP_Query /> },
          { name: 'order', title: t('Order'), content: <PSC_CP_Order /> },
          { name: 'authors', title: t('Authors'), content: <PSC_CP_Authors /> },
          { name: 'posts', title: t('Posts'), content: <PSC_CP_Posts /> },
          { name: 'date', title: t('Date'), content: <PSC_CP_Date /> },
          { name: 'more', title: t('More...'), content: <PSC_CP_More /> },
          { name: 'pagination', title: t('Pagination'), content: <PSC_CP_Pagination /> }
        ] }>
        { ({ content }) => { return content } }</TabPanel>
      </InspectorControls>
      <PSC_Render />
    </div>
	);
}
