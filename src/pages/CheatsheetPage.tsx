import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCheatsheet } from '../hooks/useCheatsheet';
import { useAllCases } from '../hooks/useCase';
import { useTranslation } from '../i18n';
import { CATEGORIES } from '../data/categories';
import type { CheatsheetCard, CheatsheetCategory } from '../types/cheatsheet';

const TABS = CATEGORIES.map((cat) => cat.key.replace('category.', '')) as CheatsheetCategory[];

function CardView({
  card,
  highlighted,
  categoryChip,
}: {
  card: CheatsheetCard;
  highlighted: boolean;
  categoryChip?: boolean;
}) {
  const { t } = useTranslation();
  const allCases = useAllCases();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ block: 'center' });
      ref.current.focus();
    }
  }, [highlighted]);

  return (
    <div
      id={card.id}
      ref={ref}
      tabIndex={-1}
      className={`bg-noir-800/60 border rounded-xl p-5 backdrop-blur-sm transition-colors ${
        highlighted ? 'border-amber-500/70 ring-2 ring-amber-500/50' : 'border-noir-600/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {categoryChip && (
          <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {t(`category.${card.category}`)}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg text-white tracking-wide">{card.title}</h3>

      <p className="text-xs font-mono text-white/45 uppercase tracking-widest mt-3">{t('cheatsheet.when')}</p>
      <p className="text-sm text-white/70 mt-1">{card.when}</p>

      <div className="mt-4 space-y-3">
        {card.options.map((opt, i) => (
          <div key={opt.use}>
            <p className="text-sm font-medium text-amber-300">
              {i === 0 ? t('cheatsheet.use') : t('cheatsheet.orUse')} {opt.use}
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {t('cheatsheet.why')}: {opt.why}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-noir-700/40">
        <p className="text-xs text-white/60">
          <span className="text-cyan-400/80 font-mono">⚖ {t('cheatsheet.tradeoff')}:</span> {card.tradeoff}
        </p>
        <p className="text-xs text-white/60 mt-2 font-mono">
          <span className="text-amber-400/80">&gt; {t('cheatsheet.interviewerProbe')}:</span> {card.interviewerProbe}
        </p>
      </div>

      {card.relatedCaseIds.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {card.relatedCaseIds.map((caseId) => {
            const caseEntry = allCases.find((c) => c.id === caseId);
            if (!caseEntry) return null;
            return (
              <Link
                key={caseId}
                to={`/case/${caseId}`}
                className="text-xs font-mono text-cyan-400/80 hover:text-cyan-300 transition-colors underline underline-offset-2"
              >
                {t('cheatsheet.investigate')} {caseEntry.number} →
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CheatsheetPage() {
  const { t } = useTranslation();
  const { data, loading, error } = useCheatsheet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CheatsheetCategory>(
    (searchParams.get('tab') as CheatsheetCategory) || TABS[0],
  );
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(searchParams.get('card'));

  useEffect(() => {
    document.title = `${t('cheatsheet.title')} — SDPD`;
    return () => {
      document.title = 'SDPD — Systems Design Police Department';
    };
  }, [t]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const params: Record<string, string> = { tab: activeTab };
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  useEffect(() => {
    if (!query) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query]);

  const cards = useMemo(() => data?.cards ?? [], [data]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.trim().toLowerCase();
    return cards.filter((c) => {
      const haystack = [c.title, c.when, c.tradeoff, ...c.options.flatMap((o) => [o.use, o.why])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [cards, debouncedQuery]);

  const tabCards = cards.filter((c) => c.category === activeTab);

  function handleResultClick(card: CheatsheetCard) {
    setActiveTab(card.category);
    setQuery('');
    setHighlightId(card.id);
  }

  if (loading) return null;
  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/60 text-sm">{t('cheatsheet.loadError')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">{t('cheatsheet.eyebrow')}</p>
        <h1 className="font-display text-4xl text-white tracking-wide mt-1">{t('cheatsheet.title')}</h1>
        <p className="text-sm text-white/70 mt-3 leading-relaxed max-w-2xl">{t('cheatsheet.subtitle')}</p>

        <div role="search" className="mt-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cheatsheet.searchPlaceholder')}
            aria-label={t('cheatsheet.searchPlaceholder')}
            className="w-full bg-noir-800/60 border border-noir-600/40 rounded-lg px-4 py-2.5 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
          />
        </div>

        {searchResults === null && (
          <div role="tablist" className="mt-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-lg border transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-amber-500/40 bg-amber-500/8 text-white'
                    : 'border-noir-600/40 text-white/60 hover:border-noir-500/50 hover:text-white/80'
                }`}
              >
                {t(`category.${tab}`)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          {searchResults !== null ? (
            <>
              <p className="text-xs font-mono text-white/45 uppercase tracking-widest mb-3">
                {searchResults.length} {t('cheatsheet.resultsFound')}
              </p>
              {searchResults.length === 0 ? (
                <p className="text-sm text-white/60">{t('cheatsheet.noResults')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((card) => (
                    <button key={card.id} onClick={() => handleResultClick(card)} className="text-left">
                      <CardView card={card} highlighted={false} categoryChip />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div role="tabpanel" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tabCards.map((card) => (
                <CardView key={card.id} card={card} highlighted={highlightId === card.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
