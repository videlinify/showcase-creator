<?php
//UPDATE LAYOUTS REGISTER
add_action('wp_ajax_psc_update_layouts', 'psc_ajax_update_layouts');
function psc_ajax_update_layouts() {
  if (!isset($_POST['id']) && !isset($_POST['act'])) {
    wp_send_json(array('status' => 'error', 'comment' => PSC::__('Failed.')));
    wp_die();
    return;
  }
  $id = intval($_POST['id']);
  $action = $_POST['act'];
  $request = $_POST['req'];
  global $_psc;
  if ($action === 'copy') {
    $copy = $_psc->layouts[$id];
    $req = explode('_###_',$request);
    $copy['name'] = $req[0];
    $copy['slug'] = $req[1];
    $_psc->layouts[] = $copy;
    $_psc->update_layouts();
    wp_send_json(array('status' => 'success', 'comment' => PSC::__('Layout duplicated.')));
    wp_die();
    return;
  }
  if ($action === 'delete') {
    unset($_psc->layouts[$id]);
    $_psc->update_layouts();
    wp_send_json(array('status' => 'success', 'comment' => PSC::__('Layout deleted.')));
    wp_die();
    return;
  }
  wp_send_json(array('status' => 'error', 'comment' => PSC::__('Failed.')));
  wp_die();
  return;
}

//SAVE LAYOUT
add_action('wp_ajax_psc_save_layout', 'psc_ajax_save_layout');
function psc_ajax_save_layout() {
  global $_psc;
  $others = $_psc->layouts;
  if (isset($_POST['id'])) { unset($others[intval($_POST['id'])]); }
  $id = isset($_POST['id']) ? intval($_POST['id']) : (count($_psc->layouts) ? max(array_keys($_psc->layouts))+1 : 0);
  $error = '';
  if (PSC::find_value($others, 'slug', $_POST['slug'])) { $error = PSC::__('Failed to save layout. Slug must be unique.'); }
  if (!isset($_POST['items']) || !isset($_POST['css'])) { $error = PSC::__('Failed to save layout.'); }
  if ($error) { wp_send_json(array('status' => 'error', 'comment' => $error )); wp_die(); return; }
  $layout = array(
    'slug' => $_POST['slug'], 'name' => $_POST['name'],
    'items' => json_decode(stripslashes($_POST['items']), true),
    'css' => stripslashes($_POST['css']),
    'post_type' => $_POST['post_type']
  );
  if (PSC::layout_is_valid($layout)) {
    $_psc->layouts[$id] = $layout;
    $_psc->update_layouts();
  }
  else { wp_send_json(array('status' => 'error', 'comment' => PSC::__('Layout in not valid.') )); wp_die(); return; }
  wp_send_json(array('status' => 'success', 'comment' => PSC::__('Layout saved.') ));
  wp_die();
}

//SAVE PREVIEW LAYOUT
add_action('wp_ajax_psc_preview_layout', 'psc_ajax_preview_layout');
function psc_ajax_preview_layout() {
  $layout = array(
    'slug' => $_POST['slug'],
    'name' => $_POST['name'],
    'items' => json_decode(stripslashes($_POST['items']), true),
    'css' => stripslashes($_POST['css'])
  );
  global $_psc;
  $_psc->update_preview(array('slug' => $layout['slug'], 'name' => $layout['name'], 'items' => $layout['items'], 'css' => $layout['css']));
  wp_send_json(array('status' => 'success'));
  wp_die();
}

//IMPORT LAYOUTS
add_action('wp_ajax_psc_import_layouts', 'psc_ajax_import_layouts');
function psc_ajax_import_layouts() {
  global $_psc;
  $layouts = json_decode(stripslashes($_POST['layouts']), true);
  if (!$layouts || !is_array($layouts) || !count($layouts)) { wp_send_json(array('status' => 'error', 'comment' => PSC::__('No valid layouts.'))); wp_die(); return; }
  else if ($layouts && is_array($layouts)) {
    foreach($layouts as $k=>$v) {
      if (is_string($v)) { $layouts[$k] = json_decode($v, true); }
    }
  }
  $imported = $_psc->add_layouts($layouts);
  if (!count($imported)) { wp_send_json(array('status' => 'error', 'comment' => PSC::__('No valid layouts.'))); wp_die(); return; }
  $send = array();
  foreach($imported as $k=>$v) { $send[] = array('name' => $v['name'], 'slug' => $v['slug'], 'id' => $k); }
  wp_send_json(array('status' => 'success', 'comment' => count($imported) === 1 ? PSC::__('1 layout imported.') : PSC::__('%s layouts imported.', count($imported)), 'imported' => $send));
  wp_die();
}

