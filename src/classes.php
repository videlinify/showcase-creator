<?php
//Showcase Creator Plugin Class
class PSC {
  function __construct($prefix) {
    $this->prefix = $prefix;
    $this->settings = $this->get_settings();
    $this->layouts = $this->load_options('layouts');
    $this->metakeys = $this->get_metakeys();
    $this->preview = $this->load_options('preview');
    $this->current_query_imgs = array();
    foreach($this->metakeys as $i=>$k) { if ($k->key === null || is_array($k->key)) { array_splice($this->metakeys, $i, 1); PSC_MetaKey::update($this->metakeys); } }
    add_action('admin_enqueue_scripts', function() {
      $this->enqueue_script('showcase-creator-main', '/src/main.js');
      $this->localize_script('showcase-creator-main', 'SHOWCASE_CREATOR', array('prefix' => $this->prefix, 'urls' => array('site' => site_url(), 'admin' => admin_url(), 'rest' => rest_url(), 'plugin' => PSC_URL . '/')));
    });
    add_action('enqueue_block_assets', function() { $this->modules_init('masonry', 'slider'); });
  }

  //STATIC: Translation functions
  public static function __($str, ...$repl) { return sprintf(__($str, 'showcase-creator'), ...$repl); }
  public static function _e($str, ...$repl) { return printf(__($str, 'showcase-creator'), ...$repl); }

  //Enqueue plugin modules
  public function modules_init(...$modules) {
    $this->enqueue_style('admin', '/src/admin.css');
    $this->enqueue_script('controls', '/src/modules/vid-controls.js');
    $this->enqueue_style('controls', '/src/modules/vid-controls.css');
    foreach ($modules as $m) {
      switch($m) {
        case 'metakeys': $this->enqueue_script('metakeys', '/src/metakeys.js'); break;
        case 'settings': $this->enqueue_script('settings', '/src/settings.js'); break;
        case 'layouts-listing': $this->enqueue_script('layouts-listing', '/src/layouts-listing.js'); break;
        case 'layout-builder':
          $this->enqueue_script('layout-builder', '/src/layout-builder.js');
          $this->enqueue_style('layout-builder', '/src/layout-builder.css'); break;
        case 'post-order': $this->enqueue_script('post-order', '/src/post-order.js'); break;
        case 'input':
          $this->enqueue_script('input-control', '/src/modules/input-control.js');
          $this->enqueue_style('input-control', '/src/modules/input-control.css'); break;
        case 'number':
          $this->enqueue_script('number-control', '/src/modules/number-control.js');
          $this->enqueue_style('number-control', '/src/modules/number-control.css'); break;
        case 'toggle':
          $this->enqueue_script('toggle-control', '/src/modules/toggle-control.js');
          $this->enqueue_style('toggle-control', '/src/modules/toggle-control.css'); break;
        case 'select':
          $this->enqueue_script('select-control', '/src/modules/select-control.js');
          $this->enqueue_style('select-control', '/src/modules/select-control.css'); break;
        case 'tokens':
          $this->enqueue_script('tokens-control', '/src/modules/tokens-control.js');
          $this->enqueue_style('tokens-control', '/src/modules/tokens-control.css'); break;
        case 'color-picker':
          $this->enqueue_script('color-picker', '/src/modules/color-picker.js');
          $this->enqueue_style('color-picker', '/src/modules/color-picker.css'); break;
        case 'context-menu':
          $this->enqueue_script('context-menu', '/src/modules/context-menu.js');
          $this->enqueue_style('context-menu', '/src/modules/context-menu.css'); break;
        case 'dialog':
          $this->enqueue_script('dialog', '/src/modules/dialog.js');
          $this->enqueue_style('dialog', '/src/modules/dialog.css'); break;
        case 'loading':
          $this->enqueue_script('loading', '/src/modules/loading.js');
          $this->enqueue_style('loading', '/src/modules/loading.css'); break;
        case 'file-list':
          $this->enqueue_script('file-list', '/src/modules/file-list.js');
          $this->enqueue_style('file-list', '/src/modules/file-list.css'); break;
        case 'hint':
          $this->enqueue_script('hint', '/src/modules/hint.js');
          $this->enqueue_style('hint', '/src/modules/hint.css'); break;
        case 'foldable-panel':
          $this->enqueue_script('foldable-panel', '/src/modules/foldable-panel.js');
          $this->enqueue_style('foldable-panel', '/src/modules/foldable-panel.css'); break;
        case 'items-list':
          $this->enqueue_script('items-list', '/src/modules/items-list.js');
          $this->enqueue_style('items-list', '/src/modules/items-list.css'); break;
        case 'dynamic-text': $this->enqueue_script('dynamic-text', '/src/modules/dynamic-text.js'); break;
        case 'content-switch': $this->enqueue_script('content-switch', '/src/modules/content-switch.js'); break;
        case 'lightbox':
          $this->enqueue_script('lightbox', '/src/modules/lightbox.js');
          $this->enqueue_style('lightbox', '/src/modules/lightbox.css'); break;
        case 'slider': $this->enqueue_script('slider', '/src/modules/slider.js'); break;
        case 'masonry': $this->enqueue_script('masonry', '/src/modules/masonry.js'); break;
      }
    }
  }

  //PRIVATE: Load an option from the database or adds one if missing (plugin prefixed)
  private function load_options($option) {
    if (!get_option($this->prefix.'_'.$option)) {
      add_option($this->prefix.'_'.$option);
      return array();
    }
    $loaded = get_option($this->prefix.'_'.$option);
    return is_array($loaded) ? $loaded : array();
  }

