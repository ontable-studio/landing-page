import { Link } from "react-router";

type RouterLinkProps = Omit<React.ComponentProps<typeof Link>, "to"> & {
	href: string;
};

/** A client-side link that takes `href`, so it can stand in for `<a>` (see ProjectCard `linkAs`). */
export function RouterLink({
	href,
	...props
}: RouterLinkProps): React.JSX.Element {
	return <Link to={href} {...props} />;
}
