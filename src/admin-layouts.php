<?php
function psc_layouts_page() {
  global $_psc;
  $layouts = $_psc->layouts;
  if (isset($_GET['action']) && ($_GET['action'] === 'create' || $_GET['action'] === 'edit')) {
    $layout_id = isset($_GET['layout']) ? intval($_GET['layout']) : null;
    psc_edit_layout($layout_id);
  }
  else {
    if (!isset($_GET['action'])) {
      psc_list_layouts();
    }
  }
}

function psc_list_layouts() {
  global $_psc;
  $layouts = $_psc->layouts;
  $_psc->modules_init('input', 'toggle', 'select', 'dialog', 'loading', 'file-list', 'items-list', 'layouts-listing');
  ?>
  <h1 class="psc-title-font psc-title"><?php PSC::_e('Showcase Creator'); ?></h1>
  <h2 class="psc-subtitle"><?php PSC::_e('Select layout'); ?></h2>
  <div id="psc-layouts-listing-wrapper" class="psc-admin-container column">
    <div class="psc-flex-row psc-flex-grow">
      <div class="psc-flex-row psc-flex-align-center psc-flex-gap-plus psc-margin-auto-left">
        <label for="preview-toggle"><?php PSC::_e('Load layout preview?'); ?></label>
        <input id="preview-toggle" type="checkbox" checked>
      </div>
    </div>
    <div class="psc-flex-row psc-flex-gap-plus">
      <div class="psc-flex-grow">
        <div id="layouts-container" class="psc-admin-box wide">
          <div id="layouts-list"></div>
          <a id="add-new-layout-btn" class="button-primary" href="<?php echo admin_url('admin.php?page=showcase-creator-layouts&action=create'); ?>"><?php PSC::_e('Add new layout'); ?></a>
        </div>
        <div class="psc-flex-row psc-flex-justify-end psc-margin-top"><button id="import-btn" class="button-secondary wide"><?php PSC::_e('Import from file'); ?></button></div>
      </div>
      <div id="layout-preview">
        <div class="psc-admin-box wide">
          <iframe id="preview-frame" src=""></iframe>
        </div>
      </div>
    </div>
  </div>
  <?php
}

function psc_edit_layout($id) {
  global $_psc;
  $layout = isset($_psc->layouts[$id]) ? array_merge(array('id' => $id), $_psc->layouts[$id]) : null;
  wp_enqueue_code_editor(array('type' => 'text/css'));
  $_psc->modules_init('input', 'number', 'toggle', 'select', 'tokens', 'context-menu', 'dialog', 'loading', 'hint', 'items-list', 'color-picker', 'layout-builder');
  if ($layout) { $_psc->localize_script('layout-builder', 'PSC_LAYOUT', $layout); }
  ?>
  <h1 class="psc-title-font psc-title"><?php PSC::_e('Showcase Creator'); ?></h1>
  <h2 class="psc-subtitle"><?php PSC::_e('Layout builder'); ?></h2>
  <div class="psc-admin-container column">
    <div id="layout-options" class="psc-admin-box row psc-flex-gap-plus">
      <div class="psc-flex-col psc-flex-gap">
        <label for="layout-name"><?php PSC::_e('Layout name') ?></label>
        <input id="layout-name" type="text" name="layoutname" />
      </div>
      <div class="psc-flex-col psc-flex-gap">
        <label for="layout-slug"><?php PSC::_e('Layout slug') ?></label>
        <input id="layout-slug" type="text" name="layoutslug" disabled />
      </div>
      <div class="psc-flex-col psc-flex-gap">
        <label for="slug-generator"><?php PSC::_e('Generate slug?') ?></label>
        <input id="slug-generator" type="checkbox" checked />
      </div>
      <div class="psc-flex-col psc-flex-gap">
        <label for="for-post-type"><?php PSC::_e('Recommended post type'); ?></label>
        <?php psc_dropdown(array('id' => 'for-post-type',
          'options' => [['label' => PSC::__('Not specified'), 'name' => ''], ...$_psc->get_data('types')['types']],
          'label_key' => 'label', 'value_key' => 'name')); ?>
      </div>
      <div class="psc-flex-row psc-flex-gap psc-flex-grow psc-flex-justify-end psc-flex-align-center">
        <button id="to-file-button" class="button-secondary"><?php PSC::_e('Save to file'); ?></button>
        <form method="GET" id="delete-layout-form">
          <input type="hidden" name="page" value="psc-layouts">
          <input type="hidden" id="layout-id" name="layout" value="<?php echo $id; ?>">
          <input type="hidden" name="action" value="delete">
          <input type="submit" id="trash-button" class="button-secondary is-destructive wide" value="<?php PSC::_e('Delete'); ?>"<?php echo isset($layout) ? '' : ' disabled'; ?>>
        </form>
        <button id="save-button" class="button-primary wide" data-url="<?php echo admin_url('admin-ajax.php'); ?>"><?php PSC::_e('Save'); ?></button>
      </div>
    </div>
    <div id="layout-builder" class="psc-admin-box psc-resizable-parent">
      <div id="constructor" class="psc-flex-col psc-flex-gap psc-resizable">
        <h3><?php PSC::_e('Constructor'); ?></h3>
        <div id="items-list"></div>
      </div>
      <div id="psc-resizer" class="psc-resizer"></div>
      <div id="style-editor" class="psc-flex-col psc-flex-gap psc-resizable">
        <h3><?php PSC::_e('Style editor'); ?></h3>
        <div class="psc-flex-col psc-flex-gap psc-padding">
          <div class="psc-flex-row psc-flex-justify-space">
            <button id="media-query-btn" class="button-secondary">&#128241; <?php PSC::_e('Add a media query'); ?></button>
            <button id="color-picker-btn" class="button-secondary">&#127912; <?php PSC::_e('Color picker'); ?></button>
            <button id="add-css-btn" class="button-secondary">&#10151; <?php PSC::_e('Add a special CSS selector'); ?></button>
          </div>
        </div>
        <div id="code-wrapper" class="psc-flex-col psc-flex-gap psc-padding" style="height: 100%;">
          <div><?php _e("You can use '_slug' as a substitude of the layout's slug.", 'posts-showcase-creator'); ?></div>
          <textarea id="code-editor"><?php if (isset($layout['css'])) { echo $layout['css']; } ?></textarea>
        </div>
      </div>
    </div>
  </div>
  <?php
}
