import projectsData from "@/data/projects.generated.json";

export interface Project {
    repo: string;
    title: string;
    description: string;
    website: string;
    coverImage?: string;
    tags: string[];
    stars: number;
    lastCommitDate: string;
    lastCommitDateFormatted: string;
    repoUrl: string;
}

export function getProjects(): Project[] {
    // Ya está ordenado por lastCommitDate descendente desde el script
    return projectsData as Project[];
}

