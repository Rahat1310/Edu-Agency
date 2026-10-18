# WhatsApp and Messenger link previews

The website shares a public 1200 × 630 JPEG card using its existing logo,
homepage illustrations, and brand palette. Every marketing page supplies its
own title and description, including Bengali pages. Open Graph and Twitter
metadata share the same image definition in `lib/seo/social-preview.ts`.

To rebuild the artwork after updating the logo or homepage illustrations:

```powershell
node scripts/generate-social-preview.mjs
```

The generated `public/images/study-abroad-preview-v1.jpg` is committed and served
as a static file. It needs no login, database, or external image service.
When replacing an already deployed card, give the file a new versioned name and
update `lib/seo/social-preview.ts` so image caches see a new URL.

## Deploy and check

1. Set `NEXT_PUBLIC_APP_URL=https://www.studyabroadconsultantbd.com` in production.
   Local development can keep `http://localhost:3000` in `.env.local`.
   Without an override, `lib/site-url.ts` uses the public domain.
2. Deploy the changes. Confirm the homepage and
   `https://www.studyabroadconsultantbd.com/images/study-abroad-preview-v1.jpg`
   both load publicly without authentication or a bot challenge.
3. Inspect page source for `og:title`, `og:description`, and an absolute
   `og:image` URL pointing at that JPEG. Next.js already recognizes WhatsApp
   and Facebook sharing crawlers and puts their metadata in the initial head.
4. Use [Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/)
   to request a fresh scrape if Messenger still shows the previous card, then
   paste the link into a new message. WhatsApp may retain its own cached card;
   card layout and whether description text is displayed are controlled by the app.

Preview metadata follows the
[Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
