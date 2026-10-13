import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export const badgeVariants = cva(
	"text-label inline-flex items-center rounded-full px-3 py-1 font-mono font-medium tracking-wide uppercase",
	{
		variants: {
			variant: {
				brand: "bg-brand text-white",
				neutral: "bg-surface text-text-secondary",
				outline: "border-surface-border text-text-secondary border",
			},
		},
		defaultVariants: { variant: "neutral" },
	}
);

type BadgeProps = React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants>;

/** A small mono label, such as a project's platform or category. */
export function Badge({
	variant,
	className,
	...props
}: BadgeProps): React.JSX.Element {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}
