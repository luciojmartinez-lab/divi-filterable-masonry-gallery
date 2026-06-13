import React from 'react';
import { ModuleContainer } from '@divi/module';

import { ModuleScriptData } from './module-script-data';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';

const attrValue = (attrs, key, fallback) => (
	attrs?.[key]?.innerContent?.desktop?.value ?? fallback
);

export const GalleryEdit = (props) => {
	const {
		attrs,
		elements,
		id,
		name
	} = props;

	const gallery = attrValue(attrs, 'gallery', '');
	const ids = attrValue(attrs, 'ids', '');
	const columns = attrValue(attrs, 'columns', '3');
	const message = gallery || ids
		? `Preview renders on the front end. Saved gallery: ${gallery || 'none'}. Columns: ${columns}.`
		: 'Choose a saved Masonry Gallery slug or enter image IDs in the module settings.';

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
			<div className="dfmg-gallery dfmg-divi5-placeholder">
				<strong>Filterable Masonry Gallery</strong>
				<p>{message}</p>
			</div>
		</ModuleContainer>
	);
};
