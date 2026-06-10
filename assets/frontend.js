(function () {
	'use strict';

	var galleries = [];
	var lightbox = null;
	var lightboxState = {
		items: [],
		index: 0
	};

	function ready(callback) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', callback);
			return;
		}

		callback();
	}

	function initGallery(gallery) {
		var grid = gallery.querySelector('[data-dfmg-grid]');
		var filters = Array.prototype.slice.call(gallery.querySelectorAll('[data-dfmg-filter]'));
		var items = Array.prototype.slice.call(gallery.querySelectorAll('[data-dfmg-item]'));
		var masonry = null;

		if (!grid || !items.length) {
			return;
		}

		if (window.Masonry) {
			masonry = new window.Masonry(grid, {
				itemSelector: '[data-dfmg-item]:not(.is-hidden)',
				columnWidth: '.dfmg-grid-sizer',
				percentPosition: true,
				transitionDuration: '0.18s'
			});

			if (window.imagesLoaded) {
				window.imagesLoaded(grid, function () {
					masonry.layout();
				});
			}
		}

		filters.forEach(function (button) {
			button.addEventListener('click', function () {
				var filter = button.getAttribute('data-dfmg-filter') || '*';

				filters.forEach(function (other) {
					var active = other === button;
					other.classList.toggle('is-active', active);
					other.setAttribute('aria-selected', active ? 'true' : 'false');
				});

				items.forEach(function (item) {
					var terms = (item.getAttribute('data-dfmg-terms') || '').split(/\s+/);
					var visible = filter === '*' || terms.indexOf(filter) !== -1;
					item.classList.toggle('is-hidden', !visible);
				});

				if (masonry) {
					masonry.reloadItems();
					masonry.layout();
				}
			});
		});

		initLightboxLinks(gallery);

		galleries.push({
			gallery: gallery,
			grid: grid,
			masonry: masonry
		});
	}

	function initLightboxLinks(gallery) {
		var links = Array.prototype.slice.call(gallery.querySelectorAll('[data-dfmg-lightbox]'));

		links.forEach(function (link, index) {
			link.addEventListener('click', function (event) {
				event.preventDefault();
				openLightbox(links, index);
			});
		});
	}

	function ensureLightbox() {
		if (lightbox) {
			return lightbox;
		}

		lightbox = document.createElement('div');
		lightbox.className = 'dfmg-lightbox';
		lightbox.setAttribute('role', 'dialog');
		lightbox.setAttribute('aria-modal', 'true');
		lightbox.setAttribute('aria-label', 'Image preview');
		lightbox.innerHTML = [
			'<button class="dfmg-lightbox__button dfmg-lightbox__close" type="button" aria-label="Close">&times;</button>',
			'<button class="dfmg-lightbox__button dfmg-lightbox__prev" type="button" aria-label="Previous">&#8249;</button>',
			'<div class="dfmg-lightbox__dialog">',
			'<img class="dfmg-lightbox__image" alt="">',
			'<p class="dfmg-lightbox__caption"></p>',
			'</div>',
			'<button class="dfmg-lightbox__button dfmg-lightbox__next" type="button" aria-label="Next">&#8250;</button>'
		].join('');

		document.body.appendChild(lightbox);

		lightbox.querySelector('.dfmg-lightbox__close').addEventListener('click', closeLightbox);
		lightbox.querySelector('.dfmg-lightbox__prev').addEventListener('click', function () {
			stepLightbox(-1);
		});
		lightbox.querySelector('.dfmg-lightbox__next').addEventListener('click', function () {
			stepLightbox(1);
		});

		lightbox.addEventListener('click', function (event) {
			if (event.target === lightbox) {
				closeLightbox();
			}
		});

		document.addEventListener('keydown', function (event) {
			if (!lightbox.classList.contains('is-open')) {
				return;
			}

			if (event.key === 'Escape') {
				closeLightbox();
			} else if (event.key === 'ArrowLeft') {
				stepLightbox(-1);
			} else if (event.key === 'ArrowRight') {
				stepLightbox(1);
			}
		});

		return lightbox;
	}

	function openLightbox(links, index) {
		ensureLightbox();

		lightboxState.items = links;
		lightboxState.index = index;

		renderLightbox();
		lightbox.classList.add('is-open');
		document.documentElement.style.overflow = 'hidden';
		lightbox.querySelector('.dfmg-lightbox__close').focus();
	}

	function closeLightbox() {
		if (!lightbox) {
			return;
		}

		lightbox.classList.remove('is-open');
		document.documentElement.style.overflow = '';
	}

	function stepLightbox(direction) {
		var total = lightboxState.items.length;

		if (!total) {
			return;
		}

		lightboxState.index = (lightboxState.index + direction + total) % total;
		renderLightbox();
	}

	function renderLightbox() {
		var link = lightboxState.items[lightboxState.index];
		var image = lightbox.querySelector('.dfmg-lightbox__image');
		var caption = lightbox.querySelector('.dfmg-lightbox__caption');
		var sourceImage = link ? link.querySelector('img') : null;
		var text = link ? (link.getAttribute('data-dfmg-caption') || '') : '';

		if (!link || !image || !caption) {
			return;
		}

		image.src = link.href;
		image.alt = sourceImage ? sourceImage.alt : '';
		caption.textContent = text;
		caption.hidden = text === '';
	}

	ready(function () {
		Array.prototype.slice.call(document.querySelectorAll('[data-dfmg-gallery]')).forEach(initGallery);

		window.addEventListener('resize', debounce(function () {
			galleries.forEach(function (entry) {
				if (entry.masonry) {
					entry.masonry.layout();
				}
			});
		}, 150));
	});

	function debounce(callback, delay) {
		var timer = null;

		return function () {
			window.clearTimeout(timer);
			timer = window.setTimeout(callback, delay);
		};
	}
}());
