<?php
add_action('rest_api_init', 'psc_extend_rest_api');
function psc_extend_rest_api() {
  register_rest_route('showcase-creator/v2', '/data', array(
    'methods' => 'GET',
    'callback' => 'psc_extend_rest_api_callback',
    'permission_callback' => function() { return true; },
    'args' => array(
      'get' => array('required' => false, 'type' => 'string', 'sanitize_callback' => function($v) { return $v ? explode(',',$v) : null; } ),
      'post_type' => array('required' => false, 'type' => 'string', 'default' => 'any'),
      'tax_query' => array('required' => false, 'type' => 'string', 'default' => '', 'sanitize_callback' => function($t) {
        if (!$t) { return null; }
        parse_str(str_replace(';','&',$t), $t);
        foreach($t as $k=>$v) {
          $t[$k] = is_numeric($v) ? intval($v) : (str_contains($v,',') ? array_map(function($v) { return (is_numeric($v) ? intval($v) : $v); }, explode(',',$v)) : $v); }
        return array($t); } ),
      'orderby' => array('required' => false, 'type' => 'string', 'default' => 'date'),
      'order' => array('required' => false, 'type' => 'string', 'default' => 'DESC'),
      'author' => array('required' => false, 'type' => 'integer', 'default' => '', 'sanitize_callback' => function($v) { return is_numeric($v) ? intval($v) : null; } ),
      'date_query' => array('required' => false, 'type' => 'string', 'default' => '', 'sanitize_callback' => function($d) {
        if (!$d) { return null; }
        parse_str(str_replace(';','&',$d), $d);
        foreach($d as $k=>$v) {
          $d[$k] = is_numeric($v) ? intval($v) : (str_contains($v,',') ? array_map(function($v) { return (is_numeric($v) ? intval($v) : $v); }, explode(',',$v)) : $v); }
        return $d; } ),
      'numberposts' => array('required' => false, 'type' => 'integer', 'default' => -1, 'sanitize_callback' => function($v) { return is_numeric($v) ? intval($v) : 0; } ),
      's' => array('required' => false, 'type' => 'string', 'default' => ''),
      'meta_key' => array('required' => false, 'type' => 'string', 'default' => '', 'sanitize_callback' => function($v) { return $v ? explode(',',$v) : null; }),
      'taxonomy' => array('required' => false, 'type' => 'string', 'default' => ''),
      'fields' => array('required' => false, 'type' => 'string', 'default' => '', 'sanitize_callback' => function($v) { return $v ? explode(',',$v) : array(); } ),
      'attributes' => array('required' => false, 'type' => 'string', 'default' => '', 'sanitize_callback' => function($str) { parse_str(parse_url(str_replace(',', '&', htmlspecialchars($str)), PHP_URL_QUERY), $result); return $result; } )
    )
  ), true);
}

function psc_extend_rest_api_callback(WP_REST_Request $request) {
  $data = array();
  $taxnames = get_taxonomies(array('public' => true));
  $get = $request->get_param('get');
  $args = array(
    'post_type' => $request->get_param('post_type'), 'tax_query' => $request->get_param('tax_query'),
    'orderby' => $request->get_param('orderby'), 'order' => $request->get_param('order'),
    'date_query' => $request->get_param('date_query'), 'author' => $request->get_param('author'),
    'numberposts' => $request->get_param('numberposts'), 's' => $request->get_param('s'),
    'meta_key' => $request->get_param('meta_key'), 'taxonomy' => $request->get_param('taxonomy')
  );
  if (!isset($args['orderby']) && !isset($args['order'])) {
    if ($args['search']) { $args['orderby'] = 'relevance'; $args['order'] = 'ASC'; }
    else { $args['orderby'] = 'date'; $args['order'] = 'DESC'; }
  }
  $fields = $request->get_param('fields');
  global $_psc;
  if (!$get || in_array('types', $get)) { $data['types'] = $_psc->get_data('types', array(), $fields)['types']; }
  if (!$get || in_array('taxs', $get))  { $data['taxs'] = $_psc->get_data('taxs', $args['post_type'] !== 'any' ? array('public' => true, 'post_type' => $args['post_type']) : array())['taxs']; }
  if (!$get || in_array('terms', $get))  { $data['terms'] = $_psc->get_data('terms', $args['taxonomy'] ? array('public' => true, 'taxonomy' => $args['taxonomy']) : array())['terms']; }
  if (!$get || in_array('authors', $get))  { $data['authors'] = $_psc->get_data('authors')['authors']; }
  if (!$get || in_array('metakeys', $get))  { $data['metakeys'] = $_psc->get_data('metakeys')['metakeys']; }
  if (!$get || in_array('layouts', $get))  { $data['layouts'] = $_psc->get_data('layouts', array(), $fields)['layouts']; }
  if (is_array($get) && in_array('posts', $get)) {
    $post_args = array_filter($args, function($v) { return $v; });
    $data['posts'] = $_psc->get_data('posts', $post_args, isset($fields) ? $fields : array())['posts'];
  }
  if (is_array($get) && in_array('order', $get))  { $data['order'] = $_psc->get_data('order', $args['meta_key'], $fields)['order']; }
  $response = new WP_REST_Response($data);
  $response->set_status(200);
  return $response;
}
