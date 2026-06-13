<?php
/**
 * Divi builder module.
 *
 * @package DFMG
 */

if ( ! defined( 'ABSPATH' ) || ! class_exists( 'ET_Builder_Module' ) ) {
	exit;
}

/**
 * Filterable masonry gallery module for Divi.
 */
class DFMG_Divi_Module extends ET_Builder_Module {
	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public $slug = 'dfmg_filterable_masonry_gallery';

	/**
	 * Visual Builder support.
	 *
	 * @var string
	 */
	public $vb_support = 'on';

	/**
	 * Initializes module metadata.
	 *
	 * @return void
	 */
	public function init() {
		$this->name             = function_exists( 'et_builder_d5_enabled' ) && et_builder_d5_enabled()
			? esc_html__( 'Filterable Masonry Gallery (Legacy)', 'divi-filterable-masonry-gallery' )
			: esc_html__( 'Filterable Masonry Gallery', 'divi-filterable-masonry-gallery' );
		$this->plural           = esc_html__( 'Filterable Masonry Galleries', 'divi-filterable-masonry-gallery' );
		$this->main_css_element = '%%order_class%%.dfmg-gallery';
		$this->icon_path        = DFMG_PLUGIN_DIR . 'assets/module-icon.svg';
	}

	/**
	 * Module settings.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public function get_fields() {
		return array(
			'gallery'          => array(
				'label'           => esc_html__( 'Saved Gallery Slug', 'divi-filterable-masonry-gallery' ),
				'type'            => 'text',
				'option_category' => 'basic_option',
				'toggle_slug'     => 'main_content',
				'description'     => esc_html__( 'Optional saved gallery slug, for example mi-galeria. Selected images below override this value.', 'divi-filterable-masonry-gallery' ),
			),
			'gallery_ids'      => array(
				'label'           => esc_html__( 'Images', 'divi-filterable-masonry-gallery' ),
				'type'            => 'upload-gallery',
				'option_category' => 'basic_option',
				'toggle_slug'     => 'main_content',
				'description'     => esc_html__( 'Choose the images that will appear in this filterable masonry gallery.', 'divi-filterable-masonry-gallery' ),
			),
			'show_filters'     => array(
				'label'           => esc_html__( 'Show Filters', 'divi-filterable-masonry-gallery' ),
				'type'            => 'yes_no_button',
				'option_category' => 'configuration',
				'options'         => array(
					'on'  => esc_html__( 'Yes', 'divi-filterable-masonry-gallery' ),
					'off' => esc_html__( 'No', 'divi-filterable-masonry-gallery' ),
				),
				'default'         => 'on',
				'toggle_slug'     => 'main_content',
			),
			'filter_all_label' => array(
				'label'           => esc_html__( 'All Label', 'divi-filterable-masonry-gallery' ),
				'type'            => 'text',
				'option_category' => 'basic_option',
				'default'         => esc_html__( 'All', 'divi-filterable-masonry-gallery' ),
				'show_if'         => array(
					'show_filters' => 'on',
				),
				'toggle_slug'     => 'main_content',
			),
			'include_terms'    => array(
				'label'           => esc_html__( 'Limit Filters', 'divi-filterable-masonry-gallery' ),
				'type'            => 'text',
				'option_category' => 'configuration',
				'description'     => esc_html__( 'Optional comma-separated Gallery Filter slugs. Leave empty to show all filters used by the selected images.', 'divi-filterable-masonry-gallery' ),
				'show_if'         => array(
					'show_filters' => 'on',
				),
				'toggle_slug'     => 'main_content',
			),
			'columns'          => array(
				'label'           => esc_html__( 'Desktop Columns', 'divi-filterable-masonry-gallery' ),
				'type'            => 'range',
				'option_category' => 'layout',
				'default'         => '3',
				'default_unit'    => '',
				'range_settings'  => array(
					'min'  => 1,
					'max'  => 6,
					'step' => 1,
				),
				'tab_slug'        => 'advanced',
				'toggle_slug'     => 'layout',
			),
			'tablet_columns'   => array(
				'label'           => esc_html__( 'Tablet Columns', 'divi-filterable-masonry-gallery' ),
				'type'            => 'range',
				'option_category' => 'layout',
				'default'         => '2',
				'default_unit'    => '',
				'range_settings'  => array(
					'min'  => 1,
					'max'  => 4,
					'step' => 1,
				),
				'tab_slug'        => 'advanced',
				'toggle_slug'     => 'layout',
			),
			'mobile_columns'   => array(
				'label'           => esc_html__( 'Mobile Columns', 'divi-filterable-masonry-gallery' ),
				'type'            => 'range',
				'option_category' => 'layout',
				'default'         => '1',
				'default_unit'    => '',
				'range_settings'  => array(
					'min'  => 1,
					'max'  => 3,
					'step' => 1,
				),
				'tab_slug'        => 'advanced',
				'toggle_slug'     => 'layout',
			),
			'gap'              => array(
				'label'           => esc_html__( 'Gap', 'divi-filterable-masonry-gallery' ),
				'type'            => 'range',
				'option_category' => 'layout',
				'default'         => '18',
				'default_unit'    => 'px',
				'allowed_units'   => array( 'px' ),
				'range_settings'  => array(
					'min'  => 0,
					'max'  => 80,
					'step' => 1,
				),
				'tab_slug'        => 'advanced',
				'toggle_slug'     => 'layout',
			),
			'image_size'       => array(
				'label'           => esc_html__( 'Image Size', 'divi-filterable-masonry-gallery' ),
				'type'            => 'select',
				'option_category' => 'configuration',
				'default'         => 'large',
				'options'         => array(
					'medium'    => esc_html__( 'Medium', 'divi-filterable-masonry-gallery' ),
					'large'     => esc_html__( 'Large', 'divi-filterable-masonry-gallery' ),
					'full'      => esc_html__( 'Full', 'divi-filterable-masonry-gallery' ),
					'thumbnail' => esc_html__( 'Thumbnail', 'divi-filterable-masonry-gallery' ),
				),
				'toggle_slug'     => 'main_content',
			),
			'show_captions'    => array(
				'label'           => esc_html__( 'Show Captions', 'divi-filterable-masonry-gallery' ),
				'type'            => 'yes_no_button',
				'option_category' => 'configuration',
				'options'         => array(
					'on'  => esc_html__( 'Yes', 'divi-filterable-masonry-gallery' ),
					'off' => esc_html__( 'No', 'divi-filterable-masonry-gallery' ),
				),
				'default'         => 'on',
				'toggle_slug'     => 'main_content',
			),
			'caption_source'   => array(
				'label'           => esc_html__( 'Caption Source', 'divi-filterable-masonry-gallery' ),
				'type'            => 'select',
				'option_category' => 'configuration',
				'default'         => 'caption',
				'options'         => array(
					'caption' => esc_html__( 'Media Caption', 'divi-filterable-masonry-gallery' ),
					'title'   => esc_html__( 'Title', 'divi-filterable-masonry-gallery' ),
					'alt'     => esc_html__( 'Alt Text', 'divi-filterable-masonry-gallery' ),
					'none'    => esc_html__( 'None', 'divi-filterable-masonry-gallery' ),
				),
				'show_if'         => array(
					'show_captions' => 'on',
				),
				'toggle_slug'     => 'main_content',
			),
			'link_behavior'    => array(
				'label'           => esc_html__( 'Click Action', 'divi-filterable-masonry-gallery' ),
				'type'            => 'select',
				'option_category' => 'configuration',
				'default'         => 'lightbox',
				'options'         => array(
					'lightbox'   => esc_html__( 'Open Lightbox', 'divi-filterable-masonry-gallery' ),
					'file'       => esc_html__( 'Open Image File', 'divi-filterable-masonry-gallery' ),
					'attachment' => esc_html__( 'Open Attachment Page', 'divi-filterable-masonry-gallery' ),
					'none'       => esc_html__( 'No Link', 'divi-filterable-masonry-gallery' ),
				),
				'toggle_slug'     => 'main_content',
			),
		);
	}

	/**
	 * Output callback.
	 *
	 * @param array<string,mixed> $attrs       Attributes.
	 * @param string|null         $content     Content.
	 * @param string              $render_slug Render slug.
	 * @return string
	 */
	public function render( $attrs, $content = null, $render_slug = '' ) {
		$args = array();

		foreach ( DFMG_Plugin::default_gallery_args() as $key => $default ) {
			if ( isset( $this->props[ $key ] ) ) {
				$args[ $key ] = $this->props[ $key ];
			}
		}

		return DFMG_Plugin::render_gallery( $args );
	}
}

new DFMG_Divi_Module();
