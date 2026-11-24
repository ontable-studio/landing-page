import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

/** A fill that slides in from the left on hover and keyboard focus, behind the label. */
const FILL =
	"relative isolate overflow-hidden before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:transition-transform before:duration-300 hover:before:translate-x-0 focus-visible:before:translate-x-0";

export const buttonVariants = cva(
	"group/button focus-visible:outline-brand inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-sans whitespace-nowrap transition-[color,scale] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]",
	{
		variants: {
			variant: {
				primary: `bg-brand text-white shadow-[0_3px_0_0_rgba(23,21,19,0.2)] hover:shadow-[0_4px_0_0_rgba(23,21,19,0.26)] active:translate-y-[2px] active:shadow-none ${FILL} before:bg-brand-hover`,
				outline: `border-ink-200 text-text-primary hover:border-ink-400 border bg-white shadow-[0_2px_0_0_rgba(23,21,19,0.08)] active:translate-y-px active:shadow-none ${FILL} before:bg-surface`,
				ghost: "text-text-primary hover:bg-surface bg-transparent",
				link: "text-brand-ink h-auto bg-transparent p-0 hover:text-orange-700 hover:underline",
			},
			size: {
				sm: "h-9 px-4 text-sm font-medium",
				md: "h-11 px-6 text-base font-semibold",
				lg: "h-13 px-7 text-base font-semibold",
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
