const focusAreas = [
  {
    slug: 'movement',
    label: 'movement',
    domain: 'movement',
    subdomain: 'movement-control',
    purpose: 'Own character movement policy, step response, and motion tuning.',
    coreReuse: ['core-input-kit', 'core-motion-kit', 'core-spatial-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'traversal',
    label: 'traversal',
    domain: 'traversal',
    subdomain: 'surface-traversal',
    purpose: 'Own traversal rules across spaces, surfaces, and route boundaries.',
    coreReuse: ['core-spatial-kit', 'core-motion-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'combat',
    label: 'combat',
    domain: 'combat',
    subdomain: 'encounter-combat',
    purpose: 'Own attack cadence, hit response, and combat state transitions.',
    coreReuse: ['core-physics-kit', 'core-motion-kit', 'core-simulation-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'camera',
    label: 'camera',
    domain: 'camera',
    subdomain: 'camera-control',
    purpose: 'Own framing, follow behavior, and camera comfort rules.',
    coreReuse: ['core-camera-kit', 'core-ui-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'input',
    label: 'input',
    domain: 'input',
    subdomain: 'semantic-input',
    purpose: 'Own semantic action handling and control intent mapping.',
    coreReuse: ['core-input-kit', 'core-ui-kit', 'core-policy-kit', 'core-data-kit'],
  },
  {
    slug: 'objectives',
    label: 'objectives',
    domain: 'objectives',
    subdomain: 'goal-flow',
    purpose: 'Own objective progression and completion checks.',
    coreReuse: ['core-simulation-kit', 'core-data-kit', 'core-diagnostics-kit', 'core-composition-kit'],
  },
  {
    slug: 'progression',
    label: 'progression',
    domain: 'progression',
    subdomain: 'reward-progression',
    purpose: 'Own unlock flow, reward pacing, and advancement policy.',
    coreReuse: ['core-simulation-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'economy',
    label: 'economy',
    domain: 'economy',
    subdomain: 'resource-economy',
    purpose: 'Own resource exchange, costs, sinks, and reward flow.',
    coreReuse: ['core-simulation-kit', 'core-data-kit', 'core-diagnostics-kit', 'core-policy-kit'],
  },
  {
    slug: 'loot',
    label: 'loot',
    domain: 'loot',
    subdomain: 'drop-loot',
    purpose: 'Own drop tables, reward rolls, and acquisition pacing.',
    coreReuse: ['core-scene-kit', 'core-simulation-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'inventory',
    label: 'inventory',
    domain: 'inventory',
    subdomain: 'item-inventory',
    purpose: 'Own carried items, slots, stacking, and inventory constraints.',
    coreReuse: ['core-data-kit', 'core-interaction-kit', 'core-policy-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'crafting',
    label: 'crafting',
    domain: 'crafting',
    subdomain: 'recipe-crafting',
    purpose: 'Own recipe assembly, result generation, and crafting rules.',
    coreReuse: ['core-data-kit', 'core-interaction-kit', 'core-simulation-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'dialogue',
    label: 'dialogue',
    domain: 'dialogue',
    subdomain: 'branch-dialogue',
    purpose: 'Own conversation choices, branching response flow, and dialogue state.',
    coreReuse: ['core-ui-kit', 'core-interaction-kit', 'core-scene-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'quest',
    label: 'quest',
    domain: 'quest',
    subdomain: 'quest-flow',
    purpose: 'Own quest state, objective chains, and completion gating.',
    coreReuse: ['core-simulation-kit', 'core-data-kit', 'core-composition-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'world',
    label: 'world',
    domain: 'world',
    subdomain: 'world-state',
    purpose: 'Own world-state slices, zone relationships, and discovery boundaries.',
    coreReuse: ['core-scene-kit', 'core-spatial-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'social',
    label: 'social',
    domain: 'social',
    subdomain: 'party-social',
    purpose: 'Own party, faction, and shared-state interaction loops.',
    coreReuse: ['core-scene-kit', 'core-interaction-kit', 'core-ui-kit', 'core-data-kit'],
  },
  {
    slug: 'replay',
    label: 'replay',
    domain: 'replay',
    subdomain: 'deterministic-replay',
    purpose: 'Own replay capture, deterministic re-entry, and review state.',
    coreReuse: ['core-data-kit', 'core-diagnostics-kit', 'core-composition-kit'],
  },
  {
    slug: 'save',
    label: 'save',
    domain: 'save',
    subdomain: 'save-state',
    purpose: 'Own save eligibility, slot serialization, and restore rules.',
    coreReuse: ['core-data-kit', 'core-persistence-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'difficulty',
    label: 'difficulty',
    domain: 'difficulty',
    subdomain: 'challenge-scale',
    purpose: 'Own scaling, pressure curves, and challenge modulation.',
    coreReuse: ['core-simulation-kit', 'core-policy-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'enemy-pressure',
    label: 'enemy pressure',
    domain: 'enemy-pressure',
    subdomain: 'enemy-pressure',
    purpose: 'Own enemy pacing, threat escalation, and encounter pressure.',
    coreReuse: ['core-physics-kit', 'core-simulation-kit', 'core-scene-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'boss-rules',
    label: 'boss rules',
    domain: 'boss-rules',
    subdomain: 'boss-phases',
    purpose: 'Own boss phases, invulnerability windows, and phase transitions.',
    coreReuse: ['core-simulation-kit', 'core-physics-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'reward-loop',
    label: 'reward loop',
    domain: 'reward-loop',
    subdomain: 'feedback-loop',
    purpose: 'Own reward cadence, feedback timing, and loop reinforcement.',
    coreReuse: ['core-simulation-kit', 'core-ui-kit', 'core-data-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'tutorial',
    label: 'tutorial',
    domain: 'tutorial',
    subdomain: 'onboarding',
    purpose: 'Own onboarding gates, guidance steps, and introduction pacing.',
    coreReuse: ['core-ui-kit', 'core-interaction-kit', 'core-simulation-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'state-management',
    label: 'state management',
    domain: 'state-management',
    subdomain: 'state-ledger',
    purpose: 'Own state ledger layout, reset rules, and snapshot boundaries.',
    coreReuse: ['core-data-kit', 'core-composition-kit', 'core-diagnostics-kit'],
  },
  {
    slug: 'presentation',
    label: 'presentation',
    domain: 'presentation',
    subdomain: 'presentation-layer',
    purpose: 'Own presentation polish, framing, and information layering.',
    coreReuse: ['core-camera-kit', 'core-graphics-kit', 'core-ui-kit', 'core-data-kit'],
  },
];

const variants = [
  { slug: 'control', suffix: 'control-kit', kind: 'atomic', angle: 'control surface and input mapping' },
  { slug: 'flow', suffix: 'flow-kit', kind: 'scoped-domain', angle: 'flow and state transition handling' },
  { slug: 'stack', suffix: 'stack-kit', kind: 'composite-domain', angle: 'composed subsystems and child-kit orchestration' },
  { slug: 'service', suffix: 'service-kit', kind: 'domain-service', angle: 'registry, policy, and stateful service behavior' },
  { slug: 'proof', suffix: 'proof-kit', kind: 'proof-harness', angle: 'proof fixtures, replay, and validation evidence' },
];

export const kitIdeaRegistryKitDescriptor = {
  id: 'kit-idea-registry',
  domain: 'game-kit-ideas',
  kind: 'domain-service',
  purpose: 'Track game profiles, generate 100+ NexusRealtime kit idea packets per unprocessed game, and write those packets into the repo-local kit ideas lane.',
  status: 'experimental',
  provides: ['n:game-kit-ideas'],
  requires: ['core-data-kit', 'core-diagnostics-kit'],
  composes: [],
};

export function createKitIdeaRegistryKit(options = {}) {
  return {
    ...kitIdeaRegistryKitDescriptor,
    options,
    install(engine) {
      return engine;
    },
    reset(engine) {
      return engine;
    },
    snapshot() {
      return {
        id: 'kit-idea-registry',
        domain: 'game-kit-ideas',
        status: 'stateless',
      };
    },
  };
}

export function buildKitIdeaPackets(gameProfile, options = {}) {
  const count = Math.max(1, Number(options.count || 120));
  const focusCount = focusAreas.length;
  const variantCount = variants.length;
  const packets = [];
  for (let i = 0; i < count; i += 1) {
    const focus = focusAreas[i % focusCount];
    const variant = variants[Math.floor(i / focusCount) % variantCount];
    const focusPurpose = focus.purpose.replace(/\.$/, '');
    const packetId = `${gameProfile.slug || 'game'}-${focus.slug}-${variant.slug}-${String(Math.floor(i / (focusCount * variantCount)) + 1).padStart(2, '0')}`;
    packets.push({
      packetId,
      gameId: String(gameProfile.id || gameProfile.slug || 'game'),
      gameSlug: String(gameProfile.slug || 'game'),
      gameName: String(gameProfile.name || 'Unnamed Game'),
      kitName: `${focus.slug}-${variant.suffix}`,
      domain: focus.domain,
      subdomain: focus.subdomain || focus.slug,
      kind: variant.kind,
      purpose: `${focusPurpose} for ${gameProfile.name || 'the game'} through ${variant.angle}.`,
      whyNow: `This game profile suggests a need for ${focus.label} work that should be tracked as a reusable kit idea.`,
      coreReuse: focus.coreReuse,
      inputs: [
        'game profile',
        'category',
        'subcategory',
        'source tags',
      ],
      outputs: [
        'kit idea packet',
        'kit name',
        'kind',
        'core reuse map',
      ],
      proof: `Review the packet against the ${gameProfile.name || 'game'} profile and confirm the kit idea is specific enough to draft.`,
      tags: [
        String(gameProfile.category || 'uncategorized'),
        String(gameProfile.subcategory || 'general'),
        focus.slug,
        variant.slug,
      ],
    });
  }
  return packets;
}
