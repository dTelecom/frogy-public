# Frogy livestreaming demo

Frogy is a Next.js livestreaming application for Telegram. Its [Telegram authentication](src/pages/api/auth.ts) identifies viewers and hosts. The [host route](src/pages/api/room/host.ts) uses the 1.x dTelecom server SDK to sign room tokens locally.

This repository shows the earlier integration. For a new livestream on dTelecom Cloud, use [dTelecom Live](https://github.com/dTelecom/dtelecom-live) and follow its host and viewer walkthrough.
