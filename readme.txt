=== Divi Filterable Masonry Gallery by Lucio ===
Contributors: luciojmartinez
Tags: divi, gallery, masonry, filterable gallery, images
Requires at least: 6.2
Requires PHP: 7.4
Tested up to: 6.5
Stable tag: 1.3.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a Divi-compatible image gallery with filter buttons, masonry layout, captions, and a lightbox.

== Description ==

Divi Filterable Masonry Gallery by Lucio creates responsive image galleries that can be filtered by terms assigned to media attachments.

The plugin includes:

* A Divi builder module when the classic Divi module API is available.
* A native Divi 5 module registered through module JSON and the Divi 5 module library API.
* A real Visual Builder preview rendered through the plugin's PHP gallery output.
* A visual image selector in the Divi 5 module preview with drag-and-drop thumbnail reordering.
* A shortcode fallback for Divi 5 layouts, Code modules, Text modules, or any WordPress content area.
* Saved Masonry Galleries with a media picker and reusable gallery slugs.
* A Gallery Filters taxonomy for images in the Media Library.
* Frontend filtering, row-ordered masonry layout, lazy-loaded images, captions, and a small lightbox.

== Installation ==

1. Upload the plugin ZIP through Plugins > Add New > Upload Plugin.
2. Activate the plugin.
3. Go to Media Library, edit images, and assign terms under Gallery Filters.
4. Go to Masonry Galleries > Add New, create a gallery, and choose images.
5. In Divi 5, add the native "Filterable Masonry Gallery" module and enter a saved gallery slug or image IDs. The shortcode remains available for Code/Text modules and regular WordPress content.

== Shortcode ==

Basic example:

`[dfmg_gallery ids="12,34,56"]`

Saved gallery example:

`[dfmg_gallery gallery="mi-galeria"]`

Fuller example:

`[dfmg_gallery gallery="mi-galeria" columns="4" tablet_columns="2" mobile_columns="1" gap="20" image_size="large" show_filters="on" show_captions="on" caption_source="caption" link_behavior="lightbox"]`

Options:

* `gallery`: saved Masonry Gallery slug or ID.
* `ids`: comma-separated attachment IDs.
* `columns`: desktop columns from 1 to 6.
* `tablet_columns`: tablet columns from 1 to 4.
* `mobile_columns`: mobile columns from 1 to 3.
* `gap`: pixel gap between items.
* `image_size`: `thumbnail`, `medium`, `large`, or `full`.
* `show_filters`: `on` or `off`.
* `filter_all_label`: label for the all-items button.
* `include_terms`: optional comma-separated Gallery Filter slugs to show.
* `show_captions`: `on` or `off`.
* `caption_source`: `caption`, `title`, `alt`, or `none`.
* `link_behavior`: `lightbox`, `file`, `attachment`, or `none`.

== Divi 5 note ==

The plugin registers a native Divi 5 module through module JSON, Divi 5 module library JavaScript, and a PHP render callback. The older `ET_Builder_Module` implementation remains available only for existing layouts and Divi builds that still need compatibility mode.

== Changelog ==

= 1.3.6 =
Add Spanish dropdown controls for finite Divi 5 settings and make preview reordering use visual order for clearer drag placement.

= 1.3.5 =
Switch frontend masonry from CSS columns to a row-ordered JavaScript layout, add drag insertion indicators, and allow direct reordering from the Divi preview canvas.

= 1.3.4 =
Show saved-gallery images in the sidebar selector, append newly selected media instead of replacing the current selection, add per-image remove controls, and make the ID textarea compact below the visual selector.

= 1.3.3 =
Load the sidebar image selector in Divi's top Visual Builder window so it can attach to the settings panel where the Image IDs field is rendered.

= 1.3.2 =
Attach the visual image selector directly to Divi's rendered Image IDs field so it appears in the settings sidebar even when custom Divi 5 settings panels are not mounted.

= 1.3.1 =
Move Divi 5 image editing controls into the settings sidebar, translate the action buttons, and remove the forced preview min-height that could leave extra blank space after the gallery.

= 1.3.0 =
Add a real Divi 5 Visual Builder preview, visual media selector controls with thumbnail drag-and-drop reordering, editor REST preview endpoint, and Lucio J. Martinez plugin attribution.

= 1.2.0 =
Add an experimental native Divi 5 module registration using module JSON, Divi 5 module library JavaScript, and PHP render callback while keeping the legacy module for existing layouts.

= 1.1.1 =
Switch frontend masonry layout to CSS columns so galleries stay in normal page flow and do not overlap the footer in Divi 5.

= 1.1.0 =
Add saved Masonry Galleries with an admin media picker and support for `[dfmg_gallery gallery="mi-galeria"]`.

= 1.0.1 =
Fix masonry height recalculation inside the Divi 5 Visual Builder so galleries do not overlap following page content.

= 1.0.0 =
Initial release.
