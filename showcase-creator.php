<?php
/**
 * Plugin Name:   Showcase Creator
 * Plugin URI:    https://videlinify.com
 * Description:   Provides tools to show posts in customized way. Create custom layouts and use the provided gutenberg block to filter posts and display them. The plugin also provides tools for custom ordering posts.
 * Version:       1.0
 * Requires PHP:  7.0
 * Author:        Videlin Djedjev
 * Author URI:    https://videlinify.com
 * License:       GPL-3.0-or-later
 * License URI:   https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:   showcase-creator
 */

define('PSC_PATH', plugin_dir_path(__FILE__));
define('PSC_URL', plugins_url('', __FILE__));

require_once PSC_PATH . 'src/classes.php';

global $_psc;
$_psc = new PSC('psc');

require_once PSC_PATH . 'src/metabox.php';
require_once PSC_PATH . 'src/admin.php';
require_once PSC_PATH . 'src/rest.php';
require_once PSC_PATH . 'src/frontend.php';
require_once PSC_PATH . 'block/block.php';

register_activation_hook(__FILE__, 'psc__install');
register_uninstall_hook(__FILE__, 'psc__uninstall');

//Remove plugin data on uninstall
function psc__uninstall() {
  delete_option('showcase_creator_activation');
  global $_psc;
  $_psc->clear_layouts();
  $_psc->clear_keys();
  $_psc->restore_settings();
  delete_option($_psc->prefix . '_preview');
}

//Add default layouts on first activation
function psc__install() {
  if (!get_option('showcase_creator_activation')) {
    add_option('showcase_creator_activation');
    update_option('showcase_creator_activation', date('Y-m-d'));
    global $_psc;
    if (!count($_psc->layouts)) { $_psc->restore_layouts(); }
  }
}
