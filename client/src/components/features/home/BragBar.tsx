import { Badge } from "@/components/ui/badge";

const pressBadges = [
  { name: "TechCrunch", logo: "/images/techcrunch.svg", url: "https://techcrunch.com" },
  { name: "Forbes", logo: "/images/forbes.svg", url: "https://forbes.com" },
  { name: "CNN", logo: "/images/cnn.svg", url: "https://cnn.com" },
];

const BragBar = () => (
  <nav
    aria-label="Press mentions"
    className="w-full bg-muted py-3 flex justify-center items-center border-b border-muted-foreground/10"
  >
    <span className="text-xs text-muted-foreground mr-4 font-medium tracking-wide uppercase">
      As seen in:
    </span>
    <ul className="flex flex-wrap gap-3 items-center">
      {pressBadges.map((badge) => (
        <li key={badge.name}>
          <a
            href={badge.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={badge.name}
            className="focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold">
              <img
                src={badge.logo}
                alt={badge.name}
                className="h-5 w-5 object-contain"
                loading="lazy"
              />
              <span className="sr-only md:not-sr-only">{badge.name}</span>
            </Badge>
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default BragBar;
