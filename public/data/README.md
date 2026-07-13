# Demo data

This directory contains the small, privacy-safe dataset used by the public GitHub Pages demo.

## Safety and provenance

- Every feed item is original synthetic content created for this repository.
- Titles are prefixed with `[Demo]`, tags include `Demo` and `合成数据`, and summaries repeat the disclosure.
- All people, companies, products, registry identifiers, approval records, trademark events, jobs and business relationships are fictional.
- Demo records do not expose outbound source links. No real email address, phone number or street address is included.
- Article bodies and podcast transcripts are short original demo copy, not third-party articles or copyrighted transcripts.
- `cover_image` is `null`, so the UI generates its own offline placeholder art.
- Podcast entries leave `audio_url` empty, so the interface renders its explicit no-audio demo state. No original MP3 or recorded voice is distributed.

Do not use this dataset for market, legal, employment or investment decisions.

## Files

- `feed.json`: 20 synthetic items covering all eight registered source types: `podcast`, `news`, `wechat`, `banhao`, `entity`, `entity_change`, `trademark` and `recruitment`.
- `podcast_channels.json`: empty public-demo channel configuration, included so the static homepage request succeeds.
- `content_filter.json`: empty public-demo relevance configuration, included so the static homepage request succeeds.

All `published_at`, `ingested_at`, snapshot and event timestamps fall within the demo window from 2026-07-01 through 2026-07-13. The schema follows `src/types/envelope.ts` and `src/types/payloads.ts`.
