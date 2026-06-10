(function () {
	'use strict';

	function text(key, fallback) {
		if (window.DFMGAdmin && window.DFMGAdmin[key]) {
			return window.DFMGAdmin[key];
		}

		return fallback;
	}

	function closestGallery(element) {
		while (element && element !== document) {
			if (element.hasAttribute('data-dfmg-admin-gallery')) {
				return element;
			}

			element = element.parentNode;
		}

		return null;
	}

	function selectedIds(input) {
		return (input.value || '')
			.split(',')
			.map(function (id) {
				return parseInt(id, 10);
			})
			.filter(function (id) {
				return id > 0;
			});
	}

	function renderPreview(gallery, attachments) {
		var preview = gallery.querySelector('[data-dfmg-preview]');
		var input = gallery.querySelector('[data-dfmg-ids]');
		var ids = [];

		if (!preview || !input) {
			return;
		}

		preview.innerHTML = '';

		attachments.forEach(function (attachment) {
			var data = attachment.toJSON ? attachment.toJSON() : attachment;
			var thumb = document.createElement('span');
			var image = document.createElement('img');
			var source = data.url;

			if (data.sizes && data.sizes.thumbnail) {
				source = data.sizes.thumbnail.url;
			}

			ids.push(data.id);
			thumb.className = 'dfmg-admin-gallery__thumb';
			thumb.setAttribute('data-dfmg-id', data.id);
			image.className = 'dfmg-admin-gallery__image';
			image.src = source;
			image.alt = data.alt || data.title || '';

			thumb.appendChild(image);
			preview.appendChild(thumb);
		});

		if (!ids.length) {
			preview.innerHTML = '<p class="dfmg-admin-gallery__empty">' + text('emptyText', 'No images selected yet.') + '</p>';
		}

		input.value = ids.join(',');
	}

	function openMediaFrame(gallery) {
		var input = gallery.querySelector('[data-dfmg-ids]');
		var ids = input ? selectedIds(input) : [];
		var frame = window.wp.media({
			title: text('frameTitle', 'Select gallery images'),
			button: {
				text: text('buttonText', 'Use selected images')
			},
			library: {
				type: 'image'
			},
			multiple: true
		});

		frame.on('open', function () {
			var selection = frame.state().get('selection');

			ids.forEach(function (id) {
				var attachment = window.wp.media.attachment(id);

				attachment.fetch();
				selection.add(attachment);
			});
		});

		frame.on('select', function () {
			renderPreview(gallery, frame.state().get('selection').models);
		});

		frame.open();
	}

	document.addEventListener('click', function (event) {
		var selectButton = event.target.closest('[data-dfmg-select]');
		var clearButton = event.target.closest('[data-dfmg-clear]');
		var gallery = closestGallery(event.target);

		if (!gallery) {
			return;
		}

		if (selectButton) {
			event.preventDefault();
			openMediaFrame(gallery);
		}

		if (clearButton) {
			event.preventDefault();
			renderPreview(gallery, []);
		}
	});
}());
