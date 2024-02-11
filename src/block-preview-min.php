<?php
ob_start(); ?>
<html <?php language_attributes(); ?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">
  </head>
  <body <?php body_class(); ?>><?php
    $url = $_SERVER['REQUEST_URI'];
    parse_str(parse_url($url, PHP_URL_QUERY), $query);
    unset($query['showcase_creator_block_preview']);
    $passed_atts = isset($_POST['attributes']) ? json_decode(stripslashes($_POST['attributes']), true) : array();
    $atts = array_merge($passed_atts, $query);
    global $_psc;
    $layout = $_psc->get_layout($atts['layout']);
    $layout = new PSC_Layout($atts['layout'], $layout); ?>
    <style id="psc-layout-css"><?php echo $layout->get_css(''); ?></style>
    <div id="psc-layout-html">
      <?php psc__render($atts); ?>
    </div>
  </body>
</html>
<?php
ob_end_flush();
