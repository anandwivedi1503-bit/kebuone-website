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
  image: string;
};

export const CEO_BIO =
  "As the CEO & Founder of Shubhrax Mobility Ltd, Sunil Pathak is the driving force behind the company's vision of transforming smart electric mobility. With a strong focus on innovation, customer satisfaction, and sustainable growth, he has led Evuddy towards becoming a trusted name in the mobility sector. His leadership is driven by a commitment to excellence, empowering teams, and embracing technology to deliver reliable and eco-friendly mobility solutions. Through his vision and dedication, Sunil continues to inspire progress, create lasting impact, and shape a future-ready organization.";

export const board: LeaderPoster[] = [
  {
    id: "ceo",
    name: "Sunil Pathak",
    role: "Founder & CEO",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/ceo-poster.png",
    bio: CEO_BIO,
  },
  {
    id: "chairman",
    name: "Chairman",
    role: "Chairman",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/chairman-poster.png",
    bio: "The Chairman provides strategic leadership, governance and long-term vision, guiding EVUDDY's sustainable growth and keeping the organisation focused on safe, smart electric mobility.",
  },
  {
    id: "director",
    name: "Executive Director",
    role: "Executive Director",
    org: "Shubhrax Mobility Ltd",
    image: "/leadership/director-poster.png",
    bio: "The Executive Director drives execution, operational excellence and customer-centric innovation so EVUDDY delivers a reliable electric mobility experience across hubs, riders and partners.",
  },
];

export const team: TeamMember[] = [
  { id: "operations", name: "Operations", role: "Operations", image: "/leadership/team/operations.png" },
  { id: "technology", name: "Technology", role: "Technology", image: "/leadership/team/technology.png" },
  { id: "finance", name: "Finance", role: "Finance", image: "/leadership/team/finance.png" },
  { id: "hr", name: "Human Resources", role: "Human Resources", image: "/leadership/team/hr.png" },
  { id: "marketing", name: "Marketing", role: "Marketing", image: "/leadership/team/marketing.png" },
  { id: "business", name: "Business Development", role: "Business Development", image: "/leadership/team/business.png" },
];