  //PRIVATE: Enqueue script (plugin prefixed)
  private function enqueue_script($name, $path_relative) {
    if (!wp_script_is($this->prefix.'-'.$name, 'enqueued')) {
      wp_register_script($this->prefix.'-'.$name, PSC_URL . $path_relative);
      wp_enqueue_script($this->prefix.'-'.$name);
    }
  }

  //PRIVATE: Enqueue stylesheet (plugin prefixed)
  private function enqueue_style($name, $path_relative) {
    if (!wp_style_is($this->prefix.'-'.$name, 'enqueued')) {
      wp_register_style($this->prefix.'-'.$name, PSC_URL . $path_relative);
      wp_enqueue_style($this->prefix.'-'.$name);
    }
  }

  //Puts a PHP variable in enqueued plugin script (plugin prefixed)
  public function localize_script($script, $varname, $data) {
    if (wp_script_is($this->prefix.'-'.$script, 'enqueued')) {
      wp_localize_script($this->prefix.'-'.$script, $varname, $data);
    }
  }

  //PRIVATE: Loads registered meta keys from the options and makes them instances of the MetaKey class
  private function get_metakeys() {
    $keys = $this->load_options('metakeys');
    $registered = array();
    if (count($keys)) { foreach ($keys as $k) { $registered[] = PSC_MetaKey::register($k); } }
    return $registered;
  }

  //PRIVATE: Loads settings from options or get default
  private function get_settings() {
    $settings = $this->load_options('settings');
    $default = PSC::get_default_settings();
    $settings = array_merge($default, $settings);
    return $settings;
  }
  private static function get_default_settings() {
    return array(
      'integrate' => array('search' => 0, 'tax' => 0, 'author' => 0, 'layout' => 0),
      'lightbox' => array('light' => '#ffffff', 'dark' => '#000000', 'alpha' => 0.5, 'zoom' => 1)
    );
  }

  //Updates plugin database
  public function update_layouts($new = null) { if ($new) { $this->layouts = $new; } return update_option($this->prefix.'_layouts', $this->layouts); }
  public function update_metakeys() { return update_option($this->prefix.'_metakeys', array_map(function($k) { return $k->to_array(); }, $this->metakeys)); }
  public function update_settings($new = null) { if ($new) { $this->settings = $new; } return update_option($this->prefix.'_settings', $this->settings); }
  public function update_preview($new = null) { if ($new) { $this->preview = $new; } return update_option($this->prefix.'_preview', $this->preview); }

  //Delete options from database
  public function clear_layouts() { delete_option($this->prefix.'_layouts'); return PSC::__('Layouts deleted.'); }
  public function clear_keys() {
    foreach($_psc->metakeys as $k) { $k->update_order(); }
    delete_option($this->prefix . '_metakeys');
    return PSC::__('Order lists deleted.');
  }

  //Restores default settings
  public function restore_settings() { delete_option($this->prefix.'_settings'); return PSC::__('Default settings restored.'); }

  //Restores default layouts
  public function restore_layouts() {
    $layouts = PSC::layouts_from_file(PSC_PATH . 'layouts/default-layouts.json');
    if (!$layouts) { return PSC::__('Cannot open default layouts'); }
    $this->add_layouts($layouts);
    return PSC::__('Default layouts restored.');
  }

  //Get specific WP data (post types, taxonomies, terms, posts, authors) or plugin data (layouts, metakeys, order)
  public function get_data($get = array(), $args = array(), $fields = array()) {
    $fields = is_array($fields) ? $fields : array($fields);
    $fields = is_array($get) ? $fields : array($get => $fields);
    $args = is_array($args) ? $args : array($args);
    $args = is_array($get) ? $args : array($get => $args);
    $get = is_array($get) ? $get : array($get);
    foreach($get as $g) {
      if (!isset($args[$g])) { $args[$g] = array(); }
      if (!isset($fields[$g])) { $fields[$g] = array(); }
    }
    $data = array();
    if (!count($get)) { $get = array('types', 'taxs', 'terms', 'posts', 'authors', 'metakeys', 'order', 'layouts'); }
    foreach($get as $d) { $data[$d] = array(); }
    if (in_array('types', $get)) {
      $types = get_post_types(count($args['types']) ? $args['types'] : array('public' => true), 'objects');
      $props = count($fields['types']) ? $fields['types'] : array('label', 'name', 'hierarchical');
      foreach ($types as $t) {
        $type_obj = array();
        foreach($props as $p) { $type_obj[$p] = $t->$p; }
        $data['types'][] = $type_obj;
      }
    }
    if (in_array('taxs', $get)) {
      $taxs = isset($args['taxs']['post_type']) ? get_object_taxonomies($args['taxs']['post_type'], 'objects') : get_taxonomies(count($args['taxs']) ? $args['taxs'] : array('public' => true), 'objects');
      $props = count($fields['taxs']) ? $fields['taxs'] : array('label', 'name', 'object_type');
      foreach ($taxs as $tax) {
        $tempterms = get_terms(array('taxonomy' => $tax->name));
        if (is_array($tempterms) && count($tempterms) > 0) {
          $tax_obj = array();
          foreach($props as $p) { $tax_obj[$p] = $tax->$p; }
          $data['taxs'][] = $tax_obj;
        }
      }
    }
    if (in_array('terms', $get)) {
      $taxnames = get_taxonomies(array('public' => true), 'names');
      $terms = get_terms(count($args['terms']) ? $args['terms'] : array('taxonomy' => $taxnames, 'hide_empty' => false));
      $props = count($fields['terms']) ? $fields['terms'] : array('name', 'term_id', 'taxonomy');
      foreach ($terms as $term) {
        $term_obj = array();
        foreach($props as $p) { $term_obj[$p] = $term->$p; }
        $data['terms'][] = $term_obj;
      }
    }
    if (in_array('posts', $get)) {
      $posts = get_posts($args['posts']);
      $props = count($fields['posts']) ? $fields['posts'] : array('post_title', 'ID');
      foreach ($posts as $post) { $data['posts'][] = PSC::get_post_data($post, $props); }
    }
    if (in_array('authors', $get)) {
      $authors = get_users(array('exclude_admin' => false, 'echo' => false, 'orderby' => 'name', 'capability' => 'edit_posts', 'fields' => array('ID', 'display_name')));
      foreach($authors as $author) {
        $data['authors'][] = array('name' => $author->display_name, 'id' => intval($author->id));
      }
    }
    if (in_array('layouts', $get)) {
      $props = count($fields['layouts']) ? $fields['layouts'] : array('name', 'slug', 'id');
      foreach($this->layouts as $k=>$v) {
        $layout_obj = array();
        foreach($props as $p) { if ($p === 'id') { $layout_obj[$p] = $k; } else { $layout_obj[$p] = PSC::get_value($v, $p); } }
        $data['layouts'][] = $layout_obj;
      }
    }
    if (in_array('metakeys', $get)) {
      $props = count($fields['metakeys']) ? $fields['metakeys'] : array('key', 'label', 'linked', 'at');
      foreach($this->metakeys as $k) {
        $key_obj = array();
        foreach($props as $p) { $key_obj[$p] = PSC::get_value($k, $p); }
        $data['metakeys'][] = $key_obj;
      }
    }
    if (in_array('order', $get)) {
      $props = count($fields['order']) ? $fields['order'] : array('post_title', 'ID', 'permalink');
      $keys = count($args['order']) && $args['order'][0] ? $args['order'] : array_map(function($k) { return $k->key; }, $this->metakeys);
      foreach($keys as $k) {
        if (PSC_MetaKey::exists($k)) { $data['order'][$k] = PSC_MetaKey::get($k)->get_order($props); }
      }
    }
    return $data;
  }

