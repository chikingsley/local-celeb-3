import { formatTime, parseTime } from "@/lib/utils";
import type { FileMetaData, Segment } from "@/types";
import { AlignLeft, ChevronDown, Clock } from "lucide-react";

interface PropertiesPanelProps {
	meta: FileMetaData;
	selectedSegment: Segment | null;
	onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
	onDeleteSegment: (id: string) => void;
}

export function PropertiesPanel({
	meta,
	selectedSegment,
	onUpdateSegment,
	onDeleteSegment,
}: PropertiesPanelProps) {
	const calculateDuration = (segment: Segment): string => {
		const start = parseTime(segment.startTime);
		const end = parseTime(segment.endTime);
		const diff = Math.max(0, end - start);
		return formatTime(diff);
	};

	return (
		<div className="bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto w-full">
			{/* Global Properties */}
			<div className="p-6 border-b border-slate-100">
				<button
					type="button"
					className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 hover:text-slate-700"
				>
					Global Properties
					<ChevronDown size={14} />
				</button>

				<div className="space-y-6">
					<div className="space-y-1">
						<h3 className="text-sm font-medium text-slate-900 break-words leading-snug">
							{meta.name}
						</h3>
						<p className="text-xs text-slate-400">Audio Source</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<span className="text-xs text-slate-500 block mb-1.5">Language</span>
							<div className="text-sm text-slate-800 font-medium flex items-center gap-2">
								{meta.language}
							</div>
						</div>
						<div>
							<span className="text-xs text-slate-500 block mb-1.5">Duration</span>
							<div className="text-sm text-slate-800 font-medium font-mono">
								{formatTime(meta.duration)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Segment Properties */}
			{selectedSegment ? (
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
							Segment Properties
						</span>
					</div>

					<div className="space-y-6">
						{/* Duration Calculation */}
						<div className="flex justify-between items-center py-2 border-b border-slate-50">
							<span className="text-sm text-slate-600">Duration</span>
							<span className="text-sm font-mono text-slate-900">
								{calculateDuration(selectedSegment)}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<label className="space-y-2">
								<span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
									<Clock size={12} /> Start Time
								</span>
								<input
									type="text"
									value={selectedSegment.startTime}
									onChange={(e) =>
										onUpdateSegment(selectedSegment.id, { startTime: e.target.value })
									}
									className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
								/>
							</label>
							<label className="space-y-2">
								<span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
									<Clock size={12} /> End Time
								</span>
								<input
									type="text"
									value={selectedSegment.endTime}
									onChange={(e) => onUpdateSegment(selectedSegment.id, { endTime: e.target.value })}
									className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
								/>
							</label>
						</div>

						<div className="pt-4 flex gap-3">
							<button
								type="button"
								onClick={() => onDeleteSegment(selectedSegment.id)}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium shadow-sm"
							>
								Delete
							</button>
							<button
								type="button"
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium shadow-md"
							>
								<AlignLeft size={14} /> Align
							</button>
						</div>

						<div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mt-4">
							<p className="text-xs text-slate-400 uppercase font-semibold mb-2">Preview Text</p>
							<p className="text-sm text-slate-700 line-clamp-3 italic">
								&quot;{selectedSegment.text}&quot;
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="p-6 flex flex-col items-center justify-center text-center opacity-50 mt-10">
					<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
						<AlignLeft size={20} className="text-slate-400" />
					</div>
					<p className="text-sm text-slate-500">Select a segment to edit its properties</p>
				</div>
			)}
		</div>
	);
}

export default PropertiesPanel;
