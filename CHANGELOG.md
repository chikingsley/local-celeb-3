# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2024-11-28

### Added

- **Drag to move entire segment** - Grab center of segment to reposition (not just edges)
- **Grid snapping** - Segments snap to 0.5s intervals when dragging (toggle in toolbar)
- **Edge snapping** - Segments snap to other segment edges with visual guide lines (toggle in toolbar)
- **Auto-scroll during drag** - Timeline scrolls when dragging segments near edges (toggle in toolbar)
- **Right-click context menu** on segments:
  - Assign speaker (submenu)
  - Split segment at center
  - Copy text to clipboard
  - Delete segment

### Changed

- **Improved selection highlighting** - Increased background opacity, added blue glow effect, thicker borders
- Segment drag handles now have visual indicators (vertical lines)
- Active segment (under playhead) now has stronger amber ring

### Removed

- Removed unused `react-timeline-editor` dependency (evaluating but not using)

## [0.3.0] - 2024-11-26

### Added

- Playback speed control (0.2x - 2.0x) with Select dropdown
- Add segment button creates new segments at cursor position
- Drag segment edges to adjust timing in timeline
- shadcn/ui component library (Button, Select, Slider, Tooltip)
- Radix UI primitives for accessible components

### Changed

- Home button now shows welcome page with sidebar visible
- Sidebar navigation now functional (Home, Projects)
- Improved visual feedback on selection (border, ring, background)
- Segments highlight when playing (amber) and selected (blue)
- Timeline segments now clickable to select and seek

## [0.2.0] - 2024-11-26

### Added

- Zustand state management with persistence
- ElysiaJS backend for secure API calls
- Biome for linting and formatting
- Vitest with React Testing Library
- Project persistence to localStorage
- Proper time formatting utilities

### Changed

- Migrated from inline state to Zustand stores
- Moved API calls to backend (no more exposed keys)
- Restructured project to src/ directory

### Fixed

- Memory leak with Object URLs (now properly revoked)
- Timeline time formatting bug (was using toISOString incorrectly)
- Various lint errors and type issues

### Security

- API keys now stored server-side only
- Added input validation with Zod schemas

## [0.1.0] - 2024-11-25

### Added

- Initial transcription editor
- Audio file upload and playback
- Segment-based transcript editing
- Speaker management (add, rename, color)
- Timeline visualization with zoom
- Undo/redo functionality
- Gemini AI transcription integration
- Dark mode UI
