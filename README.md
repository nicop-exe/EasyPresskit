# EasyPresskit

EasyPresskit is a web application designed to help DJs, producers, and artists create professional Electronic Press Kits (EPKs) effortlessly. 

## Features
- **3D DJ Booth Editor**: Interactive tool to specify and visualize technical riders (CDJs, Mixers, Monitors).
- **Dynamic Themes**: Customizable accent colors and background images (saved via Firebase Storage).
- **Stats & Reach**: Display key metrics (e.g., Spotify Listeners, Instagram followers) and artist support lists.
- **Targeted Sharing**: Generate "Full" links for booking agents or "Public" links that automatically hide sensitive riders and direct contact info.
- **PDF Export**: Clean, print-optimized document generation straight from the browser.
- **Media Delivery**: One-click `.zip` downloads for all press photos and logos.

## Changelog
All notable changes to this project are documented in the [CHANGELOG.md](./CHANGELOG.md) file.
Please ensure you update the changelog whenever pushing new features or fixing notable bugs.

## Development Setup

The project uses React, Vite, Three.js (React Three Fiber), and Firebase.

### Running locally:
```bash
npm install
npm run dev
```

### Deployment
Ensure `npm run build` passes without errors.
Deploy to Firebase Hosting using:
```bash
firebase deploy --only hosting
```
