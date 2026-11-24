import { motion } from "motion/react";
import { cn } from "../../../lib/cn";

interface RevealProps {
	children: React.ReactNode;
	/** Stagger delay in seconds. */
	delay?: number;
	/** Initial vertical offset in pixels. */
	y?: number;
	className?: string;
}

/**
 * Scroll-triggered upward reveal with smooth editorial deceleration.
 * Fires once per element when it enters the viewport.
 */
export function Reveal({
	children,
	delay = 0,
	y = 22,
	className,
}: RevealProps): React.JSX.Element {
	return (
		<motion.div
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.12 }}
			transition={{
				duration: 0.52,
				delay,
				ease: [0.22, 1, 0.36, 1],
			}}
			className={cn(className)}
		>
			{children}
		</motion.div>
	);
}
