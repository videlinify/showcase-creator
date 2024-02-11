<?php
//Function: Show navigation links
function psc_show_pagination($query) {
  if ($query->max_num_pages <= 1) { return; }
  $base = get_pagenum_link(1, false); ?>
  <div class="paging-navigation">
    <div class="nav-links">
      <?php echo paginate_links(array(
        'base' => $base . '%_%',
        'format' => (str_contains($base, '?') ? '&' : '?') . 'paged=%#%',
        'current' => max(1, get_query_var('paged')),
        'total' => max(1, $query->max_num_pages),
        'prev_text' => PSC::__('&laquo; Previous'),
        'next_text' => PSC::__('Next &raquo;')
      )); ?>
    </div>
  </div><?php
}

//Function: Check if query vars are set
function check_query_vars($vars, $and = false) {
  if (!is_array($vars)) { $vars = array($vars); }
  global $wp;
  $result = array();
  foreach($vars as $v) { $result[] = boolval(isset($wp->query_vars[$v])); }
  if ($and) { return !in_array(false, $result); }
  else { return in_array(true, $result); }
}

//Add some query vars
add_filter('query_vars', function ($vars) {
  $vars[] = 'showcase';
  $vars[] = 'author__in';
  $vars[] = 'author__not_in';
  $vars[] = 'posts_limit';
  $vars[] = 'posts_per_page';
  return $vars;
} );

//Rewrite rules and template redirect redirect
add_filter('generate_rewrite_rules', function ($wp_rewrite) { $wp_rewrite->rules = array_merge(['showcase/(\d+)/?' => 'index.php?showcase=$matches[1]'], $wp_rewrite->rules); });
add_filter('template_include', function ($template) {
  global $_psc;
  if (isset($_GET['showcase_creator_block_preview'])) {
    if ($_GET['showcase_creator_block_preview'] === 'min') { $template = PSC_PATH . 'src/block-preview-min.php'; }
    else { $template = PSC_PATH . 'src/block-preview.php'; }
  }
  else if (
    ($_psc->settings['integrate']['search'] && check_query_vars(array('search', 's'))) ||
    ($_psc->settings['integrate']['tax'] && check_query_vars(array('cat', 'term', 'tag', 'tag_id'))) ||
    ($_psc->settings['integrate']['author'] && check_query_vars(array('author', 'author_name'))) ||
    check_query_vars('showcase')) { $template = PSC_PATH . 'src/query-default.php'; }
  return $template;
});

//Function to replace default query template
function psc_default_query_template() {
  global $wp_query;
  global $_psc; ?>
  <div class="psc-posts"><?php
  psc_show_pagination($wp_query);
  $showcase = get_query_var('showcase');
  $layout = new PSC_Layout($showcase, $_psc->get_layout($showcase));
  $layout->print($wp_query);
  psc_show_pagination($wp_query); ?>
  </div><?php
}

