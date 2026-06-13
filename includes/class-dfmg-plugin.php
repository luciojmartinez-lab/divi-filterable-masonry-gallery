<?php
/**
 * Core plugin bootstrap and gallery renderer.
 *
 * @package DFMG
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin class.
 */
final class DFMG_Plugin {
	const TAXONOMY = 'dfmg_gallery_filter';
	const POST_TYPE = 'dfmg_gallery';
	const IDS_META_KEY = '_dfmg_gallery_ids';

	/**
	 * Singleton instance.
	 *
	 * @var DFMG_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Returns the singleton instance.
	 *
	 * @return DFMG_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'load_textdomain' ), 0 );
		add_action( 'init', array( $this, 'register_gallery_post_type' ) );
		add_action( 'init', array( $this, 'register_media_taxonomy' ) );
		add_shortcode( 'dfmg_gallery', array( $this, 'shortcode' ) );
		add_shortcode( 'divi_masonry_gallery', array( $this, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_gallery_meta_boxes' ) );
		add_action( 'save_post_' . self::POST_TYPE, array( $this, 'save_gallery_meta' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		add_action( 'divi_module_library_modules_dependency_tree', array( $this, 'register_divi5_module' ) );
		add_action( 'divi_visual_builder_assets_before_enqueue_scripts', array( $this, 'enqueue_divi5_builder_assets' ) );
		add_action( 'et_builder_ready', array( $this, 'register_divi_module' ) );
	}

	/**
	 * Loads translations.
	 *
	 * @return void
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'divi-filterable-masonry-gallery',
			false,
			dirname( plugin_basename( DFMG_PLUGIN_FILE ) ) . '/languages'
		);
	}

	/**
	 * Registers saved gallery posts.
	 *
	 * @return void
	 */
	public function register_gallery_post_type() {
		$labels = array(
			'name'               => __( 'Masonry Galleries', 'divi-filterable-masonry-gallery' ),
			'singular_name'      => __( 'Masonry Gallery', 'divi-filterable-masonry-gallery' ),
			'add_new'            => __( 'Add New', 'divi-filterable-masonry-gallery' ),
			'add_new_item'       => __( 'Add New Masonry Gallery', 'divi-filterable-masonry-gallery' ),
			'edit_item'          => __( 'Edit Masonry Gallery', 'divi-filterable-masonry-gallery' ),
			'new_item'           => __( 'New Masonry Gallery', 'divi-filterable-masonry-gallery' ),
			'view_item'          => __( 'View Masonry Gallery', 'divi-filterable-masonry-gallery' ),
			'search_items'       => __( 'Search Masonry Galleries', 'divi-filterable-masonry-gallery' ),
			'not_found'          => __( 'No galleries found', 'divi-filterable-masonry-gallery' ),
			'not_found_in_trash' => __( 'No galleries found in Trash', 'divi-filterable-masonry-gallery' ),
			'menu_name'          => __( 'Masonry Galleries', 'divi-filterable-masonry-gallery' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'          => $labels,
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => true,
				'menu_icon'       => 'dashicons-format-gallery',
				'menu_position'   => 58,
				'supports'        => array( 'title' ),
				'capability_type' => 'post',
				'rewrite'         => false,
			)
		);
	}