  //STATIC: Get specific post data and put it in an array
  public static function get_post_data($post, $props = array()) {
    $post_arr = array();
    foreach($props as $p) {
      switch ($p) {
        case 'author_name': $post_arr[$p] = get_user_by('ID', $post->post_author)->display_name; break;
        case 'date': $post_arr[$p] = get_the_date('', $post); break;
        case 'date_ymd': $post_arr[$p] = array_map('intval', explode('-',explode(' ',$post->post_date)[0])); break;
        case 'thumbnail': $post_arr[$p] = get_the_post_thumbnail_url($post->ID, 'thumbnail'); break;
        case 'thumbnail_medium': $post_arr[$p] = get_the_post_thumbnail_url($post->ID, 'medium'); break;
        case 'thumbnail_full': $post_arr[$p] = get_the_post_thumbnail_url($post->ID, 'full'); break;
        case 'metakeys': $temp = array(); foreach($this->metakeys as $k) { $temp[$k->key] = get_post_meta($post->ID, $k->key, true); } $post_arr[$p] = $temp; break;
        case 'permalink': $post_arr[$p] = get_post_permalink($post); break;
        default: $post_arr[$p] = is_numeric($post->$p) ? intval($post->$p) : $post->$p;
      }
    }
    return $post_arr;
  }

  //First tries to return the required layout (by a given ID or slug). On failure, it tries to return the default layout or, if not specified, the first one.
  public function get_layout($value = 0, $by = null) {
    if ($value === '_preview') { return $this->preview; }
    if (!count($this->layouts)) { return null; }
    if ($by === 'id' || (is_numeric($value) && $by === null)) {
      if (isset($this->layouts[intval($value)])) {
        $layout = $this->layouts[intval($value)];
        if ($layout) { return $layout; }
      }
    }
    else {
      $layout = $this->find_value($this->layouts, $by, $value);
      if ($layout) { return $layout; }
    }
    $default = $this->settings['integrate']['layout'];
    if (isset($this->layouts[$default])) { return $this->layouts[$default]; }
    $first = array_key_first($this->layouts);
    if (isset($this->layouts[$first])) { return $this->layouts[$first]; }
  }

  //STATIC: Checks if the given data is a valid layout
  public static function layout_is_valid($layout) {
    if (
      !is_array($layout) ||
      (!isset($layout['name']) || !is_string($layout['name'])) ||
      (!isset($layout['slug']) || !is_string($layout['slug'])) ||
      (!isset($layout['items']) || !is_array($layout['items'])) ||
      !isset($layout['css']) ) { return false; } //### is_string($layout['css'])
    foreach ($layout['items'] as $item) {
      $id = PSC::get_value($item, 'id');
      $parent = PSC::get_value($item, 'parent');
      $type = PSC::get_value($item, 'type');
      if (!is_int($id) || !($parent === null || is_int($parent)) || !is_string($type)) { return false; }
    }
    if (
      PSC::get_value($layout['items'][0], 'type') !== 'container' ||
      PSC::get_value($layout['items'][1], 'type') !== 'post' ||
      count(PSC::filter_value($layout['items'], 'type', 'container')) > 1 ||
      count(PSC::filter_value($layout['items'], 'type', 'post')) > 1) { return false; }
    return true;
  }

  //STATIC: Searches for multiple valid layouts in an array and returns them if any
  public static function get_layouts_in_array($array) {
    if (!is_iterable($array)) { return false; }
    if (PSC::layout_is_valid($array)) { return array($array); }
    $layouts = array();
    foreach($array as $k=>$v) {
      $inner = PSC::get_layouts_in_array($v);
      if ($inner && count($inner)) { array_push($layouts, ...$inner); }
    }
    return $layouts;
  }

