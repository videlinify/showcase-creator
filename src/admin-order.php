<?php
function psc_order_page() {
  global $_psc;
  $postdata = $_psc->get_data(array('types', 'taxs', 'terms', 'authors', 'metakeys'));
  $_psc->modules_init('hint', 'input', 'number', 'select', 'toggle', 'dialog', 'loading', 'dynamic-text', 'context-menu', 'content-switch', 'file-list', 'items-list', 'post-order');
  $_psc->localize_script('post-order', 'PSC_DATA', $postdata);
  $keys = array();
  foreach ($_psc->metakeys as $k) { $keys[] = array($k->key, $k->label.' ('.$k->key.')'); }
  $key = isset($_GET['key']) ? $_GET['key'] : (count($keys) ? $keys[0][0] : null);
  if (isset($_GET['focus'])) { echo '<input type="hidden" id="psc-get-focus" value="'. $_GET['focus'] .'" />'; }
  ?>
  <div class="psc-relative" style="margin-right: 20px;">
    <h1 class="psc-title-font psc-title"><?php PSC::_e('Showcase Creator'); ?></h1>
    <h2 class="psc-subtitle"><?php PSC::_e('Manually order posts'); ?></h2>
    <a class="button-secondary psc-help-btn" href="https://videlinify.com/showcase-creator/doc/#order-lists" target="_blank"><?php PSC::_e('Documentation'); ?></a>
  </div>
  <div class="psc-admin-container column">
    <div class="psc-admin-box row psc-flex-justify-space">
      <div class="psc-flex-row psc-flex-align-center psc-flex-gap-extra">
        <div class="psc-flex-col psc-flex-gap">
          <div class="psc-flex-row psc-flex-gap">
            <?php psc_dropdown(array('options' => $keys, 'value_key' => 0, 'label_key' => 1, 'name' => 'key', 'selected' => $key, 'id' => 'key')); ?>
          </div>
          <div class="psc-flex-row psc-flex-justify-space mk-flex-gap">
            <div class="psc-flex-row psc-flex-gap">
              <button id="mk-rename-btn" class="button-secondary"><?php PSC::_e('Rename'); ?></button>
              <button id="mk-add-btn" class="button-secondary"><?php PSC::_e('Add'); ?></button>
            </div>
            <div class="psc-flex-row psc-flex-gap">
              <button id="mk-remove-btn" class="button-secondary is-destructive"><?php PSC::_e('Remove'); ?></button>
            </div>
          </div>
        </div>
        <div id="key-link-wrapper" class="psc-flex-col psc-flex-gap">
          <div class="psc-flex-row psc-flex-justify-center">
            <span><strong><?php PSC::_e('Associate the list'); ?></strong></span>
            <span class="vid-hint-auto"><?php PSC::_e('By associating the list, posts related to that association goes automatically in that list when published.'); ?></span>
          </div>
          <div id="key-link-state" class="psc-flex-row psc-flex-gap-extra">
            <div id="key-linked" class="psc-flex-row psc-flex-gap-extra">
              <div class="psc-flex-col psc-flex-gap">
                <label><?php PSC::_e('Associated with'); ?>:<br><em><strong><span id="key-linked-to"></span></strong></em></label>
                <button id="mk-unlink-btn" class="button-secondary is-destructive"><?php PSC::_e('Unassociate'); ?></button>
              </div>
              <div class="psc-flex-col psc-flex-gap">
                <label for="mk-wipedata"><span style="color: #b32d2e;"><?php PSC::_e('Clear metadata?'); ?></span>
                  <span class="vid-hint-auto"><?php PSC::_e('If checked, clearing the association will delete the post order for the selected list.'); ?></span></label>
                <input type="checkbox" id="mk-wipedata" checked="true">
              </div>
            </div>
            <div id="key-unlinked" class="psc-flex-col psc-flex-gap psc-flex-align-center">
              <label><?php PSC::_e('Not associated yet.'); ?></label>
              <button id="mk-link-btn" class="button-secondary"><?php PSC::_e('Associate'); ?></button>
            </div>
          </div>
        </div>
        <div id="mk-link-dialog" class="psc-flex-col psc-width-max-content psc-flex-gap-extra">
          <div class="psc-flex-row psc-flex-gap-extra">
            <div class="psc-flex-col psc-flex-gap-plus">
              <div class="psc-flex-row psc-flex-align-center"><input id="mk-link-to-cat" type="radio" value="cat">
              <label for="mk-link-to-cat"><?php PSC::_e('a category'); ?></label></div>
              <div class="psc-flex-row psc-flex-align-center"><input id="mk-link-to-term" type="radio" value="term">
              <label for="mk-link-to-term"><?php PSC::_e('a custom term'); ?></label></div>
              <div class="psc-flex-row psc-flex-align-center"><input id="mk-link-to-author" type="radio" value="author">
              <label for="mk-link-to-author"><?php PSC::_e('an author'); ?></label></div>
              <div class="psc-flex-row psc-flex-align-center"><input id="mk-link-to-unlink" type="radio" value="">
              <label for="mk-link-to-unlink"><?php PSC::_e('(unassociated)'); ?></label></div>
            </div>
            <div id="mk-link-to-container" class="psc-flex-row psc-flex-gap" style="position: relative;">
              <div id="mk-link-cat-container" class="psc-flex-col psc-flex-gap">
                <label for="mk-link-cat"><?php PSC::_e('Category'); ?></label>
                <?php psc_dropdown(array('id' => 'mk-link-cat',
                  'options' => PSC::filter_value($postdata['terms'], 'taxonomy', 'category'),
                  'label_key' => 'name', 'value_key' => 'term_id')); ?>
              </div>
              <div id="mk-link-term-container" class="psc-flex-col psc-flex-gap">
                <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
                  <label for="mk-link-type"><?php PSC::_e('Post type'); ?></label>
                  <?php psc_dropdown(array('id' => 'mk-link-type',
                    'options' => $postdata['types'],
                    'label_key' => 'label', 'value_key' => 'name')); ?>
                </div>
                <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
                  <label for="mk-link-tax"><?php PSC::_e('Taxonomy'); ?></label>
                  <?php psc_dropdown(array('id' => 'mk-link-tax',
                    'options' => array(array('label' => 'Any taxonomy', 'name' => '')),
                    'label_key' => 'label', 'value_key' => 'name')); ?>
                </div>
                <div class="psc-flex-row psc-flex-justify-space psc-flex-align-center psc-flex-gap">
                  <label for="mk-link-term"><?php PSC::_e('Term'); ?></label>
                  <?php psc_dropdown(array('id' => 'mk-link-term',
                    'options' => array(array('name' => PSC::__('Any term'), 'term_id' => 0)),
                    'label_key' => 'name', 'value_key' => 'term_id')); ?>
                </div>
              </div>
              <div id="mk-link-author-container" class="psc-flex-col psc-flex-gap">
                <label for="mk-link-author"><?php PSC::_e('Author'); ?></label>
                <?php psc_dropdown(array('id' => 'mk-link-author',
                  'options' => $postdata['authors'],
                  'label_key' => 'name', 'value_key' => 'id')); ?>
              </div>
            </div>
          </div>
          <div class="psc-flex-row psc-flex-justify-center">
            <div class="psc-flex-col psc-flex-gap">
              <label for="mk-link-pos"><?php PSC::_e('New posts position'); ?></label>
              <div class="psc-flex-row psc-flex-gap psc-flex-justify-center">
                <?php psc_dropdown(array('id' => 'mk-link-pos', 'options' => array(
                  array(PSC::__('First'), 0), array(PSC::__('Last'), -1), array(PSC::__('Custom'), 'custom')),
                  'label_key' => 0, 'value_key' => 1 )); ?>
                <input id="mk-link-pos-custom" type="number" min="0" step="1" value="" placeholder="<?php PSC::_e('position new posts at #'); ?>">
              </div>
              <button id="mk-link-submit" class="button-secondary"><?php PSC::_e('Associate'); ?></button>
            </div>
          </div>
        </div>
      </div>
      <div class="psc-flex-row psc-flex-gap psc-flex-align-center">
        <button id="save-order" class="button-primary"><?php PSC::_e('Save order'); ?></button>
      </div>
    </div>
    <div id="psc-main" class="psc-admin-box psc-resizable-parent">
      <div id="psc-order" class="psc-flex-col psc-flex-gap psc-resizable">
        <h3><?php PSC::_e('Order list'); ?></h3>
        <div id="psc-order-btns" class="psc-flex-row psc-flex-gap">
          <button id="select-1" class="button-secondary"><?php PSC::_e('Select'); ?></button>
          <button id="reverse-1" class="button-secondary"><?php PSC::_e('Reverse'); ?></button>
          <button id="remove-1" class="button-secondary is-destructive"><?php PSC::_e('Remove'); ?></button>
        </div>
        <div id="psc-order-list"></div>
      </div>
      <div id="psc-resizer" class="psc-resizer"></div>
      <div id="psc-extra" class="psc-flex-col psc-flex-gap psc-resizable">
        <h3><?php PSC::_e('Search for posts to add'); ?></h3>
        <div id="psc-extra-filters" class="psc-flex-col">
          <div id="filter-switches" class="psc-flex-row psc-flex-wrap psc-flex-gap">
            <div><?php PSC::_e('Filter by:') ?></div>
            <div><input id="term-switch" type="checkbox" class="psc-switch" checked><label for="term-switch"><?php PSC::_e('Taxonomy'); ?></label></div>
            <div><input id="date-switch" type="checkbox" class="psc-switch"><label for="date-switch"><?php PSC::_e('Date'); ?></label></div>
            <div><input id="author-switch" type="checkbox" class="psc-switch"><label for="author-switch"><?php PSC::_e('Author'); ?></label></div>
            <div><input id="search-switch" type="checkbox" class="psc-switch"><label for="search-switch"><?php PSC::_e('Search'); ?></label></div>
          </div>
          <div id="filter-controls" class="psc-flex-row psc-flex-wrap psc-flex-gap psc-margin-bottom">
            <div id="term-controls" class="psc-flex-row psc-flex-wrap psc-flex-gap"></div>
            <div id="date-controls" class="psc-flex-row psc-flex-wrap psc-flex-gap"></div>
          </div>
          <button id="filter-btn" class="button-secondary wide" style="align-self: flex-start;"><?php PSC::_e('Load posts'); ?></button>
        </div>
        <div id="psc-extra-btns" class="psc-flex-row psc-flex-gap">
          <button id="add-2" class="button-secondary"><?php PSC::_e('Add'); ?></button>
          <button id="select-2" class="button-secondary"><?php PSC::_e('Select'); ?></button>
          <button id="reverse-2" class="button-secondary"><?php PSC::_e('Reverse'); ?></button>
          <button id="remove-2" class="button-secondary is-destructive"><?php PSC::_e('Remove'); ?></button>
          <div class="vid-hint-auto"><?php PSC::_e('Actions can be applied to selected items if any, otherwise to the entire list'); ?></div>
        </div>
        <div id="psc-extra-list"></div>
      </div>
    </div>
  </div>
  <?php
}
