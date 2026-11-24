import { createContext, useContext, useState } from "react";

interface CrtContextValue {
	enabled: boolean;
	toggle: () => void;
}

const CrtContext = createContext<CrtContextValue>({
	enabled: true,
	toggle: () => {},
});

export function useCrt(): CrtContextValue {
	return useContext(CrtContext);
}

/**
 * Provides the global warm analog CRT shader state (defaults ON) and renders a
 * subtle viewport-wide scanline + vignette overlay (pointer-events-none, zero blur).
 */
export function CrtProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const [enabled, setEnabled] = useState(true);

	return (
		<CrtContext.Provider
			value={{ enabled, toggle: () => setEnabled((value) => !value) }}
		>
			{children}
			{enabled && (
				<div
					aria-hidden="true"
					data-crt-overlay=""
					className="pointer-events-none fixed inset-0 z-140"
				>
					{/* Whisper-subtle horizontal analog scanlines */}
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, rgb(23 21 19 / 0.017) 0px, rgb(23 21 19 / 0.017) 1px, transparent 1px, transparent 4px)",
						}}
					/>
					{/* Soft CRT tube edge vignette */}
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"radial-gradient(ellipse at center, transparent 70%, rgb(23 21 19 / 0.055) 100%)",
						}}
					/>
				</div>
			)}
		</CrtContext.Provider>
	);
}
