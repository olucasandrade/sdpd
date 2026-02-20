import { Link } from "react-router-dom";
import { useGameState } from "../../hooks/useGameState";
import { useTranslation } from "../../i18n";
import { Button } from "../common/Button";

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

export function Header() {
  const { rank, completedCases, toggleGuide, guideOpen, locale, setLocale } =
    useGameState();
  const { t } = useTranslation();

  const rankTitle = t(`rank.${rank.id}`);

  return (
    <header className="h-12 bg-noir-800/80 backdrop-blur-sm border-b border-amber-500/10 flex items-center justify-between px-5 shrink-0 relative">
      {/* Subtle amber line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <Link to="/">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <div>
            <h1 className="font-display text-lg text-amber-400 leading-none tracking-wider">
              SDPD
            </h1>
            <p className="text-[9px] text-noir-500 font-mono uppercase tracking-[0.2em] leading-none mt-0.5">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-amber-400/80 text-[11px]">
              {rankTitle.toUpperCase()}
            </span>
          </div>
          <span className="text-noir-500">|</span>
          <span className="font-mono text-noir-500 text-[11px]">
            {completedCases}/33 {t("header.cases")}
          </span>
        </div>
        <button
          onClick={() => setLocale(locale === "en" ? "pt-BR" : "en")}
          className="text-[11px] font-mono text-noir-400 hover:text-amber-400 transition-colors px-1.5 py-0.5 rounded border border-noir-600/40 hover:border-amber-500/30"
        >
          {locale === "en" ? "PT" : "EN"}
        </button>
        <Button
          variant="ghost"
          onClick={toggleGuide}
          className="text-[11px] font-mono"
        >
          {guideOpen ? t("header.guide.close") : t("header.guide.open")}
        </Button>
      </div>
    </header>
  );
}
