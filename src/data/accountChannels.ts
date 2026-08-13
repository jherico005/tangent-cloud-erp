export interface AccountChannelItem {
  id: string;
  code: string;
  name: string;
  salesReps: string;
  csAgents: string;
  description: string;
  badgeBg: string;
}

export const ACCOUNT_CHANNELS_LIST: AccountChannelItem[] = [
  {
    id: 'CHANNEL_GCASH',
    code: 'GCASH',
    name: 'GCash Account Channel',
    salesReps: 'Marian Santos (Sales Lead), Joshua Garcia (Key Accounts)',
    csAgents: 'Karen Cruz (GCash CS Supervisor), John Rivera (Helpdesk)',
    description: 'GCash Merchant POS, QR & Settlement Queries',
    badgeBg: 'bg-blue-600'
  },
  {
    id: 'CHANNEL_MAYA',
    code: 'MAYA',
    name: 'Maya Business Channel',
    salesReps: 'Alex Garcia (Maya Enterprise Sales), Diana Prince',
    csAgents: 'Dave Agoncillo (Maya CS Desk), Liezel Ramos (Tech)',
    description: 'Maya Terminal Rollout, SIM Activation & MID Support',
    badgeBg: 'bg-emerald-600'
  },
  {
    id: 'CHANNEL_JFC',
    code: 'JFC',
    name: 'Jollibee Foods Corp (JFC) Channel',
    salesReps: 'Ruel Perez (JFC Account Director), Clarissa Tan',
    csAgents: 'Mark Ramos (JFC Dedicated CS), Angela Castro',
    description: 'Jollibee, Chowking, Mang Inasal & Greenwich POS',
    badgeBg: 'bg-red-600'
  },
  {
    id: 'CHANNEL_ASCP',
    code: 'ASCP',
    name: 'ASCP Merchant Channel',
    salesReps: 'Roberto Garcia (ASCP Account Manager)',
    csAgents: 'Patricia Ocampo (ASCP Support Specialist)',
    description: 'ASCP Credit/Debit Card Acceptance & Terminals',
    badgeBg: 'bg-amber-600'
  },
  {
    id: 'CHANNEL_ASC_JFC',
    code: 'ASC-JFC',
    name: 'ASC-JFC Joint Channel',
    salesReps: 'Elena Vance (ASC-JFC Coordinator)',
    csAgents: 'Michael Tan (Operations CS), Grace Mendoza',
    description: 'ASC & JFC Co-Branded Terminals & Integrated Ops',
    badgeBg: 'bg-orange-600'
  },
  {
    id: 'CHANNEL_PETRON',
    code: 'PETRON',
    name: 'Petron Fleet & Retail Channel',
    salesReps: 'Carlos Mendoza (Petron Account Lead)',
    csAgents: 'Nico Velasquez (Petron Tech Desk)',
    description: 'Petron Service Station Terminals & Fleet Cards',
    badgeBg: 'bg-blue-700'
  },
  {
    id: 'CHANNEL_PNB',
    code: 'PNB',
    name: 'PNB Terminal Channel',
    salesReps: 'Victor Sy (PNB Relationship Manager)',
    csAgents: 'Sheryll Fernandez (PNB Terminal Unit)',
    description: 'PNB POS Rollout, Upgrades & Parameter Downloads',
    badgeBg: 'bg-amber-700'
  },
  {
    id: 'CHANNEL_EASTWEST',
    code: 'EASTWEST',
    name: 'EastWest Bank Channel',
    salesReps: 'Hannah Torres (EastWest Sales Manager)',
    csAgents: 'Bong Navarro (EastWest Tech Desk)',
    description: 'EastWest Acquiring Terminals & Merchant Support',
    badgeBg: 'bg-purple-600'
  },
  {
    id: 'CHANNEL_GLOBAL_PAYMENTS',
    code: 'GLOBAL PAYMENTS',
    name: 'Global Payments Channel',
    salesReps: 'Derrick Co (Global Payments Director)',
    csAgents: 'Janine Villa (Global Escalations Lead)',
    description: 'Global Payments Multi-Currency & FX Terminals',
    badgeBg: 'bg-indigo-600'
  },
  {
    id: 'CHANNEL_SECURITY_BANK',
    code: 'SECURITY BANK',
    name: 'Security Bank Channel',
    salesReps: 'Samuel Lee (Security Bank Sales Exec)',
    csAgents: 'Rhea Sison (Security Bank Merchant Ops)',
    description: 'Security Bank Card Acceptance & Installations',
    badgeBg: 'bg-cyan-600'
  },
  {
    id: 'CHANNEL_BPI',
    code: 'BPI',
    name: 'BPI Merchant Services Channel',
    salesReps: 'Dennis Tan (BPI VP Merchant Services)',
    csAgents: 'Gino Alonzo (BPI Technical Support)',
    description: 'BPI Merchant POS Maintenance & MID Inquiries',
    badgeBg: 'bg-rose-700'
  },
  {
    id: 'CHANNEL_ABBOTT',
    code: 'ABBOTT',
    name: 'Abbott Healthcare Channel',
    salesReps: 'Sofia Alonzo (Abbott Account Manager)',
    csAgents: 'Lito Soriano (Abbott Logistics Support)',
    description: 'Abbott Outlets & POS Terminals Support',
    badgeBg: 'bg-teal-600'
  },
  {
    id: 'CHANNEL_AUB',
    code: 'AUB',
    name: 'AUB (Asia United Bank) Channel',
    salesReps: 'Kenneth Ramos (AUB Sales Head)',
    csAgents: 'Joy Villanueva (AUB Support Specialist)',
    description: 'Asia United Bank PayMate & POS Operations',
    badgeBg: 'bg-blue-800'
  }
];

export const playTeamsNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Microsoft Teams signature chime tone 1 (G5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Microsoft Teams signature chime tone 2 (C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.1);
    gain2.gain.setValueAtTime(0.18, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Audio context handle
  }
};
