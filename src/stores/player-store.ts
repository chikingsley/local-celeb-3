import { LAYOUT, ZOOM } from "@/types";
import { create } from "zustand";

export const PLAYBACK_SPEEDS = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface PlayerState {
	// Playback state
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	zoomLevel: number;
	playbackSpeed: PlaybackSpeed;

	// Layout state
	sidebarCollapsed: boolean;
	timelineHeight: number;
	rightSidebarWidth: number;
	isResizingTimeline: boolean;
	isResizingSidebar: boolean;

	// Playback actions
	setIsPlaying: (isPlaying: boolean) => void;
	togglePlay: () => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setZoomLevel: (level: number) => void;
	setPlaybackSpeed: (speed: PlaybackSpeed) => void;

	// Layout actions
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleSidebar: () => void;
	setTimelineHeight: (height: number) => void;
	setRightSidebarWidth: (width: number) => void;
	setIsResizingTimeline: (isResizing: boolean) => void;
	setIsResizingSidebar: (isResizing: boolean) => void;

	// Reset
	resetPlayback: () => void;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
	// Initial state
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	zoomLevel: ZOOM.DEFAULT,
	playbackSpeed: 1.0,
	sidebarCollapsed: false,
	timelineHeight: LAYOUT.DEFAULT_TIMELINE_HEIGHT,
	rightSidebarWidth: LAYOUT.DEFAULT_RIGHT_SIDEBAR_WIDTH,
	isResizingTimeline: false,
	isResizingSidebar: false,

	// Playback actions
	setIsPlaying: (isPlaying) => set({ isPlaying }),

	togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

	setCurrentTime: (time) => set({ currentTime: time }),

	setDuration: (duration) => set({ duration }),

	setZoomLevel: (level) => set({ zoomLevel: Math.max(ZOOM.MIN, Math.min(ZOOM.MAX, level)) }),

	setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

	// Layout actions
	setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

	toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

	setTimelineHeight: (height) => {
		const clampedHeight = Math.max(
			LAYOUT.MIN_TIMELINE_HEIGHT,
			Math.min(height, window.innerHeight - LAYOUT.MAX_TIMELINE_HEIGHT_OFFSET)
		);
		set({ timelineHeight: clampedHeight });
	},

	setRightSidebarWidth: (width) => {
		if (width < LAYOUT.RIGHT_SIDEBAR_SNAP_THRESHOLD) {
			set({ rightSidebarWidth: 0 }); // Snap close
		} else {
			const clampedWidth = Math.max(
				LAYOUT.MIN_RIGHT_SIDEBAR_WIDTH,
				Math.min(width, LAYOUT.MAX_RIGHT_SIDEBAR_WIDTH)
			);
			set({ rightSidebarWidth: clampedWidth });
		}
	},

	setIsResizingTimeline: (isResizing) => set({ isResizingTimeline: isResizing }),

	setIsResizingSidebar: (isResizing) => set({ isResizingSidebar: isResizing }),

	// Reset
	resetPlayback: () =>
		set({
			isPlaying: false,
			currentTime: 0,
			duration: 0,
		}),
}));
