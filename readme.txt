=== Divi Filterable Masonry Gallery ===
Contributors: codex
Tags: divi, gallery, masonry, filterable gallery, images
Requires at least: 6.2
Requires PHP: 7.4
Tested up to: 6.5
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a Divi-compatible image gallery with filter buttons, masonry layout, captions, and a lightbox.

== Description ==

Divi Filterable Masonry Gallery creates responsive image galleries that can be filtered by terms assigned to media attachments.

The plugin includes:

* A Divi builder module when the classic Divi module API is available.
* A shortcode fallback for Divi 5 layouts, Code modules, Text modules, or any WordPress content area.
* A Gallery Filters taxonomy for images in the Media Library.
* Frontend filtering, WordPress-bundled Masonry, lazy-loaded images, captions, and a small lightbox.

== Installation ==

1. Upload the plugin ZIP through Plugins > Add New > Upload Plugin.
2. Activate the plugin.
3. Go to Media Library, edit images, and assign terms under Gallery Filters.
4. In Divi, add the "Filterable Masonry Gallery" module when it appears. If your Divi 5 build does not expose the compatibility API, use the shortcode fallback.

== Shortcode ==

Basic example:

`[dfmg_gallery ids="12,34,56"]`

Fuller example:

`[dfmg_gallery ids="12,34,56" columns="4" tablet_columns="2" mobile_columns="1" gap="20" image_size="large" show_filters="on" show_captions="on" caption_source="caption" link_behavior="lightbox"]`

Options:

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

Divi 5 has evolved its extension APIs. This plugin registers a classic Divi custom module when Divi exposes `ET_Builder_Module`, which Divi 5 compatibility builds can load. The shortcode remains the stable integration path and can be placed in a Divi Code or Text module.

== Changelog ==

= 1.0.0 =
Initial release.
