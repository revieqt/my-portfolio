type SkillItem = { name: string; percent: number };
type SkillGroup = { category: string; items: SkillItem[] };

export const SKILLS: SkillGroup[] = [
  {
    category: "Languages",
    items: [
      { name: "Javascript", percent: 90 },
      { name: "TypeScript", percent: 85 },
      { name: "Java", percent: 80 },
      { name: "PHP", percent: 60 },
      { name: "Python", percent: 35 },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "HTML", percent: 90 },
      { name: "CSS", percent: 95 },
      { name: "Tailwind CSS", percent: 75 },
      { name: "React", percent: 80 },
      { name: "React Native", percent: 90 },
      { name: "Next.js", percent: 75 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", percent: 85 },
      { name: "Express", percent: 82 },
      { name: "REST APIs", percent: 75 },
      { name: "MySQL", percent: 90 },
      { name: "MongoDB", percent: 80 },
      { name: "Firebase", percent: 75 },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", percent: 75 },
      { name: "Docker", percent: 60 },
      { name: "VS Code", percent: 90 },
      { name: "Postman", percent: 70 },
      { name: "Figma", percent: 80 },
    ],
  },
  {
    category: "Soft Skills",
    items: [
      { name: "Communication", percent: 80 },
      { name: "Teamwork", percent: 85 },
      { name: "Problem Solving", percent: 80 },
      { name: "Adaptability", percent: 75 },
    ],
  },
];