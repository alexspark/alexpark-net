import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Home",
  EMAIL: "hello@alexpark.net",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Welcome to my corner of the internet.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects.",
};

export const SOCIALS: Socials = [
  {
    NAME: "x",
    HREF: "https://twitter.com/apark_xp",
  },
];
