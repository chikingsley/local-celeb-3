import { cn, parseTime } from "@/lib/utils";
import type { Segment, Speaker } from "@/types";
import { Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SearchMatch {
	segmentId: string;
	startIndex: number;
	endIndex: number;
}

interface EditorProps {
	segments: Segment[];
	speakers: Speaker[];
	selectedSegmentId: string | null;
	onSelectSegment: (id: string) => void;
	onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
	currentTime: number;
	searchQuery?: string;
	searchMatches?: SearchMatch[];
	currentMatchIndex?: number;
}

/**
 * Renders text with highlighted search matches
 * All text is transparent - only the highlight backgrounds are visible
 * This layer sits behind a transparent-background textarea
 */
function HighlightedText({
	text,
	matches,
	currentMatchIndex,
	allMatches,
	segmentId,
}: {
	text: string;
	matches: { startIndex: number; endIndex: number }[];
	currentMatchIndex: number;
	allMatches: SearchMatch[];
	segmentId: string;
}) {
	if (matches.length === 0) {
		return <span className="whitespace-pre-wrap text-transparent">{text}</span>;
	}

	// Sort matches by start index
	const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

	const parts: React.ReactNode[] = [];
	let lastIndex = 0;

	sortedMatches.forEach((match, idx) => {
		// Add text before match (transparent)
		if (match.startIndex > lastIndex) {
			parts.push(
				<span key={`text-${idx}`} className="whitespace-pre-wrap text-transparent">
					{text.substring(lastIndex, match.startIndex)}
				</span>
			);
		}

		// Check if this is the current match
		const globalMatchIdx = allMatches.findIndex(
			(m) =>
				m.segmentId === segmentId &&
				m.startIndex === match.startIndex &&
				m.endIndex === match.endIndex
		);
		const isCurrentMatch = globalMatchIdx === currentMatchIndex;

		// Add highlighted match (background visible, text transparent)
		parts.push(
			<mark
				key={`match-${idx}`}
				className={cn(
					"rounded-sm text-transparent",
					isCurrentMatch ? "bg-orange-300" : "bg-yellow-200"
				)}
			>
				{text.substring(match.startIndex, match.endIndex)}
			</mark>
		);

		lastIndex = match.endIndex;
	});

	// Add remaining text (transparent)
	if (lastIndex < text.length) {
		parts.push(
			<span key="text-end" className="whitespace-pre-wrap text-transparent">
				{text.substring(lastIndex)}
			</span>
		);
	}

	return <>{parts}</>;
}

export function Editor({
	segments,
	speakers,
	selectedSegmentId,
	onSelectSegment,
	onUpdateSegment,
	currentTime,
	searchQuery,
	searchMatches = [],
	currentMatchIndex = 0,
}: EditorProps) {
	const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
	const containerRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLDivElement>(null);

	// State for speaker selector popover
	const [activeSpeakerDropdown, setActiveSpeakerDropdown] = useState<string | null>(null);

	const adjustHeight = useCallback((id: string) => {
		const el = textareaRefs.current[id];
		if (el) {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}
	}, []);

	useEffect(() => {
		for (const seg of segments) {
			adjustHeight(seg.id);
		}
	}, [segments, adjustHeight]);

	// Click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = () => setActiveSpeakerDropdown(null);
		if (activeSpeakerDropdown) {
			window.addEventListener("click", handleClickOutside);
		}
		return () => window.removeEventListener("click", handleClickOutside);
	}, [activeSpeakerDropdown]);

	const getSpeaker = (id: string) => speakers.find((s) => s.id === id) ?? speakers[0];

	// Get matches for a specific segment
	const getSegmentMatches = useCallback(
		(segmentId: string) => {
			return searchMatches.filter((m) => m.segmentId === segmentId);
		},
		[searchMatches]
	);

	return (
		<div className="flex flex-col gap-0 pb-32 min-h-full" ref={containerRef}>
			{segments.map((segment) => {
				const currentSpeaker = getSpeaker(segment.speakerId);
				const startSec = parseTime(segment.startTime);
				const endSec = parseTime(segment.endTime);
				const isActive = startSec <= currentTime && endSec > currentTime;
				const isSelected = selectedSegmentId === segment.id;

				return (
					<div
						key={segment.id}
						ref={isActive ? activeRef : null}
						onClick={() => onSelectSegment(segment.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onSelectSegment(segment.id);
							}
						}}
						className={cn(
							"group relative flex gap-6 p-6 transition-all duration-200 cursor-pointer border-l-4 border-l-transparent",
							isSelected && "bg-blue-50 border-l-blue-500 shadow-sm",
							!isSelected && "hover:bg-slate-50 hover:border-l-slate-300",
							isActive && !isSelected && "bg-amber-50/50 border-l-amber-400",
							isActive && isSelected && "bg-blue-50 border-l-blue-500 ring-2 ring-blue-200"
						)}
					>
						{/* Left Column: Speaker Info */}
						<div className="w-40 flex-shrink-0 flex flex-col gap-2 pt-1 relative">
							<button
								type="button"
								className="flex items-center gap-3 p-1 -ml-1 rounded-lg hover:bg-slate-200/50 transition-colors w-fit"
								onClick={(e) => {
									e.stopPropagation();
									setActiveSpeakerDropdown(
										activeSpeakerDropdown === segment.id ? null : segment.id
									);
								}}
							>
								<div
									className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
									style={{ backgroundColor: currentSpeaker?.color }}
								>
									{currentSpeaker?.name.charAt(0)}
								</div>
								<span
									className="text-sm font-semibold text-slate-700 truncate max-w-[90px]"
									title={currentSpeaker?.name}
								>
									{currentSpeaker?.name}
								</span>
							</button>

							{/* Speaker Dropdown Popover */}
							{activeSpeakerDropdown === segment.id && (
								<div
									className="absolute top-10 left-0 z-50 w-56 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden"
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => e.stopPropagation()}
								>
									<div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
										Assign Speaker
									</div>
									<div className="max-h-64 overflow-y-auto">
										{speakers.map((s) => (
											<button
												key={s.id}
												type="button"
												className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between group/item"
												onClick={() => {
													onUpdateSegment(segment.id, { speakerId: s.id });
													setActiveSpeakerDropdown(null);
												}}
											>
												<div className="flex items-center gap-3">
													<div
														className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
														style={{ backgroundColor: s.color }}
													>
														{s.name.charAt(0)}
													</div>
													<span
														className={cn(
															"text-sm",
															s.id === currentSpeaker?.id
																? "font-semibold text-blue-700"
																: "text-slate-700"
														)}
													>
														{s.name}
													</span>
												</div>
												{s.id === currentSpeaker?.id && (
													<Check size={14} className="text-blue-600" />
												)}
											</button>
										))}
									</div>
								</div>
							)}

							<div className="pl-11 text-xs font-mono text-slate-400">{segment.startTime}</div>
						</div>

						{/* Right Column: Text Content */}
						<div className="flex-grow relative">
							{/* Highlight Layer - positioned behind textarea */}
							{searchQuery && getSegmentMatches(segment.id).length > 0 && (
								<div
									className="absolute inset-0 text-lg leading-relaxed font-serif pointer-events-none text-transparent select-none"
									aria-hidden="true"
								>
									<HighlightedText
										text={segment.text}
										matches={getSegmentMatches(segment.id)}
										currentMatchIndex={currentMatchIndex}
										allMatches={searchMatches}
										segmentId={segment.id}
									/>
								</div>
							)}
							<textarea
								ref={(el) => {
									textareaRefs.current[segment.id] = el;
								}}
								value={segment.text}
								onChange={(e) => {
									onUpdateSegment(segment.id, { text: e.target.value });
									adjustHeight(segment.id);
								}}
								className={cn(
									"w-full resize-none outline-none border-none text-lg leading-relaxed focus:ring-0 p-0 placeholder-slate-300 font-serif relative z-10",
									searchQuery && getSegmentMatches(segment.id).length > 0
										? "text-slate-800 bg-transparent caret-slate-800"
										: "text-slate-800 bg-transparent"
								)}
								placeholder="Type here..."
								rows={1}
								spellCheck={false}
							/>
						</div>
					</div>
				);
			})}

			<div className="h-32 flex items-center justify-center text-slate-300 italic">
				End of transcription
			</div>
		</div>
	);
}

export default Editor;
