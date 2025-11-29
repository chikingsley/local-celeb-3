import { useState, useCallback, useEffect, useRef } from "react";
import {
	X,
	ChevronUp,
	ChevronDown,
	CaseSensitive,
	WholeWord,
	Regex,
	Replace,
	ReplaceAll,
} from "lucide-react";
import type { Segment } from "@/types";
import { cn } from "@/lib/utils";

export interface SearchMatch {
	segmentId: string;
	startIndex: number;
	endIndex: number;
	text: string;
}

interface FindReplaceProps {
	isOpen: boolean;
	showReplace: boolean;
	onClose: () => void;
	segments: Segment[];
	onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
	onSelectSegment: (id: string | null) => void;
	onMatchesChange?: (matches: SearchMatch[], currentIndex: number, query: string) => void;
}

export default function FindReplace({
	isOpen,
	showReplace,
	onClose,
	segments,
	onUpdateSegment,
	onSelectSegment,
	onMatchesChange,
}: FindReplaceProps) {
	const [query, setQuery] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [caseSensitive, setCaseSensitive] = useState(false);
	const [wholeWord, setWholeWord] = useState(false);
	const [useRegex, setUseRegex] = useState(false);
	const [matches, setMatches] = useState<SearchMatch[]>([]);
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const [regexError, setRegexError] = useState<string | null>(null);

	const findInputRef = useRef<HTMLInputElement>(null);

	// Focus find input when opened
	useEffect(() => {
		if (isOpen && findInputRef.current) {
			findInputRef.current.focus();
			findInputRef.current.select();
		}
	}, [isOpen]);

	// Notify parent when matches change
	useEffect(() => {
		onMatchesChange?.(matches, currentMatchIndex, query);
	}, [matches, currentMatchIndex, query, onMatchesChange]);

	// Clear matches when closed
	useEffect(() => {
		if (!isOpen) {
			onMatchesChange?.([], 0, "");
		}
	}, [isOpen, onMatchesChange]);

	// Build search pattern
	const buildPattern = useCallback(
		(searchQuery: string): RegExp | null => {
			if (!searchQuery) return null;

			try {
				let pattern = searchQuery;

				if (!useRegex) {
					// Escape regex special characters
					pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				}

				if (wholeWord) {
					pattern = `\\b${pattern}\\b`;
				}

				const flags = caseSensitive ? "g" : "gi";
				const regex = new RegExp(pattern, flags);
				setRegexError(null);
				return regex;
			} catch (e) {
				setRegexError(e instanceof Error ? e.message : "Invalid regex");
				return null;
			}
		},
		[caseSensitive, wholeWord, useRegex]
	);

	// Find all matches
	useEffect(() => {
		if (!query) {
			setMatches([]);
			setCurrentMatchIndex(0);
			return;
		}

		const pattern = buildPattern(query);
		if (!pattern) {
			setMatches([]);
			return;
		}

		const newMatches: Match[] = [];

		for (const segment of segments) {
			let match: RegExpExecArray | null;
			// Reset lastIndex for each segment
			pattern.lastIndex = 0;

			while ((match = pattern.exec(segment.text)) !== null) {
				newMatches.push({
					segmentId: segment.id,
					startIndex: match.index,
					endIndex: match.index + match[0].length,
					text: match[0],
				});

				// Prevent infinite loop for zero-length matches
				if (match[0].length === 0) {
					pattern.lastIndex++;
				}
			}
		}

		setMatches(newMatches);
		setCurrentMatchIndex(0);

		// Select first match's segment
		if (newMatches.length > 0) {
			onSelectSegment(newMatches[0].segmentId);
		}
	}, [query, segments, buildPattern, onSelectSegment]);

	// Navigate to match
	const goToMatch = useCallback(
		(index: number) => {
			if (matches.length === 0) return;

			const wrappedIndex = ((index % matches.length) + matches.length) % matches.length;
			setCurrentMatchIndex(wrappedIndex);
			onSelectSegment(matches[wrappedIndex].segmentId);
		},
		[matches, onSelectSegment]
	);

	const goToNextMatch = () => goToMatch(currentMatchIndex + 1);
	const goToPrevMatch = () => goToMatch(currentMatchIndex - 1);

	// Replace current match
	const replaceCurrent = useCallback(() => {
		if (matches.length === 0) return;

		const match = matches[currentMatchIndex];
		const segment = segments.find((s) => s.id === match.segmentId);
		if (!segment) return;

		const newText =
			segment.text.substring(0, match.startIndex) +
			replaceText +
			segment.text.substring(match.endIndex);

		onUpdateSegment(match.segmentId, { text: newText });
	}, [matches, currentMatchIndex, segments, replaceText, onUpdateSegment]);

	// Replace all matches
	const replaceAll = useCallback(() => {
		if (matches.length === 0 || !query) return;

		const pattern = buildPattern(query);
		if (!pattern) return;

		// Group matches by segment
		const segmentUpdates = new Map<string, Segment>();
		for (const segment of segments) {
			segmentUpdates.set(segment.id, { ...segment });
		}

		// Apply replacements (must be done carefully to handle overlapping matches)
		for (const segment of segments) {
			const updated = segmentUpdates.get(segment.id);
			if (updated) {
				// Reset pattern for fresh replace
				pattern.lastIndex = 0;
				updated.text = segment.text.replace(pattern, replaceText);
				onUpdateSegment(segment.id, { text: updated.text });
			}
		}
	}, [matches, query, buildPattern, segments, replaceText, onUpdateSegment]);

	// Keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "Enter") {
				if (e.shiftKey) {
					goToPrevMatch();
				} else {
					goToNextMatch();
				}
			} else if (e.key === "F3") {
				e.preventDefault();
				if (e.shiftKey) {
					goToPrevMatch();
				} else {
					goToNextMatch();
				}
			}
		},
		[onClose, goToNextMatch, goToPrevMatch]
	);

	if (!isOpen) return null;

	return (
		<div
			className="absolute top-0 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-lg"
			onKeyDown={handleKeyDown}
		>
			<div className="p-2 space-y-2">
				{/* Find Row */}
				<div className="flex items-center gap-1">
					<div className="relative flex-1">
						<input
							ref={findInputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Find"
							className={cn(
								"w-48 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500",
								regexError ? "border-red-400" : "border-slate-200"
							)}
						/>
						{regexError && (
							<div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white p-1 rounded shadow-sm border border-red-200">
								{regexError}
							</div>
						)}
					</div>

					{/* Match count */}
					<span className="text-xs text-slate-500 min-w-[60px] text-center">
						{matches.length > 0
							? `${currentMatchIndex + 1} of ${matches.length}`
							: query
								? "No results"
								: ""}
					</span>

					{/* Navigation */}
					<button
						onClick={goToPrevMatch}
						disabled={matches.length === 0}
						className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50"
						title="Previous match (Shift+Enter)"
					>
						<ChevronUp className="w-4 h-4" />
					</button>
					<button
						onClick={goToNextMatch}
						disabled={matches.length === 0}
						className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50"
						title="Next match (Enter)"
					>
						<ChevronDown className="w-4 h-4" />
					</button>

					{/* Close */}
					<button
						onClick={onClose}
						className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
						title="Close (Escape)"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Replace Row (conditional) */}
				{showReplace && (
					<div className="flex items-center gap-1">
						<input
							type="text"
							value={replaceText}
							onChange={(e) => setReplaceText(e.target.value)}
							placeholder="Replace"
							className="w-48 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>

						{/* Replace buttons */}
						<button
							onClick={replaceCurrent}
							disabled={matches.length === 0}
							className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50"
							title="Replace"
						>
							<Replace className="w-4 h-4" />
						</button>
						<button
							onClick={replaceAll}
							disabled={matches.length === 0}
							className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-50"
							title="Replace All"
						>
							<ReplaceAll className="w-4 h-4" />
						</button>
					</div>
				)}

				{/* Options Row */}
				<div className="flex items-center gap-1 border-t border-slate-100 pt-2">
					<button
						onClick={() => setCaseSensitive(!caseSensitive)}
						className={cn(
							"p-1 rounded transition-colors",
							caseSensitive
								? "bg-blue-100 text-blue-600"
								: "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
						)}
						title="Match Case"
					>
						<CaseSensitive className="w-4 h-4" />
					</button>
					<button
						onClick={() => setWholeWord(!wholeWord)}
						className={cn(
							"p-1 rounded transition-colors",
							wholeWord
								? "bg-blue-100 text-blue-600"
								: "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
						)}
						title="Match Whole Word"
					>
						<WholeWord className="w-4 h-4" />
					</button>
					<button
						onClick={() => setUseRegex(!useRegex)}
						className={cn(
							"p-1 rounded transition-colors",
							useRegex
								? "bg-blue-100 text-blue-600"
								: "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
						)}
						title="Use Regular Expression"
					>
						<Regex className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
