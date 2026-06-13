(function () {
	'use strict';

	var imageIdLabels = ['Image IDs', 'IDs de imagen', 'ID de imagen'];
	var gallerySlugLabels = ['Saved Gallery Slug', 'Slug de galería guardada', 'Slug de galeria guardada'];

	function textIncludesAny(text, labels) {
		var haystack = String(text || '').toLowerCase();

		return labels.some(function (label) {
			return haystack.indexOf(label.toLowerCase()) !== -1;
		});
	}

	function restRoot() {
		var settings = window.wpApiSettings || (window.top && window.top.wpApiSettings);
		var apiLink = document.querySelector('link[rel="https://api.w.org/"]');

		if (settings && settings.root) {
			return settings.root.replace(/\/$/, '');
		}

		if (apiLink && apiLink.href) {
			return apiLink.href.replace(/\/$/, '');
		}

		return window.location.origin + '/wp-json';
	}

	function restNonce() {
		var settings = window.wpApiSettings || (window.top && window.top.wpApiSettings);

		return settings && settings.nonce ? settings.nonce : '';
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

	function findFieldContainer(field, labels) {
		var node = field.parentElement;
		var depth = 0;
		var fallback = field.parentElement;

		while (node && node !== document.body && depth < 10) {
			if (textIncludesAny(node.textContent, labels)) {
				return node;
			}

			node = node.parentElement;
			depth += 1;
		}

		return fallback;
	}

	function findSettingsRoot(field) {
		var node = field.parentElement;
		var fallback = field.parentElement;
		var depth = 0;

		while (node && node !== document.body && depth < 12) {
			if (textIncludesAny(node.textContent, imageIdLabels) && textIncludesAny(node.textContent, gallerySlugLabels)) {
				return node;
			}

			if (textIncludesAny(node.textContent, imageIdLabels)) {
				fallback = node;
			}

			node = node.parentElement;
			depth += 1;
		}

		return fallback || document;
	}

	function fieldByLabels(labels, selector, root) {
		var fields = Array.prototype.slice.call((root || document).querySelectorAll(selector));

		return fields.find(function (field) {
			var container = findFieldContainer(field, labels);

			return container && textIncludesAny(container.textContent, labels);
		});
	}

	function fieldValueByLabels(labels, selector, root) {
		var match = fieldByLabels(labels, selector, root);

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
		var root = findSettingsRoot(field);
		var gallery = ids ? '' : (fieldValueByLabels(gallerySlugLabels, 'input', root) || fieldValueByLabels(gallerySlugLabels, 'input'));
		var nonce = restNonce();

		window.fetch(previewUrl({ gallery: gallery, ids: ids }), {
			credentials: 'same-origin',
			headers: nonce ? { 'X-WP-Nonce': nonce } : {}
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
		var container = findFieldContainer(field, imageIdLabels);
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

		slugField = fieldByLabels(gallerySlugLabels, 'input', findSettingsRoot(field)) || fieldByLabels(gallerySlugLabels, 'input');
		if (slugField) {
			slugField.addEventListener('input', refresh);
			slugField.addEventListener('change', refresh);
		}

		field.addEventListener('input', refresh);
		refresh();
	}

	function initSidebarEnhancer() {
		var run = function () {
			Array.prototype.slice.call(document.querySelectorAll('textarea')).forEach(function (field) {
				var container = findFieldContainer(field, imageIdLabels);

				if (container && textIncludesAny(container.textContent, imageIdLabels)) {
					enhanceSidebarImageField(field);
				}
			});
		};

		run();

		if (window.MutationObserver && document.body) {
			new window.MutationObserver(function () {
				window.clearTimeout(initSidebarEnhancer.timer);
				initSidebarEnhancer.timer = window.setTimeout(run, 80);
			}).observe(document.body, {
				childList: true,
				subtree: true
			});
		}

		window.setTimeout(run, 300);
		window.setTimeout(run, 1200);
		window.setTimeout(run, 3000);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSidebarEnhancer);
	} else {
		initSidebarEnhancer();
	}
}());
