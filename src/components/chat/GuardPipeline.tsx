'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  Brain,
  FileSearch,
  Eye,
  Lock,
  Timer,
  User,
  Bot,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Guard node definitions — matches the actual guard pipeline in levelConfig.ts
// ─────────────────────────────────────────────────────────────────────────────

interface GuardNodeDef {
  id: string;
  label: string;
  icon: LucideIcon;
  activatesAt: number;
}

const INPUT_GUARDS: GuardNodeDef[] = [
  { id: 'adaptive_session', label: 'Rate', icon: Timer, activatesAt: 6 },
  { id: 'input_keyword', label: 'In KW', icon: Filter, activatesAt: 4 },
  { id: 'input_llm', label: 'In AI', icon: Brain, activatesAt: 6 },
];

const OUTPUT_GUARDS: GuardNodeDef[] = [
  { id: 'output_keyword', label: 'Out KW', icon: FileSearch, activatesAt: 3 },
  { id: 'output_llm', label: 'Out AI', icon: Eye, activatesAt: 5 },
  { id: 'encoding_detection', label: 'Enc', icon: Lock, activatesAt: 6 },
];

function isActive(node: GuardNodeDef, level: number): boolean {
  return level >= node.activatesAt;
}

/** True if the node should be visible (active OR will activate in a future level) */
function isVisible(node: GuardNodeDef, level: number): boolean {
  // Show nodes that are active or within 2 levels of activation
  return level >= node.activatesAt - 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface GuardPipelineProps {
  level: number;
  lastGuardEvent: { guardType: string; timestamp: number } | null;
  blockCount: number;
}

export default function GuardPipeline({ level, lastGuardEvent, blockCount }: GuardPipelineProps) {
  const [firingNode, setFiringNode] = useState<string | null>(null);

  // Flash the firing node when a guard event occurs
  useEffect(() => {
    if (!lastGuardEvent) return;
    setFiringNode(lastGuardEvent.guardType);
    const timer = setTimeout(() => setFiringNode(null), 2000);
    return () => clearTimeout(timer);
  }, [lastGuardEvent]);

  const visibleInputGuards = INPUT_GUARDS.filter((n) => isVisible(n, level));
  const visibleOutputGuards = OUTPUT_GUARDS.filter((n) => isVisible(n, level));
  const hasAnyGuards = visibleInputGuards.length > 0 || visibleOutputGuards.length > 0;

  return (
    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 relative">
      <div className="flex items-center justify-center gap-0.5 text-[10px]">
        {/* User node */}
        <NodeBadge
          icon={User}
          label="You"
          active
          firing={false}
          endpoint
        />

        {/* Input guard nodes */}
        {visibleInputGuards.map((node) => (
          <GuardNode
            key={node.id}
            node={node}
            level={level}
            firing={firingNode === node.id}
          />
        ))}

        {/* Arrow to LLM */}
        <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />

        {/* LLM node (always visible) */}
        <NodeBadge
          icon={Bot}
          label="Vinnie"
          active
          firing={false}
          endpoint
        />

        {/* Arrow from LLM */}
        {hasAnyGuards && (
          <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
        )}

        {/* Output guard nodes */}
        {visibleOutputGuards.map((node) => (
          <GuardNode
            key={node.id}
            node={node}
            level={level}
            firing={firingNode === node.id}
          />
        ))}
      </div>

      {/* Block counter */}
      {blockCount > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">
          {blockCount} blocked
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function GuardNode({
  node,
  level,
  firing,
}: {
  node: GuardNodeDef;
  level: number;
  firing: boolean;
}) {
  const active = isActive(node, level);
  return (
    <>
      <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
      <NodeBadge
        icon={node.icon}
        label={node.label}
        active={active}
        firing={firing && active}
        futureLevel={!active ? node.activatesAt : undefined}
      />
    </>
  );
}

function NodeBadge({
  icon: Icon,
  label,
  active,
  firing,
  endpoint,
  futureLevel,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  firing: boolean;
  endpoint?: boolean;
  futureLevel?: number;
}) {
  const baseClasses = 'flex flex-col items-center gap-0.5 shrink-0';

  const iconClasses = endpoint
    ? 'w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-600'
    : firing
      ? 'w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white animate-pulse shadow-md shadow-red-300'
      : active
        ? 'w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-sm'
        : 'w-6 h-6 rounded-full flex items-center justify-center border border-dashed border-slate-300 text-slate-300';

  const labelClasses = firing
    ? 'font-bold text-red-600'
    : active
      ? 'font-semibold text-slate-600'
      : 'text-slate-300';

  return (
    <div className={baseClasses} title={futureLevel ? `Activates at Level ${futureLevel}` : label}>
      <div className={iconClasses}>
        <Icon className="h-3 w-3" />
      </div>
      <span className={labelClasses}>
        {!active && futureLevel ? `L${futureLevel}+` : label}
      </span>
    </div>
  );
}
