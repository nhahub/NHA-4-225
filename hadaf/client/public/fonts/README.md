# Self-hosted fonts (E0-2.1)

This directory will hold the self-hosted Arabic/English font files for Hadaf.

**Required files** (woff2 format, one per family/weight):

- `Tajawal-Regular.woff2`     (400)
- `Tajawal-Medium.woff2`      (500)
- `Tajawal-Bold.woff2`        (700)
- `IBMPlexSansArabic-Regular.woff2` (400)
- `IBMPlexSansArabic-Medium.woff2`  (500)
- `IBMPlexSansArabic-Bold.woff2`    (700)

## Why these fonts

- **Tajawal** — clean Arabic UI face, wide weight range, well-hinted for screens.
- **IBM Plex Sans Arabic** — designed for bilingual Latin + Arabic UI, complementary to Tajawal, with strong legibility at small sizes.

## Sources

Both fonts are SIL Open Font License and free to bundle:

- Tajawal: https://github.com/google/fonts/tree/main/ofl/tajawal
- IBM Plex Sans Arabic: https://github.com/IBM/plex/tree/master/IBM-Plex-Sans-Arabic

Download the woff2 files, drop them in this directory, and the `@font-face`
rules in `src/index.css` will pick them up.

## Status

**Pending download** — fonts have not yet been added to this directory. The
client currently uses a Google Fonts CDN `@import` as a temporary fallback
in `src/index.css` (clearly commented). Before E0-2 AC can be marked
complete, the woff2 files must be placed here and the CDN `@import`
removed.