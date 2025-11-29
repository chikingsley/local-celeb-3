import { cn, parseTime } from "@/lib/utils";
import type { Segment, Speaker } from "@/types";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface EditorProps {
	segments: Segment[];
	speakers: Speaker[];
	selectedSegmentId: string | null;
	onSelectSegment: (id: string) => void;
	onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
	currentTime: number;
}

export function Editor({
	segments,
	speakers,
	selectedSegmentId,
	onSelectSegment,
	onUpdateSegment,
	currentTime,
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
							<textarea
								ref={(el) => {
									textareaRefs.current[segment.id] = el;
								}}
								value={segment.text}
								onChange={(e) => {
									onUpdateSegment(segment.id, { text: e.target.value });
									adjustHeight(segment.id);
								}}
								className="w-full resize-none outline-none border-none text-slate-800 text-lg leading-relaxed bg-transparent focus:ring-0 p-0 placeholder-slate-300 font-serif"
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
