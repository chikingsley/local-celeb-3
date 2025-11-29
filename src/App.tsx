import { CommandPalette, Editor, ExportModal, FindReplace, Minimap, PropertiesPanel, Sidebar, Timeline } from "@/components";
import EditorToolbar from "@/components/EditorToolbar";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { fileToBase64, transcribeAudio } from "@/services/api";
import { usePlayerStore } from "@/stores/player-store";
import {
	createSpeakersFromSegments,
	useProjectStore,
	useSelectedSegment,
} from "@/stores/project-store";
import { AppView, DEFAULT_SPEAKERS } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export default function App() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const editorScrollRef = useRef<HTMLDivElement>(null);

	// Modal states
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [isFindOpen, setIsFindOpen] = useState(false);
	const [showReplace, setShowReplace] = useState(false);
	const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

	// Search state
	const [searchMatches, setSearchMatches] = useState<
		{ segmentId: string; startIndex: number; endIndex: number }[]
	>([]);
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");

	// Handle search matches change from FindReplace
	const handleMatchesChange = useCallback(
		(
			matches: { segmentId: string; startIndex: number; endIndex: number }[],
			currentIndex: number,
			query: string
		) => {
			setSearchMatches(matches);
			setCurrentMatchIndex(currentIndex);
			setSearchQuery(query);
		},
		[]
	);

	// Project store
	const view = useProjectStore((s) => s.view);
	const setView = useProjectStore((s) => s.setView);
	const audioUrl = useProjectStore((s) => s.audioUrl);
	const setAudioUrl = useProjectStore((s) => s.setAudioUrl);
	const meta = useProjectStore((s) => s.meta);
	const setMeta = useProjectStore((s) => s.setMeta);
	const isProcessing = useProjectStore((s) => s.isProcessing);
	const loadingMessage = useProjectStore((s) => s.loadingMessage);
	const setProcessing = useProjectStore((s) => s.setProcessing);
	const segments = useProjectStore((s) => s.segments);
	const speakers = useProjectStore((s) => s.speakers);
	const setProjectData = useProjectStore((s) => s.setProjectData);
	const addSegment = useProjectStore((s) => s.addSegment);
	const updateSegment = useProjectStore((s) => s.updateSegment);
	const deleteSegment = useProjectStore((s) => s.deleteSegment);
	const updateSpeaker = useProjectStore((s) => s.updateSpeaker);
	const deleteSpeaker = useProjectStore((s) => s.deleteSpeaker);
	const mergeSpeakers = useProjectStore((s) => s.mergeSpeakers);
	const reorderSpeakers = useProjectStore((s) => s.reorderSpeakers);
	const selectedSegmentId = useProjectStore((s) => s.selectedSegmentId);
	const setSelectedSegmentId = useProjectStore((s) => s.setSelectedSegmentId);
	const undo = useProjectStore((s) => s.undo);
	const redo = useProjectStore((s) => s.redo);
	const canUndo = useProjectStore((s) => s.canUndo());
	const canRedo = useProjectStore((s) => s.canRedo());

	const selectedSegment = useSelectedSegment();

	// Player store
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
	const duration = usePlayerStore((s) => s.duration);
	const setDuration = usePlayerStore((s) => s.setDuration);
	const zoomLevel = usePlayerStore((s) => s.zoomLevel);
	const setZoomLevel = usePlayerStore((s) => s.setZoomLevel);
	const playbackSpeed = usePlayerStore((s) => s.playbackSpeed);
	const setPlaybackSpeed = usePlayerStore((s) => s.setPlaybackSpeed);
	const sidebarCollapsed = usePlayerStore((s) => s.sidebarCollapsed);
	const toggleSidebar = usePlayerStore((s) => s.toggleSidebar);
	const timelineHeight = usePlayerStore((s) => s.timelineHeight);
	const setTimelineHeight = usePlayerStore((s) => s.setTimelineHeight);
	const rightSidebarWidth = usePlayerStore((s) => s.rightSidebarWidth);
	const setRightSidebarWidth = usePlayerStore((s) => s.setRightSidebarWidth);
	const isResizingTimeline = usePlayerStore((s) => s.isResizingTimeline);
	const setIsResizingTimeline = usePlayerStore((s) => s.setIsResizingTimeline);
	const isResizingSidebar = usePlayerStore((s) => s.isResizingSidebar);
	const setIsResizingSidebar = usePlayerStore((s) => s.setIsResizingSidebar);

	// File upload handler
	const handleFileUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFile = e.target.files?.[0];
			if (!selectedFile) return;

			// Create URL for audio playback (this will cleanup previous URL in the store)
			const url = URL.createObjectURL(selectedFile);
			setAudioUrl(url);

			// Get duration from audio metadata
			const audio = new Audio(url);
			audio.onloadedmetadata = () => {
				setDuration(audio.duration);
				setMeta({ duration: audio.duration, name: selectedFile.name });
			};

			// Process transcription
			await processTranscription(selectedFile);
		},
		[setAudioUrl, setDuration, setMeta]
	);

	// Process transcription
	const processTranscription = async (file: File) => {
		setProcessing(true, "Converting audio...");

		try {
			const base64 = await fileToBase64(file);

			setProcessing(true, "Uploading to server...");
			await new Promise((r) => setTimeout(r, 500));

			setProcessing(true, "Transcribing & Diarizing...");
			const result = await transcribeAudio(base64, file.type);

			const newSpeakers = createSpeakersFromSegments(result.segments);
			setProjectData(result.segments, newSpeakers);
			setMeta({ language: "English (Detected)" });
			setView(AppView.EDITOR);
		} catch (error) {
			console.error(error);
			alert("Failed to transcribe. Please make sure the server is running.");
		} finally {
			setProcessing(false);
		}
	};

	// Load sample data
	const handleLoadSample = useCallback(() => {
		setProcessing(true, "Loading sample data...");

		setTimeout(() => {
			const sampleSegments = [
				{
					id: "1",
					speakerId: "speaker_1",
					startTime: "00:00",
					endTime: "00:04",
					text: "This is Unit Nineteen of Pimsleur's Speak and Read Essential French One.",
				},
				{
					id: "2",
					speakerId: "speaker_2",
					startTime: "00:04",
					endTime: "00:13",
					text: "Écoutez cette conversation. Une Américaine est dans un restaurant avec son mari. Elle parle avec le garçon.",
				},
				{
					id: "3",
					speakerId: "speaker_2",
					startTime: "00:13",
					endTime: "00:14",
					text: "Le garçon.",
				},
				{
					id: "4",
					speakerId: "speaker_3",
					startTime: "00:26",
					endTime: "00:38",
					text: "Oui, s'il vous plaît. Qu'est-ce que vous avez? Eh bien, vous pouvez boire du vin, de la bière.",
				},
				{
					id: "5",
					speakerId: "speaker_4",
					startTime: "00:46",
					endTime: "00:49",
					text: "Jacques, est-ce que vous voudriez boire du vin?",
				},
				{
					id: "6",
					speakerId: "speaker_3",
					startTime: "00:49",
					endTime: "00:53",
					text: "Non, pas de vin. De l'Orangina. Je voudrais de l'Orangina.",
				},
			];

			setProjectData(sampleSegments, DEFAULT_SPEAKERS);
			setDuration(60);
			setMeta({
				name: "French I - Lesson 19.mp3",
				duration: 60,
				language: "French",
				date: new Date().toISOString(),
			});
			setView(AppView.EDITOR);
			setProcessing(false);
		}, 1500);
	}, [setProjectData, setDuration, setMeta, setView, setProcessing]);

	// Toggle play
	const togglePlay = useCallback(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
		}
		setIsPlaying(!isPlaying);
	}, [isPlaying, setIsPlaying]);

	// Sync playback speed with audio element
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = playbackSpeed;
		}
	}, [playbackSpeed]);

	// Simulated playback when no audio file
	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (isPlaying && !audioUrl) {
			interval = setInterval(() => {
				setCurrentTime(currentTime + 0.1 * playbackSpeed);
				if (currentTime >= duration) {
					setIsPlaying(false);
					setCurrentTime(0);
				}
			}, 100);
		}
		return () => clearInterval(interval);
	}, [isPlaying, audioUrl, duration, currentTime, playbackSpeed, setCurrentTime, setIsPlaying]);

	// Seek handler
	const handleSeek = useCallback(
		(time: number) => {
			setCurrentTime(time);
			if (audioRef.current) {
				audioRef.current.currentTime = time;
			}
		},
		[setCurrentTime]
	);

	// Keyboard shortcuts
	useKeyboardShortcuts({
		onTogglePlay: togglePlay,
		onSeek: handleSeek,
		currentTime,
		duration,
		onUndo: undo,
		onRedo: redo,
		onOpenFind: () => {
			if (view === AppView.EDITOR) {
				setIsFindOpen(true);
				setShowReplace(false);
			}
		},
		onOpenFindReplace: () => {
			if (view === AppView.EDITOR) {
				setIsFindOpen(true);
				setShowReplace(true);
			}
		},
		onOpenCommandPalette: () => {
			if (view === AppView.EDITOR) {
				setIsCommandPaletteOpen(true);
			}
		},
		onOpenExport: () => view === AppView.EDITOR && setIsExportOpen(true),
		onEscape: () => {
			if (isCommandPaletteOpen) {
				setIsCommandPaletteOpen(false);
			} else if (isFindOpen) {
				setIsFindOpen(false);
			} else if (isExportOpen) {
				setIsExportOpen(false);
			}
		},
	});

	// Resize handlers
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isResizingTimeline) {
				const newHeight = window.innerHeight - e.clientY;
				setTimelineHeight(newHeight);
			}
			if (isResizingSidebar) {
				const newWidth = window.innerWidth - e.clientX;
				setRightSidebarWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizingTimeline(false);
			setIsResizingSidebar(false);
			document.body.style.cursor = "default";
		};

		if (isResizingTimeline || isResizingSidebar) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = isResizingTimeline ? "ns-resize" : "ew-resize";
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		isResizingTimeline,
		isResizingSidebar,
		setTimelineHeight,
		setRightSidebarWidth,
		setIsResizingTimeline,
		setIsResizingSidebar,
	]);

	// Main layout with sidebar visible on all views
	return (
		<div className="h-screen bg-white flex overflow-hidden text-slate-900 font-sans">
			{/* Left Sidebar - Always visible */}
			<Sidebar
				collapsed={sidebarCollapsed}
				onToggle={toggleSidebar}
				currentView={view}
				onNavigate={setView}
			/>

			{/* Main Content Area */}
			{view === AppView.WELCOME ? (
				<div className="flex-1 flex items-center justify-center bg-white">
					<WelcomeScreen
						isProcessing={isProcessing}
						loadingMessage={loadingMessage}
						onFileUpload={handleFileUpload}
						onLoadSample={handleLoadSample}
					/>
				</div>
			) : (
				<div className="flex-1 flex flex-col min-w-0 bg-white">
					{/* Toolbar */}
					<EditorToolbar
						canUndo={canUndo}
						canRedo={canRedo}
						onUndo={undo}
						onRedo={redo}
						onExport={() => setIsExportOpen(true)}
					/>

					{/* Center Workspace */}
					<div className="flex-1 flex overflow-hidden">
						{/* Middle Column: Editor + Timeline */}
						<div className="flex-1 flex flex-col min-w-0">
							{/* Scrollable Transcript Editor with Minimap */}
							<div className="flex-1 flex overflow-hidden">
								{/* Main Editor Scroll Area */}
								<div
									ref={editorScrollRef}
									className="flex-1 overflow-y-auto bg-white relative"
								>
									{/* Find & Replace Panel */}
									<FindReplace
										isOpen={isFindOpen}
										showReplace={showReplace}
										onClose={() => setIsFindOpen(false)}
										segments={segments}
										onUpdateSegment={updateSegment}
										onSelectSegment={setSelectedSegmentId}
										onMatchesChange={handleMatchesChange}
									/>

									<div className="max-w-4xl mx-auto py-12 px-8">
										<Editor
											segments={segments}
											speakers={speakers}
											selectedSegmentId={selectedSegmentId}
											onSelectSegment={setSelectedSegmentId}
											onUpdateSegment={updateSegment}
											currentTime={currentTime}
											searchQuery={searchQuery}
											searchMatches={searchMatches}
											currentMatchIndex={currentMatchIndex}
										/>
									</div>
								</div>

								{/* Minimap */}
								<Minimap
									segments={segments}
									speakers={speakers}
									containerRef={editorScrollRef}
									searchMatches={searchMatches}
									currentMatchIndex={currentMatchIndex}
								/>
							</div>

							{/* Resizable Divider */}
							<div
								className="h-1 bg-slate-100 hover:bg-blue-400 cursor-ns-resize transition-colors z-20 relative"
								onMouseDown={(e) => {
									e.preventDefault();
									setIsResizingTimeline(true);
								}}
							>
								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-slate-300 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
							</div>

							{/* Bottom Timeline Panel */}
							<div
								style={{ height: `${timelineHeight}px` }}
								className="border-t border-slate-200 bg-white shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-10"
							>
								<Timeline
									segments={segments}
									speakers={speakers}
									selectedSegmentId={selectedSegmentId}
									onSelectSegment={setSelectedSegmentId}
									isPlaying={isPlaying}
									onTogglePlay={togglePlay}
									currentTime={currentTime}
									totalDuration={duration}
									onSeek={handleSeek}
									zoomLevel={zoomLevel}
									setZoomLevel={setZoomLevel}
									playbackSpeed={playbackSpeed}
									setPlaybackSpeed={setPlaybackSpeed}
									onAddSegment={addSegment}
									onUpdateSegment={updateSegment}
									onDeleteSegment={deleteSegment}
									onUpdateSpeaker={updateSpeaker}
									onDeleteSpeaker={deleteSpeaker}
									onMergeSpeakers={mergeSpeakers}
									onReorderSpeakers={reorderSpeakers}
								/>
							</div>
						</div>

						{/* Resizable Divider for Right Sidebar */}
						<div
							className="w-1 bg-slate-100 hover:bg-blue-400 cursor-ew-resize transition-colors z-20 relative flex flex-col justify-center"
							onMouseDown={(e) => {
								e.preventDefault();
								setIsResizingSidebar(true);
							}}
						>
							<div className="h-12 w-1 bg-slate-300 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
						</div>

						{/* Right Sidebar: Properties */}
						{rightSidebarWidth > 0 && (
							<div style={{ width: `${rightSidebarWidth}px` }} className="flex-shrink-0">
								<PropertiesPanel
									meta={meta}
									selectedSegment={selectedSegment}
									onUpdateSegment={updateSegment}
									onDeleteSegment={deleteSegment}
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Hidden Audio Element */}
			{audioUrl && (
				<audio
					ref={audioRef}
					src={audioUrl}
					onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
					onEnded={() => setIsPlaying(false)}
					onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
				/>
			)}

			{/* Export Modal */}
			<ExportModal
				isOpen={isExportOpen}
				onClose={() => setIsExportOpen(false)}
				segments={segments}
				speakers={speakers}
				meta={meta}
			/>

			{/* Command Palette */}
			<CommandPalette
				isOpen={isCommandPaletteOpen}
				onClose={() => setIsCommandPaletteOpen(false)}
				isPlaying={isPlaying}
				canUndo={canUndo}
				canRedo={canRedo}
				onTogglePlay={togglePlay}
				onUndo={undo}
				onRedo={redo}
				onOpenFind={() => {
					setIsCommandPaletteOpen(false);
					setIsFindOpen(true);
					setShowReplace(false);
				}}
				onOpenFindReplace={() => {
					setIsCommandPaletteOpen(false);
					setIsFindOpen(true);
					setShowReplace(true);
				}}
				onOpenExport={() => {
					setIsCommandPaletteOpen(false);
					setIsExportOpen(true);
				}}
				onOpenSettings={() => {
					setIsCommandPaletteOpen(false);
					// TODO: Open settings modal
				}}
			/>
		</div>
	);
}