  //STATIC: Get layouts from file
  public static function layouts_from_file($path) {
    $file = file_get_contents($path, true);
    if (!$file) { return null; }
    $layouts = json_decode($file, true);
    return PSC::get_layouts_in_array($layouts);
  }

  //Add layouts to the database
  public function add_layouts(array $layouts, bool $overwrite = false) {
    $layouts = PSC::get_layouts_in_array($layouts);
    foreach($layouts as $l) {
      $same = PSC::find_value($this->layouts, 'slug', $l['slug'], true);
      $id = count($this->layouts) ? max(array_keys($this->layouts))+1 : 1;
      if ($same === null) { $this->layouts[$id] = $added[$id] = $l; }
      else {
        if ($overwrite) {
          array_splice($this->layouts, $same, 1, $l);
          $added[$same] = $l;
        }
        else {
          $counter = 1;
          $slug = PSC::find_value($this->layouts, 'slug', $l['slug'])['slug'];
          while (PSC::find_value($this->layouts, 'slug', $slug.'-'.$counter) !== null) { $counter++; }
          $l['slug'] = $slug.'-'.$counter;
          $this->layouts[$id] = $added[$id] = $l;
        }
      }
    }
    $this->update_layouts();
    return $added;
  }

  //Imports multiple order lists
  public function import_order_lists(array $lists) {
    if (!count($lists)) { return; }
    $result = array();
    foreach($lists as $name=>$order) { $result[$name] = $this->import_order_list($name, $order); }
    return $result;
  }

  //Imports a single order list. Retrieves post ids from post names (necessary in case of WP migration)
  public function import_order_list(string $key_name, array $list) {
    if (!$key_name || !count($list)) { return; }
    $result = array();
    $key = PSC::find_value($this->metakeys, 'key', $key_name);
    $posts = array();
    foreach($list as $post) {
      if (!isset($post['post_type']) || !isset($post['post_name']) || !isset($post['meta_value'])) { continue; }
      $obj = get_page_by_path($post['post_name'], OBJECT, $post['post_type']);
      if ($obj) {
        $posts[] = array($obj->ID, $post['meta_value']);
        $result[] = $obj->ID;
      }
    }
    if (count($posts)) {
      if (!$key) {
        $this->metakeys[] = $key = PSC_MetaKey::register($key_name);
        $this->update_metakeys();
      }
      $key->update_order($posts);
      return $result;
    }
  }

  //STATIC: Generates an URL by given query args
  public static function generate_custom_query_url($args) {
    global $_psc;
    return site_url('/?') . (isset($args['showcase']) ? '' : 'showcase=' . $_psc->settings['layout'] . '&') . http_build_query($args);
  }

  //STATIC: Custom PHP functions
  public static function get_value($var, $sub) {
    if (is_array($var) && isset($var[$sub])) { return $var[$sub]; }
    else if (is_object($var) && isset($var->$sub)) { return $var->$sub; }
    else { return null; }
  }
  public static function find_value($in, $what, $value, $return_key = false) {
    foreach ($in as $k=>$v) { if (PSC::get_value($v,$what) === $value) { return $return_key ? $k : $v; } }
    return null;
  }
  public static function filter_value($in, $what, $value) {
    $filtered = array();
    foreach ($in as $k) { if (PSC::get_value($k, $what) === $value) { $filtered[] = $k; } }
    return $filtered;
  }
  public static function array_every(array $array, callable $callback) {
    foreach($array as $k=>$v) {
      if (!call_user_func($callback, $v, $k, $array)) { return false; }
    }
    return true;
  }
  public static function array_any(array $array, callable $callback) {
    foreach($array as $k=>$v) {
      if (call_user_func($callback, $v, $k, $array)) { return true; }
    }
    return false;
  }
  public static function string_is_json($str) { json_decode($str); return json_last_error() === JSON_ERROR_NONE; }
}

//MetaKey class (used for Order lists)
class PSC_MetaKey {
  function __construct($key, $label, $linked, $at) {
    $this->prefix = '_sc-list_'; //used in post meta data (_sc-list_metakey-name)
    $this->key = $key;
    $this->label = $label;
    $this->linked = $linked;
    $this->at = $at;
  }

  //STATIC: Register a MetaKey class instance from an array/object
  public static function register($k) {
    $new = array();
    if (is_array($k)) {
      if (!isset($k['key']) || !isset($k['label']) || !$k['key'] || !$k['label']) { return; }
      $new['prefix'] = isset($k['prefix']) ? $k['prefix'] : '';
      $new['key'] = $k['key'];
      $new['label'] = $k['label'];
      $new['linked'] = isset($k['linked']) ? $k['linked'] : null;
      $new['at'] = isset($k['at']) ? $k['at'] : null;
    }
    else if (is_object($k)) {
      if (!isset($k->key) || !isset($k->label) || !$k->key || !$k->label) { return; }
      $new['prefix'] = isset($k->prefix) ? $k->prefix : '';
      $new['key'] = $k->key;
      $new['label'] = $k->label;
      $new['linked'] = isset($k->linked) ? $k->linked : null;
      $new['at'] = isset($k->at) ? $k->at : null;
    }
    else { return; }
    return new PSC_MetaKey($new['key'], $new['label'], $new['linked'], $new['at'], $new['prefix']);
  }

  //Extracts the core data of the current instance into an array (used to update options)
  public function to_array() { return array('key' => $this->key, 'label' => $this->label, 'linked' => $this->linked, 'at' => $this->at); }

  //STATIC: Searches an instance by a given key
  public static function get(string $key) {
    global $_psc;
    return PSC::find_value($_psc->metakeys, 'key', $key);
  }

