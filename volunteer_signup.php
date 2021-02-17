<?php
define('CMRF_ID', 1);
/*
Plugin Name: Volunteer Signup
Plugin URI: https://jmaconsulting.biz
Description: Plugin to show activities of volunteer signup.
Version: 1.0
Author: Edsel Lopez
License: GPLv2 or later
*/

function add_to_cs_head() {
  // Enqueue core libs.
  wp_enqueue_script('jquery');
  wp_enqueue_script('jquery-ui', 'https://code.jquery.com/ui/1.12.1/jquery-ui.js');
  wp_enqueue_style('jquery-ui-css', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');

  // Enqueue JS Grid libraries
  wp_enqueue_script( 'jsgrid', 'https://cdnjs.cloudflare.com/ajax/libs/jsgrid/1.5.3/jsgrid.min.js' );
  wp_enqueue_style( 'jsgrid-theme', 'https://cdnjs.cloudflare.com/ajax/libs/jsgrid/1.5.3/jsgrid-theme.min.css' );
  wp_enqueue_style( 'vs-min-css', 'https://cdnjs.cloudflare.com/ajax/libs/jsgrid/1.5.3/jsgrid.min.css' );

  // Enqueue font awesome CSS
  wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css');

  // Timepicker library
  wp_enqueue_script('jquery-timepicker', 'https://cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.js');
  wp_enqueue_style('jquery-timepicker-css', 'https://cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.css');

  // Enqueue custom libraries
  $ver = rand(1000,9999);
  wp_enqueue_script( 'custom-script', plugin_dir_url( __FILE__ ) . 'js/custom-script.js', array(), $ver);
  wp_enqueue_style( 'custom-css', plugin_dir_url( __FILE__ ) . 'css/custom-css.css', array(), $ver );

  // Retrieve the contact id.
  $cid = $_COOKIE['volunteer_cid'];
  $params = [
    'contact_id' => $cid,
  ];
  $options = ['limit' => 0];

  $call = wpcmrf_api('Yhvsignup', 'getshifts', $params, $options, CMRF_ID);
  $shifts = $call->getReply();
  if (empty($shifts['values'])) {
    $shifts['values'] = [];
  }

  $params = [
    'Job',
    'Location',
    'Division',
    'Program',
  ];

  $options = [];
  $call = wpcmrf_api('Yhvsignup', 'getselectvals', $params, $options, CMRF_ID);
  $selects = $call->getReply();

  $params['target'] = get_site_url();

  $call = wpcmrf_api('Yhvsignup', 'geturls', $params, $options, CMRF_ID);
  $urls = $call->getReply();

  $dataToBePassed = array(
    'cid' => $cid,
    'shifts' => json_encode($shifts['values']),
  );

  // Add select lists
  $dataToBePassed = $dataToBePassed + $selects['values'];

  // Also add Urls
  $dataToBePassed = $dataToBePassed + $urls['values'];

  wp_localize_script( 'custom-script', 'php_vars', $dataToBePassed );
}
add_action( 'wp_enqueue_scripts', 'add_to_cs_head', 50);

add_filter( 'page_template', 'add_jsgrid_template' );
function add_jsgrid_template( $page_template ) {
  if (is_page( 'volunteer-shift' )) {
    $page_template = __DIR__.'/grid.php';
  }
  if (is_page('volunteer-action')) {
    $page_template = __DIR__.'/action.php';
  }
  if (is_page('volunteer-filter')) {
    $page_template = __DIR__.'/filter.php';
  }
  if (is_page('volunteer-email')) {
    $page_template = __DIR__.'/validate.php';
  }
  if (is_page('volunteer-profile-email')) {
    $page_template = __DIR__.'/validatevolemail.php';
  }
  return $page_template;
}

function set_volunteer_title($title, $id = null){
  if (!is_admin() && !is_null( $id ) && !empty($_COOKIE['volunteer_cid'])) {
    $post = get_post( $id );
    if ($post instanceof WP_Post && ($post->post_type == 'post' || $post->post_type == 'page')) {
      $options = [];
      $params = [
        'sequential' => 1,
        'contact_id' => $_COOKIE['volunteer_cid'],
        'return' => 'display_name',
      ];

      $call = wpcmrf_api('Contact', 'getvalue', $params, $options, CMRF_ID);
      if (strpos($title, 'Submit Hours <br/> 提交義工時數') !== false) {
        return $call->getReply()['result'] . " : Submit Hours <br/> 提交義工時數";
      }
    }
  }
  return $title;
}
add_filter('the_title','set_volunteer_title', 10, 2);

