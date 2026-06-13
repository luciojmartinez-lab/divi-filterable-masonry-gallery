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
			gallery: fieldAttribute('gallery', 'Slug de galería guardada', '', 'contentGallery', 10, 'divi/text', 'Usa el slug de una galería guardada, por ejemplo mi-galeria.'),
			ids: fieldAttribute('ids', 'IDs de imagen', '', 'contentGallery', 20, 'divi/textarea', 'IDs de adjuntos separados por comas. Usa el selector visual para elegir y ordenar imágenes.'),
			columns: fieldAttribute('columns', 'Columnas escritorio', '3', 'layoutGallery', 10, 'divi/text', ''),
			tabletColumns: fieldAttribute('tabletColumns', 'Columnas tablet', '2', 'layoutGallery', 20, 'divi/text', ''),
			mobileColumns: fieldAttribute('mobileColumns', 'Columnas móvil', '1', 'layoutGallery', 30, 'divi/text', ''),
			gap: fieldAttribute('gap', 'Separación', '18', 'layoutGallery', 40, 'divi/text', 'Separación en píxeles entre imágenes.'),
			showFilters: fieldAttribute('showFilters', 'Mostrar filtros', 'on', 'displayGallery', 10, 'divi/text', 'Elige Sí o No.'),
			filterAllLabel: fieldAttribute('filterAllLabel', 'Etiqueta Todos', 'All', 'displayGallery', 20, 'divi/text', ''),
			includeTerms: fieldAttribute('includeTerms', 'Limitar filtros', '', 'displayGallery', 30, 'divi/text', 'Slugs de filtros separados por comas. Déjalo vacío para mostrar todos.'),
			imageSize: fieldAttribute('imageSize', 'Tamaño de imagen', 'large', 'displayGallery', 40, 'divi/text', 'Tamaño de imagen usado en la galería.'),
			showCaptions: fieldAttribute('showCaptions', 'Mostrar leyendas', 'on', 'displayGallery', 50, 'divi/text', 'Elige Sí o No.'),
			captionSource: fieldAttribute('captionSource', 'Fuente de leyenda', 'caption', 'displayGallery', 60, 'divi/text', 'Origen del texto mostrado bajo cada imagen.'),
			linkBehavior: fieldAttribute('linkBehavior', 'Acción al hacer clic', 'lightbox', 'displayGallery', 70, 'divi/text', 'Qué ocurre al hacer clic en una imagen.'),
			hoverIcon: fieldAttribute('hoverIcon', 'Icono hover', 'plus', 'displayGallery', 80, 'divi/text', 'Icono mostrado al pasar el raton por encima de una imagen.')
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
				contentGallery: group('content', 10, 'contentGallery', 'Galería'),
				layoutGallery: group('content', 20, 'layoutGallery', 'Diseño'),
				displayGallery: group('content', 30, 'displayGallery', 'Visualización')
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
		linkBehavior: valueAttr('lightbox'),
		hoverIcon: valueAttr('plus')
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
			linkBehavior: attrValue(attrs, 'linkBehavior', 'lightbox'),
			hoverIcon: attrValue(attrs, 'hoverIcon', 'plus')
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

	function mergeIds(existingIds, selectedIds) {
		var seen = {};
		var merged = [];

		existingIds.concat(selectedIds).forEach(function (id) {
			var numericId = parseInt(id, 10);

			if (numericId > 0 && !seen[numericId]) {
				seen[numericId] = true;
				merged.push(numericId);
			}
		});

		return merged;
	}

	function reorder(list, from, to) {
		var copy = list.slice();
		var moved = copy.splice(from, 1)[0];

		copy.splice(to, 0, moved);

		return copy;
	}

	function moveToInsertionIndex(list, from, insertIndex) {
		var target = insertIndex;

		if (from < target) {
			target -= 1;
		}

		target = Math.max(0, Math.min(target, list.length - 1));

		return reorder(list, from, target);
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

	function findSettingsRoot(field) {
		var node = field.parentElement;
		var fallback = field.parentElement;
		var depth = 0;

		while (node && node !== document.body && depth < 12) {
			var text = (node.textContent || '').toLowerCase();

			if (text.indexOf('image ids') !== -1 && text.indexOf('saved gallery slug') !== -1) {
				return node;
			}

			if (text.indexOf('image ids') !== -1) {
				fallback = node;
			}

			node = node.parentElement;
			depth += 1;
		}

		return fallback || document;
	}

	function fieldByLabelInRoot(label, selector, root) {
		var fields = Array.prototype.slice.call((root || document).querySelectorAll(selector));
		var needle = label.toLowerCase();

		return fields.find(function (field) {
			var container = findFieldContainer(field, label);

			return container && (container.textContent || '').toLowerCase().indexOf(needle) !== -1;
		});
	}

	function fieldValueByLabel(label, selector, root) {
		var match = root ? fieldByLabelInRoot(label, selector, root) : fieldByLabel(label, selector);

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
		var gallery = ids ? '' : (fieldValueByLabel('Saved Gallery Slug', 'input', findSettingsRoot(field)) || fieldValueByLabel('Saved Gallery Slug', 'input'));

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
		field.classList.add('dfmg-builder-ids-field');
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

		if (field.nextSibling) {
			field.parentNode.insertBefore(controls, field.nextSibling);
		} else {
			field.parentNode.appendChild(controls);
		}

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

			function clearDropMarkers() {
				Array.prototype.slice.call(thumbs.querySelectorAll('.is-dfmg-drop-before, .is-dfmg-drop-after')).forEach(function (thumb) {
					thumb.classList.remove('is-dfmg-drop-before', 'is-dfmg-drop-after');
				});
			}

			function insertionIndexFor(button, index, event) {
				var rect = button.getBoundingClientRect();
				var after = event.clientX > rect.left + (rect.width / 2);

				clearDropMarkers();
				button.classList.add(after ? 'is-dfmg-drop-after' : 'is-dfmg-drop-before');

				return index + (after ? 1 : 0);
			}

			items.forEach(function (item, index) {
				var button = document.createElement('div');
				var image = document.createElement('img');
				var remove = document.createElement('button');

				button.className = 'dfmg-builder-thumb';
				button.draggable = true;
				button.title = item.title || '';
				image.src = item.thumb;
				image.alt = item.alt || item.title || '';
				remove.className = 'dfmg-builder-thumb-remove';
				remove.type = 'button';
				remove.textContent = '×';
				remove.title = 'Quitar imagen';
				button.appendChild(image);
				button.appendChild(remove);

				button.addEventListener('dragstart', function (event) {
					dragIndex = index;
					button.classList.add('is-dfmg-dragging');
					event.dataTransfer.effectAllowed = 'move';
				});

				button.addEventListener('dragend', function () {
					dragIndex = null;
					button.classList.remove('is-dfmg-dragging');
					clearDropMarkers();
				});

				button.addEventListener('dragover', function (event) {
					event.preventDefault();
					event.dataTransfer.dropEffect = 'move';
					insertionIndexFor(button, index, event);
				});

				button.addEventListener('drop', function (event) {
					var reordered = null;
					var insertIndex = null;

					event.preventDefault();
					insertIndex = insertionIndexFor(button, index, event);

					if (dragIndex === null || dragIndex === insertIndex || dragIndex + 1 === insertIndex) {
						clearDropMarkers();
						return;
					}

					reordered = moveToInsertionIndex(items, dragIndex, insertIndex);
					dragIndex = null;
					clearDropMarkers();
					applyIds(itemIds(reordered));
				});

				remove.addEventListener('click', function (event) {
					event.preventDefault();
					event.stopPropagation();
					applyIds(itemIds(items.filter(function (candidate) {
						return candidate.id !== item.id;
					})));
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
				var selectedIds = frame.state().get('selection').models.map(function (attachment) {
					return attachment.get('id');
				});

				applyIds(mergeIds(currentIds, selectedIds));
			});

			frame.open();
		});

		controls.querySelector('[data-dfmg-panel-clear]').addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			applyIds([]);
		});

		slugField = fieldByLabelInRoot('Saved Gallery Slug', 'input', findSettingsRoot(field)) || fieldByLabel('Saved Gallery Slug', 'input');
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

	function targetDocument() {
		try {
			return window.top && window.top.document ? window.top.document : document;
		} catch (error) {
			return document;
		}
	}

	function findFieldContainerInDocument(field, label, doc) {
		var node = field.parentElement;
		var needle = label.toLowerCase();
		var depth = 0;

		while (node && node !== doc.body && depth < 10) {
			if ((node.textContent || '').toLowerCase().indexOf(needle) !== -1) {
				return node;
			}

			node = node.parentElement;
			depth += 1;
		}

		return field.parentElement;
	}

	function fieldByLabelInDocument(label, selector, doc) {
		var fields = Array.prototype.slice.call(doc.querySelectorAll(selector));
		var needle = label.toLowerCase();

		return fields.find(function (field) {
			var container = findFieldContainerInDocument(field, label, doc);

			return container && (container.textContent || '').toLowerCase().indexOf(needle) !== -1;
		});
	}

	function setExternalFieldValue(field, value) {
		var ownerWindow = field.ownerDocument.defaultView || window;
		var prototype = field.tagName === 'TEXTAREA' ? ownerWindow.HTMLTextAreaElement.prototype : ownerWindow.HTMLInputElement.prototype;
		var descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

		if (descriptor && descriptor.set) {
			descriptor.set.call(field, value);
		} else {
			field.value = value;
		}

		field.dispatchEvent(new ownerWindow.Event('input', { bubbles: true }));
		field.dispatchEvent(new ownerWindow.Event('change', { bubbles: true }));
	}

	function applyIdsToActiveSettings(ids) {
		var doc = targetDocument();
		var idsField = doc.querySelector('textarea.dfmg-builder-ids-field')
			|| fieldByLabelInDocument('Image IDs', 'textarea', doc)
			|| fieldByLabelInDocument('IDs de imagen', 'textarea', doc);
		var slugField = fieldByLabelInDocument('Saved Gallery Slug', 'input', doc)
			|| fieldByLabelInDocument('Slug de galería guardada', 'input', doc)
			|| fieldByLabelInDocument('Slug de galeria guardada', 'input', doc);

		if (!idsField) {
			return false;
		}

		if (slugField) {
			setExternalFieldValue(slugField, '');
		}

		setExternalFieldValue(idsField, ids.join(','));
		return true;
	}

	function clearPreviewDropMarkers(root) {
		Array.prototype.slice.call(root.querySelectorAll('.is-dfmg-drop-before, .is-dfmg-drop-after')).forEach(function (item) {
			item.classList.remove('is-dfmg-drop-before', 'is-dfmg-drop-after');
		});
	}

	function previewInsertionIndexFor(root, item, index, event) {
		var rect = item.getBoundingClientRect();
		var after = event.clientX > rect.left + (rect.width / 2);

		clearPreviewDropMarkers(root);
		item.classList.add(after ? 'is-dfmg-drop-after' : 'is-dfmg-drop-before');

		return index + (after ? 1 : 0);
	}

	function previewVisualItems(grid) {
		var allItems = Array.prototype.slice.call(grid.querySelectorAll('[data-dfmg-item][data-dfmg-id]'));

		if (allItems.some(function (item) {
			return item.classList.contains('is-hidden');
		})) {
			return [];
		}

		return allItems;
	}

	function bindBuilderPreviewReorder(root) {
		var grid = root.querySelector('[data-dfmg-grid]');
		var draggedItem = null;

		if (!grid || grid.dataset.dfmgPreviewReorder === 'true') {
			return;
		}

		grid.dataset.dfmgPreviewReorder = 'true';
		Array.prototype.slice.call(grid.querySelectorAll('[data-dfmg-item][data-dfmg-id]')).forEach(function (item) {
			item.draggable = true;
			item.classList.add('dfmg-builder-preview-item');
			item.title = 'Arrastra para ordenar';

			item.addEventListener('dragstart', function (event) {
				draggedItem = item;
				item.classList.add('is-dfmg-dragging');
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', item.getAttribute('data-dfmg-id') || '');
			});

			item.addEventListener('dragend', function () {
				if (draggedItem) {
					draggedItem.classList.remove('is-dfmg-dragging');
				}

				draggedItem = null;
				clearPreviewDropMarkers(grid);
			});

			item.addEventListener('dragover', function (event) {
				var items = previewVisualItems(grid);
				var index = items.indexOf(item);

				if (!draggedItem || index === -1) {
					return;
				}

				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
				previewInsertionIndexFor(grid, item, index, event);
			});

			item.addEventListener('drop', function (event) {
				var items = previewVisualItems(grid);
				var from = items.indexOf(draggedItem);
				var index = items.indexOf(item);
				var insertIndex = null;
				var ids = items.map(function (candidate) {
					return parseInt(candidate.getAttribute('data-dfmg-id'), 10);
				}).filter(function (id) {
					return id > 0;
				});
				var target = null;
				var moved = null;

				event.preventDefault();

				if (!draggedItem || from === -1 || index === -1) {
					clearPreviewDropMarkers(grid);
					return;
				}

				insertIndex = previewInsertionIndexFor(grid, item, index, event);
				if (from === insertIndex || from + 1 === insertIndex) {
					clearPreviewDropMarkers(grid);
					return;
				}

				target = insertIndex;

				moved = ids.splice(from, 1)[0];
				ids.splice(Math.max(0, Math.min(target, ids.length)), 0, moved);
				applyIdsToActiveSettings(ids);
				clearPreviewDropMarkers(grid);
			});
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

			if (previewRef.current) {
				bindBuilderPreviewReorder(previewRef.current);
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
