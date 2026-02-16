type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
};

function getPostHog(): PostHogClient | null {
  if (typeof window === 'undefined') return null;
  // PostHog attaches to window.posthog when loaded via script tag
  const ph = (window as any).posthog;
  if (!ph || typeof ph.capture !== 'function') return null;
  return ph as PostHogClient;
}

export const telemetry = {
  chatMessageSent(props: { level: number; messageLength: number; attemptNumber: number }) {
    getPostHog()?.capture('chat_message_sent', props);
  },

  chatResponse(props: { level: number; wasBlocked: boolean; blockedBy?: string; rawAnswerLength?: number }) {
    getPostHog()?.capture('chat_response', props);
  },

  guardTriggered(props: { level: number; guardType: string }) {
    getPostHog()?.capture('guard_triggered', props);
  },

  levelStarted(props: { level: number }) {
    getPostHog()?.capture('level_started', props);
  },

  levelSolved(props: { level: number; messagesUsed: number; starsEarned: number }) {
    getPostHog()?.capture('level_solved', props);
  },

  gateShown(props: { levelsCompleted: number }) {
    getPostHog()?.capture('gate_shown', props);
  },

  gateCompleted(props: { email: string; company?: string; role?: string }) {
    const ph = getPostHog();
    if (!ph) return;
    ph.identify(props.email, { company: props.company, role: props.role });
    ph.capture('gate_completed', props);
  },

  shareClicked(props: { level: number; platform: string }) {
    getPostHog()?.capture('share_clicked', props);
  },

  missionBriefingCompleted(props: { stepReached: number }) {
    getPostHog()?.capture('mission_briefing_completed', props);
  },
};
