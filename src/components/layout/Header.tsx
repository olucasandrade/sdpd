import { useState } from "react";
import { Link } from "react-router-dom";
import { useGameState } from "../../hooks/useGameState";
import { useInterviewSession } from "../../hooks/useInterviewSession";
import { useNotebook } from "../../hooks/useNotebook";
import { isDue } from "../../utils/reviewScheduler";
import { getUtcDateString } from "../../data/dailyDrill";
import { useTranslation } from "../../i18n";
import { Button } from "../common/Button";
import { MobileMenu } from "./MobileMenu";
import { ResetProgressButton } from "./ResetProgressButton";
import { AccountSection } from "../account/AccountSection";

function ShieldIcon() {
  return (
    <svg
      width="32"
      height="36"
      viewBox="0 0 28 32"
      fill="none"
      className="shield-glow flex-shrink-0"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M14 1L2 6v10c0 8.5 5.5 15.5 12 18 6.5-2.5 12-9.5 12-18V6L14 1z"
        fill="#0f1424"
        stroke="#fbbf24"
        strokeWidth="1.5"
      />
      <path
        d="M14 7l-6 2.5v5c0 4.5 2.8 8.2 6 9.5 3.2-1.3 6-5 6-9.5v-5L14 7z"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="0.75"
        opacity="0.5"
      />
      <text
        x="14"
        y="19"
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="8"
        fontFamily="Bebas Neue"
        fontWeight="bold"
      >
        S
      </text>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3L4.9 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const { rank, completedCases, toggleGuide, guideOpen, locale, setLocale } =
    useGameState();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const interviewStatus = useInterviewSession((s) => s.status);
  const guideDisabled = interviewStatus === "round" || interviewStatus === "postmortem";
  const notebookCards = useNotebook((s) => s.cards);
  const dueCount = notebookCards.filter((c) => !c.retired && isDue(c.dueDate, getUtcDateString())).length;

  const rankTitle = t(`rank.${rank.id}`);

  return (
    <header className="h-12 bg-noir-800/80 backdrop-blur-sm border-b border-amber-500/10 flex items-center justify-between px-4 md:px-5 shrink-0 relative z-30">
      {/* Subtle amber line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <Link to="/">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <div className="max-md:hidden">
            <h1 className="font-display text-lg text-amber-400 leading-none tracking-wider">
              SDPD
            </h1>
            <p className="text-xs text-noir-500 font-mono uppercase tracking-[0.2em] leading-none mt-0.5">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </Link>

      {/* Desktop controls */}
      <div className="hidden md:flex items-center gap-5">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-amber-400/80 text-xs">
              {rankTitle.toUpperCase()}
            </span>
          </div>
          <span className="text-noir-500">|</span>
          <span className="font-mono text-noir-500 text-xs">
            {completedCases}/33 {t("header.cases")}
          </span>
        </div>
        <button
          onClick={() => setLocale(locale === "en" ? "pt-BR" : "en")}
          aria-label={locale === "en" ? t("header.localeToggle.toPt") : t("header.localeToggle.toEn")}
          className="text-xs font-mono text-noir-400 hover:text-amber-400 transition-colors px-1.5 py-0.5 rounded border border-noir-600/40 hover:border-amber-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
        >
          {locale === "en" ? "PT" : "EN"}
        </button>
        <Link to="/daily">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.daily")}
          </Button>
        </Link>
        <Link to="/chaos">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.chaos")}
          </Button>
        </Link>
        <Link to="/builder">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.builder")}
          </Button>
        </Link>
        <Link to="/interview">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.interview")}
          </Button>
        </Link>
        <Link to="/notebook" className="relative">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.notebook")}
          </Button>
          {dueCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-noir-950 text-[10px] font-mono font-bold flex items-center justify-center">
              {dueCount}
            </span>
          )}
        </Link>
        <Link to="/cheatsheet">
          <Button variant="ghost" className="text-xs font-mono">
            {t("header.cheatsheet")}
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={toggleGuide}
          disabled={guideDisabled}
          className="text-xs font-mono"
        >
          {guideOpen ? t("header.guide.close") : t("header.guide.open")}
        </Button>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={t("settings.title")}
            className="text-noir-400 hover:text-amber-400 transition-colors w-9 h-9 flex items-center justify-center"
          >
            <GearIcon />
          </button>
          {settingsOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                aria-hidden="true"
                onClick={() => setSettingsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-noir-800 border border-noir-600/50 rounded-lg p-3 shadow-xl">
                <p className="text-xs font-mono text-noir-500 uppercase tracking-widest mb-2">
                  {t("settings.title")}
                </p>
                <AccountSection className="w-full mb-2" />
                <ResetProgressButton className="w-full" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile: rank pill + hamburger */}
      <div className="flex md:hidden items-center gap-3">
        <span className="font-mono text-amber-400/80 text-xs">
          {rankTitle.toUpperCase()}
        </span>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label={t("menu.open")}
          className="text-noir-300 hover:text-amber-400 transition-colors w-11 h-11 flex items-center justify-center -mr-2"
        >
          <MenuIcon />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
