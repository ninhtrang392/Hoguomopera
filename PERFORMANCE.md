# Performance optimization

Measured 2026-09-24T15:49:52.675Z on http://127.0.0.1:3000 using Lighthouse 13.5.0, default mobile simulation and a cold load. These numbers are local measurements, not guarantees for production or other hardware.

Performance: 54 ? 73

| Metric | Before | After |
| --- | --- | --- |
| First Contentful Paint | 6.3 s | 2.9 s |
| Largest Contentful Paint | 54.2 s | 6.1 s |
| Total Blocking Time | 160 ms | 20 ms |
| Speed Index | 11.8 s | 2.9 s |
| Cumulative Layout Shift | 0 | 0.001 |
| Avoids enormous network payloads | Total size was 11,907 KiB | Total size was 1,543 KiB |

Changes: WebP assets with originals preserved; mobile hero images; local Lora font; mobile uses supplied bird artwork instead of downloading Three.js; hero background remains visible during entrance; offscreen preview videos defer their sources. Desktop particle rendering remains available.

Validation: 21 relevant tests pass (hero motion, media/player lifecycle including deferred loading, finale, theatre). The full suite has two existing failures in opera-journey.test.mjs because the expected cinematic story markup is absent. Asset references and edited JavaScript syntax checked.

The Lighthouse JSON reports completed successfully with scores and no runtimeError. The CLI subsequently reported a Windows permission error while removing its temporary Chrome profile; report generation had already finished.

Image generation helpers live in scripts/. The image manifest is performance-assets.json. The original local server has no compression; serving compressed CSS/JS and cache headers in production may improve results further.
