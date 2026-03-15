# EasyPresskit Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Created the `CHANGELOG.md` file to track future changes and updates to the project.
- Updated `README.md` to reflect the project's purpose and reference this changelog.

### Fixed
- Re-added missing `Activity` icon import from `lucide-react` in `App.jsx` which was causing a ReferenceError rendering the Stats UI.
- Removed `react-router-dom` dependency usage from `PresskitView.jsx` and replaced it with native `window.location.search` to fix local server crash.

## [2026-03-02]
### Added
- **Premium Stats & Reach**: Added 3 key metric slots and a "Supported By" list to the Editor, displaying in a distinctive UI bar on the public EPK view.
- **Targeted Links**: Added a `?mode=public` display mode to `PresskitView` that completely hides the Technical and Hospitality rider sections.
- **Dual Share Buttons**: Placed two distinct buttons in the Editor after saving to copy either the "Full EPK Link" or the "Public EPK Link".
- **PDF Export**: Added a "@media print" stylesheet in `index.css` to format the EPK as a clean A4/Letter document and a "Save as PDF" button.

### Changed
- **Profile Picture Border**: Updated from a dashed border to a solid border.
- **Download Media**: Changed the functionality to download all media files as a bundled `.zip` archive using `jszip`.
- **3D DJ Booth**: Tweaked the FOV and z-position of the DJ Booth camera on mobile devices to prevent cropping standard 2-4 CDJ setups.
- **Background Image Persistence**: Uploads user-provided base64 background images to Firebase Storage on save to prevent massive payload sizes in Firestore.
