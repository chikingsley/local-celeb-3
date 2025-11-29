import { cn } from "@/lib/utils";
import { Mic, Upload, Wand2 } from "lucide-react";

interface WelcomeScreenProps {
	isProcessing: boolean;
	loadingMessage: string;
	onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onLoadSample: () => void;
}

export function WelcomeScreen({
	isProcessing,
	loadingMessage,
	onFileUpload,
	onLoadSample,
}: WelcomeScreenProps) {
	return (
		<div className="flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
			{/* Decorative Background */}
			<div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
			<div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

			<div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-xl w-full text-center relative z-10">
				<div className="flex justify-center mb-8">
					<div className="h-20 w-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
						<Mic className="text-white h-10 w-10" />
					</div>
				</div>

				<h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Local Celeb</h1>
				<p className="text-slate-500 text-lg mb-10 leading-relaxed">
					Professional AI transcription & voice lab.
				</p>

				{isProcessing ? (
					<div className="flex flex-col items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4" />
						<p className="text-slate-600 font-medium animate-pulse">{loadingMessage}</p>
					</div>
				) : (
					<div className="space-y-3">
						<label className="group block w-full relative overflow-hidden rounded-xl bg-slate-900 text-white font-medium py-3.5 cursor-pointer hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10">
							<div className="flex items-center justify-center gap-3">
								<Upload size={18} />
								<span>Upload Audio or Video</span>
							</div>
							<input
								type="file"
								accept="audio/*,video/*"
								className="hidden"
								onChange={onFileUpload}
							/>
						</label>

						<button
							type="button"
							onClick={onLoadSample}
							className="w-full bg-white text-slate-700 font-medium py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
						>
							<Wand2 size={18} className="text-purple-500" />
							Try with Sample
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default WelcomeScreen;
