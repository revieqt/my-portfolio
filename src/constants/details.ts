export const NAME = "Your Name";
export const JOB_TITLE = "Full-Stack Developer";

export const RESUME_HREF = "/resume.pdf"; // lives in /public/resume.pdf
export const GITHUB_HREF = "https://github.com/your-username";
export const LINKEDIN_HREF = "https://www.linkedin.com/in/your-username";
export const EMAIL = "your.email@gmail.com";

export const BUILT_WITH = [
  { label: "React", href: "https://react.dev" },
  { label: "Vite", href: "https://vite.dev" },
];

export const NAV_ITEMS = [
  { to: "/", label: "Portfolio", end: true },
  { to: "/blog", label: "Blog", end: false },
  { to: "/contact", label: "Contact", end: false },
];

export const FOOTER_LINKS = [
  { label: "View resume", href: RESUME_HREF, external: true },
  { label: "GitHub", href: GITHUB_HREF, external: true },
  { label: "LinkedIn", href: LINKEDIN_HREF, external: true },
  { label: "Gmail", href: `mailto:${EMAIL}`, external: false },
];