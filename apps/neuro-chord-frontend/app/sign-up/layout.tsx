import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}>
      <div className="flex w-full flex-col justify-center px-6 md:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">{children}</div>
      </div>

      <div
        className="relative hidden md:flex md:w-1/2 flex-col justify-between overflow-hidden"
        style={{ background: 'var(--color-primary)' }}
      >
        {/* ── Geometric background texture ─────────────────── */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Large soft circle top-right */}
          <div
            className="absolute -top-32 -right-32 size-[480px] rounded-full opacity-20"
            style={{ background: 'var(--brand-300)' }}
          />
          {/* Small circle mid-left */}
          <div
            className="absolute top-1/2 -left-16 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'var(--brand-400)' }}
          />
          {/* Bottom accent circle */}
          <div
            className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'var(--brand-300)' }}
          />

          {/* Subtle dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* ── Top: Logo mark ────────────────────────────────── */}
        <div className="relative z-10 pt-10 pl-10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'oklch(from var(--brand-300) l c h / 0.25)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L3 6V12L9 16L15 12V6L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="9" cy="9" r="2" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide opacity-90">Neuro Chord</span>
          </div>
        </div>

        {/* ── Center: Main illustration ─────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-10">
          {/* EdTech SVG illustration — teacher sharing to students */}
          <svg
            viewBox="0 0 380 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-sm"
            aria-label="Teacher sharing materials with students"
          >
            {/* ── Whiteboard / screen ── */}
            <rect
              x="80"
              y="30"
              width="220"
              height="140"
              rx="10"
              fill="white"
              fillOpacity="0.12"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            {/* Screen content lines */}
            <rect x="100" y="55" width="100" height="7" rx="3.5" fill="white" fillOpacity="0.5" />
            <rect x="100" y="70" width="140" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
            <rect x="100" y="82" width="120" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
            <rect x="100" y="94" width="80" height="5" rx="2.5" fill="white" fillOpacity="0.2" />
            {/* Code block on screen */}
            <rect
              x="100"
              y="110"
              width="160"
              height="42"
              rx="6"
              fill="white"
              fillOpacity="0.08"
              stroke="white"
              strokeOpacity="0.15"
            />
            <rect x="110" y="120" width="50" height="4" rx="2" fill="white" fillOpacity="0.4" />
            <rect x="110" y="130" width="80" height="4" rx="2" fill="white" fillOpacity="0.25" />
            <rect x="110" y="140" width="60" height="4" rx="2" fill="white" fillOpacity="0.25" />

            {/* ── Teacher figure ── */}
            {/* Body */}
            <rect x="168" y="188" width="44" height="54" rx="8" fill="white" fillOpacity="0.18" />
            {/* Head */}
            <circle cx="190" cy="176" r="16" fill="white" fillOpacity="0.22" />
            {/* Pointer arm */}
            <line
              x1="212"
              y1="200"
              x2="250"
              y2="168"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="252" cy="167" r="3" fill="white" fillOpacity="0.6" />

            {/* ── Connection lines from screen to students ── */}
            <line
              x1="120"
              y1="172"
              x2="80"
              y2="230"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="260"
              y1="172"
              x2="300"
              y2="230"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="190"
              y1="172"
              x2="190"
              y2="240"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* ── Student 1 (left) ── */}
            <rect x="44" y="238" width="36" height="44" rx="7" fill="white" fillOpacity="0.14" />
            <circle cx="62" cy="228" r="13" fill="white" fillOpacity="0.18" />
            {/* Laptop */}
            <rect
              x="32"
              y="268"
              width="60"
              height="28"
              rx="4"
              fill="white"
              fillOpacity="0.1"
              stroke="white"
              strokeOpacity="0.2"
            />
            <rect x="36" y="272" width="52" height="18" rx="2" fill="white" fillOpacity="0.08" />

            {/* ── Student 2 (center) ── */}
            <rect x="172" y="248" width="36" height="44" rx="7" fill="white" fillOpacity="0.14" />
            <circle cx="190" cy="238" r="13" fill="white" fillOpacity="0.18" />
            {/* Laptop */}
            <rect
              x="160"
              y="278"
              width="60"
              height="22"
              rx="4"
              fill="white"
              fillOpacity="0.1"
              stroke="white"
              strokeOpacity="0.2"
            />

            {/* ── Student 3 (right) ── */}
            <rect x="300" y="238" width="36" height="44" rx="7" fill="white" fillOpacity="0.14" />
            <circle cx="318" cy="228" r="13" fill="white" fillOpacity="0.18" />
            {/* Laptop */}
            <rect
              x="288"
              y="268"
              width="60"
              height="28"
              rx="4"
              fill="white"
              fillOpacity="0.1"
              stroke="white"
              strokeOpacity="0.2"
            />
            <rect x="292" y="272" width="52" height="18" rx="2" fill="white" fillOpacity="0.08" />

            {/* ── Floating material cards ── */}
            {/* Card 1 */}
            <rect
              x="22"
              y="80"
              width="48"
              height="58"
              rx="6"
              fill="white"
              fillOpacity="0.12"
              stroke="white"
              strokeOpacity="0.25"
            />
            <rect x="30" y="92" width="32" height="4" rx="2" fill="white" fillOpacity="0.5" />
            <rect x="30" y="102" width="24" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
            <rect x="30" y="110" width="28" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
            <rect x="30" y="122" width="20" height="8" rx="3" fill="white" fillOpacity="0.15" />

            {/* Card 2 */}
            <rect
              x="310"
              y="60"
              width="48"
              height="58"
              rx="6"
              fill="white"
              fillOpacity="0.12"
              stroke="white"
              strokeOpacity="0.25"
            />
            <rect x="318" y="72" width="32" height="4" rx="2" fill="white" fillOpacity="0.5" />
            <rect x="318" y="82" width="24" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
            <rect x="318" y="90" width="28" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
            <rect x="318" y="102" width="20" height="8" rx="3" fill="white" fillOpacity="0.15" />

            {/* ── Small accent dots ── */}
            <circle cx="145" cy="40" r="4" fill="white" fillOpacity="0.3" />
            <circle cx="345" cy="170" r="3" fill="white" fillOpacity="0.25" />
            <circle cx="30" cy="200" r="3" fill="white" fillOpacity="0.2" />
          </svg>

          {/* Stat pills */}
          <div className="flex items-center gap-3 mt-6">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'oklch(from var(--brand-300) l c h / 0.2)', color: 'white' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              Materials shared instantly
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'oklch(from var(--brand-300) l c h / 0.2)', color: 'white' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              Real-time feedback
            </div>
          </div>
        </div>

        {/* ── Bottom: Quote ─────────────────────────────────── */}
        <div className="relative z-10 pb-10 pl-10 pr-10">
          <div className="p-5 rounded-xl" style={{ background: 'oklch(from var(--brand-600) l c h / 0.35)' }}>
            <blockquote>
              <p
                className="text-sm font-medium leading-relaxed italic mb-2"
                style={{ color: 'oklch(100% 0 0 / 0.88)' }}
              >
                The best teachers dont give you the answers — they spark the curiosity to find them.
              </p>
              <footer className="text-xs font-medium tracking-wide" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>
                Neuro Chord — EdTech Platform
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
