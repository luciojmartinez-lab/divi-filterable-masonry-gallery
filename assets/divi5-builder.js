(function () {
	'use strict';

	var hooks = window.vendor && window.vendor.wp && window.vendor.wp.hooks;
	var divi = window.divi || {};
	var moduleLibrary = divi.moduleLibrary || {};
	var diviModule = divi.module || {};
	var React = (window.vendor && window.vendor.React) || window.React;

	if (!hooks || !moduleLibrary.registerModule || !React || !diviModule.ModuleContainer) {
		return;
	}

	var metadata = {
		name: 'dfmg/filterable-masonry-gallery',
		d4Shortcode: 'dfmg_filterable_masonry_gallery',
		title: 'Filterable Masonry Gallery',
		titles: 'Filterable Masonry Galleries',
		moduleIcon: '',
		moduleClassName: 'dfmg_divi5_module',
		moduleOrderClassName: 'dfmg_divi5_module',
		category: 'module',
		attributes: {
			module: moduleAttribute(),
			gallery: fieldAttribute('gallery', 'Saved Gallery Slug', '', 'contentGallery', 10, 'divi/text', 'Use a saved Masonry Gallery slug, for example mi-galeria.'),
			ids: fieldAttribute('ids', 'Image IDs', '', 'contentGallery', 20, 'divi/textarea', 'Optional comma-separated attachment IDs. This overrides Saved Gallery Slug.'),
			columns: fieldAttribute('columns', 'Desktop Columns', '3', 'layoutGallery', 10, 'divi/text', ''),
			tabletColumns: fieldAttribute('tabletColumns', 'Tablet Columns', '2', 'layoutGallery', 20, 'divi/text', ''),
			mobileColumns: fieldAttribute('mobileColumns', 'Mobile Columns', '1', 'layoutGallery', 30, 'divi/text', ''),
			gap: fieldAttribute('gap', 'Gap', '18', 'layoutGallery', 40, 'divi/text', 'Pixel gap between images.'),
			showFilters: fieldAttribute('showFilters', 'Show Filters', 'on', 'displayGallery', 10, 'divi/text', 'Use on or off.'),
			filterAllLabel: fieldAttribute('filterAllLabel', 'All Label', 'All', 'displayGallery', 20, 'divi/text', ''),
			includeTerms: fieldAttribute('includeTerms', 'Limit Filters', '', 'displayGallery', 30, 'divi/text', 'Optional comma-separated Gallery Filter slugs.'),
			imageSize: fieldAttribute('imageSize', 'Image Size', 'large', 'displayGallery', 40, 'divi/text', 'thumbnail, medium, large, or full.'),
			showCaptions: fieldAttribute('showCaptions', 'Show Captions', 'on', 'displayGallery', 50, 'divi/text', 'Use on or off.'),
			captionSource: fieldAttribute('captionSource', 'Caption Source', 'caption', 'displayGallery', 60, 'divi/text', 'caption, title, alt, or none.'),
			linkBehavior: fieldAttribute('linkBehavior', 'Click Action', 'lightbox', 'displayGallery', 70, 'divi/text', 'lightbox, file, attachment, or none.')
		},
		customCssFields: {
			gallery: {
				subName: 'gallery',
				selectorSuffix: ' .dfmg-gallery'
			},
			item: {
				subName: 'item',
				selectorSuffix: ' .dfmg-item'
			},
			caption: {
				subName: 'caption',
				selectorSuffix: ' .dfmg-caption'
			},
			filter: {
				subName: 'filter',
				selectorSuffix: ' .dfmg-filter'
			}
		},
		settings: {
			content: 'auto',
			design: 'auto',
			advanced: 'auto',
			groups: {
				contentGallery: group('content', 10, 'contentGallery', 'Gallery'),
				layoutGallery: group('content', 20, 'layoutGallery', 'Layout'),
				displayGallery: group('content', 30, 'displayGallery', 'Display')
			}
		}
	};

	var defaultAttrs = {
		module: {
			meta: {
				adminLabel: {
					desktop: {
						value: 'Filterable Masonry Gallery'
					}
				}
			}
		},
		gallery: valueAttr(''),
		ids: valueAttr(''),
		columns: valueAttr('3'),
		tabletColumns: valueAttr('2'),
		mobileColumns: valueAttr('1'),
		gap: valueAttr('18'),
		showFilters: valueAttr('on'),
		filterAllLabel: valueAttr('All'),
		includeTerms: valueAttr(''),
		imageSize: valueAttr('large'),
		showCaptions: valueAttr('on'),
		captionSource: valueAttr('caption'),
		linkBehavior: valueAttr('lightbox')
	};

	function valueAttr(value) {
		return {
			innerContent: {
				desktop: {
					value: value
				}
			}
		};
	}

	function moduleAttribute() {
		return {
			type: 'object',
			selector: '{{selector}}',
			default: {
				meta: {
					adminLabel: {
						desktop: {
							value: 'Filterable Masonry Gallery'
						}
					}
				}
			},
			settings: {
				meta: {
					adminLabel: {}
				},
				advanced: {
					link: {},
					text: {},
					htmlAttributes: {}
				},
				decoration: {
					background: {},
					sizing: {},
					spacing: {},
					border: {},
					boxShadow: {},
					filters: {},
					transform: {},
					animation: {},
					overflow: {},
					disabledOn: {},
					transition: {},
					position: {},
					zIndex: {},
					scroll: {},
					sticky: {}
				}
			}
		};
	}

	function fieldAttribute(name, label, defaultValue, groupSlug, priority, componentName, description) {
		var item = {
			groupType: 'group-item',
			item: {
				groupSlug: groupSlug,
				priority: priority,
				render: true,
				attrName: name + '.innerContent',
				label: label,
				features: {
					sticky: false,
					responsive: false,
					hover: false,
					dynamicContent: false
				},
				component: {
					name: componentName,
					type: 'field'
				}
			}
		};

		if (description) {
			item.item.description = description;
		}

		return {
			type: 'object',
			default: valueAttr(defaultValue),
			settings: {
				innerContent: item
			}
		};
	}

	function group(panel, priority, groupName, label) {
		return {
			panel: panel,
			priority: priority,
			groupName: groupName,
			multiElements: true,
			component: {
				name: 'divi/composite',
				props: {
					groupLabel: label
				}
			}
		};
	}

	function attrValue(attrs, key, fallback) {
		return attrs && attrs[key] && attrs[key].innerContent && attrs[key].innerContent.desktop
			? attrs[key].innerContent.desktop.value
			: fallback;
	}

	function moduleClassnames(params) {
		if (params && params.classnamesInstance) {
			params.classnamesInstance.add('dfmg-divi5-module');
		}
	}

	function ModuleStyles(props) {
		if (!props || !props.elements || !diviModule.StyleContainer) {
			return null;
		}

		return React.createElement(
			diviModule.StyleContainer,
			{
				mode: props.mode,
				state: props.state,
				noStyleTag: props.noStyleTag
			},
			props.elements.style({
				attrName: 'module',
				styleProps: {
					disabledOn: {
						disabledModuleVisibility: props.settings ? props.settings.disabledModuleVisibility : null
					}
				}
			})
		);
	}

	function ModuleScriptData(props) {
		if (!props || !props.elements || !props.elements.scriptData) {
			return null;
		}

		return props.elements.scriptData({
			attrName: 'module'
		});
	}

	function Edit(props) {
		var attrs = props.attrs || {};
		var gallery = attrValue(attrs, 'gallery', '');
		var ids = attrValue(attrs, 'ids', '');
		var columns = attrValue(attrs, 'columns', '3');
		var message = gallery || ids
			? 'Preview renders on the front end. Saved gallery: ' + (gallery || 'none') + '. Columns: ' + columns + '.'
			: 'Choose a saved Masonry Gallery slug or enter image IDs in the module settings.';

		return React.createElement(
			diviModule.ModuleContainer,
			{
				attrs: attrs,
				elements: props.elements,
				id: props.id,
				name: props.name,
				stylesComponent: ModuleStyles,
				classnamesFunction: moduleClassnames,
				scriptDataComponent: ModuleScriptData
			},
			props.elements && props.elements.styleComponents
				? props.elements.styleComponents({ attrName: 'module' })
				: null,
			React.createElement(
				'div',
				{ className: 'dfmg-gallery dfmg-divi5-placeholder' },
				React.createElement('strong', null, 'Filterable Masonry Gallery'),
				React.createElement('p', null, message)
			)
		);
	}

	hooks.addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'dfmg/filterable-masonry-gallery', function () {
		moduleLibrary.registerModule(metadata, {
			defaultAttrs: defaultAttrs,
			defaultPrintedStyleAttrs: {},
			renderers: {
				edit: Edit
			}
		});
	});
}());
