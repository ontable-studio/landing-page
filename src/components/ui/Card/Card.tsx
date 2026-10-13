import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export const cardVariants = cva("bg-canvas rounded-2xl", {
	variants: {
		variant: {
			flat: "bg-surface",
			bordered: "border-surface-border border",
			elevated: "shadow-lg shadow-black/5",
		},
	},
	defaultVariants: { variant: "flat" },
});

type CardProps = React.ComponentProps<"div"> &
	VariantProps<typeof cardVariants>;

/** A generic surface: flat, bordered or elevated. */
export function Card({
	variant,
	className,
	...props
}: CardProps): React.JSX.Element {
	return (
		<div className={cn(cardVariants({ variant }), className)} {...props} />
	);
}
