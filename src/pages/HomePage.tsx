import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAllCases } from "../hooks/useCase";
import { useGameState } from "../hooks/useGameState";
import { useTranslation } from "../i18n";
import { Button } from "../components/common/Button";

const categoryKeys = [
  { key: "category.replication", range: [1, 3], color: "amber" },
  { key: "category.consistency", range: [4, 8], color: "cyan" },
  { key: "category.loadBalancing", range: [9, 13], color: "amber" },
  { key: "category.caching", range: [14, 17], color: "cyan" },
  { key: "category.messaging", range: [18, 21], color: "amber" },
  { key: "category.storage", range: [22, 25], color: "cyan" },
  { key: "category.network", range: [26, 29], color: "amber" },
  { key: "category.advanced", range: [30, 33], color: "cyan" },
];

export function HomePage() {
  const navigate = useNavigate();
  const cases = useAllCases();
  const { progress, isCaseUnlocked, completedCases, rank } = useGameState();
  const { t } = useTranslation();

  const pct =
    cases.length > 0 ? Math.round((completedCases / cases.length) * 100) : 0;
  const rankTitle = t(`rank.${rank.id}`);

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative py-16 px-6 text-center overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Shield */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 15,
              delay: 0.2,
            }}
            className="mx-auto mb-6"
          >
            <svg
              width="100"
              height="112"
              viewBox="0 0 28 32"
              fill="none"
              className="mx-auto shield-glow"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M14 1L2 6v10c0 8.5 5.5 15.5 12 18 6.5-2.5 12-9.5 12-18V6L14 1z"
                fill="#0a0e1a"
                stroke="#fbbf24"
                strokeWidth="0.8"
              />
              <path
                d="M14 5l-8 3.5v7c0 6 3.6 11 8 13 4.4-2 8-7 8-13v-7L14 5z"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="0.4"
                opacity="0.3"
              />
              <text
                x="14"
                y="20"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="9"
                fontFamily="Bebas Neue"
              >
                SDPD
              </text>
            </svg>
          </motion.div>

          <h1 className="font-display text-5xl md:text-6xl text-white tracking-[0.1em] mb-2">
            {t("home.heroTitle1")}
            <br />
            <span className="text-amber-400">{t("home.heroTitle2")}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/30 text-sm max-w-md mx-auto mt-4 leading-relaxed"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 mt-8 text-xs font-mono"
          >
            <div className="text-center">
              <p className="text-amber-400 text-lg font-display tracking-wider">
                {rankTitle.toUpperCase()}
              </p>
              <p className="text-white/20">{t("home.rank")}</p>
            </div>
            <div className="w-px h-8 bg-noir-600" />
            <div className="text-center">
              <p className="text-white/80 text-lg font-display">
                {completedCases}/{cases.length}
              </p>
              <p className="text-white/20">{t("home.cases")}</p>
            </div>
            <div className="w-px h-8 bg-noir-600" />
            <div className="text-center">
              <p className="text-cyan-400 text-lg font-display">{pct}%</p>
              <p className="text-white/20">{t("home.cleared")}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Case Board */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {categoryKeys.map((cat, catIdx) => {
          const catCases = cases.filter(
            (c) => c.number >= cat.range[0] && c.number <= cat.range[1],
          );
          if (catCases.length === 0) return null;
          const label = t(cat.key);

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + catIdx * 0.05 }}
              className="mb-8"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-1 h-4 rounded-full ${cat.color === "cyan" ? "bg-cyan-400/60" : "bg-amber-400/60"}`}
                />
                <h2 className="font-display text-base text-white/50 tracking-wider uppercase">
                  {label}
                </h2>
                <div className="flex-1 h-px bg-noir-700/50" />
                <span className="text-[10px] font-mono text-white/15">
                  {catCases.filter((c) => progress[c.id]?.completed).length}/
                  {catCases.length}
                </span>
              </div>

              {/* Case grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {catCases.map((c) => {
                  const unlocked = isCaseUnlocked(c.number);
                  const done = progress[c.id]?.completed;

                  return (
                    <motion.div
                      key={c.id}
                      whileHover={
                        unlocked
                          ? { x: 4, transition: { duration: 0.15 } }
                          : undefined
                      }
                      className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        done
                          ? "border-status-healthy/15 bg-status-healthy/3 hover:bg-status-healthy/5"
                          : unlocked
                            ? "border-noir-600/30 bg-noir-800/30 hover:border-amber-500/20 hover:bg-noir-700/30 cursor-pointer"
                            : "border-noir-700/20 bg-noir-800/10 opacity-35"
                      }`}
                      onClick={() => unlocked && navigate(`/case/${c.id}`)}
                    >
                      {/* Number */}
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                          done
                            ? "bg-status-healthy/10 text-status-healthy"
                            : unlocked
                              ? "bg-amber-500/8 text-amber-500/80"
                              : "bg-noir-700/30 text-white/10"
                        }`}
                      >
                        <span className="font-display text-sm">
                          {String(c.number).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            done
                              ? "text-status-healthy/70"
                              : unlocked
                                ? "text-white/70"
                                : "text-white/20"
                          }`}
                        >
                          {c.title}
                        </p>
                        <p className="text-[11px] text-white/20 truncate">
                          {c.subtitle}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        {done ? (
                          <span className="text-[10px] font-mono text-status-healthy/60">
                            {t("home.statusCleared")}
                          </span>
                        ) : unlocked ? (
                          <Button
                            onClick={() => navigate(`/case/${c.id}`)}
                            className="text-[11px] py-1 px-3"
                          >
                            {t("home.open")}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-mono text-white/10">
                            {t("home.statusLocked")}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
