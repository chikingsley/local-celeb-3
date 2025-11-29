# Local Celeb - TODO

## Phase 1 - Core Improvements ✅ COMPLETED

- [x] Add playback speed control (0.2x - 2.0x, increment 0.2)
- [x] Add segment button functionality (create at cursor position with selected speaker)
- [x] Drag segment edges to adjust timing
- [x] Home button shows welcome page with sidebar visible
- [x] Better visual feedback on selection/highlighting
- [x] shadcn/ui component library integration

## Phase 1.5 - Timeline Enhancements ✅ COMPLETED

- [x] Drag to move entire segment (not just edges)
- [x] Grid snapping (0.5s intervals, toggle in toolbar)
- [x] Edge snapping with visual guides (snap to other segments)
- [x] Auto-scroll during drag
- [x] Right-click context menu (assign speaker, split, copy text, delete)
- [x] Extract snap logic to testable utilities (47 tests)

## Phase 2 - Export & Productivity ✅ MOSTLY COMPLETED

- [x] Export transcripts (TXT, SRT, VTT, JSON, HTML, CSV) with tests
- [x] Keyboard shortcuts (play/pause, seek, undo/redo, find, export)
- [x] Find & Replace (match case, whole word, regex options)
- [x] Command Palette (Cmd+K) for quick access to all features
- [x] Search highlighting in Editor (yellow/orange backgrounds)
- [x] Minimap with viewport indicator and search markers
- [ ] Audio waveform visualization
- [ ] Multiple projects support

### Future Enhancements (Nice to Have)
- [ ] Minimap with actual text rendering (VS Code style)
- [ ] Selected text auto-populates Find field
- [ ] Find in Timeline (not just Editor)

## Phase 3 - Settings & Storage

- [ ] Settings menu/modal (theme, shortcuts, defaults)
- [ ] Cloudflare R2 integration for audio storage
- [ ] Project persistence to cloud
- [ ] Import existing transcripts

## Phase 4 - Desktop App (Tauri)

- [ ] Initialize Tauri in project
- [ ] Configure native window (size, title, menu bar)
- [ ] Local transcription with FluidAudio (Apple platforms)
  - Rust ↔ Swift FFI bridge
  - Parakeet TDT v3 model
  - Speaker diarization support
  - See: <https://github.com/FluidInference/FluidAudio>
- [ ] Whisper.cpp fallback for non-Apple platforms
- [ ] Offline mode support
- [ ] Auto-updates
- [ ] Code signing & notarization (macOS)

## Phase 5 - Authentication & Collaboration

- [ ] User authentication with Clerk
- [ ] Project sharing
- [ ] Collaborative editing
- [ ] Version history

## Technical Debt

- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Add error boundaries
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization for large transcripts

## Notes

### Why Tauri?

- **Bundle size**: 2.5-10 MB (vs Electron's 80-120 MB)
- **RAM usage**: 30-40 MB (vs Electron's 200-400 MB)
- **Native performance**: Rust backend, system WebView
- **Swift FFI**: Easy integration with FluidAudio
- **Your React/Vite/Tailwind code works as-is**

### FluidAudio Integration

FluidAudio is a Swift SDK for Apple platforms (macOS/iOS) that provides:

- State-of-the-art speech recognition using Parakeet models
- Speaker diarization (who spoke when)
- Runs locally on device
- No cloud dependencies

Integration path:

1. Tauri Rust backend calls Swift via FFI
2. Swift code uses FluidAudio SDK
3. Results passed back to React frontend via Tauri commands