	/**
	 * Registers attachment filter terms used by galleries.
	 *
	 * @return void
	 */
	public function register_media_taxonomy() {
		$labels = array(
			'name'                       => __( 'Gallery Filters', 'divi-filterable-masonry-gallery' ),
			'singular_name'              => __( 'Gallery Filter', 'divi-filterable-masonry-gallery' ),
			'search_items'               => __( 'Search Gallery Filters', 'divi-filterable-masonry-gallery' ),
			'popular_items'              => __( 'Popular Gallery Filters', 'divi-filterable-masonry-gallery' ),
			'all_items'                  => __( 'All Gallery Filters', 'divi-filterable-masonry-gallery' ),
			'edit_item'                  => __( 'Edit Gallery Filter', 'divi-filterable-masonry-gallery' ),
			'update_item'                => __( 'Update Gallery Filter', 'divi-filterable-masonry-gallery' ),
			'add_new_item'               => __( 'Add New Gallery Filter', 'divi-filterable-masonry-gallery' ),
			'new_item_name'              => __( 'New Gallery Filter Name', 'divi-filterable-masonry-gallery' ),
			'separate_items_with_commas' => __( 'Separate filters with commas', 'divi-filterable-masonry-gallery' ),
			'add_or_remove_items'        => __( 'Add or remove filters', 'divi-filterable-masonry-gallery' ),
			'choose_from_most_used'      => __( 'Choose from the most used filters', 'divi-filterable-masonry-gallery' ),
			'menu_name'                  => __( 'Gallery Filters', 'divi-filterable-masonry-gallery' ),
		);

		register_taxonomy(
			self::TAXONOMY,
			array( 'attachment' ),
			array(
				'labels'                => $labels,
				'public'                => false,
				'show_ui'               => true,
				'show_admin_column'     => true,
				'show_in_quick_edit'    => true,
				'show_in_rest'          => true,
				'hierarchical'          => false,
				'rewrite'               => false,
				'update_count_callback' => '_update_generic_term_count',
			)
		);
	}

	/**
	 * Registers the Divi module when Divi exposes the classic builder API.
	 *
	 * Divi 5 can run many legacy custom modules through its compatibility layer.
	 * The shortcode remains available for sites where only the newer API is enabled.
	 *
	 * @return void
	 */
	public function register_divi_module() {
		if ( ! class_exists( 'ET_Builder_Module' ) ) {
			return;
		}

		require_once DFMG_PLUGIN_DIR . 'includes/class-dfmg-divi-module.php';
	}

	/**
	 * Registers the native Divi 5 module dependency.
	 *
	 * @param object $dependency_tree Divi dependency tree.
	 * @return void
	 */
	public function register_divi5_module( $dependency_tree ) {
		if ( ! self::is_divi5_available() || ! is_object( $dependency_tree ) || ! method_exists( $dependency_tree, 'add_dependency' ) ) {
			return;
		}

		require_once DFMG_PLUGIN_DIR . 'includes/divi5/class-dfmg-divi5-gallery-module.php';

		if ( class_exists( '\DFMG\Divi5\GalleryModule' ) ) {
			$dependency_tree->add_dependency( new \DFMG\Divi5\GalleryModule() );
		}
	}

