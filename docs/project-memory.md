# Project memory

## Scope

Work only in this repository. Local design and WordPress integration. No remote publishing or repository changes.

## Decisions · 2026-11-12

- Empty repository; buildless HTML/CSS/JS, zero external runtime dependencies.
- Brand colors and local Manrope / Onest fonts from supplied SSS brand kit.
- Original Google Doc opened after access was updated; export in `research/content.md`.
- User subsequently supplied corrected text: https://ikolosovskiy.github.io/SSS_project_page/?v=d1da168. Sanitized source sections in `research/content-updated.html` now have priority for full chapter text. Included 1 125 training participants.
- `page.template.html` + source content → `node scripts/build.mjs` → `index.html` and `page-content.html`.
- Main summaries edited for scanning; full chapter text in native disclosures.
- 13 original photos stored locally; no generated or stock photographs.
- Optional WP plugin `sss-project-page.php`, shortcode `[sss_project_2026]`, existing theme chrome retained by default.
- Preview: `node scripts/serve.mjs`, port 4173. Static verification: `node scripts/check.mjs`.
- Browser checks use project-local headless Chrome profile `.cache/chrome-qa` and screenshots under `qa/`.
- PHP / WordPress not installed; theme integration untested locally.
- No publishing, commits, or remote changes performed.
- Completed browser QA: all five widths 320–1440, no overflow or broken images, menu/Escape, anchors, disclosure, reduced motion, no-JS content passed. See `docs/VERIFICATION.md`. WordPress install ZIP: `sss-project-page.zip` (ignored generated output).
- User clarification: 27 communities have ALREADY received support in developing social passports. This overrides the still-future wording returned by the linked page. Updated summary, full chapter text, source snapshot, and design notes.
- User requested exact 13-community metric wording: «13 громад долучилися до опитування щодо оцінки спроможності та потреб». Updated chapter card, regenerated preview / WP HTML and install ZIP.
- User specified exact Focus field: «Спроможні державні установи. Дієві ради ВПО. Доступний соціальний захист.» Updated template, generated HTML and WordPress ZIP.
- User requested numerical KPI animation. Added once-per-view counter animation (1200 ms, cubic deceleration) for results, chapter stats and portal figures. Final values remain in static HTML and screen-reader text; fixed width avoids shifts; reduced motion shows final values and cancels running counters. WP cache version bumped to 1.0.1.
- Applied remaining PDF wording corrections at user request: navigation «Соціальний захист»; About headline «Спроможні державні установи. Дієві ради ВПО. Доступний соціальний захист.»; 173 metric «моніторингові візити для оцінки спроможності рад ВПО». Regenerated preview, WP HTML and ZIP; static checks passed.
- Full terminology review requested by user: source wording takes priority over editorial brevity. Restored full official project name in hero / title / share; explicit council heading «Допомагаємо радам ВПО впливати на рішення»; institutional and community / Ombudsman headings; all five full source priorities; exact target groups and purposes in KPI labels. Removed соцзахист abbreviation including source quote about municipal department. Preserved all direct user / PDF corrections, 27 supported communities, and dates as supplied. WP assets version 1.0.2. Rebuilt preview and ZIP; browser QA passed all five widths, counters, accessibility fallbacks.
