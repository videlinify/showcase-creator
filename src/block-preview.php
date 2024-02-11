<?php
ob_start(); ?>
<html <?php language_attributes(); ?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <?php wp_head(); ?>
  </head>
  <body <?php body_class(); ?>>
    <?php wp_body_open();
    $url = $_SERVER['REQUEST_URI'];
    parse_str(parse_url($url, PHP_URL_QUERY), $query);
    unset($query['showcase_creator_block_preview']);
    $passed_atts = isset($_POST['attributes']) ? json_decode(stripslashes($_POST['attributes']), true) : array();
    $atts = array_merge($passed_atts, $query); ?>
    <div id="psc-layout-html">
      <?php psc__render($atts); ?>
    </div>
    <?php wp_footer(); ?>
  </body>
</html>
<?php
ob_end_flush();
