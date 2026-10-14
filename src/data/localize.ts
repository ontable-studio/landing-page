import { translate, type Locale, type TextKey } from "../i18n";
import { projects, type Project, type ProjectType } from "./projects";
import { projectTextsId } from "./projects.id";

const CREDIT_LABELS: Record<string, TextKey> = {
	Date: "credit.date",
	Role: "credit.role",
	Platform: "credit.platform",
	"Made for": "credit.madeFor",
	Status: "credit.status",
};

const STATUSES: Record<string, TextKey> = {
	"In development": "status.inDevelopment",
};

/** `status` or a credit value that names a status, in the language; anything else as it is. */
function status(locale: Locale, text: string): string {
	const key = STATUSES[text];
	return key ? translate(locale, key) : text;
}

/**
 * The project as shown in `locale`: summary, genre, status, credit labels and picture
 * descriptions translated, everything else (names, files, platforms, roles, year, links)
 * untouched. English is the data as it is.
 */
export function localizeProject(project: Project, locale: Locale): Project {
	if (locale === "en") return project;
	const text = locale === "id" ? projectTextsId[project.slug] : undefined;
	if (!text) return project;
	return {
		...project,
		summary: text.summary,
		category: text.category,
		status: project.status ? status(locale, project.status) : undefined,
		credits: project.credits.map((credit) => {
			const key = CREDIT_LABELS[credit.label];
			return {
				label: key ? translate(locale, key) : credit.label,
				value:
					credit.label === "Status"
						? status(locale, credit.value)
						: credit.value,
			};
		}),
		gallery: project.gallery.map((item, index) => ({
			...item,
			alt: text.galleryAlts[index] ?? item.alt,
		})),
	};
}

/** Every project, in the language. */
export function localizedProjects(locale: Locale): Project[] {
	return projects.map((project) => localizeProject(project, locale));
}

/** The name of a project type in the language ("UI Design" is "Desain UI" in Indonesian). */
export function typeLabel(locale: Locale, type: ProjectType): string {
	const slug = type.toLowerCase().replace(/\s+/g, "-");
	return translate(locale, `type.${slug}` as TextKey);
}