  //STATIC: Checks if meta key exists
  public static function exists(string $key = null, string $label = null, string $exclude_key = null) {
    global $_psc;
    foreach($_psc->metakeys as $k) {
      if ($k->key !== $exclude_key) {
        if ($key && $k->key === $key) { return true; }
        if ($label && $k->label === $label) { return true; }
      }
    }
    return false;
  }

  //Updates the post order for the current instance
  public function update_order(array $ids = array()) {
    delete_post_meta_by_key($this->prefix . $this->key);
    foreach($ids as $n=>$id) { update_post_meta(intval($id), $this->prefix . $this->key, $n+1); }
    return $ids;
  }

  //Retrieves the post order for the current instance
  public function get_order(array $fields = array('ID')) {
    $posts = get_posts(array('numberposts' => -1, 'post_type' => 'any', 'post_status' => 'any', 'order' => 'ASC', 'orderby' => 'meta_value_num', 'meta_key' => $this->prefix . $this->key));
    if (!$fields || !count($fields)) { return $posts; }
    else {
      $result = array();
      foreach($posts as $p) {
        if (count($fields) === 1 && in_array($fields[0], array('ID', 'post_name'))) { $field = $fields[0]; $result[] = $p->$field; }
        else { $result[] = array_merge(PSC::get_post_data($p, $fields), array('meta_value' => intval(get_post_meta($p->ID, $this->prefix . $this->key, true))));
        }
      }
      return $result;
    }
  }

  //Rename the MetaKey
  public function rename(string $new_key, string $new_label) {
    global $_psc;
    if ($this->key === $new_key) { $this->label = $new_label; return $_psc->update_metakeys(); }
    if (PSC_MetaKey::exists($new_key, $new_label, $this->key)) { return false; }
    $ids = $this->get_order();
    delete_post_meta_by_key($this->prefix . $this->key);
    foreach($ids as $n=>$id) { update_post_meta($id, $this->prefix . $new_key, $n+1); }
    $this->key = $new_key;
    $this->label = $new_label;
    return $_psc->update_metakeys();
  }

  //Delete the MetaKey
  public function delete() {
    global $_psc;
    $this->update_order();
    $key = PSC::find_value($_psc->metakeys, 'key', $this->key, true);
    if ($key === false) { return false; }
    else { unset($_psc->metakeys[$key]); }
    return $_psc->update_metakeys();
  }

  //Associate (link) the MetaKey to a category, author or a custom post type / term.
  public function link($type, $link, $at) {
    global $_psc;
    $result = '';
    $this->at = $at;
    if ($type === 'term') {
      $link = is_string($link) ? explode(',', $link) : $link;
      $this->linked = array('term', $link[0], $link[1], intval($link[2]));
      $result = get_post_type_object($link[0])->label . ($link[1] && intval($link[2]) ? ' > '.get_taxonomy($link[1])->label.' > '.get_term(intval($link[2]), $link[1])->name : ' ('. PSC::__('post type'). ')');
    }
    else if ($type === 'cat') {
      $this->linked = array('cat', intval($link));
      $result = 'Category > '.get_term(intval($link),'category')->name;
    }
    else if ($type === 'author') {
      $this->linked = array('author', intval($link));
      $result = 'Author > '.get_userdata(intval($link))->display_name;
    }
    else { $this->linked = null; $this->at = null; }
    if ($_psc->update_metakeys()) { return $result; }
    return false;
  }

  //Unassociate the MetaKey
  public function unlink($wipe = true) {
    global $_psc;
    if ($wipe) { $this->update_order(); }
    $this->linked = null;
    $this->at = null;
    return $_psc->update_metakeys();
  }

  //Get the length of the Order list
  public function list_count() { return count($this->get_order())-1; }

  //Adds a post to the list (using the default position for new posts)
  public function list_add_post($id) {
    $ids = $this->get_order();
    if (in_array($id, $ids)) { return false; }
    if ($this->at === 0) { array_unshift($ids, $id); }
    else if ($this->at === -1) { $ids[] = $id; }
    else { array_splice($ids, $this->at-1, 0, $id); }
    return $this->update_order($ids);
  }

  //Removes a post from the list
  public function list_remove_post($id) {
    $ids = $this->get_order();
    if (!in_array($id, $ids)) { return false; }
    $key = array_search($id, $ids);
    array_splice($ids, $key, 1);
    return $this->update_order($ids);
  }

  //Moves a post from one place to another in the list
  public function list_move_post($id, $pos) {
    if (!is_numeric($id) || !is_numeric($pos)) { return false; }
    $id = intval($id);
    $pos = max(1, intval($pos));
    $ids = $this->get_order();
    $key = array_search($id, $ids);
    if ($key === $pos) { return null; }
    array_splice($ids, $key, 1);
    array_splice($ids, $pos-1, 0, $id);
    return $this->update_order($ids);
  }
}

//Layout class
class PSC_layout {
  private $_items;
  function __construct($id, $layout) {
    $this->id = $id;
    $this->slug = isset($layout['slug']) ? $layout['slug'] : null;
    $this->name = isset($layout['name']) ? $layout['name'] : null;
    $this->items = isset($layout['items']) ? $layout['items'] : null;
    $this->css = isset($layout['css']) ? $layout['css'] : null;
    $this->post_type = isset($layout['post_type']) ? $layout['post_type'] : null;
    $this->register_items();
  }

  //Returns an array with basic data
  public function to_array() {
    return array('slug' => $this->slug, 'name' => $this->name, 'items' => $this->items, 'css' => $this->css, 'post_type' => $this->post_type);
  }

