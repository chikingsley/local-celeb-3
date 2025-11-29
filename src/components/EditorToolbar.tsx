import { cn } from "@/lib/utils";
import { Download, Redo2, Undo2 } from "lucide-react";

interface EditorToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

export function EditorToolbar({ canUndo, canRedo, onUndo, onRedo }: EditorToolbarProps) {
	return (
		<header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0 z-20">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1 text-slate-400">
					<button
						type="button"
						onClick={onUndo}
						disabled={!canUndo}
						className={cn(
							"p-2 rounded-lg transition-colors",
							canUndo ? "hover:bg-slate-100 text-slate-600" : "opacity-50 cursor-not-allowed"
						)}
					>
						<Undo2 size={18} />
					</button>
					<button
						type="button"
						onClick={onRedo}
						disabled={!canRedo}
						className={cn(
							"p-2 rounded-lg transition-colors",
							canRedo ? "hover:bg-slate-100 text-slate-600" : "opacity-50 cursor-not-allowed"
						)}
					>
						<Redo2 size={18} />
					</button>
				</div>
				<div className="h-4 w-px bg-slate-200 mx-2" />
				<span className="text-sm text-slate-400">
					{canUndo ? "Unsaved changes" : "All changes saved"}
				</span>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
				>
					Feedback
				</button>
				<button
					type="button"
					className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
				>
					<Download size={16} /> Export
				</button>
			</div>
		</header>
	);
}

export default EditorToolbar;