	/**
	 * Enqueues the native Divi 5 Visual Builder bundle.
	 *
	 * @return void
	 */
	public function enqueue_divi5_builder_assets() {
		if ( ! self::is_divi5_available() || ! function_exists( 'et_core_is_fb_enabled' ) || ! et_core_is_fb_enabled() ) {
			return;
		}

		if ( ! class_exists( '\ET\Builder\VisualBuilder\Assets\PackageBuildManager' ) ) {
			return;
		}

		wp_enqueue_media();

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			array(
				'name'    => 'dfmg-divi5-builder-script',
				'version' => DFMG_VERSION,
				'script'  => array(
					'src'                => DFMG_PLUGIN_URL . 'assets/divi5-builder.js',
					'deps'               => array(
						'divi-module-library',
						'divi-vendor-wp-hooks',
					),
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				),
			)
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			array(
				'name'    => 'dfmg-divi5-sidebar-script',
				'version' => DFMG_VERSION,
				'script'  => array(
					'src'                => DFMG_PLUGIN_URL . 'assets/divi5-sidebar.js',
					'deps'               => array(),
					'enqueue_top_window' => true,
					'enqueue_app_window' => false,
				),
			)
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			array(
				'name'    => 'dfmg-divi5-frontend-script',
				'version' => DFMG_VERSION,
				'script'  => array(
					'src'                => DFMG_PLUGIN_URL . 'assets/frontend.js',
					'deps'               => array(),
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				),
			)
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			array(
				'name'    => 'dfmg-divi5-builder-style',
				'version' => DFMG_VERSION,
				'style'   => array(
					'src'                => DFMG_PLUGIN_URL . 'assets/frontend.css',
					'deps'               => array(),
					'enqueue_top_window' => true,
					'enqueue_app_window' => true,
				),
			)
		);
	}

	/**
	 * Checks whether Divi 5 APIs required for native modules are available.
	 *
	 * @return bool
	 */
	public static function is_divi5_available() {
		return function_exists( 'et_builder_d5_enabled' )
			&& et_builder_d5_enabled()
			&& class_exists( '\ET\Builder\Packages\ModuleLibrary\ModuleRegistration' )
			&& interface_exists( '\ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface' );
	}

	/**
	 * Registers editor REST routes used by the Divi 5 Visual Builder preview.
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			'dfmg/v1',
			'/preview',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_gallery_preview' ),
				'permission_callback' => array( $this, 'rest_can_preview' ),
			)
		);
	}

	/**
	 * Checks whether the current user can preview galleries in the builder.
	 *
	 * @return bool
	 */
	public function rest_can_preview() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Returns rendered gallery HTML and selected item thumbnails for Divi 5.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function rest_gallery_preview( $request ) {
		$args = self::rest_gallery_args( $request );
		$ids  = self::resolve_gallery_ids( $args );

		return rest_ensure_response(
			array(
				'html'  => self::render_gallery( $args ),
				'ids'   => implode( ',', $ids ),
				'items' => self::preview_items( $ids ),
			)
		);
	}

	/**
	 * Builds gallery args from REST params.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return array<string,mixed>
	 */
	private static function rest_gallery_args( $request ) {
		$params = $request->get_params();
		$args   = array();

		foreach ( self::default_gallery_args() as $key => $default ) {
			if ( isset( $params[ $key ] ) ) {
				$args[ $key ] = $params[ $key ];
			}
		}

		$aliases = array(
			'tabletColumns'  => 'tablet_columns',
			'mobileColumns'  => 'mobile_columns',
			'imageSize'      => 'image_size',
			'filterAllLabel' => 'filter_all_label',
			'showFilters'    => 'show_filters',
			'showCaptions'   => 'show_captions',
			'captionSource'  => 'caption_source',
			'linkBehavior'   => 'link_behavior',
			'includeTerms'   => 'include_terms',
		);

		foreach ( $aliases as $source => $target ) {
			if ( isset( $params[ $source ] ) ) {
				$args[ $target ] = $params[ $source ];
			}
		}

		return $args;
	}

	/**
	 * Shortcode callback.
	 *
	 * @param array<string,mixed> $atts Shortcode attributes.
	 * @return string
	 */
	public function shortcode( $atts ) {
		$atts = shortcode_atts(
			self::default_gallery_args(),
			(array) $atts,
			'dfmg_gallery'
		);

		return self::render_gallery( $atts );
	}

	/**
	 * Enqueues frontend CSS and JS.
	 *
	 * Assets are intentionally loaded on the frontend globally so shortcode
	 * usage does not enqueue styles too late for wp_head.
	 *
	 * @return void
	 */
	public function enqueue_frontend_assets() {
		wp_enqueue_style(
			'dfmg-frontend',
			DFMG_PLUGIN_URL . 'assets/frontend.css',
			array(),
			DFMG_VERSION
		);

		wp_enqueue_script(
			'dfmg-frontend',
			DFMG_PLUGIN_URL . 'assets/frontend.js',
			array(),
			DFMG_VERSION,
			true
		);
	}

	/**
	 * Enqueues admin assets for saved galleries.
	 *
	 * @param string $hook_suffix Current admin hook.
	 * @return void
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		if ( ! in_array( $hook_suffix, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		$screen = get_current_screen();

		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}

		wp_enqueue_media();

		wp_enqueue_style(
			'dfmg-admin',
			DFMG_PLUGIN_URL . 'assets/admin.css',
			array(),
			DFMG_VERSION
		);

		wp_enqueue_script(
			'dfmg-admin',
			DFMG_PLUGIN_URL . 'assets/admin.js',
			array(),
			DFMG_VERSION,
			true
		);

		wp_localize_script(
			'dfmg-admin',
			'DFMGAdmin',
			array(
				'frameTitle' => __( 'Select gallery images', 'divi-filterable-masonry-gallery' ),
				'buttonText' => __( 'Use selected images', 'divi-filterable-masonry-gallery' ),
				'emptyText'  => __( 'No images selected yet.', 'divi-filterable-masonry-gallery' ),
			)
		);
	}

	/**
	 * Adds saved gallery meta boxes.
	 *
	 * @return void
	 */
	public function add_gallery_meta_boxes() {
		add_meta_box(
			'dfmg_gallery_images',
			__( 'Gallery Images', 'divi-filterable-masonry-gallery' ),
			array( $this, 'render_gallery_images_meta_box' ),
			self::POST_TYPE,
			'normal',
			'high'
		);

		add_meta_box(
			'dfmg_gallery_shortcode',
			__( 'Shortcode', 'divi-filterable-masonry-gallery' ),
			array( $this, 'render_gallery_shortcode_meta_box' ),
			self::POST_TYPE,
			'side',
			'default'
		);
	}

	/**
	 * Renders gallery image selector.
	 *
	 * @param WP_Post $post Gallery post.
	 * @return void
	 */
	public function render_gallery_images_meta_box( $post ) {
		$ids = self::parse_ids_from_value( get_post_meta( $post->ID, self::IDS_META_KEY, true ) );

		wp_nonce_field( 'dfmg_save_gallery', 'dfmg_gallery_nonce' );
		?>
		<div class="dfmg-admin-gallery" data-dfmg-admin-gallery>
			<input type="hidden" name="dfmg_gallery_ids" value="<?php echo esc_attr( implode( ',', $ids ) ); ?>" data-dfmg-ids>

			<div class="dfmg-admin-gallery__preview" data-dfmg-preview>
				<?php if ( empty( $ids ) ) : ?>
					<p class="dfmg-admin-gallery__empty"><?php esc_html_e( 'No images selected yet.', 'divi-filterable-masonry-gallery' ); ?></p>
				<?php else : ?>
					<?php foreach ( $ids as $id ) : ?>
						<?php echo self::admin_preview_image( $id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>

			<p class="dfmg-admin-gallery__actions">
				<button type="button" class="button button-primary" data-dfmg-select>
					<?php esc_html_e( 'Select Images', 'divi-filterable-masonry-gallery' ); ?>
				</button>
				<button type="button" class="button" data-dfmg-clear>
					<?php esc_html_e( 'Clear', 'divi-filterable-masonry-gallery' ); ?>
				</button>
			</p>

			<p class="description">
				<?php esc_html_e( 'Drag images inside the media modal to reorder them before inserting.', 'divi-filterable-masonry-gallery' ); ?>
			</p>
		</div>
		<?php
	}

	/**
	 * Renders shortcode helper box.
	 *
	 * @param WP_Post $post Gallery post.
	 * @return void
	 */
	public function render_gallery_shortcode_meta_box( $post ) {
		$slug      = $post->post_name ? $post->post_name : sanitize_title( $post->post_title );
		$shortcode = $slug ? sprintf( '[dfmg_gallery gallery="%s"]', $slug ) : __( 'Save this gallery to generate a shortcode.', 'divi-filterable-masonry-gallery' );
		?>
		<p><?php esc_html_e( 'Use this in Divi Code/Text modules or regular content:', 'divi-filterable-masonry-gallery' ); ?></p>
		<input type="text" class="widefat code" readonly value="<?php echo esc_attr( $shortcode ); ?>" onclick="this.select();">
		<?php
	}

	/**
	 * Saves selected image IDs.
	 *
	 * @param int $post_id Gallery post ID.
	 * @return void
	 */
	public function save_gallery_meta( $post_id ) {
		if ( ! isset( $_POST['dfmg_gallery_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['dfmg_gallery_nonce'] ) ), 'dfmg_save_gallery' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$raw_ids = isset( $_POST['dfmg_gallery_ids'] ) ? wp_unslash( $_POST['dfmg_gallery_ids'] ) : '';
		$ids     = self::parse_ids_from_value( $raw_ids );

		if ( empty( $ids ) ) {
			delete_post_meta( $post_id, self::IDS_META_KEY );
			return;
		}

		update_post_meta( $post_id, self::IDS_META_KEY, implode( ',', $ids ) );
	}

	/**
	 * Default gallery arguments.
	 *
	 * @return array<string,mixed>
	 */
	public static function default_gallery_args() {
		return array(
			'gallery'          => '',
			'ids'              => '',
			'gallery_ids'      => '',
			'columns'          => 3,
			'tablet_columns'   => 2,
			'mobile_columns'   => 1,
			'gap'              => 18,
			'image_size'       => 'large',
			'filter_all_label' => __( 'All', 'divi-filterable-masonry-gallery' ),
			'show_filters'     => 'on',
			'show_captions'    => 'on',
			'caption_source'   => 'caption',
			'link_behavior'    => 'lightbox',
			'orderby'          => 'post__in',
			'order'            => 'ASC',
			'include_terms'    => '',
			'extra_class'      => '',
		);
	}

	/**
	 * Renders a gallery.
	 *
	 * @param array<string,mixed> $args Gallery arguments.
	 * @return string
	 */
	public static function render_gallery( $args ) {
		$args = wp_parse_args( (array) $args, self::default_gallery_args() );
		$args = self::sanitize_gallery_args( $args );
		$ids  = self::parse_attachment_ids( $args );

		if ( empty( $ids ) ) {
			if ( current_user_can( 'edit_posts' ) ) {
				return sprintf(
					'<div class="dfmg-empty">%s</div>',
					esc_html__( 'Select images for the filterable masonry gallery.', 'divi-filterable-masonry-gallery' )
				);
			}

			return '';
		}

		$attachments = self::get_attachments( $ids, $args );

		if ( empty( $attachments ) ) {
			return '';
		}

		$gallery_id = wp_unique_id( 'dfmg-gallery-' );
		$terms      = self::collect_terms( wp_list_pluck( $attachments, 'ID' ), $args['include_terms'] );
		$style      = self::gallery_style( $args );
		$classes    = array_filter(
			array(
				'dfmg-gallery',
				'dfmg-link-' . $args['link_behavior'],
				$args['extra_class'],
			)
		);

		ob_start();
		?>
		<div
			id="<?php echo esc_attr( $gallery_id ); ?>"
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
			style="<?php echo esc_attr( $style ); ?>"
			data-dfmg-gallery
		>
			<?php if ( 'on' === $args['show_filters'] && ! empty( $terms ) ) : ?>
				<div class="dfmg-filters" role="tablist" aria-label="<?php esc_attr_e( 'Gallery filters', 'divi-filterable-masonry-gallery' ); ?>">
					<button class="dfmg-filter is-active" type="button" data-dfmg-filter="*" aria-selected="true">
						<?php echo esc_html( $args['filter_all_label'] ); ?>
					</button>
					<?php foreach ( $terms as $term ) : ?>
						<button class="dfmg-filter" type="button" data-dfmg-filter="<?php echo esc_attr( $term->slug ); ?>" aria-selected="false">
							<?php echo esc_html( $term->name ); ?>
						</button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<div class="dfmg-grid" data-dfmg-grid>
				<div class="dfmg-grid-sizer"></div>
				<?php foreach ( $attachments as $attachment ) : ?>
					<?php echo self::render_item( $attachment, $args ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endforeach; ?>
			</div>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Resolves the attachment IDs that a gallery configuration points to.
	 *
	 * @param array<string,mixed> $args Gallery arguments.
	 * @return array<int>
	 */
	public static function resolve_gallery_ids( $args ) {
		$args = wp_parse_args( (array) $args, self::default_gallery_args() );
		$args = self::sanitize_gallery_args( $args );

		return self::parse_attachment_ids( $args );
	}

	/**
	 * Returns lightweight attachment data for builder previews.
	 *
	 * @param array<int> $ids Attachment IDs.
	 * @return array<int,array<string,mixed>>
	 */
	private static function preview_items( $ids ) {
		$items = array();

		foreach ( $ids as $id ) {
			$thumb = wp_get_attachment_image_src( $id, 'thumbnail' );
			$image = wp_get_attachment_image_src( $id, 'medium' );

			if ( ! $thumb && ! $image ) {
				continue;
			}

			$items[] = array(
				'id'      => $id,
				'thumb'   => $thumb ? $thumb[0] : $image[0],
				'url'     => $image ? $image[0] : $thumb[0],
				'alt'     => trim( (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) ),
				'title'   => get_the_title( $id ),
				'caption' => trim( (string) wp_get_attachment_caption( $id ) ),
			);
		}

		return $items;
	}

	/**
	 * Sanitizes gallery args.
	 *
	 * @param array<string,mixed> $args Raw args.
	 * @return array<string,mixed>
	 */
	private static function sanitize_gallery_args( $args ) {
		$args['columns']        = self::bounded_int( $args['columns'], 1, 6, 3 );
		$args['tablet_columns'] = self::bounded_int( $args['tablet_columns'], 1, 4, 2 );
		$args['mobile_columns'] = self::bounded_int( $args['mobile_columns'], 1, 3, 1 );
		$args['gap']            = self::bounded_int( $args['gap'], 0, 80, 18 );

		$args['image_size']       = sanitize_key( (string) $args['image_size'] );
		$args['gallery']          = sanitize_text_field( (string) $args['gallery'] );
		$args['filter_all_label'] = sanitize_text_field( (string) $args['filter_all_label'] );
		$args['show_filters']     = self::bool_to_on_off( $args['show_filters'] );
		$args['show_captions']    = self::bool_to_on_off( $args['show_captions'] );
		$args['caption_source']   = self::one_of( sanitize_key( (string) $args['caption_source'] ), array( 'caption', 'title', 'alt', 'none' ), 'caption' );
		$args['link_behavior']    = self::one_of( sanitize_key( (string) $args['link_behavior'] ), array( 'lightbox', 'file', 'attachment', 'none' ), 'lightbox' );
		$args['orderby']          = self::one_of( sanitize_key( (string) $args['orderby'] ), array( 'post__in', 'date', 'title', 'menu_order', 'rand' ), 'post__in' );
		$args['order']            = self::one_of( strtoupper( sanitize_key( (string) $args['order'] ) ), array( 'ASC', 'DESC' ), 'ASC' );
		$args['include_terms']    = sanitize_text_field( (string) $args['include_terms'] );
		$args['extra_class']      = sanitize_html_class( (string) $args['extra_class'] );

		return $args;
	}

	/**
	 * Parses selected image IDs from shortcode or Divi gallery field.
	 *
	 * @param array<string,mixed> $args Gallery args.
	 * @return array<int>
	 */
	private static function parse_attachment_ids( $args ) {
		$raw = ! empty( $args['ids'] ) ? $args['ids'] : $args['gallery_ids'];
		$ids = self::parse_ids_from_value( $raw );

		if ( empty( $ids ) && ! empty( $args['gallery'] ) ) {
			$ids = self::get_saved_gallery_ids( $args['gallery'] );
		}

		return $ids;
	}

	/**
	 * Parses image IDs from raw shortcode, Divi, or saved meta values.
	 *
	 * @param mixed $raw Raw IDs.
	 * @return array<int>
	 */
	private static function parse_ids_from_value( $raw ) {
		if ( is_array( $raw ) ) {
			$raw = implode( ',', $raw );
		}

		preg_match_all( '/\d+/', (string) $raw, $matches );
		$ids = array_map( 'absint', $matches[0] );

		return array_values( array_unique( array_filter( $ids ) ) );
	}

	/**
	 * Gets attachment IDs from a saved gallery slug or ID.
	 *
	 * @param string $gallery_ref Saved gallery slug or ID.
	 * @return array<int>
	 */
	private static function get_saved_gallery_ids( $gallery_ref ) {
		$gallery_ref = trim( (string) $gallery_ref );

		if ( '' === $gallery_ref ) {
			return array();
		}

		if ( is_numeric( $gallery_ref ) ) {
			$post_id = absint( $gallery_ref );
		} else {
			$post    = get_page_by_path( sanitize_title( $gallery_ref ), OBJECT, self::POST_TYPE );
			$post_id = $post instanceof WP_Post ? $post->ID : 0;
		}

		if ( ! $post_id || self::POST_TYPE !== get_post_type( $post_id ) ) {
			return array();
		}

		return self::parse_ids_from_value( get_post_meta( $post_id, self::IDS_META_KEY, true ) );
	}

	/**
	 * Returns one admin preview image.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return string
	 */
	private static function admin_preview_image( $attachment_id ) {
		$image = wp_get_attachment_image(
			$attachment_id,
			'thumbnail',
			false,
			array(
				'class' => 'dfmg-admin-gallery__image',
			)
		);

		if ( '' === $image ) {
			return '';
		}

		return sprintf(
			'<span class="dfmg-admin-gallery__thumb" data-dfmg-id="%1$d">%2$s</span>',
			absint( $attachment_id ),
			$image
		);
	}

	/**
	 * Queries image attachments.
	 *
	 * @param array<int>           $ids  Attachment IDs.
	 * @param array<string,mixed> $args Gallery args.
	 * @return array<int,WP_Post>
	 */
	private static function get_attachments( $ids, $args ) {
		$query_args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'post_status'    => 'inherit',
			'post__in'       => $ids,
			'posts_per_page' => count( $ids ),
			'orderby'        => $args['orderby'],
			'order'          => $args['order'],
		);

		return get_posts( $query_args );
	}

	/**
	 * Collects unique taxonomy terms from selected attachments.
	 *
	 * @param array<int> $attachment_ids Attachment IDs.
	 * @param string     $include_terms  Optional comma-separated term slugs.
	 * @return array<int,WP_Term>
	 */
	private static function collect_terms( $attachment_ids, $include_terms = '' ) {
		$allowed_slugs = self::parse_slugs( $include_terms );
		$terms_by_slug = array();

		foreach ( $attachment_ids as $attachment_id ) {
			$terms = wp_get_object_terms( $attachment_id, self::TAXONOMY );

			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				continue;
			}

			foreach ( $terms as $term ) {
				if ( ! empty( $allowed_slugs ) && ! in_array( $term->slug, $allowed_slugs, true ) ) {
					continue;
				}

				$terms_by_slug[ $term->slug ] = $term;
			}
		}

		uasort(
			$terms_by_slug,
			static function ( $a, $b ) {
				return strnatcasecmp( $a->name, $b->name );
			}
		);

		return array_values( $terms_by_slug );
	}

	/**
	 * Renders one gallery item.
	 *
	 * @param WP_Post             $attachment Attachment post.
	 * @param array<string,mixed> $args       Gallery args.
	 * @return string
	 */
	private static function render_item( $attachment, $args ) {
		$terms      = wp_get_object_terms( $attachment->ID, self::TAXONOMY );
		$term_slugs = array();

		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			foreach ( $terms as $term ) {
				$term_slugs[] = $term->slug;
			}
		}

		$caption = self::attachment_caption( $attachment, $args['caption_source'] );
		$alt     = trim( (string) get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true ) );

		if ( '' === $alt ) {
			$alt = get_the_title( $attachment );
		}

		$image = wp_get_attachment_image(
			$attachment->ID,
			$args['image_size'],
			false,
			array(
				'class'    => 'dfmg-image',
				'loading'  => 'lazy',
				'decoding' => 'async',
				'alt'      => $alt,
			)
		);

		if ( '' === $image ) {
			return '';
		}

		$link_open  = '';
		$link_close = '';

		if ( 'none' !== $args['link_behavior'] ) {
			$link_data = self::link_data( $attachment, $args['link_behavior'], $caption );
			$link_open = sprintf(
				'<a class="dfmg-link" href="%1$s"%2$s%3$s%4$s>',
				esc_url( $link_data['href'] ),
				$link_data['lightbox'] ? ' data-dfmg-lightbox' : '',
				'' !== $caption ? ' data-dfmg-caption="' . esc_attr( $caption ) . '"' : '',
				'attachment' === $args['link_behavior'] ? '' : ' aria-label="' . esc_attr( get_the_title( $attachment ) ) . '"'
			);
			$link_close = '</a>';
		}

		ob_start();
		?>
		<article class="dfmg-item" data-dfmg-item data-dfmg-id="<?php echo esc_attr( (string) $attachment->ID ); ?>" data-dfmg-terms="<?php echo esc_attr( implode( ' ', $term_slugs ) ); ?>">
			<figure class="dfmg-card">
				<?php echo $link_open; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php echo $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php echo $link_close; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

				<?php if ( 'on' === $args['show_captions'] && '' !== $caption ) : ?>
					<figcaption class="dfmg-caption"><?php echo esc_html( $caption ); ?></figcaption>
				<?php endif; ?>
			</figure>
		</article>
		<?php

		return ob_get_clean();
	}

	/**
	 * Returns data for item links.
	 *
	 * @param WP_Post $attachment    Attachment post.
	 * @param string  $link_behavior Link behavior.
	 * @param string  $caption       Caption text.
	 * @return array{href:string,lightbox:bool,caption:string}
	 */
	private static function link_data( $attachment, $link_behavior, $caption ) {
		if ( 'attachment' === $link_behavior ) {
			return array(
				'href'     => get_attachment_link( $attachment->ID ),
				'lightbox' => false,
				'caption'  => $caption,
			);
		}

		$full = wp_get_attachment_image_src( $attachment->ID, 'full' );

		return array(
			'href'     => $full ? $full[0] : wp_get_attachment_url( $attachment->ID ),
			'lightbox' => 'lightbox' === $link_behavior,
			'caption'  => $caption,
		);
	}

	/**
	 * Resolves attachment caption text.
	 *
	 * @param WP_Post $attachment Attachment post.
	 * @param string  $source     Caption source.
	 * @return string
	 */
	private static function attachment_caption( $attachment, $source ) {
		switch ( $source ) {
			case 'title':
				return trim( get_the_title( $attachment ) );

			case 'alt':
				return trim( (string) get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true ) );

			case 'none':
				return '';

			case 'caption':
			default:
				return trim( (string) wp_get_attachment_caption( $attachment->ID ) );
		}
	}

	/**
	 * Builds inline CSS custom properties.
	 *
	 * @param array<string,mixed> $args Gallery args.
	 * @return string
	 */
	private static function gallery_style( $args ) {
		return sprintf(
			'--dfmg-columns:%1$d;--dfmg-tablet-columns:%2$d;--dfmg-mobile-columns:%3$d;--dfmg-gap:%4$dpx;',
			(int) $args['columns'],
			(int) $args['tablet_columns'],
			(int) $args['mobile_columns'],
			(int) $args['gap']
		);
	}

	/**
	 * Converts common boolean-ish values to on/off.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	private static function bool_to_on_off( $value ) {
		if ( is_bool( $value ) ) {
			return $value ? 'on' : 'off';
		}

		$value = strtolower( trim( (string) $value ) );

		return in_array( $value, array( '1', 'yes', 'true', 'on', 'show' ), true ) ? 'on' : 'off';
	}

	/**
	 * Returns a bounded integer.
	 *
	 * @param mixed $value    Raw value.
	 * @param int   $min      Minimum.
	 * @param int   $max      Maximum.
	 * @param int   $fallback Fallback.
	 * @return int
	 */
	private static function bounded_int( $value, $min, $max, $fallback ) {
		if ( is_numeric( $value ) ) {
			$value = (int) $value;
		} elseif ( is_string( $value ) && preg_match( '/-?\d+/', $value, $matches ) ) {
			$value = (int) $matches[0];
		} else {
			$value = $fallback;
		}

		return min( $max, max( $min, $value ) );
	}

	/**
	 * Returns value when it exists in allowed list, otherwise fallback.
	 *
	 * @param string       $value    Value.
	 * @param array<string> $allowed  Allowed values.
	 * @param string       $fallback Fallback.
	 * @return string
	 */
	private static function one_of( $value, $allowed, $fallback ) {
		return in_array( $value, $allowed, true ) ? $value : $fallback;
	}

	/**
	 * Parses comma-separated slugs.
	 *
	 * @param string $value Raw value.
	 * @return array<string>
	 */
	private static function parse_slugs( $value ) {
		if ( '' === trim( $value ) ) {
			return array();
		}

		$parts = array_map( 'sanitize_title', explode( ',', $value ) );

		return array_values( array_filter( array_unique( $parts ) ) );
	}
}
