import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../i18n';

function getArrayKeys(prefix: string, t: (key: string) => string): string[] {
  const items: string[] = [];
  for (let i = 0; i < 50; i++) {
    const key = `${prefix}.${i}`;
    const value = t(key);
    if (value === key || !value) break;
    items.push(value);
  }
  return items;
}

function PhaseCard({
  index,
  title,
  duration,
  points,
}: {
  index: number;
  title: string;
  duration: string;
  points: string[];
}) {
  return (
    <div className="relative bg-noir-800/50 border border-noir-600/30 rounded-xl p-5 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500/40 via-cyan-500/30 to-transparent" />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-mono text-noir-500 uppercase tracking-widest">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="font-display text-lg text-white tracking-wide mt-0.5">{title}</h3>
        </div>
        <span className="shrink-0 text-xs font-mono text-amber-400/80 border border-amber-500/20 bg-amber-500/5 px-2 py-1 rounded">
          {duration}
        </span>
      </div>
      <ul className="space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="text-sm text-white/65 pl-3.5 relative leading-relaxed">
            <span className="absolute left-0 top-[0.45em] w-1 h-1 rounded-full bg-cyan-400/60" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConceptCard({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="bg-noir-800/40 border border-noir-600/30 rounded-xl p-4 hover:border-amber-500/20 transition-colors">
      <h3 className="font-display text-base text-amber-300 tracking-wide mb-1.5">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{summary}</p>
    </div>
  );
}

function JuniorMistakeCard({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-noir-800/50 border border-noir-600/30 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-mono text-cyan-400">
          {index + 1}
        </span>
        <h3 className="font-display text-base text-white tracking-wide">{title}</h3>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{body}</p>
    </div>
  );
}

export function CheatsheetPage() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = `${t('cheatsheet.title')} — SDPD`;
    return () => {
      document.title = 'SDPD — Systems Design Police Department';
    };
  }, [t]);

  const phaseIndices = useMemo(() => [0, 1, 2, 3, 4, 5, 6], []);
  const conceptIndices = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);
  const juniorMistakeIndices = useMemo(() => [0, 1, 2], []);

  const phases = useMemo(
    () =>
      phaseIndices.map((i) => ({
        title: t(`cheatsheet.phase.${i}.title`),
        duration: t(`cheatsheet.phase.${i}.duration`),
        points: getArrayKeys(`cheatsheet.phase.${i}.points`, t),
      })),
    [t, phaseIndices],
  );

  const concepts = useMemo(
    () =>
      conceptIndices.map((i) => ({
        title: t(`cheatsheet.concept.${i}.title`),
        summary: t(`cheatsheet.concept.${i}.summary`),
      })),
    [t, conceptIndices],
  );

  const magicPhrases = getArrayKeys('cheatsheet.magicPhrase', t);
  const juniorMistakes = useMemo(
    () =>
      juniorMistakeIndices.map((i) => ({
        title: t(`cheatsheet.juniorMistake.${i}.title`),
        body: t(`cheatsheet.juniorMistake.${i}.body`),
      })),
    [t, juniorMistakeIndices],
  );

  const onePageBlock = t('cheatsheet.onePageBlock');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">
          {t('cheatsheet.eyebrow')}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide mt-2">
          {t('cheatsheet.title')}
        </h1>
        <p className="text-sm md:text-base text-white/70 mt-4 leading-relaxed max-w-3xl">
          {t('cheatsheet.subtitle')}
        </p>

        {/* Interview rhythm */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="font-display text-2xl text-white tracking-wide">
              {t('cheatsheet.structureTitle')}
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">{t('cheatsheet.structureSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phases.map((phase, i) => (
              <PhaseCard
                key={i}
                index={i}
                title={phase.title}
                duration={phase.duration}
                points={phase.points}
              />
            ))}
          </div>
        </section>

        {/* Core concepts */}
        <section className="mt-14">
          <div className="mb-5">
            <h2 className="font-display text-2xl text-white tracking-wide">
              {t('cheatsheet.conceptsTitle')}
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">{t('cheatsheet.conceptsSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((concept, i) => (
              <ConceptCard key={i} title={concept.title} summary={concept.summary} />
            ))}
          </div>
        </section>

        {/* Magic phrases */}
        <section className="mt-14">
          <div className="mb-5">
            <h2 className="font-display text-2xl text-white tracking-wide">
              {t('cheatsheet.magicPhrasesTitle')}
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">
              {t('cheatsheet.magicPhrasesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {magicPhrases.map((phrase, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-amber-500/50 bg-noir-800/30 pl-4 pr-4 py-3 text-sm text-white/75 italic"
              >
                {phrase}
              </blockquote>
            ))}
          </div>
        </section>

        {/* Junior mistakes */}
        <section className="mt-14">
          <div className="mb-5">
            <h2 className="font-display text-2xl text-white tracking-wide">
              {t('cheatsheet.juniorMistakesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {juniorMistakes.map((mistake, i) => (
              <JuniorMistakeCard key={i} index={i} title={mistake.title} body={mistake.body} />
            ))}
          </div>
        </section>

        {/* One-page cheat sheet */}
        <section className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-2xl text-white tracking-wide">
                {t('cheatsheet.onePageTitle')}
              </h2>
              <p className="text-sm text-white/60 mt-1 max-w-2xl">{t('cheatsheet.onePageSubtitle')}</p>
            </div>
            <button
              ref={printRef}
              onClick={() => window.print()}
              className="self-start sm:self-auto text-xs font-mono text-noir-950 bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              {t('cheatsheet.printButton')}
            </button>
          </div>
          <div className="bg-noir-950 border border-noir-600/50 rounded-xl p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cyan-300/90 whitespace-pre">
              {onePageBlock}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
