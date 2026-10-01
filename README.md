# Pichola Retro Radio

A nostalgic lakeside web radio inspired by Udaipur and the timeless charm of
India's cassette era. Pichola Retro Radio combines a warm, illustrated Lake
Pichola scene with a custom music-player interface for listening to classic
Hindi songs.

The application uses the YouTube IFrame API as its playback engine while
presenting its own retro radio controls. No audio files are stored in this
repository.

## Features

- Responsive Lake Pichola artwork for desktop and mobile screens
- Custom play, pause, previous-track, and next-track controls
- Track title, artist, film, year, duration, and progress information
- Golden Hour, Lakeside, and Late Night listening modes
- YouTube-powered playback without a visible YouTube video panel
- Vintage cassette-era visual styling
- Responsive layout for desktop, tablet, and mobile devices
- Vercel Analytics and Speed Insights integration
- Production-ready Next.js build and Netlify compatibility

## Technology Stack

- [Next.js](https://nextjs.org/) with the App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Vercel Analytics](https://vercel.com/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## Project Structure

```text
radio-pichola/
|-- app/                  # Next.js routes, layout, and global styles
|-- components/           # Player and interface components
|-- lib/                  # Track data and shared application logic
|-- public/
|   `-- bg/               # Desktop and mobile background artwork
|-- next.config.ts        # Next.js configuration
|-- package.json          # Dependencies and npm scripts
`-- tsconfig.json         # TypeScript configuration
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm, which is included with Node.js
- Git, if you want to clone or contribute to the project

Confirm that Node.js and npm are available:

```bash
node --version
npm --version
```

## Run the Application Locally

### 1. Clone the repository

```bash
git clone https://github.com/krapanshi/Pichola-Retro-Radio.git
cd Pichola-Retro-Radio/radio-pichola
```

If the project is already downloaded on Windows, open PowerShell and run:

```powershell
cd C:\Users\DELL\Downloads\radio-pichola\radio-pichola
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The
development server automatically refreshes the page when source files change.
Stop it by pressing `Ctrl+C` in the terminal.

## Production Build

Create and test an optimized production build before deploying:

```bash
npm run build
npm start
```

The production server is available at
[http://localhost:3000](http://localhost:3000).

## Available npm Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Run the production build |
| `npm run lint` | Run the configured lint checks |

## Add or Update Songs

Track information is stored in `lib/tracks.ts`. A track entry follows this
shape:

```ts
{
  id: "unique-track-id",
  title: "Song Title",
  artist: "Artist Name",
  film: "Film Name",
  year: 1975,
  duration: 245,
  videoId: "YOUTUBE_VIDEO_ID"
}
```

The `videoId` is the value after `v=` in a standard YouTube URL or after
`youtu.be/` in a shortened URL.

Only use videos that you have permission to embed. Playback can fail when a
video is private, removed, region restricted, age restricted, or has embedding
disabled by its owner.

## Change the Background Artwork

Background images are located in `public/bg/`:

- `scene-wide.png` is used on desktop and landscape screens.
- `scene-tall.png` is used on mobile and portrait screens.

You can replace these files while keeping the same names. For the best result,
use a landscape image for `scene-wide.png` and a portrait image for
`scene-tall.png`.

## Update Social Links

Edit `components/SocialLinks.tsx` and replace the placeholder Instagram, X,
and YouTube addresses with the correct profile URLs.

## How Playback Works

Pichola Retro Radio uses the YouTube IFrame Player API as the audio source. The
YouTube video surface is kept out of the visible layout, and listeners interact
with the custom radio controls instead.

Some browsers block media from starting automatically. If playback does not
begin immediately, press the play button once to grant media playback
permission.

## Deploy on Netlify

1. Push the project to a GitHub, GitLab, or Bitbucket repository.
2. Sign in to [Netlify](https://app.netlify.com/).
3. Select **Add new project**, then **Import an existing project**.
4. Connect the Git provider and choose this repository.
5. Use the following build configuration:

```text
Base directory: radio-pichola
Build command: npm run build
Publish directory: .next
```

6. Add an environment variable named `NODE_VERSION` with the value `20`.
7. Select **Deploy**.

Netlify automatically builds and deploys the application again whenever a new
commit is pushed to the connected branch.

## Troubleshooting

### The background is blank or black

- Confirm that `scene-wide.png` and `scene-tall.png` exist in `public/bg/`.
- Keep the filenames and letter casing unchanged.
- Restart the development server after changing configuration files.
- Perform a hard refresh with `Ctrl+Shift+R`.

### A song does not play

- Confirm that the track has a real YouTube video ID in `lib/tracks.ts`.
- Confirm that the video is still available and permits embedding.
- Press play manually if the browser blocked automatic playback.

### Port 3000 is already in use

```bash
npm run dev -- -p 3001
```

Then open [http://localhost:3001](http://localhost:3001).

### Changes are not visible

Stop the server with `Ctrl+C`, start it again with `npm run dev`, and perform a
hard refresh in the browser.

## Copyright and Usage

The application does not host music or audio files. Songs are loaded from
YouTube and remain subject to YouTube's terms, the uploader's permissions, and
the rights of the respective copyright owners. Ensure that you have permission
to use all artwork, branding, and embedded media before publishing the site.

## Author

Created by [krapanshi](https://github.com/krapanshi).
