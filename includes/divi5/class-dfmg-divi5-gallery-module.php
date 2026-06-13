<?php
/**
 * Native Divi 5 module registration and render callback.
 *
 * @package DFMG
 */

namespace DFMG\Divi5;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use DFMG_Plugin;
use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;

/**
 * Native Divi 5 gallery module dependency.
 */
class GalleryModule implements DependencyInterface {
	/**
	 * Loads module registration.
	 *
	 * @return void
	 */
	public function load() {
		$module_json_folder_path = DFMG_DIVI5_JSON_PATH . 'filterable-masonry-gallery/';

		add_action(
			'init',
			static function() use ( $module_json_folder_path ) {
				ModuleRegistration::register_module(
					$module_json_folder_path,
					array(
						'render_callback' => array( GalleryModule::class, 'render_callback' ),
					)
				);
			}
		);
	}

	/**
	 * Native Divi 5 render callback.
	 *
	 * @param array     $attrs   Module attributes.
	 * @param string    $content Module content.
	 * @param \WP_Block $block   Parsed block.
	 * @param object    $elements Module elements.
	 * @return string
	 */
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$args = array(
			'gallery'          => self::attr_value( $attrs, 'gallery', '' ),
			'ids'              => self::attr_value( $attrs, 'ids', '' ),
			'columns'          => self::attr_value( $attrs, 'columns', 3 ),
			'tablet_columns'   => self::attr_value( $attrs, 'tabletColumns', 2 ),
			'mobile_columns'   => self::attr_value( $attrs, 'mobileColumns', 1 ),
			'gap'              => self::attr_value( $attrs, 'gap', 18 ),
			'image_size'       => self::attr_value( $attrs, 'imageSize', 'large' ),
			'filter_all_label' => self::attr_value( $attrs, 'filterAllLabel', __( 'All', 'divi-filterable-masonry-gallery' ) ),
			'show_filters'     => self::attr_value( $attrs, 'showFilters', 'on' ),
			'show_captions'    => self::attr_value( $attrs, 'showCaptions', 'on' ),
			'caption_source'   => self::attr_value( $attrs, 'captionSource', 'caption' ),
			'link_behavior'    => self::attr_value( $attrs, 'linkBehavior', 'lightbox' ),
			'hover_icon'       => self::attr_value( $attrs, 'hoverIcon', 'plus' ),
			'include_terms'    => self::attr_value( $attrs, 'includeTerms', '' ),
		);

		$gallery = DFMG_Plugin::render_gallery( $args );

		if ( ! class_exists( Module::class ) ) {
			return $gallery;
		}

		$parsed_block = is_object( $block ) && isset( $block->parsed_block ) ? $block->parsed_block : array();
		$parent       = null;

		if ( class_exists( BlockParserStore::class ) && ! empty( $parsed_block['id'] ) && ! empty( $parsed_block['storeInstance'] ) ) {
			$parent = BlockParserStore::get_parent( $parsed_block['id'], $parsed_block['storeInstance'] );
		}

		$background_component = class_exists( ElementComponents::class ) && isset( $attrs['module']['decoration'] )
			? ElementComponents::component(
				array(
					'attrs'         => $attrs['module']['decoration'],
					'id'            => $parsed_block['id'] ?? '',
					'orderIndex'    => $parsed_block['orderIndex'] ?? 0,
					'storeInstance' => $parsed_block['storeInstance'] ?? null,
				)
			)
			: '';

		return Module::render(
			array(
				'orderIndex'          => $parsed_block['orderIndex'] ?? 0,
				'storeInstance'       => $parsed_block['storeInstance'] ?? null,
				'id'                  => $parsed_block['id'] ?? '',
				'name'                => is_object( $block ) && isset( $block->block_type->name ) ? $block->block_type->name : 'dfmg/filterable-masonry-gallery',
				'moduleCategory'      => is_object( $block ) && isset( $block->block_type->category ) ? $block->block_type->category : 'module',
				'attrs'               => $attrs,
				'elements'            => $elements,
				'classnamesFunction'  => array( GalleryModule::class, 'module_classnames' ),
				'stylesComponent'     => array( GalleryModule::class, 'module_styles' ),
				'scriptDataComponent' => array( GalleryModule::class, 'module_script_data' ),
				'parentAttrs'         => is_object( $parent ) && isset( $parent->attrs ) ? $parent->attrs : array(),
				'parentId'            => is_object( $parent ) && isset( $parent->id ) ? $parent->id : '',
				'parentName'          => is_object( $parent ) && isset( $parent->blockName ) ? $parent->blockName : '',
				'children'            => array(
					$background_component,
					$gallery,
				),
			)
		);
	}

	/**
	 * Adds module classnames.
	 *
	 * @param array $args Classname args.
	 * @return void
	 */
	public static function module_classnames( $args ) {
		if ( empty( $args['classnamesInstance'] ) || ! is_object( $args['classnamesInstance'] ) ) {
			return;
		}

		$args['classnamesInstance']->add( 'dfmg-divi5-module', true );
	}

	/**
	 * Adds module styles. Frontend gallery CSS is served by assets/frontend.css.
	 *
	 * @param array $args Style args.
	 * @return void
	 */
	public static function module_styles( $args ) {
		if ( empty( $args['elements'] ) || ! is_object( $args['elements'] ) || ! method_exists( $args['elements'], 'style' ) ) {
			return;
		}

		if ( class_exists( '\ET\Builder\FrontEnd\Module\Style' ) ) {
			\ET\Builder\FrontEnd\Module\Style::add(
				array(
					'id'            => $args['id'] ?? '',
					'name'          => $args['name'] ?? 'dfmg/filterable-masonry-gallery',
					'orderIndex'    => $args['orderIndex'] ?? 0,
					'storeInstance' => $args['storeInstance'] ?? null,
					'styles'        => array(
						$args['elements']->style(
							array(
								'attrName'   => 'module',
								'styleProps' => array(
									'disabledOn' => array(
										'disabledModuleVisibility' => $args['settings']['disabledModuleVisibility'] ?? null,
									),
								),
							)
						),
					),
				)
			);
		}
	}

	/**
	 * Adds module script data.
	 *
	 * @param array $args Script data args.
	 * @return void
	 */
	public static function module_script_data( $args ) {
		if ( class_exists( '\ET\Builder\Packages\Module\Options\Element\ElementScriptData' ) ) {
			\ET\Builder\Packages\Module\Options\Element\ElementScriptData::set(
				array(
					'id'            => $args['id'] ?? '',
					'selector'      => $args['selector'] ?? '',
					'attrs'         => $args['attrs']['module']['decoration'] ?? array(),
					'storeInstance' => $args['storeInstance'] ?? null,
				)
			);
		}
	}

	/**
	 * Reads a Divi 5 innerContent text attribute.
	 *
	 * @param array  $attrs    Module attrs.
	 * @param string $attr     Attribute name.
	 * @param mixed  $fallback Fallback value.
	 * @return mixed
	 */
	private static function attr_value( $attrs, $attr, $fallback = '' ) {
		return $attrs[ $attr ]['innerContent']['desktop']['value'] ?? $fallback;
	}
}
