import { cors } from "@elysiajs/cors";
import { GoogleGenAI, Type } from "@google/genai";
import { Elysia, t } from "elysia";

const SYSTEM_INSTRUCTION = `
You are an expert audio transcriptionist and diarization engine.
Your task is to transcribe the provided audio file accurately.
Identify different speakers and label them as "Speaker 1", "Speaker 2", etc.
Break the transcription into logical segments based on speaker changes or natural pauses.
Provide a start and end time for each segment in "MM:SS" format.
Ensure the text is punctuated and capitalized correctly.
`;

const app = new Elysia()
	.use(cors())
	.get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
	.post(
		"/api/transcribe",
		async ({ body }) => {
			const apiKey = process.env.GEMINI_API_KEY;
			if (!apiKey) {
				throw new Error("GEMINI_API_KEY not configured");
			}

			const ai = new GoogleGenAI({ apiKey });

			try {
				const response = await ai.models.generateContent({
					model: "gemini-2.5-flash",
					contents: {
						parts: [
							{
								inlineData: {
									mimeType: body.mimeType,
									data: body.audio,
								},
							},
							{
								text: "Transcribe this audio file with speaker diarization. Return the result as a structured JSON object.",
							},
						],
					},
					config: {
						systemInstruction: SYSTEM_INSTRUCTION,
						responseMimeType: "application/json",
						responseSchema: {
							type: Type.OBJECT,
							properties: {
								segments: {
									type: Type.ARRAY,
									items: {
										type: Type.OBJECT,
										properties: {
											speakerId: {
												type: Type.STRING,
												description: "Generic ID like 'speaker_1', 'speaker_2'",
											},
											startTime: { type: Type.STRING },
											endTime: { type: Type.STRING },
											text: { type: Type.STRING },
										},
										required: ["speakerId", "startTime", "endTime", "text"],
									},
								},
							},
						},
					},
				});

				const text = response.text;
				if (!text) {
					throw new Error("No response from Gemini");
				}

				const data = JSON.parse(text);

				// Add unique IDs to segments
				const segments = data.segments.map(
					(
						s: { speakerId: string; startTime: string; endTime: string; text: string },
						index: number
					) => ({
						...s,
						id: `segment-${index}-${Date.now()}`,
					})
				);

				return { segments };
			} catch (error) {
				console.error("Transcription error:", error);
				throw error;
			}
		},
		{
			body: t.Object({
				audio: t.String({ description: "Base64 encoded audio data" }),
				mimeType: t.String({ description: "MIME type of the audio file" }),
			}),
		}
	)
	.listen(3001);

console.log(`Server running at http://localhost:${app.server?.port}`);

export type App = typeof app;
