<?php
add_action('add_meta_boxes', 'psc_add_metabox');
add_action('save_post', 'psc_metabox_save', 10, 3);

function psc_add_metabox() {
  global $_psc;
  $types = [];
  foreach ($_psc->metakeys as $k) {
    if (!$k->linked) { continue; }
    $add = $k->linked[0] === 'term' ? $k->linked[1] : 'post';
    if (!in_array($add, $types)) { $types[] = $add; }
  }
  foreach ($types as $type) { add_meta_box('showcase-creator-metabox', 'Order lists', 'psc_metabox', $type, 'side', 'high'); }
}

function psc_metabox($post) {
  global $_psc;
  ob_start(); ?>
  <div class="psc-flex-col psc-flex-gap-plus">
    <button class="button-secondary" onclick="pscMetaboxAssociations()"><?php PSC::_e('Put in associated lists'); ?></button>
  <?php
  foreach ($_psc->metakeys as $k) {
    $current = get_post_meta($post->ID, $k->prefix . $k->key, true);
    if ($current) { ?>
      <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center">
        <div class="psc-flex-col psc-flex-gap">
          <a href="<?php echo admin_url('admin.php'); ?>?page=showcase-creator-order&key=<?php echo $k->key; ?>&focus=<?php echo $post->ID; ?>" target="_blank"><?php echo $k->label; ?></a>
          <a href="javascript:void()" onclick="pscMetaboxUnlist('<?php echo $k->key; ?>')" class="submitdelete"><?php PSC::_e('Unlist'); ?></a>
        </div>
        <button class="button-secondary" onclick="pscMetaboxChange('<?php echo $k->key; ?>', <?php echo $current; ?>, event.target)"><?php PSC::_e('Current position: %s', $current); ?></button>
      </div><?php
    }
  }
  ob_end_flush();
}

function psc_metabox_save($post_id, $post, $update) {
  global $_psc;
  $auto_in = $update ? false : true;
  if (isset($_POST['psc_metabox_associated'])) { $auto_in = true; }
  foreach ($_psc->metakeys as $k) {
    if (isset($_POST['psc_metabox_unlist_' . $k->key])) { $k->list_remove_post($post_id); }
    else if (isset($_POST['psc_update_key_' . $k->key])) { $k->list_move_post($post_id, intval($_POST['psc_update_key_' . $k->key])); }
    else if ($auto_in && $k->linked) {
      if ($k->linked[0] === 'cat') {
        $terms = wp_get_object_terms($post_id, 'category', array('fields' => 'ids'));
        if (in_array($k->linked[1], $terms)) { $k->list_add_post($post_id); }
      }
      else if ($k->linked[0] === 'term') {
        if (!$k->linked[2] && !$k->linked[3]) { if ($post->post_type === $k->linked[1]) { $k->list_add_post($post_id); } }
        else {
          $terms = wp_get_object_terms($post->ID, $k->linked[2], array('fields' => 'ids'));
          if ($terms && $k->linked[3] && in_array($k->linked[3], $terms)) { $k->list_add_post($post_id); }
        }
      }
      else if ($k->linked[0] === 'author') { if ($k->linked[1] === intval($post->post_author)) { $k->list_add_post($post_id); } }
    }
  }
}