//Render function
function psc__render($attributes) {
  $defaults = array('postType' => 'post', 'mimeTypes' => ["any"], 'taxRelation' => 'AND', 'taxQueries' => array(), 'ignoreSticky' => 1,
    'includePosts' => array(), 'includePostsWhere' => 'above', 'excludePosts' => array(), 'topLevelOnly' => 0, 'includeInParents' => array(),
    'excludeInParents' => array(), 'author' => '', 'includeAuthors' => array(), 'excludeAuthors' => array(), 'postsToDisplay' => '-1',
    'order' => 'DESC', 'orderBy' => 'date', 'orderList' => '', 'metaKey' => '', 'metaValue' => '', 'layout' => '0', 'pagination' => 'below',
    'postsPerPage' => '10', 'noPostsText' => '', 'withThumbnail' => 0, 'comments' => ['','='], 'dateFilter' => '',
    'date' => ['','','','','',''], 'dateModified' => 0);
  $attributes = array_merge($defaults, $attributes);
  global $_psc;
  //PREPARE FIRST QUERY
	$args = array(
		'post_type' => $attributes['postType'],
		'post_status' => 'publish',
		'order' => $attributes['order'],
		'orderby' => ($attributes['orderBy'] === 'custom_order_list' ? 'meta_value_num' : $attributes['orderBy']),
    'nopaging' => true
	);
  //SINGLE AUTHOR
	if ($attributes['author']) { $args['author'] = intval($attributes['author']); }
  //TAX QUERIES
	if (count($attributes['taxQueries'])) {
		foreach ($attributes['taxQueries'] as $taxquery) {
			if (is_array($taxquery) && array_key_exists('taxonomy',$taxquery) && array_key_exists('terms',$taxquery) && $taxquery['taxonomy'] && $taxquery['terms']) {
			  $args['tax_query'][] = array('taxonomy' => $taxquery['taxonomy'], 'terms' => array_map('intval',$taxquery['terms']), 'field' => 'term_id', 'operator' => $taxquery['operator']);
      }
		}
	}
	if (isset($args['tax_query']) && count($args['tax_query']) > 1) { $args['tax_query']['relation'] = $attributes['taxRelation']; }
  //META KEY
	if (in_array($attributes['orderBy'], array('meta_value', 'meta_value_num'))) { $args['meta_key'] = $attributes['metaKey']; }
  //ORDER LIST
  if ($attributes['orderBy'] === 'custom_order_list') {
    $key = PSC_MetaKey::get($attributes['orderList']);
    if ($key) { $args['meta_key'] = $key->prefix . $key->key; }
  }
  //ATTACHMENT
	if ($attributes['postType'] === 'attachment') {
		$args['post_status'] = 'inherit';
		$args['mime_types'] = $attributes['mimeTypes'];
	}
  //INCLUDE AUTHORS
	if (count($attributes['includeAuthors'])) { $args['author__in'] = array_map('intval', $attributes['includeAuthors']); }
  //EXCLUDE AUTHORS
	if (count($attributes['excludeAuthors'])) { $args['author__not_in'] = array_map('intval', $attributes['excludeAuthors']);	}
  //INCLUDE POSTS
	$include_posts = array();
	if (count($attributes['includePosts'])) { $include_posts = array_map('intval', $attributes['includePosts']); }
  //EXCLUDE POSTS
	if (count($attributes['excludePosts'])) { $args['post__not_in'] = array_map('intval', $attributes['excludePosts']); }
  //TOP LEVEL POSTS ONLY
  if ($attributes['topLevelOnly']) { $args['post_parent'] = 0; }
  //INCLUDE POSTS WITHIN PARENTS
  if (count($attributes['includeInParents'])) { $include_posts = array_unique(array_merge($include_posts, get_posts(array('post_type' => $args['post_type'], 'post_parent__in' => array_map('intval', $attributes['includeInParents']), 'fields' => 'ids')))); }
  //EXCLUDE POSTS WITHIN PARENTS
  if (count($attributes['excludeInParents'])) { $args['post_parent__not_in'] = array_map('intval', $attributes['excludeInParents']); }

  //DATE QUERY
  $date_column = $attributes['dateModified'] ? 'post_modified' : 'post_date';
  if (is_string($attributes['date'])) { $attributes['date'] = explode(',',$attributes['date']); }
  $date = $attributes['date'];
  foreach($date as $d) { $d = is_numeric($d) ? intval($d) : $d; }
  switch($attributes['dateFilter']) {
    case 'today': $args['date_query'] = array(array('year' => date('Y'), 'month' => date('n'), 'day' => date('j'), 'column' => $date_column)); break;
    case 'thisweek': $args['date_query'] = array(array('year' => date('Y'), 'week' => date('W'), 'column' => $date_column)); break;
    case 'thismonth': $args['date_query'] = array(array('year' => date('Y'), 'month' => date('n'), 'column' => $date_column)); break;
    case 'thisyear': $args['date_query'] = array(array('year' => date('Y'), 'column' => $date_column)); break;
    case 'ymd':
      $temp = array('column' => $date_column);
      if ($date[0]) { $temp['year'] = $date[0]; }
      if ($date[1]) { $temp['month'] = min(12,max($date[1], 1)); }
      if ($date[2]) { $temp['day'] = min(31, max(1, $date[2])); }
      if ($date[0] || $date[1] || $date[2]) { $args['date_query'] = array($temp); } break;
    case 'ago':
      if (!is_numeric($date[1])) { break; }
      if ($date[0] && $date[1] && $date[2])
        $temp = array('column' => $date_column); {
        $temp[$date[0]] = $date[1].' '.$date[2].($date[1] !== 1 ? 's' : '').' ago';
        $args['date_query'] = array($temp);
      } break;
    case 'between':
      $after = array();
      $before = array();
      if ($date[0]) { $after['year'] = intval($date[0]); }
      if ($date[1]) { $after['month'] = min(12,max(intval($date[1]), 1)); }
      if ($date[2]) { $after['day'] = min(31, max(1, intval($date[2]))); }
      if ($date[3]) { $before['year'] = intval($date[3]); }
      if ($date[4]) { $before['month'] = min(12,max(intval($date[4]), 1)); }
      if ($date[5]) { $before['day'] = min(31, max(1, intval($date[5]))); }
      $args['date_query'] = array(
      array(
        'after' => $after,
        'before' => $before,
        'column' => $date_column)
      ); break;
  }
  //THUMBNAILS ONLY
  if (isset($attributes['withThumbnail']) && $attributes['withThumbnail']) { $args['meta_query'] = array(array('key' => '_thumbnail_id')); }
  //COMMENTS COUNT
  if ($attributes['comments'][0] !== '') { $args['comment_count'] = array('value' => intval($attributes['comments'][0]), 'compare' => $attributes['comments'][1]); }
  //IGNORE STICKY POSTS
  if ($attributes['ignoreSticky']) { $args['ignore_sticky_posts'] = true; }
  //FIRST QUERY
	$query = new WP_Query($args);
	$query_post_ids = array();
	while ($query->have_posts()) {
		$query->the_post();
		$query_post_ids[] = $query->post->ID;
	}
	wp_reset_postdata();
  //PREPARE SECOND QUERY
	$args2 = array();
  if ($attributes['pagination'] !== 'disabled') {
		$paged = get_query_var('paged') ? get_query_var('paged') : 1;
		$args2['nopaging'] = false;
		$args2['paged'] = $paged;
		$args2['posts_per_page'] = intval($attributes['postsPerPage']);
	}	else { $args2['nopaging'] = 'true'; }
  $args2['post_type'] = 'any';
  $args2['post_status'] = 'any';
  if (!count($include_posts)) { $args2['orderby'] = 'post__in'; }
	else if ($attributes['includePostsWhere'] === 'above') {
		$query_post_ids = array_merge($include_posts, $query_post_ids);
		$args2['orderby'] = 'post__in';
	}
	else if ($attributes['includePostsWhere'] === 'among') {
		$query_post_ids = array_merge($query_post_ids, $include_posts);
		$args2['order'] = $attributes['order'];
		$args2['orderby'] = $attributes['orderBy'];
	}
	else if ($attributes['includePostsWhere'] === 'below') {
		$query_post_ids = array_merge($query_post_ids, $include_posts);
		$args2['orderby'] = 'post__in';
	}
	else if ($attributes['includePostsWhere'] === 'alone') {
		$query_post_ids = $include_posts;
		$args2['orderby'] = 'post__in';
	}
  if ($attributes['ignoreSticky']) { $args2['ignore_sticky_posts'] = true; }

	if ($attributes['postsToDisplay'] !== '-1') {
		if (count($query_post_ids) > intval($attributes['postsToDisplay'])) {
			$query_post_ids = array_slice($query_post_ids, 0, intval($attributes['postsToDisplay']));
		}
	}
	$args2['post__in'] = $query_post_ids;
  if (isset($attributes['search']) && $attributes['search']) { $args2['s'] = $attributes['search']; }
  if (count($query_post_ids)) { ?>
    <div class="psc-posts"><?php
    //RUN SECOND QUERY AND DISPLAY
  	$query2 = new WP_Query($args2);
  	if ($attributes['pagination'] === "above" || $attributes['pagination'] === "both") { psc_show_pagination($query2); }
  	$layout = new PSC_Layout($attributes['layout'], $_psc->get_layout($attributes['layout']));
    $layout->print($query2);
  	if ($attributes['pagination'] === "below" || $attributes['pagination'] === "both") { psc_show_pagination($query2); } ?>
    </div><?php
  	wp_reset_postdata();
  }
  else if (isset($attributes['noPostsText']) && $attributes['noPostsText']) { echo '<div class="psc-no-posts-text">'. $attributes['noPostsText'] .'</div>'; }
}
