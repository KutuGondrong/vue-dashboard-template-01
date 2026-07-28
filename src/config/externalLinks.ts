import externalLinks from './external-links.json';

export interface ExternalLinks {
  templateRepoUrl: string;
  readmeUrl: string;
  previewUrl: string;
  tutorialUrl: string;
  componentsUrl: string;
}

export const externalLinksConfig: ExternalLinks = externalLinks;
