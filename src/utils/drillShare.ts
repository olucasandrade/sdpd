export interface ShareCardParams {
  drillNumber: number;
  rootCauseStars: number;
  fixStars: number;
  seconds: number;
  streak: number;
  url: string;
}

function formatMmSs(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

/** Spoiler-free, Wordle-style share text — no case name or answer content. */
export function buildShareText({ drillNumber, rootCauseStars, fixStars, seconds, streak, url }: ShareCardParams): string {
  const diagnosis = '⭐️'.repeat(rootCauseStars);
  const fix = '⭐️'.repeat(fixStars);
  return [
    `SDPD Daily Drill #${drillNumber} 🔍`,
    `Diagnosis: ${diagnosis} Fix: ${fix}`,
    `⏱ ${formatMmSs(seconds)} · 🔥 ${streak}-day streak`,
    url,
  ].join('\n');
}

/** Copies `text` to the clipboard, falling back to a hidden textarea + execCommand for older/mobile browsers. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