//UPDATE META KEY REGISTER
add_action('wp_ajax_psc_update_key', 'psc_ajax_update_key');
function psc_ajax_update_key() {
  global $_psc;
  $key = $_POST['key'];
  $action = $_POST['act'];
  $request = PSC::string_is_json(stripslashes($_POST['req'])) ? json_decode(stripslashes($_POST['req'])) : $_POST['req'];
  $success = false;
  $respond = '';
  $rq_key = PSC::find_value($_psc->metakeys, 'key', $key);
  //Link a meta key
  if ($action === 'link') {
    $result = $rq_key->link($request[0], $request[1], $request[2]);
    if ($result) { $success = true; $respond = PSC::__('Order list %2$s (%1$s) was associated with: %3$s', $rq_key->key, $rq_key->label, $result_str); }
    else { $respond = PSC::__('Failed to associate %2$s (%1$s) or already associated with the same category / term / author.', $rq_key->key, $rq_key->label); }
  }
  else if ($action === 'add') {
    if ($request) {
      if (!PSC_MetaKey::exists($request[0], $request[1])) {
        $_psc->metakeys[] = PSC_MetaKey::register(array('key' => $request[0], 'label' => $request[1]));
        $result = $_psc->update_metakeys();
        if ($result) { $success = true; $respond = PSC::__('Order list %2$s (%1$s) added.', $request[0], $request[1]); }
        else { $respond = PSC::__('Failed to add %2$s (%1$s).', $request[0], $request[1]); }
      }
      else { $respond = PSC::__('An order list with such a key (%1$s) or label (%2$s) already exists.', $request[0], $request[1]); }
    }
    else { $respond = PSC::__('Empty request.'); }
  }
  else if ($action === 'rename') {
    if ($rq_key) {
      $old_label = $rq_key->label;
      $result = $rq_key->rename($request[0], $request[1]);
      if ($result) { $success = true; $respond = PSC::__('Order list %2$s (%1$s) was renamed to %4$s (%3$s).', $key, $old_label, $rq_key->key, $rq_key->label); }
      else { $respond = PSC::__('Failed to rename %2$s (%1$s).', $rq_key->key, $rq_key->label); }
    } else { $respond = PSC::__('No such order list was found.'); }
  }
  else if ($action === 'remove') {
    if ($rq_key) {
      $result = $rq_key->delete();
      if ($result) { $success = true; $respond = PSC::__('%2$s (%1$s) was removed.', $rq_key->key, $rq_key->label); }
      else { $respond = PSC::__('Failed to remove %2$s (%1$s).', $rq_key->key, $rq_key->label); }
    }
  }
  else if ($action === 'unlink') {
    $result = $rq_key->unlink($request);
    if ($result) { $success = true; $respond = PSC::__('Association '. ($request ? 'and post order ' : '') .'cleared for %2$s (%1$s).', $rq_key->key, $rq_key->label); }
    else { $respond = PSC::__('Failed to clear association for %2$s (%1$s).', $rq_key->key, $rq_key->label); }
  }
  else if ($action === 'order' && $key) {
    $ids = explode(',', $request);
    $rq_key->update_order($ids);
    $result = $success = true;
    $respond = PSC::__('Order list %2$s (%1$s) was saved.', $rq_key->key, $rq_key->label);
  }
  else if ($action === 'import' && $key) { $_psc->import_order_list($key, $request); }
  if ($action === 'wipedata') {
    $result = delete_post_meta_by_key($rq_key->prefix . $rq_key->key);
    if ($result) { $success = true; $respond .= PSC::__('Post order was cleared.'); }
    else { $respond = PSC::__('The order list is empty.'); }
  }
  if ($success) { wp_send_json(array('status' => 'success', 'comment' => $respond, 'result' => $result)); }
  else { wp_send_json(array('status' => 'error', 'comment' => $respond, 'result' => $result)); }
  wp_die();
}

//IMPORT ORDER LISTS
add_action('wp_ajax_psc_import_order_lists', 'psc_ajax_import_order_lists');
function psc_ajax_import_order_lists() {
  global $_psc;
  $data = json_decode(stripslashes($_POST['lists']), true);
  if (!$data || !is_array($data) || !count($data)) { wp_send_json(array('status' => 'error', 'comment' => PSC::__('No valid order lists found.'))); wp_die(); return; }
  $imported = $_psc->import_order_lists($data);
  if (!is_array($imported) || !count($imported)) { wp_send_json(array('status' => 'error', 'comment' => PSC::__('No valid order lists found or posts are missing.'))); wp_die(); return; }
  else { wp_send_json(array('status' => 'success', 'comment' => count($imported) === 1 ? PSC::__('1 order list imported.') : PSC::__('%s order lists imported.', count($imported)))); }
  wp_die();
}

//UPDATE SETTINGS
add_action('wp_ajax_psc_update_settings', 'psc_ajax_update_settings');
function psc_ajax_update_settings() {
  $settings = json_decode(str_replace('\\','',$_POST['settings']),true);
  if (is_array($settings)) {
    global $_psc;
    $_psc->settings = $settings;
    $_psc->update_settings();
    wp_send_json(array('status' => 'success', 'comment' => PSC::__('Settings updated.') ));
  }
  else { wp_send_json(array('status' => 'error', 'comment' => PSC::__('Failed to update settings.'), 'test' => $_POST['settings'] )); }
  wp_die();
}
