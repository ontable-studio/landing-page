import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export const buttonVariants = cva(
	"group/button focus-visible:outline-brand inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-sans whitespace-nowrap transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2",
	{
		variants: {
			variant: {
				primary: "bg-brand hover:bg-brand-hover text-white",
				outline:
					"border-surface-border text-text-primary hover:bg-surface border bg-white",
				ghost: "text-text-primary hover:bg-surface bg-transparent",
				link: "text-brand hover:text-brand-hover h-auto bg-transparent p-0 hover:underline",
			},
			size: {
				sm: "h-9 px-4 text-sm font-medium",
				md: "h-11 px-6 text-base font-semibold",
				lg: "h-14 px-8 text-base font-semibold",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	}
);

type OwnProps = VariantProps<typeof buttonVariants> & {
	/** Trailing ↗ icon. */
	arrow?: boolean;
};

type ButtonAsButton = OwnProps &
	React.ComponentProps<"button"> & { href?: undefined };
type ButtonAsLink = OwnProps & React.ComponentProps<"a"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function ArrowUpRight(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
		>
			<path d="M4 12 12 4M5.5 4H12v6.5" />
		</svg>
	);
}

/** One button for every call to action: renders an `<a>` when given an `href`. */
export function Button({
	variant,
	size,
	arrow,
	className,
	children,
	...props
}: ButtonProps): React.JSX.Element {
	const classes = cn(buttonVariants({ variant, size }), className);
	const content = (
		<>
			{children}
			{arrow && <ArrowUpRight />}
		</>
	);

	if ("href" in props && props.href !== undefined) {
		return (
			<a className={classes} {...(props as React.ComponentProps<"a">)}>
				{content}
			</a>
		);
	}

	return (
		<button className={classes} {...(props as React.ComponentProps<"button">)}>
			{content}
		</button>
	);
}
