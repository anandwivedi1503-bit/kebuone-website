export type LeaderPoster = {
  id: string;
  name: string;
  role: string;
  org: string;
  image: string;
  bio: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Paste a local path or full https URL for this person's poster. */
  image: string;
};

export const board: LeaderPoster[] = [
  {
    id: "chairman",
    name: "Anjali Mishra",
    role: "Chairman",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/chairman-poster.png",
    bio: "As the Chairman of Shubhrax Mobility Ltd, Anjali Mishra plays a pivotal role in steering the company towards innovation, operational excellence, and sustainable growth. With a sharp strategic vision and a deep understanding of the mobility sector, she ensures that every initiative aligns with our mission of delivering Smart, Electric, and Dependable solutions. Anjali believes in building strong systems, empowering teams, and embracing technology to create real impact. Her leadership continues to inspire trust, drive transformation, and shape Shubhrax Mobility Ltd into a future-ready organisation.",
  },
  {
    id: "ceo",
    name: "Sunil Pathak",
    role: "Founder & CEO",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/ceo-poster.png",
    bio: "As the CEO & Founder of Shubhrax Mobility Ltd, Sunil Pathak is the driving force behind the company's vision of transforming smart electric mobility. With a strong focus on innovation, customer satisfaction, and sustainable growth, he has led Evuddy towards becoming a trusted name in the mobility sector. His leadership is driven by a commitment to excellence, empowering teams, and embracing technology to deliver reliable and eco-friendly mobility solutions. Through his vision and dedication, Sunil continues to inspire progress, create lasting impact, and shape a future-ready organization.",
  },
  {
    id: "gm",
    name: "Bindu Singh",
    role: "General Manager",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/gm-poster.png",
    bio: "As the General Manager of Shubhrax Mobility Ltd, Bindu Singh plays a pivotal role in steering the company towards innovation, operational excellence, and sustainable growth. With a sharp strategic vision and a deep understanding of the mobility sector, she ensures that every initiative aligns with our mission of delivering Smart, Electric, and Dependable solutions. Bindu believes in building strong systems, empowering teams, and embracing technology to create real impact. Her leadership continues to inspire trust, drive transformation, and shape Shubhrax Mobility Ltd into a future-ready organisation.",
  },
];

/** Second row under board leadership posters. */
export const teamRow: TeamMember[] = [
  {
    id: "designer",
    name: "Akanksha Maurya",
    role: "Graphic Designer",
    image: "/leadership/designer.png",
  },
  {
    id: "admin-front-desk",
    name: "Aanya Singh",
    role: "Admin & Front Desk",
    image: "/leadership/admin-and-telecaller.png",
  },
];

export const team: TeamMember[] = [
  {
    id: "technology",
    name: "Anand Dhar Dwivedi",
    role: "Software Development Engineer (SDE)",
    image: "/anand-sde.png",
  },
  { id: "operations", name: "Team member", role: "Operations", image: "" },
  { id: "finance", name: "Team member", role: "Finance", image: "" },
  { id: "hr", name: "Team member", role: "Human Resources", image: "" },
  { id: "marketing", name: "Team member", role: "Marketing", image: "" },
  { id: "business", name: "Team member", role: "Business Development", image: "" },
];
