// Props: none. The design's sticky header: a blurred cream bar over the hero picture, the logo
// mark and wordmark on the left, three anchors and the GitHub pill on the right. The skip link sits
// before it so the keyboard reaches the content without walking the bar.
import { GITHUB_REPO } from '../lib/site-links';

const ANCHORS = [
  { href: '#gallery', label: 'Demos' },
  { href: '#numbers', label: 'Catalog' },
  { href: '#loop', label: 'How it works' },
];

export default function SiteNav() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:tracking-[1px] focus:text-white"
      >
        SKIP TO CONTENT
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-6 py-3.5">
          <a
            href="#hero-cinema"
            className="flex items-center gap-2.5 text-[16px] font-bold tracking-[-0.3px] whitespace-nowrap text-ink hover:text-ink"
          >
            <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true" className="block flex-none">
              <g
                fill="none"
                stroke="currentColor"
                className="text-green"
                strokeWidth="2.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <path d="M24 5 41 14.5v19L24 43 7 33.5v-19Z" />
                <path d="M7 14.5 24 24l17-9.5M24 24v19" />
              </g>
              <circle cx="24" cy="24" r="3.2" fill="#c7ef7a" stroke="#0b7553" strokeWidth="1.6" />
            </svg>
            3Dviz Pro Max
          </a>
          <nav aria-label="Site" className="flex items-center gap-1.5 text-[14px] font-medium">
            {/* Below 640px the three anchors and the pill do not share a line; the pill stays
                (it is the call to action) and the anchors return with the room to hold them. */}
            <ul className="hidden items-center gap-1.5 sm:flex">
              {ANCHORS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="rounded-full px-[13px] py-2 text-mute transition-colors duration-150 hover:bg-tint hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={GITHUB_REPO}
              className="ml-1.5 rounded-full bg-ink px-[18px] py-[9px] font-semibold text-white hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
