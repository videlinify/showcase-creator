<?php
function psc__block_init() {
  register_block_type(PSC_PATH . 'block/build');
}
add_action('init', 'psc__block_init');
