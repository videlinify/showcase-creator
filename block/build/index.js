/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/edit.js":
/*!*********************!*\
  !*** ./src/edit.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor.scss */ "./src/editor.scss");

/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */


/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */




/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
function Edit(_ref) {
  let {
    attributes,
    setAttributes
  } = _ref;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)(),
    [postData, setPostData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
      layouts: [],
      types: [],
      taxs: {},
      terms: {},
      authors: [],
      metakeys: []
    }),
    [posts, setPosts] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  async function getPostData() {
    let data = await pscFetch();
    if (!data) {
      setTimeout(() => getPostData(), 1000);
      return;
    }
    //prepare objects
    let taxs = {},
      terms = {};
    data.types.map(t => t.name).forEach(t => taxs[t] = []);
    data.taxs.map(f => f.name).forEach(t => terms[t] = []);
    //process layouts
    data.layouts = data.layouts.map(d => {
      return {
        label: d.name,
        value: d.id
      };
    });
    //process types
    data.types = data.types;
    //process taxonomies
    data.taxs.forEach(tax => {
      tax.object_type.forEach(type => {
        if (!(type in taxs)) {
          taxs[type] = [];
        }
        taxs[type].push({
          label: tax.label,
          value: tax.name
        });
      });
    });
    data.taxs = taxs;
    //process terms
    data.terms.forEach(t => {
      if (!(t.taxonomy in terms)) {
        terms[t.taxonomy] = [];
      }
      terms[t.taxonomy].push({
        label: t.name + (data.terms.filter(f => f.name === o.name).length > 1 ? ' (ID: ' + o.id + ')' : ''),
        value: t.term_id
      });
    });
    data.terms = terms;
    //process authors
    data.authors = data.authors.map(o => {
      return {
        label: o.name + (data.authors.filter(f => f.name === o.name).length > 1 ? ' (ID: ' + o.id + ')' : ''),
        value: o.id
      };
    });
    //process order lists
    data.metakeys = data.metakeys.map(k => {
      return {
        label: k.label,
        value: k.key
      };
    });
    setPostData(data);
  }
  async function getPosts(type) {
    let data = await pscFetch('rest', 'get=posts&post_type=' + type);
    if (!data || !('posts' in data)) {
      setTimeout(() => getPosts(type), 1000);
      return [];
    }
    data = await data.posts.map(o => {
      if (data.posts.filter(f => f.post_title === o.post_title).length > 1) {
        return {
          label: o.post_title + ' (ID: ' + o.ID + ')',
          value: o.ID
        };
      } else {
        return {
          label: o.post_title,
          value: o.ID
        };
      }
    });
    setPosts(data);
  }
  function t(text) {
    return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(text, 'showcase-creator');
  }
  function op(label, value) {
    let disabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let option = {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(label, 'showcase-creator'),
      value: value
    };
    if (disabled === true) option.disabled = true;
    return option;
  }

  //initial data call
  if (!Object.values(postData).some(e => Object.keys(e).length)) {
    getPostData();
  }
  let taxQueryControls = attributes.taxQueries.map((query, i, all) => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
      key: i
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Taxonomy'),
      style: {
        margin: '0'
      },
      value: query.taxonomy,
      options: [op('Any taxonomy', '', false), ...(attributes.postType in postData.taxs ? postData.taxs[attributes.postType] : [])],
      onChange: v => {
        let temp = [...all];
        temp[i].taxonomy = v;
        temp[i].terms = [];
        setAttributes({
          taxQueries: temp
        });
      }
    })), query.taxonomy && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      label: t('Terms'),
      style: {
        margin: '0'
      },
      value: query.terms.map(v => postData.terms[query.taxonomy].find(f => f.value === v).label),
      suggestions: postData.terms[query.taxonomy].map(t => t.label),
      __experimentalExpandOnFocus: true,
      onChange: v => {
        let taxTerms = postData.terms[query.taxonomy].map(t => t.label),
          filtered = v.filter(f => taxTerms.includes(f)).map(l => postData.terms[query.taxonomy].find(f => f.label === l).value),
          temp = [...all];
        temp[i].terms = filtered;
        setAttributes({
          taxQueries: temp
        });
      }
    })), query.taxonomy && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Operator'),
      style: {
        margin: '0'
      },
      value: query.operator,
      options: [op('IN any of the selected term(s)', 'IN'), op('NOT IN the selected term(s)', 'NOT IN'), op('AND - present in all terms', 'AND')],
      onChange: v => {
        let temp = [...attributes.taxQueries];
        temp[i].operator = v;
        setAttributes({
          taxQueries: temp
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
      variant: "secondary",
      isDestructive: true,
      isSmall: true,
      style: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '8px'
      },
      onClick: () => {
        let temp = [...attributes.taxQueries];
        temp.splice(i, 1);
        setAttributes({
          taxQueries: temp
        });
      }
    }, "Remove tax. query"));
  });
  const PSC_CP_Query = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Post type'),
      value: attributes.postType,
      options: [op('Select a post type', '', true), ...postData.types.map(t => {
        return {
          label: t.label,
          value: t.name
        };
      })],
      onChange: v => {
        setAttributes({
          postType: v,
          taxQueries: [{
            taxonomy: '',
            terms: [],
            operator: 'IN'
          }]
        });
        getPosts(v);
      }
    })), attributes.postType === 'attachment' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      label: t('Mime types'),
      value: attributes.mimeTypes,
      onChange: v => {
        setAttributes({
          mimeTypes: v
        });
      },
      suggestions: ['image/jpeg', 'image/pjpeg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/x-icon', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/mspowerpoint', 'application/powerpoint', 'application/vnd.ms-powerpoint', 'application/x-mspowerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/mspowerpoint', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow', 'application/vnd.oasis.opendocument.text', 'application/excel', 'application/vnd.ms-excel', 'application/x-excel', 'application/x-msexcel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream', 'audio/mpeg3', 'audio/x-mpeg-3', 'video/mpeg', 'video/x-mpeg', 'audio/m4a', 'audio/ogg,', 'audio/wav', 'audio/x-wav', 'video/mp4', 'video/x-m4v', 'video/quicktime', 'video/x-ms-asf', 'video/x-ms-wmv', 'application/x-troff-msvideo', 'video/avi', 'video/msvideo', 'video/x-msvideo', 'audio/mpeg', 'video/mpeg', 'video/ogg', 'video/3gpp', 'audio/3gpp', 'video/3gpp2', 'audio/3gpp2'],
      tokenizeOnSpace: true
    })), attributes.taxQueries.length > 0 && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("ol", {
      className: 'psc-inspector-controls-taxqueries'
    }, taxQueryControls), attributes.postType !== '' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
      style: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      },
      variant: "primary",
      isSmall: true,
      onClick: () => {
        setAttributes({
          taxQueries: [...attributes.taxQueries, {
            taxonomy: '',
            terms: [],
            operator: 'IN'
          }]
        });
      }
    }, t('Add new tax. query'))), attributes.taxQueries.length > 0 && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
      label: t('Taxonomies relationship'),
      selected: attributes.taxRelation,
      onChange: v => {
        setAttributes({
          taxRelation: v
        });
      },
      options: [op('AND = All must be TRUE', 'AND'), op('OR = at least one must be TRUE', 'OR')]
    }))));
  };
  const PSC_CP_Order = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Order'),
      value: attributes.order,
      options: [op('Ascending', 'ASC'), op('Descending', 'DESC')],
      onChange: v => {
        setAttributes({
          order: v
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Order by'),
      value: attributes.orderBy,
      options: [op('Order List', 'custom_order_list'), op('Date', 'date'), op('Date - modified', 'modified'), op('Title', 'title'), op('Author', 'author'), op('Random', 'rand'), op('Page order (Menu order)', 'menu_order'), op('Meta value (alphabetical)', 'meta_value'), op('Meta value (number)', 'meta_value_num'), op('Post ID', 'ID'), op('Parent ID', 'parent'), op('Comment count', 'comment_count')],
      onChange: v => {
        setAttributes({
          orderBy: v
        });
      }
    })), attributes.orderBy === 'custom_order_list' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Order list'),
      value: attributes.orderList,
      options: [postData.metakeys.length ? op('Select an order list', '', true) : op('No order lists', '', true), ...postData.metakeys],
      onChange: v => {
        setAttributes({
          orderList: v
        });
      }
    })), ['meta_value_num', 'meta_value'].includes(attributes.orderBy) && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: t('Meta key'),
      value: attributes.metaKey,
      onChange: v => {
        setAttributes({
          metaKey: v
        });
      }
    }))));
  };
  const PSC_CP_Authors = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Filter by post author'),
      value: attributes.author,
      options: [op('Any author', ''), ...postData.authors],
      onChange: v => {
        setAttributes({
          author: v
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      label: t('Authors to include'),
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      value: attributes.includeAuthors.map(v => postData.authors.find(f => f.value === v).label),
      suggestions: postData.authors.map(a => a.label),
      onChange: v => {
        setAttributes({
          includeAuthors: v.map(l => postData.authors.find(a => a.label === l).value)
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      label: t('Authors to exclude'),
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      value: attributes.excludeAuthors.map(v => postData.authors.find(f => f.value === v).label),
      suggestions: postData.authors.map(a => a.label),
      onChange: v => {
        setAttributes({
          excludeAuthors: v.map(l => postData.authors.find(a => a.label === l).value)
        });
      }
    }))));
  };
  const PSC_CP_Posts = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      help: t('-1 to show all posts'),
      __nextHasNoMarginBottom: true
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      label: t('Posts to display'),
      min: -1,
      value: Number(attributes.postsToDisplay),
      onChange: v => {
        setAttributes({
          postsToDisplay: String(v)
        });
      },
      required: true
    }))), attributes.postType !== '' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      label: t('Posts to include'),
      value: attributes.includePosts.map(p => posts.find(f => f.value === p).label),
      suggestions: posts.map(a => a.label),
      onChange: v => {
        setAttributes({
          includePosts: v.map(l => posts.find(p => p.label === l).value)
        });
      }
    })), attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
      help: t('Ignore posts that are children of others'),
      label: t('Top level posts only?'),
      checked: attributes.topLevelOnly,
      onChange: v => {
        setAttributes({
          topLevelOnly: v
        });
      }
    })), attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && !attributes.topLevelOnly && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      label: t('Include posts that are within'),
      value: attributes.includeInParents.map(p => posts.find(f => f.value === p).label),
      suggestions: posts.map(a => a.label),
      onChange: v => {
        setAttributes({
          includeInParents: v.map(l => posts.find(p => p.label === l).value)
        });
      }
    })), (attributes.includePosts.length || attributes.includeInParents.length) > 0 && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
      label: t('Where to put included posts'),
      selected: attributes.includePostsWhere,
      onChange: v => {
        setAttributes({
          includePostsWhere: v
        });
      },
      options: [op('Above others', 'above'), op('Below others', 'below'), op('Among others', 'among'), op('Show selected posts only', 'alone')]
    })), attributes.postType !== '' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      label: t('Posts to exclude'),
      value: attributes.excludePosts.map(p => posts.find(f => f.value === p).label),
      suggestions: posts.map(a => a.label),
      onChange: v => {
        setAttributes({
          excludePosts: v.map(l => posts.find(p => p.label === l).value)
        });
      }
    })), attributes.postType !== '' && postData.types.find(f => f.name === attributes.postType).hierarchical && !attributes.topLevelOnly && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FormTokenField, {
      __experimentalExpandOnFocus: true,
      maxSuggestions: 5,
      label: t('Exclude posts that are within'),
      value: attributes.excludeInParents.map(p => posts.find(f => f.value === p).label),
      suggestions: posts.map(a => a.label),
      onChange: v => {
        setAttributes({
          excludeInParents: v.map(l => posts.find(p => p.label === l).value)
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
      label: t('Ignore sticky posts?'),
      checked: attributes.ignoreSticky,
      onChange: v => {
        setAttributes({
          ignoreSticky: v
        });
      }
    }))));
  };
  const PSC_CP_Date = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Filter posts by date'),
      value: attributes.dateFilter,
      options: [op('Any date', ''), op('From today', 'today'), op('From this week', 'thisweek'), op('From this month', 'thismonth'), op('From this year', 'thisyear'), op('Year / Month / Day', 'ymd'), op('Some time ago', 'ago'), op('After / Before / Between dates', 'between')],
      onChange: v => {
        setAttributes({
          dateFilter: v,
          date: ["", "", "", "", "", ""]
        });
      }
    })), ['ymd', 'between'].includes(attributes.dateFilter) && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      label: {
        ymd: t('From an year, month or/and day'),
        between: t('After this date')
      }[attributes.dateFilter],
      hint: attributes.dateFilter === 'ymd' ? t('Fill only the desired fields') : ''
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
      className: 'psc-inspector-controls-row-gap'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: t('Year'),
      value: attributes.date[0],
      onChange: v => {
        let temp = [...attributes.date];
        temp[0] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Month'),
      value: attributes.date[1],
      options: [op('', ''), op('Jan', '1'), op('Feb', '2'), op('Mar', '3'), op('Apr', '4'), op('May', '5'), op('Jun', '6'), op('Jul', '7'), op('Aug', '8'), op('Sep', '9'), op('Oct', '10'), op('Nov', '11'), op('Dec', '12')],
      onChange: v => {
        let temp = [...attributes.date];
        temp[1] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      label: t('Day'),
      value: attributes.date[2],
      min: 1,
      max: 31,
      onChange: v => {
        let temp = [...attributes.date];
        temp[2] = v;
        setAttributes({
          date: temp
        });
      }
    }))), attributes.dateFilter === 'between' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      label: t('Before this date')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
      className: 'psc-inspector-controls-row-gap'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: t('Year'),
      value: attributes.date[3],
      onChange: v => {
        let temp = [...attributes.date];
        temp[3] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      label: t('Month'),
      value: attributes.date[4],
      options: [op('', ''), op('Jan', '1'), op('Feb', '2'), op('Mar', '3'), op('Apr', '4'), op('May', '5'), op('Jun', '6'), op('Jul', '7'), op('Aug', '8'), op('Sep', '9'), op('Oct', '10'), op('Nov', '11'), op('Dec', '12')],
      onChange: v => {
        let temp = [...attributes.date];
        temp[4] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      label: t('Day'),
      value: attributes.date[5],
      min: 1,
      max: 31,
      onChange: v => {
        let temp = [...attributes.date];
        temp[5] = v;
        setAttributes({
          date: temp
        });
      }
    }))), attributes.dateFilter === 'ago' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      label: t('Some time ago')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
      className: 'psc-inspector-controls-row-gap'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      value: attributes.date[0],
      options: [op('', '', true), op('Before', 'before'), op('After', 'after')],
      onChange: v => {
        let temp = [...attributes.date];
        temp[0] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      value: attributes.date[1],
      onChange: v => {
        let temp = [...attributes.date];
        temp[1] = v;
        setAttributes({
          date: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      value: attributes.date[2],
      options: [op('', '', true), op('Year(s)', 'year'), op('Month(s)', 'month'), op('Week(s)', 'week'), op('Day(s)', 'day')],
      onChange: v => {
        let temp = [...attributes.date];
        temp[2] = v;
        setAttributes({
          date: temp
        });
      }
    }))), attributes.dateFilter && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
      label: t('Apply filter to last modified date?'),
      help: t('If not checked, the date of publication is used'),
      checked: attributes.dateModified,
      onChange: v => {
        setAttributes({
          dateModified: v
        });
      }
    }))));
  };
  const PSC_CP_More = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
      label: t('Posts with thumbnails only'),
      help: t('If checked, will show posts with featured image only'),
      checked: attributes.withThumbnail,
      onChange: v => {
        setAttributes({
          withThumbnail: v
        });
      }
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      label: t('Comments count'),
      help: t('Leave blank to not count comments')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
      className: 'psc-inspector-controls-row-gap'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      value: attributes.comments[1],
      options: [op('= (equal to)', '='), op('< (less than)', '<'), op('> (greater than)', '>'), op('<= (equal or less)', '<='), op('>= (equal or greater)', '>='), op('!= (not equal to)', '!=')],
      onChange: v => {
        let temp = [...attributes.comments];
        temp[1] = v;
        setAttributes({
          comments: temp
        });
      }
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      min: 0,
      value: attributes.comments[0],
      onChange: v => {
        let temp = [...attributes.comments];
        temp[0] = String(v);
        setAttributes({
          comments: temp
        });
      }
    })))));
  };
  const PSC_CP_Pagination = () => {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RadioControl, {
      label: t('Pagination'),
      onChange: v => {
        setAttributes({
          pagination: v
        });
      },
      options: [op('No pagination', 'disabled'), op('Above posts', 'above'), op('Below posts', 'below'), op('Both', 'both')],
      selected: attributes.pagination
    })), attributes.pagination !== 'disabled' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalNumberControl, {
      label: t('Posts per page'),
      min: 1,
      value: Number(attributes.postsPerPage),
      onChange: v => {
        setAttributes({
          postsPerPage: String(v)
        });
      },
      required: true
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: t('Text to display when no posts found'),
      value: attributes.noPostsText,
      onChange: v => {
        setAttributes({
          noPostsText: v
        });
      }
    }))));
  };
  const [renderData, setRenderData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    html: '',
    css: '',
    reload: true,
    atts: {}
  });
  class PSC_Render extends React.Component {
    constructor(props) {
      super(props);
      this.ref = React.createRef();
      this.script = null;
    }
    setHTML(ref, html) {
      ref.innerHTML = html;
      const htmlEl = document.getElementById(blockProps.id).querySelector('.psc-block-preview-html');
      [...htmlEl.querySelectorAll('a', 'button')].forEach(l => l.href = 'javascript:void(0)');
      htmlEl.querySelector('.vid-masonry') && !htmlEl.querySelector('.vid-masonry-row') && typeof VID_Masonry !== 'undefined' && (this.script = VID_Masonry.mount(htmlEl.querySelector('.vid-masonry')));
      htmlEl.querySelector('.vid-slider') && !htmlEl.querySelector('.vid-slider-inner') && typeof VID_Slider !== 'undefined' && (this.script = VID_Slider.mount(htmlEl.querySelector('.vid-slider')));
    }
    async reloadPreview() {
      const ref = this.ref.current;
      if (ref) {
        if (!renderData.reload && renderData.html || pscIsEqual(renderData.atts, attributes)) {
          this.setHTML(ref, renderData.html);
          return;
        }
        pscGetBlockPreview(attributes).then(r => {
          if ([r.css, r.html].includes(null)) {
            return;
          }
          if (r.css !== renderData.css || r.html !== renderData.html) {
            setRenderData({
              css: r.css,
              html: r.html,
              reload: renderData.reload,
              atts: {
                ...attributes
              }
            });
          }
          this.setHTML(ref, renderData.html);
        });
      }
    }
    componentDidMount() {
      this.reloadPreview();
    }
    componentWillUnmount() {
      this.script && this.script.unmount();
    }
    render() {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "psc-block-preview"
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "psc-block-preview-options"
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
        label: t('Refresh preview?'),
        checked: renderData.reload,
        onChange: v => {
          setRenderData({
            css: renderData.css,
            html: renderData.html,
            reload: v,
            atts: renderData.atts
          });
        }
      })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("style", {
        className: "psc-block-preview-css"
      }, renderData.css), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "psc-block-preview-html",
        ref: this.ref
      }));
    }
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", blockProps, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
    title: "Layout"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
    label: t('Layout'),
    value: attributes.layout,
    options: [postData.layouts.length ? op('Select a layout', '', true) : op('No layouts found', '', true), ...postData.layouts],
    onChange: v => {
      setAttributes({
        layout: v
      });
    }
  }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TabPanel, {
    className: 'psc-inspector-controls-tab-panel',
    activeClass: "psc-controls-tab-active",
    tabs: [{
      name: 'query',
      title: t('Taxonomy'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Query, null)
    }, {
      name: 'order',
      title: t('Order'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Order, null)
    }, {
      name: 'authors',
      title: t('Authors'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Authors, null)
    }, {
      name: 'posts',
      title: t('Posts'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Posts, null)
    }, {
      name: 'date',
      title: t('Date'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Date, null)
    }, {
      name: 'more',
      title: t('More...'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_More, null)
    }, {
      name: 'pagination',
      title: t('Pagination'),
      content: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_CP_Pagination, null)
    }]
  }, _ref2 => {
    let {
      content
    } = _ref2;
    return content;
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(PSC_Render, null));
}

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./src/style.scss");
/* harmony import */ var _edit_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit.js */ "./src/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/block.json");
/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */


