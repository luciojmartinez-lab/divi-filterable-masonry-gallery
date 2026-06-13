import React, { useEffect, useRef, useState } from 'react';
import { ModuleContainer } from '@divi/module';

import { ModuleScriptData } from './module-script-data';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';

const attrValue = (attrs, key, fallback) => (
	attrs?.[key]?.innerContent?.desktop?.value ?? fallback
);

const restRoot = () => {
	const settings = window.wpApiSettings || window.top?.wpApiSettings;

	return settings?.root ? settings.root.replace(/\/$/, '') : `${window.location.origin}/wp-json`;
};

const restNonce = () => {
	const settings = window.wpApiSettings || window.top?.wpApiSettings;

	return settings?.nonce || '';
};

const parseIds = (value) => (
	(String(value || '').match(/\d+/g) || [])
		.map((id) => parseInt(id, 10))
		.filter((id) => id > 0)
);

const moduleAttrs = (props) => (
	props.attrs || props.moduleAttrs || props.attributes || {}
);

const itemIds = (items) => (
	(items || [])
		.map((item) => item.id)
		.filter((id) => id > 0)
);

const mergeIds = (existingIds, selectedIds) => {
	const seen = {};
	const merged = [];

	existingIds.concat(selectedIds).forEach((id) => {
		const numericId = parseInt(id, 10);

		if (numericId > 0 && !seen[numericId]) {
			seen[numericId] = true;
			merged.push(numericId);
		}
	});

	return merged;
};

const reorder = (list, from, to) => {
	const copy = list.slice();
	const moved = copy.splice(from, 1)[0];

	copy.splice(to, 0, moved);

	return copy;
};

const moveToInsertionIndex = (list, from, insertIndex) => {
	let target = insertIndex;

	if (from < target) {
		target -= 1;
	}

	target = Math.max(0, Math.min(target, list.length - 1));

	return reorder(list, from, target);
};

const mediaWindow = () => {
	try {
		if (window.wp?.media) {
			return window;
		}

		if (window.parent?.wp?.media) {
			return window.parent;
		}

		if (window.top?.wp?.media) {
			return window.top;
		}
	} catch (error) {
		return null;
	}

	return null;
};

const previewParams = (attrs, ids, gallery) => ({
	gallery,
	ids,
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
});

const previewUrl = (params) => {
	const query = Object.keys(params)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
		.join('&');

	return `${restRoot()}/dfmg/v1/preview?${query}`;
};

const findFieldContainer = (field, label) => {
	let node = field.parentElement;
	const needle = label.toLowerCase();
	let depth = 0;

	while (node && node !== document.body && depth < 8) {
		if ((node.textContent || '').toLowerCase().includes(needle)) {
			return node;
		}

		node = node.parentElement;
		depth += 1;
	}

	return field.parentElement;
};

const findSettingsRoot = (field) => {
	let node = field.parentElement;
	let fallback = field.parentElement;
	let depth = 0;

	while (node && node !== document.body && depth < 12) {
		const text = (node.textContent || '').toLowerCase();

		if (text.includes('image ids') && text.includes('saved gallery slug')) {
			return node;
		}

		if (text.includes('image ids')) {
			fallback = node;
		}

		node = node.parentElement;
		depth += 1;
	}

	return fallback || document;
};

const fieldByLabel = (label, selector) => (
	Array.from(document.querySelectorAll(selector)).find((field) => {
		const container = findFieldContainer(field, label);

		return container && (container.textContent || '').toLowerCase().includes(label.toLowerCase());
	})
);

const fieldByLabelInRoot = (label, selector, root) => (
	Array.from((root || document).querySelectorAll(selector)).find((field) => {
		const container = findFieldContainer(field, label);

		return container && (container.textContent || '').toLowerCase().includes(label.toLowerCase());
	})
);

const fieldValueByLabel = (label, selector, root) => {
	const match = root ? fieldByLabelInRoot(label, selector, root) : fieldByLabel(label, selector);

	return match ? match.value : '';
};

const setFieldValue = (field, value) => {
	const prototype = field.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

	if (descriptor?.set) {
		descriptor.set.call(field, value);
	} else {
		field.value = value;
	}

	field.dispatchEvent(new window.Event('input', { bubbles: true }));
	field.dispatchEvent(new window.Event('change', { bubbles: true }));
};

