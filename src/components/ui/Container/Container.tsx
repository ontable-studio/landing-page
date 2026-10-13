import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export const containerVariants = cva("mx-auto w-full px-6", {
	variants: {
		size: {
			default: "max-w-6xl",
			narrow: "max-w-3xl",
			wide: "max-w-7xl px-4 lg:px-8",
		},
	},
	defaultVariants: { size: "default" },
});

type ContainerProps = React.ComponentProps<"div"> &
	VariantProps<typeof containerVariants>;

/** Centres page content and sets its maximum width and side gutters. */
export function Container({
	size,
	className,
	...props
}: ContainerProps): React.JSX.Element {
	return (
		<div className={cn(containerVariants({ size }), className)} {...props} />
	);
}
