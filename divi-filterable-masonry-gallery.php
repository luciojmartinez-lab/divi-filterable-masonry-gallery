<?php
/**
 * Plugin Name: Divi Filterable Masonry Gallery by Lucio
 * Plugin URI: https://github.com/luciojmartinez-lab/divi-filterable-masonry-gallery
 * Description: Adds a Divi-compatible filterable masonry image gallery with media-library filters and a shortcode fallback.
 * Version: 1.3.8
 * Author: Lucio J. Martinez
 * Text Domain: divi-filterable-masonry-gallery
 * Domain Path: /languages
 * Requires at least: 6.2
 * Requires PHP: 7.4
 *
 * @package DFMG
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DFMG_VERSION', '1.3.8' );
define( 'DFMG_PLUGIN_FILE', __FILE__ );
define( 'DFMG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DFMG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DFMG_DIVI5_JSON_PATH', DFMG_PLUGIN_DIR . 'modules-json/' );

require_once DFMG_PLUGIN_DIR . 'includes/class-dfmg-plugin.php';

DFMG_Plugin::instance();
