import React, { useEffect, useRef, useState } from 'react';
import { ModuleContainer, ModuleGroups } from '@divi/module';

import { ModuleScriptData } from './module-script-data';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';

const attrValue = (attrs, key, fallback) => (
	attrs?.[key]?.innerContent?.desktop?.value ?? fallback
);

const valueAttr = (value) => ({
	innerContent: {
		desktop: {
			value
		}
	}
});

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

const moduleId = (props) => (
	props.id || props.clientId || props.moduleId || props.blockId || props.block?.clientId || ''
);

const moduleAttrs = (props) => (
	props.attrs || props.moduleAttrs || props.attributes || {}
);

const itemIds = (items) => (
	(items || [])
		.map((item) => item.id)
		.filter((id) => id > 0)
);

const reorder = (list, from, to) => {
	const copy = list.slice();
	const moved = copy.splice(from, 1)[0];

	copy.splice(to, 0, moved);

	return copy;
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

const updateModuleAttrs = (props, values) => {
	const payload = {};
	const attempts = [];
	const id = moduleId(props);
	const wpData = window.wp?.data || window.top?.wp?.data;

	Object.keys(values).forEach((key) => {
		payload[key] = valueAttr(values[key]);
	});

	[
		props.setAttrs,
		props.setAttributes,
		props.updateAttrs,
		props.onUpdateAttrs,
		props.onChangeAttrs
	].forEach((fn) => {
		if (typeof fn === 'function') {
			attempts.push(() => fn(payload));
			attempts.push(() => fn(id, payload));
		}
	});

	if (props.actions) {
		['setAttrs', 'setAttributes', 'updateAttrs', 'onUpdateAttrs'].forEach((name) => {
			if (typeof props.actions[name] === 'function') {
				attempts.push(() => props.actions[name](payload));
				attempts.push(() => props.actions[name](id, payload));
			}
		});
	}

	if (wpData && id) {
		['core/block-editor', 'core/editor'].forEach((store) => {
			attempts.push(() => {
				const dispatch = wpData.dispatch(store);

				if (dispatch?.updateBlockAttributes) {
					dispatch.updateBlockAttributes(id, payload);
				}
			});
		});
	}

	attempts.forEach((attempt) => {
		try {
			attempt();
		} catch (error) {
			// Divi 5 builds expose different update callbacks while the API evolves.
		}
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

const GallerySelector = (props) => {
	const attrs = moduleAttrs(props);
	const attrGallery = attrValue(attrs, 'gallery', '');
	const attrIds = attrValue(attrs, 'ids', '');
	const [localIds, setLocalIds] = useState(null);
	const dragIndexRef = useRef(null);
	const attrKey = `${attrGallery}|${attrIds}`;
	const activeIds = localIds !== null ? localIds : attrIds;
	const activeGallery = localIds !== null ? '' : attrGallery;
	const preview = usePreview(attrs, activeIds, activeGallery);

	useEffect(() => {
		setLocalIds(null);
	}, [attrKey]);

	const setDirectIds = (ids) => {
		const value = ids.join(',');

		setLocalIds(value);
		updateModuleAttrs(props, {
			ids: value,
			gallery: ''
		});
	};

	const openMediaFrame = (event) => {
		const apiWindow = mediaWindow();
		const currentIds = parseIds(activeIds || preview.ids);

		event.preventDefault();
		event.stopPropagation();

		if (!apiWindow) {
			setPreview({
				...preview,
				loading: false,
				error: 'The WordPress media picker is not available in this builder window.'
			});
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
			const selected = frame.state().get('selection').models.map((attachment) => attachment.get('id'));

			setDirectIds(selected);
		});

		frame.open();
	};

	const clearDirectSelection = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setDirectIds([]);
	};

	const onDrop = (index, event) => {
		const from = dragIndexRef.current;

		event.preventDefault();
		event.stopPropagation();

		if (from === null || from === index || !preview.items.length) {
			return;
		}

		dragIndexRef.current = null;
		setDirectIds(itemIds(reorder(preview.items, from, index)));
	};

	const thumbs = preview.items.length ? (
		<div className="dfmg-builder-thumbs" aria-label="Selected images">
			{preview.items.map((item, index) => (
				<button
					className="dfmg-builder-thumb"
					draggable
					key={item.id}
					onDragStart={(event) => {
						dragIndexRef.current = index;
						event.dataTransfer.effectAllowed = 'move';
					}}
					onDragOver={(event) => {
						event.preventDefault();
					}}
					onDrop={(event) => onDrop(index, event)}
					title={item.title || ''}
					type="button"
				>
					<img src={item.thumb} alt={item.alt || item.title || ''} />
				</button>
			))}
		</div>
	) : (
		<p className="dfmg-builder-empty-note">No hay imágenes seleccionadas.</p>
	);

	return (
		<div className="dfmg-builder-controls">
			<div className="dfmg-builder-controls__bar">
				<button className="dfmg-builder-button" type="button" onClick={openMediaFrame}>
					Añadir/editar imágenes
				</button>
				<button className="dfmg-builder-button dfmg-builder-button--secondary" type="button" onClick={clearDirectSelection}>
					Limpiar
				</button>
			</div>
			<div className="dfmg-builder-count">
				{preview.items.length}
				{preview.items.length === 1 ? ' imagen' : ' imágenes'}
			</div>
			{thumbs}
		</div>
	);
};

export const SettingsContent = (props) => (
	<>
		<GallerySelector {...props} />
		{props.groupConfiguration ? <ModuleGroups groups={props.groupConfiguration} /> : null}
	</>
);

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
