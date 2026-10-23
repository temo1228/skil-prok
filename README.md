# Groove

Run `npm start` (or `npm.cmd start` in PowerShell), then open http://localhost:3000. Requires Node 24; no frontend build is needed.

## Music

- The home mix starts with full-length Verity and free Audius tracks. The original popular songs remain in Discover.
- 417 catalogue songs across popular hits, TikTok favorites, world music, Verity/gaming, and free full streams.
- Catalogue playback uses official full-track YouTube embeds inside the website. Apple preview URLs have been removed. The embedded video remains visible with its original controls and branding. Some recordings cannot be embedded or are restricted by region; the player tries other official recordings when available and reports failures without switching to a preview.
- The Free full streams collection includes 17 ungated tracks from verified Audius artists. These use native audio playback on the page. Audio URLs stay on the provider's service; the app does not download or rehost recordings.
- The Shuffle songs button randomizes the visible songs and playback queue without interrupting listening. The order stays stable until the button is pressed again. Sort by chart popularity, most used on this device, full recording length, or title. Local usage counts playback starts and persists in this browser.
- Create, rename, delete, and play playlists. Search songs, artists, and albums. Upload complete audio with editable embedded metadata and artwork.
- Verity includes Horror Skunx's It's me, It's Verity, Lord Verity – Master of Humanity, The Verity Band – Be My Friend, CG5/Horror Skunx's your verity, and related CG5 tracks. All seven passed real embedded playback checks beyond 35 seconds.
- YouTube source matches are bundled in full-sources.json. Run node resolve-full-catalog.cjs to retry unmatched entries. Live lookup requires server network access and may break if YouTube changes its search page format. A source match does not guarantee playback in every region.
- The transparent visualizer responds to actual audio frequencies for native streams and uploads. YouTube audio is isolated inside its iframe, so embedded playback uses a labelled playback animation. Reduced motion stops both visualizations.

## Settings

Dark is the default theme; dark green and light are also available. Settings include larger text, reduced motion, automatic next-song playback, and volume synchronized with the player. Preferences persist locally and can be reset without removing music, playlists, accounts, or language choices.

## Languages and accounts

121 languages are listed alphabetically by English name with native names. The styled picker in Settings searches English names, native names, and language codes. English is the default. Login has no language picker; it uses the current app language. Arabic, Hebrew, Persian, Urdu, Sorani Kurdish, Dhivehi, Pashto, Sindhi, Uyghur, and Yiddish use RTL layouts. Language packs are bundled, so changing language does not send user text to a translation service. The expanded packs are machine translated; the initial English/Russian/Georgian/Chinese/Spanish core has curated labels. Native-speaker review is advisable before publication.

Accounts can register and sign in with an email address or an international phone number and password. Phone numbers are normalized to remove spaces, parentheses, dots, and hyphens; SMS verification is not configured. Registration and login use server-side scrypt password hashes and HTTP-only SameSite session cookies. Accounts and language preferences persist in `.data/accounts.json`; sessions expire after seven days or a server restart. This is a local app: email verification, password recovery, and cloud music sync are not implemented. Use HTTPS and production account infrastructure before hosting publicly.

Uploaded audio/covers use IndexedDB; playlists, likes, and language preferences use localStorage. These are browser-local and shared across local account sessions. Clearing browser site data removes them.

## Music finder

The built-in local finder matches artist/title terms, moods, popularity, and durations. It is explicitly labelled as a catalogue helper, not a live AI model.

For optional AI recommendations, copy `.env.example` to `.env`, set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`, and restart the server. Keep keys server-side. The [OpenAI Responses API with structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) returns recommendations restricted to known catalogue IDs. Only chat messages and public catalogue metadata are sent; audio files are never uploaded. The live provider requires your own API access and was not called during testing.

## Verification

`npm run check` checks all application JavaScript. `npm run test:unit` tests embedded audio tags and editable metadata. `npm test` runs the browser suite, covering discovery, artist navigation, playlists, uploads, languages/RTL, authentication, sorting, music finder, full audio playback beyond 30 seconds, native free-stream playback, YouTube player integration, theme persistence, and byte-for-byte downloads. The YouTube UI test uses a controlled API mock. node verify-live-stream.cjs separately checks real YouTube and Audius playback beyond 35 seconds. node audit-playback.cjs tests every catalogue entry using real provider playback and seeking beyond 35 seconds, writing incremental results to artifacts/playback-audit.json. Set AUDIT_SCOPE=verity for the seven-song Verity check. node update-playback-status.cjs applies the completed audit to catalogue metadata; the Playback checked collection shows successful entries, and blocked entries display their last-check status. These checks reflect the test region and time, not guaranteed global availability. node verify-full-source.cjs checks retry selection for blocked pinned videos. Browser tests use installed Microsoft Edge on Windows via `playwright.config.cjs`.

Streaming audio and embedded video require internet access. Cover art and translations are local. Optional Google Fonts fall back to system fonts. Audio format support depends on the browser. Catalogue chart rankings reflect the bundled chart snapshot; `refresh-catalog.cjs` and `cache-art.cjs` can refresh metadata/artwork with network access.