  //PRIVATE: Registers instances of PSC_layout_item class for each element of a layout
  private function register_items() {
    $slug = $this->slug;
    $this->_items = array_map(function($item) use($slug) {
      return new PSC_layout_item($slug, PSC::get_value($item, 'id'), PSC::get_value($item, 'parent'), PSC::get_value($item, 'type'), PSC::get_value($item, 'options'));
    }, $this->items);
  }

  //Prints posts using the layout.
  public function print($query, $output = true) {
    if (!$this->_items) { return; }
    global $_psc;
    $_psc->current_query_imgs = array();
    foreach ($query->posts as $p) {
      $img_id = get_post_thumbnail_id($p);
      if ($img_id) { $_psc->current_query_imgs[] = array('url' => wp_get_attachment_image_url($img_id, 'full'), 'desc' => wp_get_attachment_caption($img_id), 'id' => $p->ID); }
    }
  	ob_start();
  	$this->load_css();
  	$this->_items[0]->open($query->post);
  	while ($query->have_posts()) {
  		$query->the_post();
  		$this->print_post($query->post);
  	}
  	$this->_items[0]->close();
    if ($output) { ob_end_flush(); }
    else { return ob_get_clean(); }
  }

  //Prints a post. $post - the WP_Post for which the elements are printed.
  public function print_post($post) {
    $items = array_slice($this->_items, 1);
    $pending = array();
    foreach ($items as $item) {
      $children = PSC::filter_value($items, 'parent', $item->id);
      while (count($pending) && $item->parent !== $pending[0]->id) {
        $pending[0]->close();
        array_shift($pending);
      }
      $item->open($post);
      if (!count($children)) { $item->close(); }
      else { array_unshift($pending, $item); }
    }
    foreach($pending as $p) { if (isset($p)) { $p->close(); } }
    foreach($items as $item) { $item->status = null; }
  }

  public function get_css() {
    if (!$this->css) { return; }
    return str_replace('_slug', $this->slug, $this->css);
  }

  //Load layout's stylesheet
  public function load_css() {
    $css = $this->get_css();
    wp_register_style('psc-layout-' . $this->id, PSC_URL . '/src/layout.css');
    wp_enqueue_style('psc-layout-' . $this->id);
    wp_add_inline_style('psc-layout-' . $this->id, $css);
  }

  //STATIC: Fallback method that prints a post query without layout.
  public static function print_fallback($query) { ?>
    <div class="psc-flex-col psc-flex-gap-extra"><?php
    while($query->have_posts()) {
      $query->the_post();
      ?>
      <div>
        <h2><a href="<?php echo get_permalink($query2->post); ?>"><?php echo $query->post->post_title; ?></a></h2>
        <p>Posted on <em><?php echo get_the_date(''); ?></em> by <em><?php echo get_the_author_meta('display_name'); ?></em></p>
        <p><?php echo get_the_excerpt(); ?></p>
      </div><?php
    } ?>
  </div><?php
  }
}

//Layout Item class used for printing the layout
class PSC_layout_item {
  function __construct($layout_slug, $id, $parent, $type, $options) {
    $this->layout_slug = $layout_slug;
    $this->id = $id;
    $this->parent = $parent;
    $this->type = $type;
    $this->options = $options;
    $this->status = null;
  }

  //PRIVATE: Get an option of the layout element
  private function option_value($name, $single = true) {
    foreach ($this->options as $option => $value) {
      if ($option == $name) { return ($single ? (is_array($value) ? $value[array_key_first($value)] : $value) : $value); }
    }
    return null;
  }

