import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { SectionHeader } from "../../components/layout/SectionHeader";

export function MotionSection(): React.JSX.Element {
	const [run, setRun] = useState(0);
	return (
		<section id="motion" className="scroll-mt-36">
			<SectionHeader
				title="Motion"
				description="animate-rise lifts and fades something in; animate-fade-in only fades. Both are switched off for visitors who prefer reduced motion."
			/>
			<div className="mt-8 flex items-center gap-6">
				<div key={run} className="flex gap-4">
					<div className="animate-rise bg-brand h-16 w-32 rounded-2xl" />
					<div className="animate-fade-in bg-ink-900 h-16 w-32 rounded-2xl" />
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setRun((n) => n + 1)}
				>
					Replay
				</Button>
			</div>
		</section>
	);
}
