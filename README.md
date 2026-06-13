# Divi Filterable Masonry Gallery by Lucio

WordPress plugin for creating responsive filterable image galleries with a masonry layout, built for Divi sites with a shortcode fallback.

## Features

- Divi-compatible custom module when the classic Divi builder API is available.
- Native Divi 5 module registration using module JSON and the Divi 5 module library API.
- Visual Builder preview rendered through the same PHP gallery output used on the frontend.
- Visual image selector in the Divi 5 module preview with thumbnail reordering by drag and drop.
- Stable `[dfmg_gallery]` shortcode fallback for Divi 5 Code/Text modules or any WordPress content area.
- Saved Masonry Galleries with a WordPress media picker and reusable slugs.
- Gallery Filters taxonomy for images in the Media Library.
- Frontend filtering by media terms.
- Masonry-style layout using CSS columns for stable Divi rendering.
- Responsive desktop, tablet, and mobile column controls.
- Captions from media caption, title, or alt text.
- Lightweight built-in lightbox.

## Installation

1. Download the plugin ZIP from a release.
2. In WordPress, go to Plugins > Add New > Upload Plugin.
3. Upload and activate the ZIP.
4. Edit images in the Media Library and assign terms under Gallery Filters.
5. Go to Masonry Galleries > Add New, create a gallery, and choose images.
6. Add the Divi module if it appears, or use the shortcode fallback.

## Shortcode

```text
[dfmg_gallery ids="12,34,56"]
```

```text
[dfmg_gallery gallery="mi-galeria"]
```

```text
[dfmg_gallery gallery="mi-galeria" columns="4" tablet_columns="2" mobile_columns="1" gap="20" image_size="large" show_filters="on" show_captions="on" caption_source="caption" link_behavior="lightbox"]
```

### Options

- `gallery`: saved Masonry Gallery slug or ID.
- `ids`: comma-separated attachment IDs.
- `columns`: desktop columns from 1 to 6.
- `tablet_columns`: tablet columns from 1 to 4.
- `mobile_columns`: mobile columns from 1 to 3.
- `gap`: pixel gap between items.
- `image_size`: `thumbnail`, `medium`, `large`, or `full`.
- `show_filters`: `on` or `off`.
- `filter_all_label`: label for the all-items button.
- `include_terms`: optional comma-separated Gallery Filter slugs to show.
- `show_captions`: `on` or `off`.
- `caption_source`: `caption`, `title`, `alt`, or `none`.
- `link_behavior`: `lightbox`, `file`, `attachment`, or `none`.

## Divi 5

The plugin now registers a native Divi 5 module through `modules-json/filterable-masonry-gallery/module.json`, `assets/divi5-builder.js`, and the PHP render callback in `includes/divi5/class-dfmg-divi5-gallery-module.php`. The older `ET_Builder_Module` implementation remains available only for existing layouts and Divi builds that still need compatibility mode.

## Development

The installable plugin includes the built Visual Builder asset at `assets/divi5-builder.js`, so WordPress does not need Node.js. For development, the Divi 5 Visual Builder source lives in `src/divi5` and can be rebuilt with webpack:

```powershell
npm install
npm run build
```

Package the `divi-filterable-masonry-gallery` folder as a ZIP for installation:

```powershell
Compress-Archive -Path .\divi-filterable-masonry-gallery -DestinationPath .\divi-filterable-masonry-gallery-1.3.0.zip -Force
```

## License

GPL-2.0-or-later.
