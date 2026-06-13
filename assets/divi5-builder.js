(function () {
	'use strict';

	var hooks = window.vendor && window.vendor.wp && window.vendor.wp.hooks;
	var divi = window.divi || {};
	var moduleLibrary = divi.moduleLibrary || {};
	var diviModule = divi.module || {};
	var React = (window.vendor && window.vendor.React) || window.React;
	var canRegisterModule = hooks && moduleLibrary.registerModule && React && diviModule.ModuleContainer;

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

	function moduleAttrs(props) {
		return props.attrs || props.moduleAttrs || props.attributes || {};
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

	function findFieldContainer(field, label) {
		var node = field.parentElement;
		var needle = label.toLowerCase();
		var depth = 0;

		while (node && node !== document.body && depth < 8) {
			if ((node.textContent || '').toLowerCase().indexOf(needle) !== -1) {
				return node;
			}

			node = node.parentElement;
			depth += 1;
		}

		return field.parentElement;
	}

	function fieldByLabel(label, selector) {
		var fields = Array.prototype.slice.call(document.querySelectorAll(selector));
		var needle = label.toLowerCase();

		return fields.find(function (field) {
			var container = findFieldContainer(field, label);

			return container && (container.textContent || '').toLowerCase().indexOf(needle) !== -1;
		});
	}

	function fieldValueByLabel(label, selector) {
		var match = fieldByLabel(label, selector);

		return match ? match.value : '';
	}

	function setFieldValue(field, value) {
		var prototype = field.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
		var descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

		if (descriptor && descriptor.set) {
			descriptor.set.call(field, value);
		} else {
			field.value = value;
		}

		field.dispatchEvent(new window.Event('input', { bubbles: true }));
		field.dispatchEvent(new window.Event('change', { bubbles: true }));
	}

	function fetchItemsForField(field, callback) {
		var ids = field.value || '';
		var gallery = ids ? '' : fieldValueByLabel('Saved Gallery Slug', 'input');

		window.fetch(previewUrl({ gallery: gallery, ids: ids }), {
			credentials: 'same-origin',
			headers: restNonce() ? { 'X-WP-Nonce': restNonce() } : {}
		}).then(function (response) {
			if (!response.ok) {
				throw new Error('No se pudo cargar la galería.');
			}

			return response.json();
		}).then(function (data) {
			callback(data.items || [], '');
		}).catch(function (error) {
			callback([], error && error.message ? error.message : 'No se pudo cargar la galería.');
		});
	}

	function enhanceSidebarImageField(field) {
		var container = findFieldContainer(field, 'Image IDs');
		var controls = null;
		var thumbs = null;
		var status = null;
		var slugField = null;
		var items = [];
		var dragIndex = null;

		if (!container || field.dataset.dfmgEnhanced === 'true') {
			return;
		}

		field.dataset.dfmgEnhanced = 'true';
		controls = document.createElement('div');
		controls.className = 'dfmg-builder-controls dfmg-builder-controls--sidebar';
		controls.innerHTML = [
			'<div class="dfmg-builder-controls__bar">',
			'<button class="dfmg-builder-button" type="button" data-dfmg-panel-select>Añadir/editar imágenes</button>',
			'<button class="dfmg-builder-button dfmg-builder-button--secondary" type="button" data-dfmg-panel-clear>Limpiar</button>',
			'</div>',
			'<div class="dfmg-builder-count" data-dfmg-panel-count>0 imágenes</div>',
			'<div class="dfmg-builder-thumbs" data-dfmg-panel-thumbs></div>',
			'<p class="dfmg-builder-empty-note" data-dfmg-panel-status></p>'
		].join('');

		field.parentNode.insertBefore(controls, field);
		thumbs = controls.querySelector('[data-dfmg-panel-thumbs]');
		status = controls.querySelector('[data-dfmg-panel-status]');

		function applyIds(ids) {
			if (slugField) {
				setFieldValue(slugField, '');
			}

			setFieldValue(field, ids.join(','));
			refresh();
		}

		function render(nextItems, message) {
			items = nextItems;
			controls.querySelector('[data-dfmg-panel-count]').textContent = items.length + (items.length === 1 ? ' imagen' : ' imágenes');
			thumbs.innerHTML = '';
			status.textContent = message || (items.length ? '' : 'No hay imágenes seleccionadas.');

			items.forEach(function (item, index) {
				var button = document.createElement('button');
				var image = document.createElement('img');

				button.className = 'dfmg-builder-thumb';
				button.draggable = true;
				button.type = 'button';
				button.title = item.title || '';
				image.src = item.thumb;
				image.alt = item.alt || item.title || '';
				button.appendChild(image);

				button.addEventListener('dragstart', function (event) {
					dragIndex = index;
					event.dataTransfer.effectAllowed = 'move';
				});

				button.addEventListener('dragover', function (event) {
					event.preventDefault();
				});

				button.addEventListener('drop', function (event) {
					var reordered = null;

					event.preventDefault();
					if (dragIndex === null || dragIndex === index) {
						return;
					}

					reordered = reorder(items, dragIndex, index);
					dragIndex = null;
					applyIds(itemIds(reordered));
				});

				thumbs.appendChild(button);
			});
		}

		function refresh() {
			status.textContent = 'Cargando imágenes...';
			fetchItemsForField(field, render);
		}

		controls.querySelector('[data-dfmg-panel-select]').addEventListener('click', function (event) {
			var apiWindow = mediaWindow();
			var currentIds = parseIds(field.value || itemIds(items).join(','));
			var frame = null;

			event.preventDefault();
			event.stopPropagation();

			if (!apiWindow) {
				status.textContent = 'El selector de medios de WordPress no está disponible.';
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
				applyIds(frame.state().get('selection').models.map(function (attachment) {
					return attachment.get('id');
				}));
			});

			frame.open();
		});

		controls.querySelector('[data-dfmg-panel-clear]').addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			applyIds([]);
		});

		slugField = fieldByLabel('Saved Gallery Slug', 'input');
		if (slugField) {
			slugField.addEventListener('input', refresh);
			slugField.addEventListener('change', refresh);
		}

		field.addEventListener('input', refresh);
		refresh();
	}

	function initSidebarEnhancer() {
		var observer = null;
		var run = function () {
			Array.prototype.slice.call(document.querySelectorAll('textarea')).forEach(function (field) {
				var container = findFieldContainer(field, 'Image IDs');

				if (container && (container.textContent || '').indexOf('Image IDs') !== -1) {
					enhanceSidebarImageField(field);
				}
			});
		};

		run();

		if (!window.MutationObserver || !document.body) {
			return;
		}

		observer = new window.MutationObserver(function () {
			window.clearTimeout(initSidebarEnhancer.timer);
			initSidebarEnhancer.timer = window.setTimeout(run, 80);
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
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

	if (canRegisterModule) {
		hooks.addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'dfmg/filterable-masonry-gallery', function () {
			moduleLibrary.registerModule(metadata, {
				defaultAttrs: defaultAttrs,
				defaultPrintedStyleAttrs: {},
				renderers: {
					edit: Edit
				}
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSidebarEnhancer);
	} else {
		initSidebarEnhancer();
	}
}());
