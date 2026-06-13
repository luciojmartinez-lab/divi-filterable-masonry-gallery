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
			ids: fieldAttribute('ids', 'Image IDs', '', 'contentGallery', 20, 'divi/textarea', 'Optional comma-separated attachment IDs. Use the visual selector above to choose and reorder images.'),
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

	function restRoot() {
		var settings = window.wpApiSettings || (window.top && window.top.wpApiSettings);

		if (settings && settings.root) {
			return settings.root.replace(/\/$/, '');
		}

		return window.location.origin + '/wp-json';
	}

	function restNonce() {
		var settings = window.wpApiSettings || (window.top && window.top.wpApiSettings);

		return settings && settings.nonce ? settings.nonce : '';
	}

	function previewParams(attrs, ids, gallery) {
		return {
			gallery: gallery,
			ids: ids,
			columns: attrValue(attrs, 'columns', '3'),
			tabletColumns: attrValue(attrs, 'tabletColumns', '2'),
			mobileColumns: attrValue(attrs, 'mobileColumns', '1'),
			gap: attrValue(attrs, 'gap', '18'),
			showFilters: attrValue(attrs, 'showFilters', 'on'),
			filterAllLabel: attrValue(attrs, 'filterAllLabel', 'All'),
			includeTerms: attrValue(attrs, 'includeTerms', ''),
			imageSize: attrValue(attrs, 'imageSize', 'large'),
			showCaptions: attrValue(attrs, 'showCaptions', 'on'),
			captionSource: attrValue(attrs, 'captionSource', 'caption'),
			linkBehavior: attrValue(attrs, 'linkBehavior', 'lightbox')
		};
	}

	function previewUrl(params) {
		var query = Object.keys(params).map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key] == null ? '' : params[key]);
		}).join('&');

		return restRoot() + '/dfmg/v1/preview?' + query;
	}

	function parseIds(value) {
		var matches = String(value || '').match(/\d+/g) || [];

		return matches.map(function (id) {
			return parseInt(id, 10);
		}).filter(function (id) {
			return id > 0;
		});
	}

	function moduleId(props) {
		return props.id || props.clientId || props.moduleId || props.blockId || (props.block && props.block.clientId) || '';
	}

	function moduleAttrs(props) {
		return props.attrs || props.moduleAttrs || props.attributes || {};
	}

	function updateModuleAttrs(props, values) {
		var payload = {};
		var attempts = [];
		var id = moduleId(props);
		var wpData = window.wp && window.wp.data ? window.wp.data : (window.top && window.top.wp && window.top.wp.data ? window.top.wp.data : null);

		Object.keys(values).forEach(function (key) {
			payload[key] = valueAttr(values[key]);
		});

		[
			props.setAttrs,
			props.setAttributes,
			props.updateAttrs,
			props.onUpdateAttrs,
			props.onChangeAttrs
		].forEach(function (fn) {
			if (typeof fn === 'function') {
				attempts.push(function () {
					fn(payload);
				});
				attempts.push(function () {
					fn(id, payload);
				});
			}
		});

		if (props.actions) {
			['setAttrs', 'setAttributes', 'updateAttrs', 'onUpdateAttrs'].forEach(function (name) {
				if (typeof props.actions[name] === 'function') {
					attempts.push(function () {
						props.actions[name](payload);
					});
					attempts.push(function () {
						props.actions[name](id, payload);
					});
				}
			});
		}

		if (wpData && id) {
			['core/block-editor', 'core/editor'].forEach(function (store) {
				attempts.push(function () {
					var dispatch = wpData.dispatch(store);

					if (dispatch && typeof dispatch.updateBlockAttributes === 'function') {
						dispatch.updateBlockAttributes(id, payload);
					}
				});
			});
		}

		attempts.forEach(function (attempt) {
			try {
				attempt();
			} catch (error) {
				// Different Divi 5 builds expose different update callbacks.
			}
		});
	}

	function mediaWindow() {
		try {
			if (window.wp && window.wp.media) {
				return window;
			}

			if (window.parent && window.parent.wp && window.parent.wp.media) {
				return window.parent;
			}

			if (window.top && window.top.wp && window.top.wp.media) {
				return window.top;
			}
		} catch (error) {
			return null;
		}

		return null;
	}

	function itemIds(items) {
		return (items || []).map(function (item) {
			return item.id;
		}).filter(function (id) {
			return id > 0;
		});
	}

	function reorder(list, from, to) {
		var copy = list.slice();
		var moved = copy.splice(from, 1)[0];

		copy.splice(to, 0, moved);

		return copy;
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

	function usePreview(attrs, activeIds, activeGallery) {
		var previewState = React.useState({
			html: '',
			ids: '',
			items: [],
			loading: true,
			error: ''
		});
		var preview = previewState[0];
		var setPreview = previewState[1];
		var params = previewParams(attrs, activeIds, activeGallery);
		var paramsKey = JSON.stringify(params);

		React.useEffect(function () {
			var controller = window.AbortController ? new window.AbortController() : null;
			var headers = {};
			var nonce = restNonce();

			if (nonce) {
				headers['X-WP-Nonce'] = nonce;
			}

			setPreview(function (current) {
				return {
					html: current.html,
					ids: current.ids,
					items: current.items,
					loading: true,
					error: ''
				};
			});

			window.fetch(previewUrl(params), {
				credentials: 'same-origin',
				headers: headers,
				signal: controller ? controller.signal : undefined
			}).then(function (response) {
				if (!response.ok) {
					throw new Error('Unable to load gallery preview.');
				}

				return response.json();
			}).then(function (data) {
				setPreview({
					html: data.html || '',
					ids: data.ids || '',
					items: data.items || [],
					loading: false,
					error: ''
				});
			}).catch(function (error) {
				if (error && error.name === 'AbortError') {
					return;
				}

				setPreview({
					html: '',
					ids: activeIds,
					items: [],
					loading: false,
					error: error && error.message ? error.message : 'Unable to load gallery preview.'
				});
			});

			return function () {
				if (controller) {
					controller.abort();
				}
			};
		}, [paramsKey]);

		return preview;
	}

	function GalleryPreview(props) {
		var attrs = moduleAttrs(props);
		var previewRef = React.useRef(null);
		var preview = usePreview(
			attrs,
			attrValue(attrs, 'ids', ''),
			attrValue(attrs, 'gallery', '')
		);

		React.useEffect(function () {
			if (previewRef.current && window.DFMGInitGalleries) {
				window.DFMGInitGalleries(previewRef.current);
			}
		}, [preview.html]);

		return React.createElement(
			'div',
			{ className: 'dfmg-builder-preview', ref: previewRef },
			preview.loading
				? React.createElement('div', { className: 'dfmg-empty' }, 'Cargando previsualización...')
				: null,
			!preview.loading && preview.error
				? React.createElement('div', { className: 'dfmg-empty' }, preview.error)
				: null,
			!preview.loading && !preview.error && preview.html
				? React.createElement('div', { dangerouslySetInnerHTML: { __html: preview.html } })
				: null,
			!preview.loading && !preview.error && !preview.html
				? React.createElement('div', { className: 'dfmg-empty' }, 'Selecciona imágenes o escribe un slug de galería guardada.')
				: null
		);
	}

	function GallerySelector(props) {
		var attrs = moduleAttrs(props);
		var attrGallery = attrValue(attrs, 'gallery', '');
		var attrIds = attrValue(attrs, 'ids', '');
		var localIdsState = React.useState(null);
		var localIds = localIdsState[0];
		var setLocalIds = localIdsState[1];
		var dragIndexRef = React.useRef(null);
		var attrKey = attrGallery + '|' + attrIds;
		var activeIds = localIds !== null ? localIds : attrIds;
		var activeGallery = localIds !== null ? '' : attrGallery;
		var preview = usePreview(attrs, activeIds, activeGallery);

		React.useEffect(function () {
			setLocalIds(null);
		}, [attrKey]);

		function setDirectIds(ids) {
			var value = ids.join(',');

			setLocalIds(value);
			updateModuleAttrs(props, {
				ids: value,
				gallery: ''
			});
		}

		function openMediaFrame(event) {
			var apiWindow = mediaWindow();
			var currentIds = parseIds(activeIds || preview.ids);
			var frame = null;

			event.preventDefault();
			event.stopPropagation();

			if (!apiWindow) {
				setPreview({
					html: preview.html,
					ids: preview.ids,
					items: preview.items,
					loading: false,
					error: 'The WordPress media picker is not available in this builder window.'
				});
				return;
			}

			frame = apiWindow.wp.media({
				title: 'Seleccionar imágenes de la galería',
				button: {
					text: 'Usar imágenes seleccionadas'
				},
				library: {
					type: 'image'
				},
				multiple: true
			});

			frame.on('open', function () {
				var selection = frame.state().get('selection');

				currentIds.forEach(function (id) {
					var attachment = apiWindow.wp.media.attachment(id);

					attachment.fetch();
					selection.add(attachment);
				});
			});

			frame.on('select', function () {
				var selected = frame.state().get('selection').models.map(function (attachment) {
					return attachment.get('id');
				});

				setDirectIds(selected);
			});

			frame.open();
		}

		function clearDirectSelection(event) {
			event.preventDefault();
			event.stopPropagation();
			setDirectIds([]);
		}

		function onDrop(index, event) {
			var from = dragIndexRef.current;
			var reordered = null;

			event.preventDefault();
			event.stopPropagation();

			if (from === null || from === index || !preview.items.length) {
				return;
			}

			reordered = reorder(preview.items, from, index);
			dragIndexRef.current = null;
			setDirectIds(itemIds(reordered));
		}

		function renderThumbs() {
			if (!preview.items.length) {
				return React.createElement(
					'p',
					{ className: 'dfmg-builder-empty-note' },
					'No hay imágenes seleccionadas.'
				);
			}

			return React.createElement(
				'div',
				{ className: 'dfmg-builder-thumbs', 'aria-label': 'Selected images' },
				preview.items.map(function (item, index) {
					return React.createElement(
						'button',
						{
							className: 'dfmg-builder-thumb',
							draggable: true,
							key: item.id,
							onDragStart: function (event) {
								dragIndexRef.current = index;
								event.dataTransfer.effectAllowed = 'move';
							},
							onDragOver: function (event) {
								event.preventDefault();
							},
							onDrop: function (event) {
								onDrop(index, event);
							},
							title: item.title || '',
							type: 'button'
						},
						React.createElement('img', { src: item.thumb, alt: item.alt || item.title || '' })
					);
				})
			);
		}

		return React.createElement(
			'div',
			{ className: 'dfmg-builder-controls' },
			React.createElement(
				'div',
				{ className: 'dfmg-builder-controls__bar' },
				React.createElement(
					'button',
					{ className: 'dfmg-builder-button', type: 'button', onClick: openMediaFrame },
					'Añadir/editar imágenes'
				),
				React.createElement(
					'button',
					{ className: 'dfmg-builder-button dfmg-builder-button--secondary', type: 'button', onClick: clearDirectSelection },
					'Limpiar'
				)
			),
			React.createElement(
				'div',
				{ className: 'dfmg-builder-count' },
				preview.items.length + (1 === preview.items.length ? ' imagen' : ' imágenes')
			),
			renderThumbs()
		);
	}

	function SettingsContent(props) {
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(GallerySelector, props),
			diviModule.ModuleGroups && props.groupConfiguration
				? React.createElement(diviModule.ModuleGroups, { groups: props.groupConfiguration })
				: null
		);
	}

	function Edit(props) {
		var attrs = moduleAttrs(props);

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
			React.createElement(GalleryPreview, { attrs: attrs })
		);
	}

	hooks.addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'dfmg/filterable-masonry-gallery', function () {
		moduleLibrary.registerModule(metadata, {
			defaultAttrs: defaultAttrs,
			defaultPrintedStyleAttrs: {},
			settings: {
				content: SettingsContent
			},
			renderers: {
				edit: Edit
			}
		});
	});
}());
