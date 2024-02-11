<?php
function psc_settings_page() {
  global $_psc;
  $_psc->modules_init('input', 'number', 'select', 'toggle', 'color-picker', 'dialog', 'loading', 'items-list', 'file-list', 'settings');
  $_psc->localize_script('settings', 'PSC_SETTINGS', $_psc->settings);
  if (isset($_POST['restore_settings'])) { echo '<span class="psc-fade-message">'.$_psc->restore_settings().'</span>'; }
  if (isset($_POST['restore_layouts'])) { echo '<span class="psc-fade-message">'.$_psc->restore_layouts().'</span>'; }
  if (isset($_POST['clear_keys'])) { echo '<span class="psc-fade-message">'.$_psc->clear_keys().'</span>'; }
  if (isset($_POST['clear_layouts'])) { echo '<span class="psc-fade-message">'.$_psc->clear_layouts().'</span>'; }
  $layouts = array();
  foreach ($_psc->layouts as $id => $l) { $layouts[] = array($l['name'], $id); } ?>
  <h1 class="psc-title-font psc-title"><?php PSC::_e('Showcase Creator'); ?></h1>
  <h2 class="psc-subtitle"><?php PSC::_e('Settings'); ?></h2>
    <div class="psc-admin-container">
      <div class="psc-admin-box">
        <h3><?php PSC::_e('Integration'); ?></h3>
        <div class="psc-flex-col psc-flex-gap-plus">
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="integration_search"><?php PSC::_e('Replace WP search queries'); ?></label>
            <input id="integration_search" name="integration_search" type="checkbox" <?php echo $_psc->settings['integrate']['search'] ? 'checked' : ''; ?>>
          </div>
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="integration_tax"><?php PSC::_e('Replace WP category view<br>(also tags and other terms)'); ?></label>
            <input id="integration_tax" name="integration_tax" type="checkbox" <?php echo $_psc->settings['integrate']['tax'] ? 'checked' : ''; ?>>
          </div>
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="integration_author"><?php PSC::_e('Replace WP author page'); ?></label>
            <input id="integration_author" name="integration_author" type="checkbox" <?php echo $_psc->settings['integrate']['author'] ? 'checked' : ''; ?>>
          </div>
        </div>
        <div class="psc-flex-col psc-flex-gap" style="margin-top: 20px;">
          <label><?php PSC::_e('Select a layout to display the results'); ?></label>
          <?php psc_dropdown(array('id' => 'integration_layout', 'name' => 'integration_layout', 'options' => $layouts, 'label_key' => 0, 'value_key' => 1, 'selected' => $_psc->settings['integrate']['layout'])); ?>
        </div>
      </div>
      <div class="psc-admin-box">
        <h3><?php PSC::_e('Lightbox'); ?></h3>
        <div class="psc-flex-col psc-flex-gap-plus">
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="lightbox_colorLight"><?php PSC::_e('Light color'); ?></label>
            <input name="lightbox_colorLight" type="color" id="lightbox_colorLight" value="<?php echo $_psc->settings['lightbox']['light']; ?>">
          </div>
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="lightbox_colorDark"><?php PSC::_e('Dark color'); ?></label>
            <input name="lightbox_colorDark" type="color" id="lightbox_colorDark" value="<?php echo $_psc->settings['lightbox']['dark']; ?>">
          </div>
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="lightbox_alphaValue"><?php PSC::_e('Alpha value'); ?></label>
            <input name="lightbox_alphaValue" type="number" min="0" max="1" step="0.01" id="lightbox_alphaValue" value="<?php echo $_psc->settings['lightbox']['alpha']; ?>">
          </div>
          <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
            <label for="lightbox_enableZoom"><?php PSC::_e('Enable zoom?'); ?></label>
            <input name="lightbox_enableZoom" type="checkbox" id="lightbox_enableZoom" <?php echo $_psc->settings['lightbox']['zoom'] ? 'checked' : ''; ?>>
          </div>
        </div>
      </div>
      <div style="flex-grow: 1;"></div>
      <div class="psc-admin-box psc-flex-gap-extra">
        <h3><?php PSC::_e('Import/Export'); ?></h3>
        <button id="export-layouts" class="button-secondary"><?php PSC::_e('Export layouts'); ?></button>
        <button id="import-layouts" class="button-secondary"><?php PSC::_e('Import layouts'); ?></button>
        <button id="export-metakeys" class="button-secondary"><?php PSC::_e('Export order lists'); ?></button>
        <button id="import-metakeys" class="button-secondary"><?php PSC::_e('Import order lists'); ?></button>
      </div>
      <div class="psc-admin-box psc-flex-gap-extra">
        <h3><?php PSC::_e('Restore/Remove'); ?></h3>
        <form id="restore_default_layouts" action="" method="post">
          <input type="hidden" name="restore_layouts">
          <button id="restore_default_layouts_submit" class="button-secondary is-destructive" data-ask="<?php PSC::_e('Are you sure you want to add the default layouts to your layouts list?'); ?>"><?php PSC::_e('Restore default layouts'); ?></button>
        </form>
        <form id="clear_all_layouts" action="" method="post">
          <input type="hidden" name="clear_layouts">
          <button id="clear_all_layouts_submit" class="button-secondary is-destructive" data-ask="<?php PSC::_e('All layouts will be erased. This cannot be undone. Are you sure?'); ?>"><?php PSC::_e('Delete all layouts'); ?></button>
        </form>
        <form id="clear_all_keys" action="" method="post">
          <input type="hidden" name="clear_keys">
          <button id="clear_all_keys_submit" class="button-secondary is-destructive" data-ask="<?php PSC::_e('Remove all order lists created with this plugin. All post sorting data will be lost. Are you sure you want to continue?'); ?>"><?php PSC::_e('Delete all order lists'); ?></button>
        </form>
        <form id="restore_default_settings" action="" method="post">
          <input type="hidden" name="restore_settings">
          <button id="restore_default_settings_submit" class="button-secondary is-destructive" data-ask="<?php PSC::_e('All settings will be restored to default. Are you sure you want to continue?'); ?>"><?php PSC::_e('Restore default settings'); ?></button>
        </form>
      </div>
    </div>
    <button id="update-settings" class="button-primary"><?php PSC::_e('Update settings'); ?></button>
  <?php
}
