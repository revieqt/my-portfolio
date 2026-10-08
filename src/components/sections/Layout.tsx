import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { NAME, JOB_TITLE, BUILT_WITH, NAV_ITEMS, FOOTER_LINKS } from "@/constants/details"

/*
  Palette
  page      #0A0E14    footer   #070A0F    line   #1E2733
  text      #E6EDF3    muted    #8793A3    accent #4CC9F0 (cyan)
*/

// Header stays put until the page has scrolled past this many pixels.
const HIDE_AFTER = 80;

/* -------------------------------------------------------------------------- */
/*  Icons (inline so there are no extra dependencies)                         */
/* -------------------------------------------------------------------------- */

function Icon({
  children,
  className = "h-4 w-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

const ChevronRightIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/*  Header scroll behaviour                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Hides on any downward scroll (once past HIDE_AFTER) and
 * reappears on any upward scroll, however small.
 */
function useHeaderVisibility() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      // Clamp to the real scroll range so iOS rubber-banding doesn't
      // register as a scroll in the opposite direction.
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(maxY, 0));

      if (y < HIDE_AFTER) {
        setVisible(true);
      } else if (y > lastY.current) {
        setVisible(false);
      } else if (y < lastY.current) {
        setVisible(true);
      }

      lastY.current = y;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return [visible, setVisible] as const;
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

function Layout() {
  const [headerVisible, setHeaderVisible] = useHeaderVisibility();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close with Escape while open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Close if the viewport grows to the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Never hide the header while the mobile menu is open.
  const showHeader = headerVisible || menuOpen;

  return (
    <div
      className="flex min-h-screen flex-col bg-[#0A0E14] bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] text-[#E6EDF3] antialiased [color-scheme:dark] selection:bg-[#4CC9F0]/30"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#4CC9F0] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0A0E14]"
      >
        Skip to content
      </a>

      {/* ------------------------------ Header ------------------------------ */}
      <header
        ref={headerRef}
        // Keyboard users tabbing into a hidden header should see it.
        onFocusCapture={() => setHeaderVisible(true)}
        className={`sticky top-0 z-50 border-b border-[#1E2733] bg-[#0A0E14]/80 backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8"
        >
          {/* Wordmark */}
          <Link
            to="/"
            className="group flex items-center text-[15px] font-semibold tracking-tight outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#4CC9F0]"
          >
            <span aria-hidden className="mr-2 text-[#4CC9F0]">
              &gt;
            </span>
            <span className="transition-colors duration-200 group-hover:text-[#4CC9F0]">
              {NAME}
            </span>
            <span
              aria-hidden
              className="ml-1.5 h-4 w-2 bg-[#4CC9F0] opacity-0 transition-opacity group-hover:animate-pulse group-hover:opacity-100 motion-reduce:animate-none"
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-10 md:flex">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group relative text-sm outline-offset-8 transition-colors duration-200 hover:[text-shadow:0_0_14px_rgba(76,201,240,0.55)] focus-visible:outline-2 focus-visible:outline-[#4CC9F0] ${
                      isActive
                        ? "text-[#4CC9F0]"
                        : "text-[#8793A3] hover:text-[#E6EDF3]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden
                        className={`absolute -left-4 text-[#4CC9F0] transition-all duration-200 motion-reduce:transition-none ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      >
                        [
                      </span>
                      {label}
                      <span
                        aria-hidden
                        className={`absolute -right-4 text-[#4CC9F0] transition-all duration-200 motion-reduce:transition-none ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      >
                        ]
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Burger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-[#E6EDF3] outline-offset-2 transition-colors duration-200 hover:text-[#4CC9F0] focus-visible:outline-2 focus-visible:outline-[#4CC9F0] md:hidden"
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 h-0.5 w-full rounded bg-current transition-all duration-300 motion-reduce:transition-none ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full rounded bg-current transition-opacity duration-200 motion-reduce:transition-none ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-full rounded bg-current transition-all duration-300 motion-reduce:transition-none ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </nav>

        {/* Mobile menu: full-width panel directly under the header */}
        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-full grid border-b border-[#1E2733] bg-[#0A0E14] transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
            menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <ul>
              {NAV_ITEMS.map(({ to, label, end }) => (
                <li key={to} className="border-t border-[#1E2733] first:border-t-0">
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group relative flex min-h-14 items-center justify-between px-5 py-4 text-base transition-colors duration-200 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#4CC9F0] before:transition-transform before:duration-200 hover:bg-[#4CC9F0]/5 focus-visible:bg-[#4CC9F0]/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4CC9F0] motion-reduce:before:transition-none ${
                        isActive
                          ? "bg-[#4CC9F0]/5 text-[#4CC9F0] before:scale-y-100"
                          : "text-[#E6EDF3] before:scale-y-0 hover:before:scale-y-100"
                      }`
                    }
                  >
                    <span>
                      <span
                        aria-hidden
                        className="mr-3 text-[#4CC9F0]/60 transition-colors group-hover:text-[#4CC9F0]"
                      >
                        &gt;
                      </span>
                      {label}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-[#8793A3] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#4CC9F0] motion-reduce:transform-none" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* ------------------------------- Main ------------------------------- */}
      <main
        id="main"
        className="flex-1"
        style={{ "--layout-header-height": `${headerHeight}px` } as CSSProperties}
      >
        <Outlet />
      </main>

      {/* ------------------------------ Footer ------------------------------ */}
      <footer className="border-t border-[#1E2733] bg-[#070A0F]">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div>
              <p className="font-semibold tracking-tight">{NAME}</p>
              <p className="mt-0.5 text-sm text-[#8793A3]">{JOB_TITLE}</p>
            </div>

            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm md:justify-start">
              {FOOTER_LINKS.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-block py-1 text-[#8793A3] outline-offset-4 transition-colors duration-200 hover:text-[#4CC9F0] hover:[text-shadow:0_0_14px_rgba(76,201,240,0.55)] focus-visible:outline-2 focus-visible:outline-[#4CC9F0] motion-reduce:transition-none"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 border-t border-[#1E2733] pt-5 text-center text-xs text-[#8793A3] md:flex-row md:justify-between md:text-left">
            <p>
              Built with{" "}
              {BUILT_WITH.map(({ label, href }, i) => (
                <span key={label}>
                  {i > 0 && " + "}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-[#4CC9F0] focus-visible:outline-2 focus-visible:outline-[#4CC9F0] motion-reduce:transition-none"
                  >
                    {label}
                  </a>
                </span>
              ))}
            </p>
            <p>
              © {new Date().getFullYear()} {NAME}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;