const fetchItemsForField = (field, callback) => {
	const ids = field.value || '';
	const gallery = ids ? '' : (fieldValueByLabel('Saved Gallery Slug', 'input', findSettingsRoot(field)) || fieldValueByLabel('Saved Gallery Slug', 'input'));
	const nonce = restNonce();

	fetch(previewUrl({ gallery, ids }), {
		credentials: 'same-origin',
		headers: nonce ? { 'X-WP-Nonce': nonce } : {}
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('No se pudo cargar la galería.');
			}

			return response.json();
		})
		.then((data) => callback(data.items || [], ''))
		.catch((error) => callback([], error?.message || 'No se pudo cargar la galería.'));
};

const enhanceSidebarImageField = (field) => {
	const container = findFieldContainer(field, 'Image IDs');
	let controls = null;
	let thumbs = null;
	let status = null;
	let slugField = null;
	let items = [];
	let dragIndex = null;

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

	const applyIds = (ids) => {
		if (slugField) {
			setFieldValue(slugField, '');
		}

		setFieldValue(field, ids.join(','));
		refresh();
	};

	const render = (nextItems, message) => {
		items = nextItems;
		controls.querySelector('[data-dfmg-panel-count]').textContent = `${items.length}${items.length === 1 ? ' imagen' : ' imágenes'}`;
		thumbs.innerHTML = '';
		status.textContent = message || (items.length ? '' : 'No hay imágenes seleccionadas.');

		const clearDropMarkers = () => {
			Array.from(thumbs.querySelectorAll('.is-dfmg-drop-before, .is-dfmg-drop-after')).forEach((thumb) => {
				thumb.classList.remove('is-dfmg-drop-before', 'is-dfmg-drop-after');
			});
		};

		const insertionIndexFor = (button, index, event) => {
			const rect = button.getBoundingClientRect();
			const after = event.clientX > rect.left + (rect.width / 2);

			clearDropMarkers();
			button.classList.add(after ? 'is-dfmg-drop-after' : 'is-dfmg-drop-before');

			return index + (after ? 1 : 0);
		};

		items.forEach((item, index) => {
			const button = document.createElement('div');
			const image = document.createElement('img');
			const remove = document.createElement('button');

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

			button.addEventListener('dragstart', (event) => {
				dragIndex = index;
				button.classList.add('is-dfmg-dragging');
				event.dataTransfer.effectAllowed = 'move';
			});

			button.addEventListener('dragend', () => {
				dragIndex = null;
				button.classList.remove('is-dfmg-dragging');
				clearDropMarkers();
			});

			button.addEventListener('dragover', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
				insertionIndexFor(button, index, event);
			});

			button.addEventListener('drop', (event) => {
				event.preventDefault();
				const insertIndex = insertionIndexFor(button, index, event);

				if (dragIndex === null || dragIndex === insertIndex || dragIndex + 1 === insertIndex) {
					clearDropMarkers();
					return;
				}

				const reordered = moveToInsertionIndex(items, dragIndex, insertIndex);

				dragIndex = null;
				clearDropMarkers();
				applyIds(itemIds(reordered));
			});

			remove.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				applyIds(itemIds(items.filter((candidate) => candidate.id !== item.id)));
			});

			thumbs.appendChild(button);
		});
	};

	function refresh() {
		status.textContent = 'Cargando imágenes...';
		fetchItemsForField(field, render);
	}

	controls.querySelector('[data-dfmg-panel-select]').addEventListener('click', (event) => {
		const apiWindow = mediaWindow();
		const currentIds = parseIds(field.value || itemIds(items).join(','));

		event.preventDefault();
		event.stopPropagation();

		if (!apiWindow) {
			status.textContent = 'El selector de medios de WordPress no está disponible.';
			return;
		}

		const frame = apiWindow.wp.media({
			title: 'Seleccionar imágenes de la galería',
			button: {
				text: 'Usar imágenes seleccionadas'
			},
			library: {
				type: 'image'
			},
			multiple: true
		});

		frame.on('open', () => {
			const selection = frame.state().get('selection');

			currentIds.forEach((id) => {
				const attachment = apiWindow.wp.media.attachment(id);

				attachment.fetch();
				selection.add(attachment);
			});
		});

		frame.on('select', () => {
			const selectedIds = frame.state().get('selection').models.map((attachment) => attachment.get('id'));

			applyIds(mergeIds(currentIds, selectedIds));
		});

		frame.open();
	});

	controls.querySelector('[data-dfmg-panel-clear]').addEventListener('click', (event) => {
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
};

export const initSidebarEnhancer = () => {
	const run = () => {
		Array.from(document.querySelectorAll('textarea')).forEach((field) => {
			const container = findFieldContainer(field, 'Image IDs');

			if (container && (container.textContent || '').includes('Image IDs')) {
				enhanceSidebarImageField(field);
			}
		});
	};

	run();

	if (!window.MutationObserver || !document.body) {
		return;
	}

	const observer = new window.MutationObserver(() => {
		window.clearTimeout(initSidebarEnhancer.timer);
		initSidebarEnhancer.timer = window.setTimeout(run, 80);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
};

const targetDocument = () => {
	try {
		return window.top?.document || document;
	} catch (error) {
		return document;
	}
};

const findFieldContainerInDocument = (field, label, doc) => {
	let node = field.parentElement;
	const needle = label.toLowerCase();
	let depth = 0;

	while (node && node !== doc.body && depth < 10) {
		if ((node.textContent || '').toLowerCase().includes(needle)) {
			return node;
		}

		node = node.parentElement;
		depth += 1;
	}

	return field.parentElement;
};

const fieldByLabelInDocument = (label, selector, doc) => (
	Array.from(doc.querySelectorAll(selector)).find((field) => {
		const container = findFieldContainerInDocument(field, label, doc);

		return container && (container.textContent || '').toLowerCase().includes(label.toLowerCase());
	})
);

const setExternalFieldValue = (field, value) => {
	const ownerWindow = field.ownerDocument.defaultView || window;
	const prototype = field.tagName === 'TEXTAREA' ? ownerWindow.HTMLTextAreaElement.prototype : ownerWindow.HTMLInputElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

	if (descriptor?.set) {
		descriptor.set.call(field, value);
	} else {
		field.value = value;
	}

	field.dispatchEvent(new ownerWindow.Event('input', { bubbles: true }));
	field.dispatchEvent(new ownerWindow.Event('change', { bubbles: true }));
};

const applyIdsToActiveSettings = (ids) => {
	const doc = targetDocument();
	const idsField = doc.querySelector('textarea.dfmg-builder-ids-field') || fieldByLabelInDocument('Image IDs', 'textarea', doc);
	const slugField = fieldByLabelInDocument('Saved Gallery Slug', 'input', doc);

	if (!idsField) {
		return false;
	}

	if (slugField) {
		setExternalFieldValue(slugField, '');
	}

	setExternalFieldValue(idsField, ids.join(','));
	return true;
};

const clearPreviewDropMarkers = (root) => {
	Array.from(root.querySelectorAll('.is-dfmg-drop-before, .is-dfmg-drop-after')).forEach((item) => {
		item.classList.remove('is-dfmg-drop-before', 'is-dfmg-drop-after');
	});
};

const previewInsertionIndexFor = (root, item, index, event) => {
	const rect = item.getBoundingClientRect();
	const after = event.clientX > rect.left + (rect.width / 2);

	clearPreviewDropMarkers(root);
	item.classList.add(after ? 'is-dfmg-drop-after' : 'is-dfmg-drop-before');

	return index + (after ? 1 : 0);
};

const bindBuilderPreviewReorder = (root) => {
	const grid = root.querySelector('[data-dfmg-grid]');
	let draggedItem = null;

	if (!grid || grid.dataset.dfmgPreviewReorder === 'true') {
		return;
	}

	grid.dataset.dfmgPreviewReorder = 'true';
	Array.from(grid.querySelectorAll('[data-dfmg-item][data-dfmg-id]')).forEach((item) => {
		item.draggable = true;
		item.classList.add('dfmg-builder-preview-item');

		item.addEventListener('dragstart', (event) => {
			draggedItem = item;
			item.classList.add('is-dfmg-dragging');
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', item.getAttribute('data-dfmg-id') || '');
		});

		item.addEventListener('dragend', () => {
			if (draggedItem) {
				draggedItem.classList.remove('is-dfmg-dragging');
			}

			draggedItem = null;
			clearPreviewDropMarkers(grid);
		});

		item.addEventListener('dragover', (event) => {
			const items = Array.from(grid.querySelectorAll('[data-dfmg-item][data-dfmg-id]:not(.is-hidden)'));
			const index = items.indexOf(item);

			if (!draggedItem || index === -1) {
				return;
			}

			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			previewInsertionIndexFor(grid, item, index, event);
		});

		item.addEventListener('drop', (event) => {
			const items = Array.from(grid.querySelectorAll('[data-dfmg-item][data-dfmg-id]:not(.is-hidden)'));
			const from = items.indexOf(draggedItem);
			const index = items.indexOf(item);
			const ids = items.map((candidate) => parseInt(candidate.getAttribute('data-dfmg-id'), 10)).filter((id) => id > 0);
			let insertIndex = null;
			let target = null;
			let moved = null;

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
			if (from < target) {
				target -= 1;
			}

			moved = ids.splice(from, 1)[0];
			ids.splice(Math.max(0, Math.min(target, ids.length)), 0, moved);
			applyIdsToActiveSettings(ids);
			clearPreviewDropMarkers(grid);
		});
	});
};

const usePreview = (attrs, activeIds, activeGallery) => {
	const [preview, setPreview] = useState({
		html: '',
		ids: '',
		items: [],
		loading: true,
		error: ''
	});
	const params = previewParams(attrs, activeIds, activeGallery);
	const paramsKey = JSON.stringify(params);

	useEffect(() => {
		const controller = window.AbortController ? new window.AbortController() : null;
		const headers = {};
		const nonce = restNonce();

		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		setPreview((current) => ({
			...current,
			loading: true,
			error: ''
		}));

		fetch(previewUrl(params), {
			credentials: 'same-origin',
			headers,
			signal: controller?.signal
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Unable to load gallery preview.');
				}

				return response.json();
			})
			.then((data) => {
				setPreview({
					html: data.html || '',
					ids: data.ids || '',
					items: data.items || [],
					loading: false,
					error: ''
				});
			})
			.catch((error) => {
				if (error?.name === 'AbortError') {
					return;
				}

				setPreview({
					html: '',
					ids: activeIds,
					items: [],
					loading: false,
					error: error?.message || 'Unable to load gallery preview.'
				});
			});

		return () => {
			controller?.abort();
		};
	}, [paramsKey]);

	return preview;
};

const GalleryPreview = (props) => {
	const attrs = moduleAttrs(props);
	const previewRef = useRef(null);
	const preview = usePreview(
		attrs,
		attrValue(attrs, 'ids', ''),
		attrValue(attrs, 'gallery', '')
	);

	useEffect(() => {
		if (previewRef.current && window.DFMGInitGalleries) {
			window.DFMGInitGalleries(previewRef.current);
		}

		if (previewRef.current) {
			bindBuilderPreviewReorder(previewRef.current);
		}
	}, [preview.html]);

	return (
		<div className="dfmg-builder-preview" ref={previewRef}>
			{preview.loading && <div className="dfmg-empty">Cargando previsualización...</div>}
			{!preview.loading && preview.error && <div className="dfmg-empty">{preview.error}</div>}
			{!preview.loading && !preview.error && preview.html && <div dangerouslySetInnerHTML={{ __html: preview.html }} />}
			{!preview.loading && !preview.error && !preview.html && (
				<div className="dfmg-empty">Selecciona imágenes o escribe un slug de galería guardada.</div>
			)}
		</div>
	);
};

export const GalleryEdit = (props) => {
	const {
		elements,
		id,
		name
	} = props;
	const attrs = moduleAttrs(props);

	return (
		<ModuleContainer
			attrs={attrs}
			elements={elements}
			id={id}
			name={name}
			stylesComponent={ModuleStyles}
			classnamesFunction={moduleClassnames}
			scriptDataComponent={ModuleScriptData}
		>
			{elements.styleComponents({
				attrName: 'module'
			})}
			<GalleryPreview attrs={attrs} />
		</ModuleContainer>
	);
};
