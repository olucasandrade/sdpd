import { useEffect } from 'react';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { InterviewSetup } from '../components/interview/InterviewSetup';
import { InterviewRound } from '../components/interview/InterviewRound';
import { InterviewPostmortem } from '../components/interview/InterviewPostmortem';
import { InterviewDebrief } from '../components/interview/InterviewDebrief';

export function InterviewPage() {
  const status = useInterviewSession((s) => s.status);
  const abandon = useInterviewSession((s) => s.abandon);

  // A session abandoned mid-way (leaving the page during a round or the
  // postmortem) is discarded — nothing partial is ever persisted.
  useEffect(() => {
    return () => {
      const current = useInterviewSession.getState().status;
      if (current === 'round' || current === 'postmortem') {
        abandon();
      }
    };
  }, [abandon]);

  if (status === 'round') return <InterviewRound />;
  if (status === 'postmortem') return <InterviewPostmortem />;
  if (status === 'debrief') return <InterviewDebrief />;
  return <InterviewSetup />;
}