  //Open the HTML tag of an element
  public function open($post) {
    if ($this->status) { return; }
    global $_psc;
    $layout_id = PSC::find_value($_psc->layouts, 'slug', $this->layout_slug, true);
    $tag = $this->option_value('tag');
    $classes = $this->option_value('class', false);
    if ($classes) { $classes = str_replace('_slug', $this->layout_slug, $classes); }
    if ($tag === null) { $tag = 'div'; }
    $tag_atts = '';
    $post_url = get_post_permalink($post);
    $img_id = $post ? ($post->post_type === 'attachment' ? $post->ID : get_post_thumbnail_id($post)) : null;
    $innerHTML = '';
    if ($this->type === 'container') {
      $special = $this->option_value('special');
      if ($special === 'slider') {
        $_psc->modules_init('slider');
        $classes[] = 'vid-slider';
        $slider_args = array('delay' => $this->option_value('delay'), 'animate' => $this->option_value('animate'), 'speed' => $this->option_value('speed'), 'ease' => $this->option_value('ease'), 'start' => $this->option_value('start'));
        if ($slider_args['delay'] !== null) { $tag_atts .= 'data-delay="'.(floatval($slider_args['delay'])*1000).'"'; }
        if ($slider_args['animate'] !== null) { $tag_atts .= ' data-animate="'. $slider_args['animate'] .'"'; }
        if ($slider_args['speed'] !== null) { $tag_atts .= ' data-speed="'.(floatval($slider_args['speed'])*1000).'"'; }
        if ($slider_args['ease'] !== null) { $tag_atts .= ' data-ease="'.$slider_args['ease'].'"'; }
        if ($slider_args['start'] !== null) { $tag_atts .= ' data-start="'.$slider_args['start'].'"'; }
      }
      else if ($special === 'masonry') {
        $_psc->modules_init('masonry');
        $classes[] = 'vid-masonry';
        $masonry_fill = $this->option_value('fill');
        if ($masonry_fill !== null) { $tag_atts .= 'data-fill="'.$masonry_fill.'"'; }
      }
    }
    else if ($this->type === 'post') {
      $no_thumbnail_class = $this->option_value('no_thumbnail_class');
      if ($no_thumbnail_class && !$img_id) { $classes[] = $no_thumbnail_class; }
    }
    else if ($this->type === 'title') {
      if ($this->option_value('hyperlink')) { $innerHTML = "<a href=\"$post_url\">$post->post_title</a>"; }
      else { $innerHTML = $post->post_title; }
    }
    else if ($this->type === 'date') { $innerHTML = get_the_date('', $post); }
    else if ($this->type === 'datemodified') { $innerHTML = get_the_modified_date('', $post); }
    else if ($this->type === 'author') {
      $author_name = get_the_author_meta('display_name', $post->post_author);
      if ($tag === 'a') { $tag_atts = " href=\"". PSC::generate_custom_query_url(array('showcase' => $layout_id, 'author' => $post->post_author)) ."\""; }
      $innerHTML = $author_name;
    }
    else if ($this->type === 'avatar') {
      $avatar_url = get_avatar_url($post->post_author, array('size' => $this->option_value('size'), 'default' => $this->option_value('default'), 'force_default' => $this->option_value('force_default')));
      if (!$avatar_url) { return; }
      if ($tag === 'div') { $tag_atts = " style=\"background-image:url($avatar_url)\""; }
      else { $tag_atts = " src=\"$avatar_url\""; }
    }
    else if ($this->type === 'categories') { $innerHTML = $this->get_terms_links($layout_id, $post->ID, 'category', $this->option_value('hyperlink'), ', '); }
    else if ($this->type === 'tags') { $innerHTML = $this->get_terms_links($layout_id, $post->ID, 'post_tag', $this->option_value('hyperlink'), ', ', $this->option_value('hashtag') ? '#' : ''); }
    else if ($this->type === 'thumbnail') {
      if ($img_id) {
        $img_src = wp_get_attachment_image_url($img_id, $this->option_value('size'));
        $img_full = wp_get_attachment_image_url($img_id, 'full');
        if ($tag === 'div') { $tag_atts = " style=\"background-image: url('$img_src');\""; }
        else { $tag_atts = " src=\"$img_src\" alt=\"".get_post_meta(get_post_thumbnail_id($post), '_wp_attachment_image_alt', true)."\""; }
      }
      else { return; }
    }
    else if ($this->type === 'image') {
      $replacements = array('%site_url%', '%meta_key=(.*?)%', '%post_id%', '%post_slug%', '%author_id%');
      $img_src = $this->apply_replacements($replacements, $post, $this->option_value('url'));
      if ($tag === 'div') { $tag_atts = " style=\"background-image: url('$img_src');\""; }
      else { $tag_atts = " src=\"$img_src\""; }
    }
    else if ($this->type === 'embed') {
      $types = $this->option_value('types', false);
      if (in_array('audio', $types) && $post->post_type === 'attachment' && str_contains($post->post_mime_type, 'audio')) { $innerHTML = wp_audio_shortcode(array('src' => wp_get_attachment_url($post->ID))); }
      if (in_array('video', $types) && $post->post_type === 'attachment' && str_contains($post->post_mime_type, 'video')) { $innerHTML = wp_video_shortcode(array('src' => wp_get_attachment_url($post->ID))); }
      if ($this->option_value('in_content')) {
        $content = apply_filters('the_content', $post->post_content);
        $embedded = get_media_embedded_in_content($content, $types);
        if (is_array($embedded)) { $embedded = array_slice($embedded, 0, $this->option_value('max')); }
        if (count($embedded)) { $innerHTML = implode('',$embedded); }
      }
    }
    else if ($this->type === 'excerpt') {
      $source = $this->option_value('source');
      $excerpt = '';
      if ($source === 'excerpt') { $excerpt = trim($post->post_excerpt); }
      else if ($source === 'content') { $excerpt = wp_strip_all_tags($post->post_content); }
      else {
        if ($post->post_excerpt) { $excerpt = trim($post->post_excerpt); }
        else { $excerpt = wp_strip_all_tags($post->post_content); }
      }
      if ($this->option_value('cut')) {
        $limit = intval($this->option_value('limit'));
        $splited = explode(' ', $excerpt);
        $moretext = $this->option_value('more_text');
        $morelink = '<a href="'. $post_url .'">'. $moretext .'</a>';
        if ($limit && count($splited) > $limit) { $excerpt = implode(' ', array_slice($splited, 0, $limit)) . ($moretext ? ' '.$morelink : '...'); }
        else if ($this->option_value('force_more')) { $excerpt .= ' '.$morelink; }
      }
      $innerHTML = $excerpt;
    }
    else if ($this->type === 'link') {
      $leads_to = $this->option_value('leads_to');
      if (in_array($leads_to, ['query_gallery', 'content_gallery', 'img_lightbox'])) {
        $_psc->modules_init('lightbox');
        $lightbox_settings = 'colorDark: \''.$_psc->settings['lightbox']['dark'].'\', colorLight: \''.$_psc->settings['lightbox']['light'].'\', alphaValue: '.$_psc->settings['lightbox']['alpha'].', zoom: '.$_psc->settings['lightbox']['zoom'];
      }
      if ($leads_to === 'post') { $tag_atts = ' href="'. $post_url .'"'; }
      else if ($leads_to === 'author_page') { $tag_atts = ' href="'. get_author_posts_url($post->post_author) .'"'; }
      else if ($leads_to === 'media_page') { $tag_atts = ' href="'. get_attachment_link(get_post_thumbnail_id($post)) .'"'; }
      else if ($leads_to === 'download') {
        $tag_atts = ' href="'. ($post->post_type === 'attachment' ? wp_get_attachment_url($post->ID) : wp_get_attachment_image_url(get_post_thumbnail_id($post), 'full')).'" download';
      }
      else if ($leads_to === 'img_lightbox') {
        $img_full = wp_get_attachment_image_url($img_id, 'full');
        if ($img_full) { $tag_atts = " href=\"javascript:vid_lightbox({ $lightbox_settings },'$img_full')\""; }
      }
      else if ($leads_to === 'content_gallery') {
        preg_match_all('/\<img[^>]*?src="(.*?)"|\<img[^>]*?src=\'(.*?)\'/i', $post->post_content, $content_imgs);
        $content_imgs = implode(',', array_map(function($m) { return '\''. $m .'\''; }, array_filter(array_merge($content_imgs[1],$content_imgs[2]), function($f) { return $f; })));
        if ($content_imgs) { $tag_atts = " href=\"javascript:vid_lightbox({ $lightbox_settings },$content_imgs)\""; }
      }
      else if ($leads_to === 'query_gallery') {
        if (is_array($_psc->current_query_imgs) && count($_psc->current_query_imgs)) {
          $_psc->localize_script('lightbox', 'VID_GALLERY', $_psc->current_query_imgs);
          $img_counter = $img_current = 0;
          foreach ($_psc->current_query_imgs as $img) { if ($post->ID === $img['id']) { $img_current = $img_counter; } $img_counter++; }
          $current_img = array_search(strval($post->ID), $_psc->current_query_imgs);
          $tag_atts = " href=\"javascript:vid_lightbox_gallery({ current: $img_current, $lightbox_settings })\"";
        }
      }
      else if ($leads_to === 'home') { $tag_atts = ' href="'. get_home_url() .'"'; }
      else if ($leads_to === 'custom') {
        $replacements = array('%site_url%', '%meta_key=(.*?)%', '%gallery=\[(.*?)\]%', '%post_permalink%', '%post_id%', '%post_slug%', '%author_id%', '%attachment_url%');
        $tag_atts = ' href="'. $this->apply_replacements($replacements, $post, $this->option_value('custom_url')) .'"';
      }
      $target_blank = $this->option_value('target_blank');
      if ($target_blank) { $tag_atts .= ' target="_blank"'; }
    }
    else if ($this->type === 'text') {
      $replacements = array('%meta_key=(.*?)%', '%site_title%', '%site_tagline%', '%post_title%', '%post_slug%');
      $innerHTML = $this->apply_replacements($replacements, $post, $this->option_value('content'));
    }
    else if ($this->type === 'terms') { $innerHTML = $this->get_terms_links($layout_id, $post->ID, $this->option_value('taxonomy'), $this->option_value('hyperlink'), ', '); }
    $classes = array_filter($classes, function($c) { return $c && strlen($c); });
    $classes = $classes && count($classes) ? ' class="'.implode(" ", $classes).'"' : '';
    $self_closing = in_array($tag, array('img','br')) ? ' /' : '';
    echo '<'.$tag.$classes.$tag_atts.$self_closing.'>'.$innerHTML;
    $this->status = 'opened';
  }