/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * Internal dependencies
 */


let layouts = [];
/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  /**
   * @see ./edit.js
   */
  edit: _edit_js__WEBPACK_IMPORTED_MODULE_2__["default"]
});

/***/ }),

/***/ "./src/editor.scss":
/*!*************************!*\
  !*** ./src/editor.scss ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./src/block.json":
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":2,"name":"showcase-creator/posts-showcase-block","version":"0.1.0","title":"Posts Showcase","category":"widgets","icon":"slides","description":"Displays posts with a custom layout using a custom post query that allows custom post ordering.","supports":{"html":false,"align":true},"textdomain":"showcase-creator","attributes":{"postType":{"type":"string","default":"post"},"mimeTypes":{"type":"array","default":["any"]},"taxRelation":{"type":"string","default":"AND"},"taxQueries":{"type":"array","default":[]},"ignoreSticky":{"type":"boolean","default":1},"includePosts":{"type":"array","default":[]},"includePostsWhere":{"type":"string","default":"above"},"excludePosts":{"type":"array","default":[]},"topLevelOnly":{"type":"boolean","default":0},"includeInParents":{"type":"array","default":[]},"excludeInParents":{"type":"array","default":[]},"author":{"type":"string","default":""},"includeAuthors":{"type":"array","default":[]},"excludeAuthors":{"type":"array","default":[]},"postsToDisplay":{"type":"string","default":"-1"},"order":{"type":"string","default":"DESC"},"orderBy":{"type":"string","default":"date"},"orderList":{"type":"string","default":""},"metaKey":{"type":"string","default":""},"metaValue":{"type":"string","default":""},"layout":{"type":"string","default":"0"},"pagination":{"type":"string","default":"below"},"postsPerPage":{"type":"string","default":"10"},"noPostsText":{"type":"string","default":""},"withThumbnail":{"type":"boolean","default":0},"comments":{"type":"array","default":["","="]},"dateFilter":{"type":"string","default":""},"date":{"type":"array","default":["","","","","",""]},"dateModified":{"type":"boolean","default":0}},"editorScript":"file:./index.js","editorStyle":"file:./index.css","render":"file:./render.php"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0,
/******/ 			"./style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkshowcase_creator_block"] = globalThis["webpackChunkshowcase_creator_block"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["./style-index"], () => (__webpack_require__("./src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map