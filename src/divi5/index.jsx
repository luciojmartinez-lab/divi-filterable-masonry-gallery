import React from 'react';
import { addAction } from '@wordpress/hooks';
import { registerModule } from '@divi/module-library';

import metadata from '../../modules-json/filterable-masonry-gallery/module.json';
import defaultAttrs from '../../modules-json/filterable-masonry-gallery/module-default-render-attributes.json';
import defaultPrintedStyleAttrs from '../../modules-json/filterable-masonry-gallery/module-default-printed-style-attributes.json';
import { GalleryEdit, initSidebarEnhancer } from './filterable-masonry-gallery/edit';

addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'dfmg/filterable-masonry-gallery', () => {
	registerModule(metadata, {
		defaultAttrs,
		defaultPrintedStyleAttrs,
		renderers: {
			edit: GalleryEdit
		}
	});
});

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSidebarEnhancer);
} else {
	initSidebarEnhancer();
}
