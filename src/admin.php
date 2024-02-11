<?php
require_once PSC_PATH . 'src/admin-ajax.php';
require_once PSC_PATH . 'src/admin-info.php';
require_once PSC_PATH . 'src/admin-layouts.php';
require_once PSC_PATH . 'src/admin-order.php';
require_once PSC_PATH . 'src/admin-settings.php';

function psc_create_menu() {
  add_menu_page('Showcase Creator', 'Showcase Creator', 'manage_options', 'showcase-creator', 'psc_info_page', 'dashicons-slides', 26);
}

function psc_create_layouts_submenu() {
  add_submenu_page('showcase-creator', 'Showcase Creator > Layouts', 'Layouts', 'manage_options', 'showcase-creator-layouts', 'psc_layouts_page');
}

function psc_create_order_submenu() {
  add_submenu_page('showcase-creator', 'Showcase Creator > Order posts', 'Order posts', 'manage_options', 'showcase-creator-order', 'psc_order_page');
}

function psc_create_settings_submenu() {
  add_submenu_page('showcase-creator', 'Showcase Creator > Settings', 'Settings', 'manage_options', 'showcase-creator-settings', 'psc_settings_page');
}

add_action('admin_menu','psc_create_menu');
add_action('admin_menu','psc_create_layouts_submenu');
add_action('admin_menu','psc_create_order_submenu');
add_action('admin_menu','psc_create_settings_submenu');

/*
 * Function: psc_dropdown
 * Creates a drop-down
 * $args (associative array):
 *  options => provide array to populate the drop down
 *  value_key => key in the options array to use for options value (eg. 'value'), default = 0
 *  label_key => key in the options array to use for options label (eg. 'label'), default = 0
 *  name => name of the select element
 *  selected => value of the currently selected item
 *  class => css class of the select element
 *  id => id of the select element
 *  required => whether is required
 *  no_items_text => text to be displayed when no items in the drop down
 *  placeholder => placeholder
 *  select_attributes => provide an associative array to add custom attributes to the select element. (eg. data-attr => "attr_value")
 *  options_attributes => provide an associative array to search the Options array for, and add it to the HTML tag (eg. 'attr_name' => 'key_from_options_array').
 */

function psc_dropdown($args) {
  ob_start();
  if (!isset($args['value_key'])) { $args['value_key'] = 0; }
  if (!isset($args['label_key'])) { $args['label_key'] = 0; }
  $atts = '';
  if (array_key_exists('select_attributes',$args) && is_array($args['select_attributes'])) {
    foreach ($args['select_custom_atts'] as $k=>$v) { $atts .= ' '.$k.'="'.$v.'"'; }
  }
  echo sprintf('<select%1$s%2$s%3$s%4$s%5$s>',
    isset($args['name']) ? ' name="'. $args['name'].'"' : '',
    isset($args['class']) ? ' class="'. $args['class'] .'"' : '',
    isset($args['id']) ? ' id="'. $args['id'] .'"' : '',
    isset($args['required']) && $args['required'] === true ? ' required' : '',
    $atts);
  if (isset($args['options']) && is_array($args['options'])) {
    if (!count($args['options']) && isset($args['no_items_text'])) { echo '<option value="" disabled hidden selected>'.(isset($args['no_items_text']) ? $args['no_items_text'] : '').'</option>'; }
    else {
      if (isset($args['placeholder'])) { echo '<option class="psc-option-placeholder" value="" disabled hidden selected>'.$args['placeholder'].'</option>'; }
      foreach ($args['options'] as $option) {
        if (is_array($option)) {
          $value = isset($option[$args['value_key']]) ? $option[$args['value_key']] : $option[array_key_first($option)];
          $label = isset($option[$args['label_key']]) ? $option[$args['label_key']] : $option[array_key_first($option)];
        }
        else { $value = $label = $option; }
        if (isset($args['selected'])) { $selected = $args['selected'] === $value || $args['selected'] === $label ? ' selected' : ''; }
        else { $selected = ''; }
        $atts = '';
        if (isset($args['options_attributes']) && is_array($args['options_attributes'])) {
          foreach ($args['options_attributes'] as $k => $v) {
            if (is_array($option) && isset($option[$v])) { $atts .= ' '.$k.'="'.$option[$v].'"'; }
          }
        }
        echo '<option value="'.$value.'"'.$atts.''.$selected.'>'.$label.'</option>';
      }
    }
  }
  echo '</select>';
  ob_end_flush();
}