  //Close the tag of an element
  public function close() {
    if ($this->status === 'opened') { $this->status = 'closed'; }
    else { return; }
    $tag = $this->option_value('tag');
    if (!in_array($tag, array('img', 'br'))) { echo "</$tag>"; }
  }

  //PRIVATE: Apply string replacements (used on each post)
  private function apply_replacements(array $replacements, object $post, string $str) {
    foreach($replacements as $r) {
      $repl = $r;
      $matches = null;
      switch($r) {
        case '%site_title%': $repl = get_bloginfo('name'); break;
        case '%site_tagline%': $repl = get_bloginfo('description'); break;
        case '%site_url%': $repl = site_url(); break;
        case '%post_title%': $repl = $post->post_title; break;
        case '%post_slug%': $repl = $post->post_name; break;
        case '%post_id%': $repl = $post->ID; break;
        case '%post_permalink%': $repl = get_permalink($post); break;
        case '%author_id%': $repl = $post->post_author; break;
        case '%attachment_url%': $repl = $post->post_type === 'attachment' ? wp_get_attachment_url($post->ID) : wp_get_attachment_image_url(get_post_thumbnail_id($post), 'full'); break;
        case '%meta_key=(.*?)%':
          preg_match_all('/'.$r.'/', $str, $matches);
          if ($matches && count($matches)) { $r = $matches[0]; $repl = array_map(function($m) use($post) { return get_post_meta($post->ID, $m, true); }, $matches[1]); }
          break;
        case '%gallery=\[(.*?)\]%':
          global $_psc;
          $_psc->modules_init('lightbox');
          preg_match_all('/'.$r.'/', $str, $matches);
          if ($matches && count($matches)) { $r = $matches[0]; $repl = array_map(function($m) { return 'javascript:vid_lightbox({},'. $m .');';  }, $matches[1]); }
          break;
      }
      $str = str_replace($r, $repl, $str);
    }
    return $str;
  }

  //PRIVATE: Get post terms as links
  private function get_terms_links($layout_id, $post_id, $tax, $links = true, $join = ', ', $before = '') {
    $result = array();
    $array = wp_get_post_terms($post_id, $tax, array('fields' => 'id=>name'));
    foreach ($array as $key => $val) {
      if ($links) {
        $url = PSC::generate_custom_query_url(array('showcase' => $layout_id, 'post_type' => get_post_type($post_id), 'taxonomy' => $tax, 'term' => $key, 'order' => 'DESC', 'orderby' => 'date'));
        $result[] = "<a href=\"$url\">$before$val</a>";
      }
      else { $result[] = $val; }
    }
    $result = implode($join, $result);
    return $result;
  }
}
