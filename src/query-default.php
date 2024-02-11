<?php
if (wp_is_block_theme()) {
  ?>
  <html <?php language_attributes(); ?>>
    <head>
      <meta charset="<?php bloginfo( 'charset' ); ?>">
      <?php wp_head(); ?>
    </head>
    <body <?php body_class(); ?>>
      <?php wp_body_open(); ?>
      <div class="wp-site-blocks">
        <header class="wp-block-template-part site-header">
          <?php block_header_area(); ?>
        </header>
        <?php echo psc_default_query_template(); ?>
        <footer class="wp-block-template-part site-footer">
          <?php block_footer_area(); ?>
        </footer>
      </div>
    <?php wp_footer(); ?>
    </body>
  </html>
  <?php
}
else {
  get_header();
  echo psc_default_query_template();
  get_footer();
}
