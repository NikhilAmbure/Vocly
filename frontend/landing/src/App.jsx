import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ArrowUp,
  Play,
  Square,
  Volume2,
  Sparkles,
  Check,
  CheckCircle2,
  MessageCircle,
  Coffee,
  Plane,
  Briefcase,
  Smile,
  Plus,
  Clock,
  FileText,
  RotateCcw,
  ExternalLink,
  Zap,
} from 'lucide-react';

// ============================================================================
// DATA: HERO LANGUAGES, MARQUEE, STAGES, SCENARIOS, PROGRESS, FAQ, NAV
// ============================================================================

const HERO_LANGUAGES = [
  {
    id: 'en',
    label: 'English',
    cefr: 'B1',
    speechLang: 'en-US',
    scenarioLabel: 'Free Talk · Everyday Past Tense',
    prompt: 'What did you get up to yesterday?',
    rawWords: ['I', 'go', 'to', 'market', 'yesterday.'],
    mistakeIndices: [1, 2],
    wordScores: [
      { word: 'I', score: 98 },
      { word: 'went', score: 95 },
      { word: 'market', score: 91 },
      { word: 'yesterday', score: 96 },
    ],
    tutorLead: 'Almost! Say: ',
    correctedPhrase: "'I went to the market yesterday.'",
    tutorTail: ' We use the past tense for things that already happened.',
    fixTag: 'Past Tense · Gentle Fix',
    englishHint: 'Use "went" (past of "go") and add "the" before "market".',
    latency: '170ms',
  },
  {
    id: 'de',
    label: 'German',
    cefr: 'A2',
    speechLang: 'de-DE',
    scenarioLabel: 'Café Ordering · Berlin',
    prompt: 'Was möchtest du heute bestellen?',
    rawWords: ['Ich', 'möchte', 'eine', 'Kaffee', 'mit', 'Milch.'],
    mistakeIndices: [2],
    wordScores: [
      { word: 'Ich', score: 98 },
      { word: 'möchte', score: 93 },
      { word: 'Kaffee', score: 97 },
      { word: 'Milch', score: 95 },
    ],
    tutorLead: 'Sehr gut! Say: ',
    correctedPhrase: "'Ich möchte einen Kaffee mit Milch.'",
    tutorTail: ' Kaffee is masculine (der Kaffee), so use "einen" in the accusative case.',
    fixTag: 'Articles · Gentle Fix',
    englishHint: 'Meaning: "I would like a coffee with milk." (der Kaffee → einen)',
    latency: '185ms',
  },
  {
    id: 'ja',
    label: 'Japanese',
    cefr: 'A1',
    speechLang: 'ja-JP',
    scenarioLabel: 'Small Talk · Tokyo',
    prompt: '昨日、何をしましたか？',
    rawWords: ['昨日、', 'カフェに', '行きます。'],
    mistakeIndices: [2],
    wordScores: [
      { word: '昨日', score: 96 },
      { word: 'カフェに', score: 98 },
      { word: '行きました', score: 91 },
    ],
    tutorLead: 'Nice rhythm! Say: ',
    correctedPhrase: "'昨日、カフェに行きました。'",
    tutorTail: ' Since 昨日 means yesterday, finish with the past polite form "ikimashita".',
    fixTag: 'Past Polite · Gentle Fix',
    englishHint: 'Meaning: "Yesterday, I went to a café."',
    latency: '195ms',
  },
  {
    id: 'fr',
    label: 'French',
    cefr: 'B1',
    speechLang: 'fr-FR',
    scenarioLabel: 'Work Sync · Paris',
    prompt: 'Que penses-tu du nouveau projet ?',
    rawWords: ['Je', 'suis', 'très', 'excité', 'pour', 'ce', 'projet.'],
    mistakeIndices: [3, 4],
    wordScores: [
      { word: 'enthousiaste', score: 92 },
      { word: "l'idée", score: 95 },
      { word: 'projet', score: 97 },
    ],
    tutorLead: 'Great energy! Try: ',
    correctedPhrase: "'Je suis très enthousiaste à l’idée de ce projet.'",
    tutorTail: ' In French, "enthousiaste" sounds natural and polished at work.',
    fixTag: 'Natural Phrasing · Gentle Fix',
    englishHint: 'Meaning: "I am really excited about this project."',
    latency: '180ms',
  },
];

const HERO_STORY_CAPTIONS = [
  {
    step: '01 · Get heard',
    title: 'Every word, live',
    desc: 'Your speech streams in word by word, scored for clarity as you speak.',
    start: 0,
    end: 0.44,
  },
  {
    step: '02 · Fix it',
    title: 'Gentle real-time fixes',
    desc: 'Slips are calmly reformulated in the flow—no red pens, no judgment.',
    start: 0.44,
    end: 0.72,
  },
  {
    step: '03 · Own it',
    title: 'Slips become warm-ups',
    desc: 'Corrections feed your Smart Revision Queue so tomorrow starts stronger.',
    start: 0.72,
    end: 1.01,
  },
];

const MARQUEE_ITEMS = [
  'English · A1–C1',
  'German · A1–C1',
  'Japanese · A1–C1',
  'French · A1–C1',
  'Café Ordering',
  'Job Interview',
  'Travel & Airport',
  'Small Talk',
  'Free Talk',
  'Natural Barge-In',
  'Spaced Repetition',
];

const FLUENCY_STAGES = [
  {
    id: 'beginner',
    cefr: 'A1 – A2',
    badge: 'Stage 01 · Foundations',
    title: 'Break the silence.',
    subtitle: 'Calm everyday speaking with instant hints',
    desc: 'You recognize words from flashcards, yet freeze when speaking aloud. Vocly slows its cadence, offers one-tap English hints, and guides you through real café and street-level chats.',
    quote: '“Could I get an oat latte, not too hot, and a croissant to go?”',
    clarity: 91,
    metricLabel: 'First 5-min scene',
    metricValue: 'Day 3',
    scenarioId: 'cafe',
    cta: 'Try Café Scene',
    gradient: 'from-teal-600 via-teal-500 to-emerald-500',
    accentColor: '#14B8A6',
  },
  {
    id: 'intermediate',
    cefr: 'B1 – B2',
    badge: 'Stage 02 · Flow & Grammar',
    title: 'Smooth out the slips.',
    subtitle: 'Inline past-tense & article coaching',
    desc: 'You can hold a conversation, but tenses and articles still trip you up mid-thought. Vocly models natural phrasing in the flow and turns recurring slips into 3-minute daily warm-ups.',
    quote: '“Yes, I have one suitcase, and I’d prefer a window seat if available.”',
    clarity: 95,
    metricLabel: 'Fewer tense slips',
    metricValue: '-42%',
    scenarioId: 'travel',
    cta: 'Try Travel Scene',
    gradient: 'from-indigo-600 via-indigo-500 to-teal-500',
    accentColor: '#6366F1',
  },
  {
    id: 'mastery',
    cefr: 'C1 Mastery',
    badge: 'Stage 03 · High-Stakes Rooms',
    title: 'Own every room.',
    subtitle: 'Executive storytelling & rapid follow-ups',
    desc: 'Rehearsing for global interviews, client pitches, or relocating abroad? Practice crisp project narratives, nuanced idioms, and rapid turn-taking with word-level clarity telemetry.',
    quote: '“In my last role, I led our migration and we shipped two weeks early.”',
    clarity: 98,
    metricLabel: 'Natural cadence',
    metricValue: 'C1 Track',
    scenarioId: 'interview',
    cta: 'Try Interview Scene',
    gradient: 'from-violet-600 via-indigo-600 to-teal-500',
    accentColor: '#8B5CF6',
  },
];

const SCENARIOS = [
  {
    id: 'cafe',
    label: 'Café Ordering',
    icon: Coffee,
    level: 'A1 – A2',
    duration: '4 min',
    summary: 'Order drinks, customize milk or sweetness, and make polite requests effortlessly.',
    opening:
      '“Morning! Welcome to Harbor Coffee. What can I get started for you today—espresso, matcha, or something warm from the bakery?”',
    sampleReply: '“Could I get an oat latte, not too hot, and a vegan croissant to go?”',
    presets: [
      {
        spoken: 'I want one oat latte and not too much hot please.',
        correction:
          "Almost! Say: 'Could I get an oat latte, not too hot, please?' Using 'Could I get' sounds warm and natural.",
        scores: [
          { word: 'oat latte', score: 96 },
          { word: 'not too hot', score: 91 },
          { word: 'please', score: 98 },
        ],
        vocab: ['oat latte', 'not too hot', 'Could I get…'],
      },
      {
        spoken: 'Do you have vegan croissant for take away?',
        correction:
          "Very close! Say: 'Do you have any vegan croissants to go?' (plural 'croissants').",
        scores: [
          { word: 'vegan', score: 95 },
          { word: 'croissants', score: 89 },
          { word: 'to go', score: 97 },
        ],
        vocab: ['croissants', 'to go / takeaway'],
      },
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Airport',
    icon: Plane,
    level: 'A2 – B1',
    duration: '6 min',
    summary: 'Breeze through check-in counters, customs, directions, and hotel check-ins.',
    opening:
      '“Welcome to international check-in. May I see your passport and know if you’re checking any bags today?”',
    sampleReply: '“Yes, I have one suitcase, and I’d prefer a window seat if available.”',
    presets: [
      {
        spoken: 'Yes, I have one luggage and I prefer seat near to window.',
        correction:
          "Nice clarity! 'Luggage' is uncountable—say: 'Yes, I have one suitcase, and I’d prefer a window seat.'",
        scores: [
          { word: 'suitcase', score: 95 },
          { word: 'prefer', score: 93 },
          { word: 'window seat', score: 97 },
        ],
        vocab: ['suitcase', 'window seat'],
      },
      {
        spoken: 'Excuse me, where is gate for flight to Munich?',
        correction:
          "Great question! Add 'the': 'Excuse me, where is the gate for the flight to Munich?'",
        scores: [
          { word: 'Excuse me', score: 98 },
          { word: 'gate', score: 94 },
          { word: 'Munich', score: 91 },
        ],
        vocab: ['boarding gate', 'the flight to…'],
      },
    ],
  },
  {
    id: 'freetalk',
    label: 'Free Talk',
    icon: MessageCircle,
    level: 'A1 – C1',
    duration: 'Open',
    summary: 'Speak freely on any topic while Vocly adapts gently to your personal weak spots.',
    opening:
      '“Welcome back! Last time you struggled with past tense, let’s practice that—what did you do yesterday?”',
    sampleReply: '“I went to the market yesterday and picked up fresh ingredients for dinner.”',
    presets: [
      {
        spoken: 'I go to market yesterday.',
        correction:
          "Almost! Say: 'I went to the market yesterday.' We use the past tense for things that already happened.",
        scores: [
          { word: 'I', score: 98 },
          { word: 'went', score: 95 },
          { word: 'market', score: 91 },
          { word: 'yesterday', score: 96 },
        ],
        vocab: ['went', 'the market'],
      },
      {
        spoken: 'Last weekend I watch a great documentary with friends.',
        correction:
          "Nice! Since it was last weekend, use past tense: 'Last weekend I watched a great documentary with friends.'",
        scores: [
          { word: 'weekend', score: 96 },
          { word: 'watched', score: 92 },
          { word: 'documentary', score: 90 },
        ],
        vocab: ['watched', 'documentary'],
      },
    ],
  },
  {
    id: 'interview',
    label: 'Job Interview',
    icon: Briefcase,
    level: 'B1 – C1',
    duration: '8 min',
    summary: 'Tell crisp project stories with confident past-tense verbs and clear structure.',
    opening:
      '“Thanks for joining today. Could you walk me through a challenging project you led recently and how it turned out?”',
    sampleReply: '“In my last role, I led our backend migration and we shipped two weeks early.”',
    presets: [
      {
        spoken: 'In my last role, I am leading the migration and we finish early.',
        correction:
          "Strong story! Keep both verbs in past tense: 'In my last role, I led the migration and we finished early.'",
        scores: [
          { word: 'led', score: 96 },
          { word: 'migration', score: 93 },
          { word: 'finished', score: 91 },
        ],
        vocab: ['led the migration', 'finished early'],
      },
      {
        spoken: 'My biggest strength is I learn new tools very fastly.',
        correction:
          "Almost! 'Fast' is already an adverb—say: 'My biggest strength is that I learn new tools very quickly.'",
        scores: [
          { word: 'strength', score: 92 },
          { word: 'tools', score: 97 },
          { word: 'quickly', score: 95 },
        ],
        vocab: ['quickly / fast'],
      },
    ],
  },
  {
    id: 'smalltalk',
    label: 'Small Talk',
    icon: Smile,
    level: 'A2 – B2',
    duration: '5 min',
    summary: 'Keep casual chats flowing naturally with warm follow-ups and everyday idioms.',
    opening:
      '“Hey, so glad we finally caught up! How has your week been treating you so far?”',
    sampleReply: '“Pretty busy! I didn’t have time to watch the game yesterday, how about you?”',
    presets: [
      {
        spoken: 'It was busy, I didn’t had time for watch the game yesterday.',
        correction:
          "Nice flow! After 'didn’t', use base 'have' and 'to watch': 'I didn’t have time to watch the game yesterday.'",
        scores: [
          { word: 'busy', score: 97 },
          { word: 'didn’t have', score: 92 },
          { word: 'yesterday', score: 94 },
        ],
        vocab: ['didn’t have time to…'],
      },
      {
        spoken: 'I am living here since three years and love the cafés.',
        correction:
          "Warm phrasing! Use 'have lived ... for': 'I’ve lived here for three years and love the cafés.'",
        scores: [
          { word: 'lived', score: 95 },
          { word: 'three years', score: 93 },
          { word: 'cafés', score: 96 },
        ],
        vocab: ['I’ve lived here for…'],
      },
    ],
  },
];

// Canopy geometry for the Organic Fluency Tree (Desktop SVG viewBox 1000 x 520)
const TREE_BRANCHES = [
  {
    id: 'cafe',
    x: 13,
    y: 52,
    popoverSide: 'left',
    path: 'M 500 458 C 500 345, 360 335, 130 272',
  },
  {
    id: 'travel',
    x: 30,
    y: 26,
    popoverSide: 'left',
    path: 'M 500 458 C 500 320, 415 245, 300 138',
  },
  {
    id: 'freetalk',
    x: 50,
    y: 16,
    popoverSide: 'center',
    path: 'M 500 458 C 500 320, 500 220, 500 86',
  },
  {
    id: 'interview',
    x: 70,
    y: 26,
    popoverSide: 'right',
    path: 'M 500 458 C 500 320, 585 245, 700 138',
  },
  {
    id: 'smalltalk',
    x: 87,
    y: 52,
    popoverSide: 'right',
    path: 'M 500 458 C 500 345, 640 335, 870 272',
  },
];

const WEEKLY_DATA = [
  { day: 'Mon', mins: 16, words: 8 },
  { day: 'Tue', mins: 24, words: 12 },
  { day: 'Wed', mins: 15, words: 7 },
  { day: 'Thu', mins: 29, words: 14 },
  { day: 'Fri', mins: 21, words: 10 },
  { day: 'Sat', mins: 22, words: 8 },
  { day: 'Sun', mins: 15, words: 5 },
];

const MISTAKE_TRENDS = [
  { label: 'Past Tense', drop: '-42%', accuracy: 86 },
  { label: 'Articles (a / the)', drop: '-31%', accuracy: 81 },
  { label: 'Word Order', drop: '-54%', accuracy: 91 },
];

const REVISION_ITEMS = [
  {
    id: 'r1',
    wrong: 'I go to market yesterday.',
    right: 'I went to the market yesterday.',
    tag: 'Past Tense',
  },
  {
    id: 'r2',
    wrong: 'I have one luggage for check-in.',
    right: 'I have one suitcase to check in.',
    tag: 'Articles & Nouns',
  },
  {
    id: 'r3',
    wrong: 'Ich möchte eine Kaffee, bitte.',
    right: 'Ich möchte einen Kaffee, bitte.',
    tag: 'German · A2',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can I interrupt Vocly mid-sentence?',
    a: 'Yes. Vocly listens continuously with natural turn-taking, so you can cut in anytime to ask a question, restart a thought, or change topics.',
  },
  {
    q: 'Is Vocly helpful if I feel nervous speaking to real people?',
    a: 'That’s exactly who we built Vocly for. Practice privately 24/7 with zero judgment, optional English hints, and warm, calm feedback.',
  },
  {
    q: 'Which languages and proficiency levels does Vocly support?',
    a: 'Vocly adapts from CEFR A1 (beginner) to C1 (advanced) across English, German, Japanese, French, and Spanish.',
  },
  {
    q: 'How does word-level pronunciation feedback work?',
    a: 'Every spoken turn is scored word-by-word for acoustic clarity so you immediately see which words sounded crisp and which ones to retry.',
  },
  {
    q: 'How does Vocly remember what I struggled with?',
    a: 'After each session, Vocly logs your key corrections into a Smart Revision Queue and weaves them into your next warm-up automatically.',
  },
];

const NAV_SECTIONS = [
  { id: 'why', label: 'Why Vocly', href: '#why' },
  { id: 'how-it-works', label: 'How it works', href: '#how-it-works' },
  { id: 'stages', label: 'Stages', href: '#stages' },
  { id: 'scenarios', label: 'Scenarios', href: '#scenarios' },
  { id: 'progress', label: 'Progress', href: '#progress' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

// ============================================================================
// MATH & EASING HELPERS FOR 60FPS SCROLL CHOREOGRAPHY
// ============================================================================

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const seg = (p, a, b) => clamp01((p - a) / Math.max(b - a, 0.0001));
const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const easeOutBack = (x) => {
  const c = 1.65;
  const v = clamp01(x);
  return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2);
};

// ============================================================================
// SMOOTH UI PRIMITIVES (TEAL -> INDIGO/VIOLET EDITORIAL THEME)
// ============================================================================

const SMOOTH = 'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]';

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

/**
 * Vertical Dual-Text Hover Roll Animation (used across nav, buttons, and footer)
 */
function RollText({ text, className = '' }) {
  return (
    <span className={`relative inline-flex overflow-hidden leading-[1.25] py-[1px] ${className}`}>
      <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 inline-block translate-y-full py-[1px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
      >
        {text}
      </span>
    </span>
  );
}

function VoclyMark({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8';
  return (
    <span
      className={`${dim} rounded-full bg-gradient-to-br from-teal-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_4px_16px_rgba(20,184,166,0.35)] shrink-0`}
    >
      <span className="flex items-center gap-[2px] h-3.5">
        <span className="w-[2px] h-1.5 rounded-full bg-white/85 animate-[voclyWave_1.05s_ease-in-out_0s_infinite_alternate]" />
        <span className="w-[2px] h-3 rounded-full bg-white animate-[voclyWave_0.82s_ease-in-out_0.15s_infinite_alternate]" />
        <span className="w-[2px] h-2 rounded-full bg-white/95 animate-[voclyWave_0.96s_ease-in-out_0.3s_infinite_alternate]" />
        <span className="w-[2px] h-2.5 rounded-full bg-white/85 animate-[voclyWave_0.88s_ease-in-out_0.45s_infinite_alternate]" />
      </span>
    </span>
  );
}

function VoclyVoiceEmblem({ listening = false }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className="w-4 h-4 text-white overflow-visible"
      aria-hidden="true"
    >
      <path
        d="M8.5 9.5C6.8 11.7 6.8 16.3 8.5 18.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={
          listening
            ? 'animate-[arcRipple_0.9s_ease-in-out_0s_infinite]'
            : 'opacity-80 animate-[arcBreath_2.4s_ease-in-out_0s_infinite]'
        }
      />
      <path
        d="M19.5 9.5C21.2 11.7 21.2 16.3 19.5 18.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={
          listening
            ? 'animate-[arcRipple_0.9s_ease-in-out_0s_infinite]'
            : 'opacity-80 animate-[arcBreath_2.4s_ease-in-out_0s_infinite]'
        }
      />
      <path
        d="M5.2 6.8C2.6 10.6 2.6 17.4 5.2 21.2"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        className={
          listening
            ? 'animate-[arcRipple_0.9s_ease-in-out_0.22s_infinite]'
            : 'opacity-50 animate-[arcBreath_2.4s_ease-in-out_0.45s_infinite]'
        }
      />
      <path
        d="M22.8 6.8C25.4 10.6 25.4 17.4 22.8 21.2"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        className={
          listening
            ? 'animate-[arcRipple_0.9s_ease-in-out_0.22s_infinite]'
            : 'opacity-50 animate-[arcBreath_2.4s_ease-in-out_0.45s_infinite]'
        }
      />
      <path
        d="M14 7.5L15.45 12.55L20.5 14L15.45 15.45L14 20.5L12.55 15.45L7.5 14L12.55 12.55L14 7.5Z"
        fill="currentColor"
        className={`origin-center ${
          listening
            ? 'animate-[sparkPulse_0.75s_ease-in-out_infinite]'
            : 'animate-[sparkIdle_2.8s_ease-in-out_infinite]'
        }`}
      />
    </svg>
  );
}

function PrimaryButton({ children, onClick, className = '', type = 'button', ariaLabel }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 shadow-[0_10px_26px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_14px_32px_-8px_rgba(20,184,166,0.55)] hover:-translate-y-[1px] active:scale-[0.98] cursor-pointer select-none ${SMOOTH} ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

function SecondaryLink({ children, href, isDark, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex items-center justify-center gap-2 rounded-full border font-medium active:scale-[0.98] cursor-pointer select-none ${SMOOTH} ${
        isDark
          ? 'border-white/[0.12] bg-white/[0.04] text-[#F8FAFC] hover:bg-white/[0.09] hover:border-teal-400/40'
          : 'border-[#E3D5BA] bg-[#FCF8EE] text-[#1C1917] hover:bg-[#EFE4CC] hover:border-teal-500/40'
      } ${className}`}
    >
      {children}
    </a>
  );
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(22px)',
      }}
    >
      {children}
    </div>
  );
}

function CountUp({ target, suffix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const ranRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ranRef.current) {
          ranRef.current = true;
          const start = performance.now();
          const duration = 950;
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

function AcousticEqualizer({ active = false, bars = 18, height = 24, onDark = true }) {
  const [levels, setLevels] = useState(() =>
    Array.from({ length: bars }, (_, i) => {
      const dist = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2 || 1);
      return Math.max(18, Math.round((1 - dist * 0.65) * 38));
    })
  );

  useEffect(() => {
    if (!active) {
      setLevels(
        Array.from({ length: bars }, (_, i) => {
          const dist = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2 || 1);
          return Math.max(16, Math.round((1 - dist * 0.65) * 34));
        })
      );
      return;
    }

    const id = setInterval(() => {
      setLevels(
        Array.from({ length: bars }, (_, i) => {
          const dist = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2 || 1);
          const env = Math.max(0.28, 1 - dist * 0.65);
          return Math.min(100, Math.max(16, Math.round((24 + Math.random() * 76) * env)));
        })
      );
    }, 110);

    return () => clearInterval(id);
  }, [active, bars]);

  return (
    <div
      className="inline-flex items-center justify-center gap-[2.5px]"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {levels.map((pct, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            active
              ? 'bg-gradient-to-t from-teal-400 via-indigo-400 to-violet-400'
              : onDark
              ? 'bg-teal-300/45'
              : 'bg-teal-600/35'
          }`}
          style={{ height: `${pct}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Interactive Hero Topographic Acoustic Resonance Canvas
 */
function HeroWaveCanvas({ isDark, isActive }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -999, y: -999, energy: 0 });
  const activeRef = useRef(isActive);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = null;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.energy = Math.min(1, pointerRef.current.energy + 0.16);
    };

    const onPointerLeave = () => {
      pointerRef.current.x = -999;
      pointerRef.current.y = -999;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      pointerRef.current.energy *= 0.94;
      const isSpeaking = activeRef.current;
      const cx = w * 0.5;
      const cy = h * 0.36;
      const baseScale = Math.min(w * 0.54, 540);
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      const ringCount = 11;
      const steps = 120;

      for (let i = 0; i < ringCount; i++) {
        const ratio = i / (ringCount - 1);
        const baseRx = (0.16 + ratio * 0.88) * baseScale;
        const baseRy = baseRx * 0.62;
        const phase = i * 0.55;

        const rr = Math.round(
          ratio < 0.5 ? 13 + (99 - 13) * (ratio * 2) : 99 + (139 - 99) * ((ratio - 0.5) * 2)
        );
        const gg = Math.round(
          ratio < 0.5 ? 148 + (102 - 148) * (ratio * 2) : 102 + (92 - 102) * ((ratio - 0.5) * 2)
        );
        const bb = Math.round(
          ratio < 0.5 ? 136 + (241 - 136) * (ratio * 2) : 241 + (246 - 241) * ((ratio - 0.5) * 2)
        );

        const resonanceWave = Math.sin(ratio * 5.5 - t * (isSpeaking ? 3.8 : 1.5));
        const highlight = Math.max(0, resonanceWave) * (isSpeaking ? 0.22 : 0.09);
        const edgeFade = Math.sin((0.12 + ratio * 0.82) * Math.PI);
        const alpha = ((isDark ? 0.14 : 0.15) + highlight) * edgeFade;

        ctx.beginPath();
        let orbX = 0;
        let orbY = 0;
        const orbAngle =
          (t * (0.28 + (i % 3) * 0.12) * (i % 2 === 0 ? 1 : -1) + i * 1.4) % (Math.PI * 2);
        let closestDiff = 999;

        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const harmonicAmp = (isSpeaking ? 16 : 9) * (0.45 + ratio * 0.65);
          const morph =
            Math.sin(theta * 3 + t * 1.1 + phase) * harmonicAmp +
            Math.cos(theta * 5 - t * 0.85 + phase * 0.7) * (harmonicAmp * 0.45) +
            Math.sin(theta * 2 - t * 0.6) * (harmonicAmp * 0.35);

          let x = cx + Math.cos(theta) * (baseRx + morph);
          let y = cy + Math.sin(theta) * (baseRy + morph * 0.65);

          const dx = x - px;
          const dy = y - py;
          const pDist = Math.hypot(dx, dy);
          if (pDist < 160 && pDist > 0.001) {
            const pull = Math.pow(1 - pDist / 160, 2) * (18 + pointerRef.current.energy * 16);
            x += (dx / pDist) * pull;
            y += (dy / pDist) * pull;
          }

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          const angleDiff = Math.abs(((theta - orbAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (angleDiff < closestDiff) {
            closestDiff = angleDiff;
            orbX = x;
            orbY = y;
          }
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(${rr}, ${gg}, ${bb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1 + highlight * 2.4;
        ctx.stroke();

        if (i === 2 || i === 5 || i === 8) {
          ctx.beginPath();
          ctx.arc(orbX, orbY, isSpeaking ? 3.2 : 2.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${Math.min(0.85, alpha * 3.1).toFixed(3)})`;
          ctx.fill();
        }
      }

      t += isSpeaking ? 0.024 : 0.013;
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full block"
      aria-hidden="true"
    />
  );
}

/**
 * Interactive Acoustic Pulse Dot-Matrix Canvas
 */
function AcousticDotMatrixCanvas({ isDark, isActive }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -999, y: -999, energy: 0 });
  const activeRef = useRef(isActive);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = null;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.energy = Math.min(1, pointerRef.current.energy + 0.16);
    };

    const onPointerLeave = () => {
      pointerRef.current.x = -999;
      pointerRef.current.y = -999;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      pointerRef.current.energy *= 0.94;
      const isSpeaking = activeRef.current;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.hypot(w * 0.55, h * 0.55);
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      const gap = 30;
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      const offsetX = (w - (cols - 1) * gap) * 0.5;
      const offsetY = (h - (rows - 1) * gap) * 0.5;

      for (let row = 0; row < rows; row++) {
        const y = offsetY + row * gap;
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * gap;
          const dist = Math.hypot(x - cx, y - cy);
          const normDist = dist / Math.max(maxR, 1);
          const vignette = Math.max(0, 1 - Math.pow(normDist, 1.9));
          if (vignette <= 0.02) continue;

          const wave = Math.sin(dist * 0.022 - t * (isSpeaking ? 3.2 : 1.7));
          const pulse = Math.max(0, wave);

          const pDist = Math.hypot(x - px, y - py);
          const hover =
            pDist < 150
              ? Math.pow(1 - pDist / 150, 2) * (0.65 + pointerRef.current.energy * 0.45)
              : 0;

          const intensity = Math.min(1, pulse * (isSpeaking ? 0.72 : 0.46) + hover);
          const radius = 1.05 + intensity * 1.45;

          const colorMix = Math.min(1, normDist * 1.15);
          const tr = Math.round(13 + (99 - 13) * colorMix);
          const tg = Math.round(148 + (102 - 148) * colorMix);
          const tb = Math.round(136 + (241 - 136) * colorMix);

          if (intensity > 0.14) {
            const alpha =
              ((isDark ? 0.18 : 0.16) + intensity * (isDark ? 0.42 : 0.34)) * vignette;
            ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${alpha.toFixed(3)})`;
          } else {
            const baseAlpha = (isDark ? 0.16 : 0.18) * vignette;
            ctx.fillStyle = isDark
              ? `rgba(148, 163, 184, ${baseAlpha.toFixed(3)})`
              : `rgba(120, 113, 108, ${baseAlpha.toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      t += isSpeaking ? 0.024 : 0.015;
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none w-full h-full block"
      aria-hidden="true"
    />
  );
}

/**
 * Reusable Slow-Flowing Acoustic Soundwaves Backdrop
 * Used behind the Scenarios Fluency Tree, Stages Deck, and Final CTA.
 */
function AmbientSoundWaves({
  idPrefix = 'wave',
  isDark = false,
  onDarkSurface = false,
  withBars = false,
  className = '',
}) {
  const darkPalette = isDark || onDarkSurface;
  const gradA = `${idPrefix}-grad-a`;
  const gradB = `${idPrefix}-grad-b`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{
        maskImage:
          'radial-gradient(ellipse 78% 68% at 50% 50%, #000 32%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 78% 68% at 50% 50%, #000 32%, transparent 100%)',
      }}
    >
      <svg
        viewBox="0 0 1800 320"
        preserveAspectRatio="none"
        className="absolute w-[180%] max-w-none h-[240px] sm:h-[320px]"
      >
        <defs>
          <linearGradient id={gradA} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.04" />
            <stop offset="32%" stopColor="#14B8A6" stopOpacity={darkPalette ? '0.5' : '0.38'} />
            <stop offset="68%" stopColor="#6366F1" stopOpacity={darkPalette ? '0.5' : '0.38'} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={gradB} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.03" />
            <stop offset="38%" stopColor="#6366F1" stopOpacity={darkPalette ? '0.38' : '0.28'} />
            <stop offset="72%" stopColor="#14B8A6" stopOpacity={darkPalette ? '0.38' : '0.28'} />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <g
          style={{
            animation: 'introWaveDriftA 10.5s ease-in-out infinite',
            transformOrigin: 'center',
          }}
        >
          <path
            d="M0 160 C 150 65, 300 255, 450 160 C 600 65, 750 255, 900 160 C 1050 65, 1200 255, 1350 160 C 1500 65, 1650 255, 1800 160"
            fill="none"
            stroke={`url(#${gradA})`}
            strokeWidth="2.2"
          />
          <path
            d="M0 160 C 150 225, 300 95, 450 160 C 600 225, 750 95, 900 160 C 1050 225, 1200 95, 1350 160 C 1500 225, 1650 95, 1800 160"
            fill="none"
            stroke={`url(#${gradB})`}
            strokeWidth="1.5"
          />
        </g>

        <g
          style={{
            animation: 'introWaveDriftB 12.8s ease-in-out infinite',
            transformOrigin: 'center',
          }}
        >
          <path
            d="M0 160 C 180 105, 360 215, 540 160 C 720 105, 900 215, 1080 160 C 1260 105, 1440 215, 1620 160 C 1710 132, 1755 148, 1800 160"
            fill="none"
            stroke={`url(#${gradA})`}
            strokeWidth="1.7"
            strokeOpacity="0.65"
          />
        </g>
      </svg>

      {withBars && (
        <div className="relative flex items-center justify-center gap-[6px] sm:gap-[9px] h-40 sm:h-52 opacity-30">
          {[
            16, 26, 38, 30, 52, 68, 44, 80, 58, 92, 72, 100, 72, 92, 58, 80, 44, 68, 52, 30,
            38, 26, 16,
          ].map((h, i) => (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-gradient-to-t from-teal-500/65 via-indigo-500/65 to-violet-500/65 origin-center"
              style={{
                height: `${h}%`,
                animation: `introBarBreathe ${3.0 + (i % 5) * 0.4}s ease-in-out ${
                  (i % 7) * 0.16
                }s infinite`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHUFFLE CARD STYLE HELPER (USED BY #stages DECK)
// ============================================================================

function getShuffleCardStyle(index, rawProgress, total = 3, dir = 1) {
  const step = rawProgress * (total - 1);
  const diff = index - step;

  // Already passed -> gently arcs out & tucks to the back of the deck
  if (diff < 0) {
    const out = clamp01(-diff);
    const e = easeOutCubic(out);
    const arcX = dir * Math.sin(e * Math.PI) * 190;
    const tx = arcX + dir * e * 28;
    const ty = -e * 28 + e * e * 46;
    const rot = dir * Math.sin(e * Math.PI) * 10 + dir * e * 3.5;
    const sc = 1 - e * 0.12;
    const zIndex = out < 0.48 ? 30 - index : 5 + index;
    const opacity = 1 - e * 0.42;
    return {
      transform: `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(
        2
      )}deg) scale(${sc.toFixed(3)})`,
      zIndex,
      opacity: opacity.toFixed(3),
    };
  }

  // Active front card or waiting behind in stack
  const depth = Math.min(diff, total - 1);
  const ty = depth * 18;
  const tx = -dir * depth * 10;
  const rot = -dir * depth * 2.4;
  const sc = 1 - depth * 0.055;
  const zIndex = Math.round(30 - depth * 6);
  const opacity = Math.max(0.55, 1 - depth * 0.16);

  return {
    transform: `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(
      2
    )}deg) scale(${sc.toFixed(3)})`,
    zIndex,
    opacity: opacity.toFixed(3),
  };
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function App() {
  // Default to Solid Cream Light Mode (with instant Dark Mode toggle)
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [navCompressed, setNavCompressed] = useState(false);

  // Cinematic "Vocly" Page-Load Intro State ('showing' -> 'exiting' -> 'done')
  const [introPhase, setIntroPhase] = useState('showing');

  // Viewport & Scroll Choreography Progress States
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isDesktop = viewportWidth >= 1024;
  const [heroZoom, setHeroZoom] = useState(0);
  const [stagesShuffle, setStagesShuffle] = useState(0);

  // Hero Floating Voice Studio State
  const [selectedLangId, setSelectedLangId] = useState('en');
  const [englishHints, setEnglishHints] = useState(true);
  const [isHeroListening, setIsHeroListening] = useState(false);
  const [isStreamingSample, setIsStreamingSample] = useState(false);
  const [streamWordCount, setStreamWordCount] = useState(99);
  const [showHeroCorrection, setShowHeroCorrection] = useState(true);
  const [heroLiveTranscript, setHeroLiveTranscript] = useState('');

  // How It Works Step 01 Interactive Language Preview
  const [stepLang, setStepLang] = useState('English');

  // Persistent Bottom-Center Wispr Flow–Style Floating Voice Pill State
  const [dockStatus, setDockStatus] = useState('idle');
  const [dockPopoverOpen, setDockPopoverOpen] = useState(false);
  const [dockSpoken, setDockSpoken] = useState('');
  const [dockReply, setDockReply] = useState('');

  // Organic Fluency Tree Scenarios State
  const [hoveredBranchId, setHoveredBranchId] = useState(null);
  const [mobileExpandedScenarioId, setMobileExpandedScenarioId] = useState('cafe');
  const [hearingOpening, setHearingOpening] = useState(false);

  // Progress Dashboard State
  const [hoveredDay, setHoveredDay] = useState('Thu');
  const [masteredIds, setMasteredIds] = useState([]);

  // FAQ State
  const [openFaq, setOpenFaq] = useState(0);

  // Interactive "Try the Demo" Modal State
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [modalLangId, setModalLangId] = useState('en');
  const [modalScenarioId, setModalScenarioId] = useState('freetalk');
  const [modalListening, setModalListening] = useState(false);
  const [modalSpoken, setModalSpoken] = useState('');
  const [modalCorrection, setModalCorrection] = useState('');
  const [modalScores, setModalScores] = useState([]);
  const [modalTurns, setModalTurns] = useState([]);
  const [modalShowSummary, setModalShowSummary] = useState(false);

  // Refs
  const heroScrollRef = useRef(null);
  const stagesScrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const timersRef = useRef([]);
  const scenarioAudioTimerRef = useRef(null);

  const currentHeroLang =
    HERO_LANGUAGES.find((l) => l.id === selectedLangId) || HERO_LANGUAGES[0];
  const modalScenario =
    SCENARIOS.find((s) => s.id === modalScenarioId) || SCENARIOS[2];
  const modalLang =
    HERO_LANGUAGES.find((l) => l.id === modalLangId) || HERO_LANGUAGES[0];

  // Cinematic "Vocly" Page-Load Intro Sequence
  useEffect(() => {
    const tExit = setTimeout(() => setIntroPhase('exiting'), 1650);
    const tDone = setTimeout(() => setIntroPhase('done'), 2250);
    return () => {
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, []);

  // 60fps RAF-Lerped Scroll Choreography + Direction-Aware Navbar + Scroll-Spy
  useEffect(() => {
    document.title = 'Vocly — Speak it. Fix it. Own it.';

    const sectionIds = NAV_SECTIONS.map((s) => s.id);
    const targets = { hero: 0, stages: 0 };
    const current = { hero: 0, stages: 0 };
    let lastY = window.scrollY;
    let rafId = null;

    const measure = () => {
      const top = window.scrollY;
      const delta = top - lastY;
      if (top <= 80) setNavCompressed(false);
      else if (delta > 6) setNavCompressed(true);
      else if (delta < -6) setNavCompressed(false);
      lastY = top;

      setViewportWidth(window.innerWidth);

      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(docHeight > 0 ? Math.min(100, (top / docHeight) * 100) : 0);

      // Hero Sticky Zoom Progress
      if (heroScrollRef.current) {
        const rect = heroScrollRef.current.getBoundingClientRect();
        const scrollable = Math.max(
          heroScrollRef.current.offsetHeight - window.innerHeight,
          1
        );
        targets.hero = clamp01(-rect.top / scrollable);
      }

      // Stages Shuffling Deck Progress
      if (stagesScrollRef.current) {
        const rect = stagesScrollRef.current.getBoundingClientRect();
        const scrollable = Math.max(
          stagesScrollRef.current.offsetHeight - window.innerHeight,
          1
        );
        targets.stages = clamp01(-rect.top / scrollable);
      }

      // Active Section Scroll-Spy
      if (top < 260) {
        setActiveSection('');
        return;
      }
      if (docHeight > 0 && top + 90 >= docHeight) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }
      const focusY = window.innerHeight * 0.35;
      let active = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= focusY && r.bottom > 100) active = id;
      }
      if (active) setActiveSection(active);
    };

    const tick = () => {
      current.hero += (targets.hero - current.hero) * 0.1;
      current.stages += (targets.stages - current.stages) * 0.1;

      setHeroZoom(current.hero);
      setStagesShuffle(current.stages);
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Cleanup all async timers and active mic sessions
  const stopAudioAndTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsHeroListening(false);
    setIsStreamingSample(false);
    setModalListening(false);
    setDockStatus((prev) => (prev === 'listening' || prev === 'replying' ? 'idle' : prev));
  }, []);

  useEffect(() => {
    return () => {
      stopAudioAndTimers();
      if (scenarioAudioTimerRef.current) clearTimeout(scenarioAudioTimerRef.current);
    };
  }, [stopAudioAndTimers]);

  // Modal body-scroll lock & Escape dismissal
  useEffect(() => {
    if (!demoModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopAudioAndTimers();
        setDemoModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [demoModalOpen, stopAudioAndTimers]);

  // Hero Language Switch
  const handleSelectHeroLang = (langId) => {
    stopAudioAndTimers();
    setSelectedLangId(langId);
    setHeroLiveTranscript('');
    setStreamWordCount(99);
    setShowHeroCorrection(true);
  };

  // Word-by-Word Streaming "Play Sample" in Hero Voice Studio
  const handlePlayHeroSample = () => {
    if (isStreamingSample) {
      stopAudioAndTimers();
      setStreamWordCount(99);
      setShowHeroCorrection(true);
      return;
    }

    stopAudioAndTimers();
    setHeroLiveTranscript('');
    setIsStreamingSample(true);
    setShowHeroCorrection(false);
    setStreamWordCount(0);

    const words = currentHeroLang.rawWords;
    const newTimers = [];
    words.forEach((_, idx) => {
      newTimers.push(
        setTimeout(() => {
          setStreamWordCount(idx + 1);
        }, (idx + 1) * 210)
      );
    });

    const revealAt = words.length * 210 + 380;
    newTimers.push(
      setTimeout(() => {
        setShowHeroCorrection(true);
      }, revealAt)
    );
    newTimers.push(
      setTimeout(() => {
        setIsStreamingSample(false);
      }, revealAt + 1000)
    );

    timersRef.current = newTimers;
  };

  // Live Speak Button in Hero Voice Studio
  const handleToggleHeroMic = () => {
    if (isHeroListening) {
      stopAudioAndTimers();
      return;
    }
    stopAudioAndTimers();

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      handlePlayHeroSample();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = currentHeroLang.speechLang;
      rec.interimResults = true;
      rec.continuous = false;

      setIsHeroListening(true);
      setHeroLiveTranscript('');
      setShowHeroCorrection(false);

      let captured = '';
      rec.onresult = (event) => {
        captured = '';
        for (let i = 0; i < event.results.length; i++) {
          captured += event.results[i][0].transcript;
        }
        setHeroLiveTranscript(captured);
      };

      rec.onerror = () => {
        setIsHeroListening(false);
        handlePlayHeroSample();
      };

      rec.onend = () => {
        setIsHeroListening(false);
        if (!captured.trim()) {
          handlePlayHeroSample();
        } else {
          setShowHeroCorrection(true);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      handlePlayHeroSample();
    }
  };

  // Persistent Bottom-Center Floating Voice Pill Handlers
  const runDockSimulatedTurn = () => {
    setDockPopoverOpen(true);
    setDockStatus('listening');
    setDockSpoken('');
    setDockReply('');

    const t1 = setTimeout(() => {
      setDockSpoken('I go to market yesterday.');
      setDockStatus('replying');
    }, 1250);

    const t2 = setTimeout(() => {
      setDockReply(
        "Almost! Say: 'I went to the market yesterday.' We use the past tense for things that already happened."
      );
      setDockStatus('result');
    }, 2250);

    timersRef.current = [t1, t2];
  };

  const handleDockFinish = () => {
    stopAudioAndTimers();
    setDockPopoverOpen(true);
    const spoken = dockSpoken.trim() || 'I go to market yesterday.';
    setDockSpoken(spoken);
    setDockStatus('replying');

    const t = setTimeout(() => {
      setDockReply(
        spoken === 'I go to market yesterday.'
          ? "Almost! Say: 'I went to the market yesterday.' We use the past tense for things that already happened."
          : 'Great natural flow! Your clarity averaged 95%. Try extending that with one detail about who you met.'
      );
      setDockStatus('result');
    }, 650);
    timersRef.current.push(t);
  };

  const handleDockMicClick = () => {
    if (dockStatus === 'listening') {
      handleDockFinish();
      return;
    }
    stopAudioAndTimers();

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      runDockSimulatedTurn();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = currentHeroLang.speechLang;
      rec.interimResults = true;
      rec.continuous = false;

      setDockPopoverOpen(true);
      setDockStatus('listening');
      setDockSpoken('');
      setDockReply('');

      let captured = '';
      rec.onresult = (event) => {
        captured = '';
        for (let i = 0; i < event.results.length; i++) {
          captured += event.results[i][0].transcript;
        }
        setDockSpoken(captured);
      };

      rec.onerror = () => {
        runDockSimulatedTurn();
      };

      rec.onend = () => {
        if (!captured.trim()) {
          runDockSimulatedTurn();
        } else {
          setDockStatus('replying');
          const t = setTimeout(() => {
            setDockReply(
              'Great natural flow! Your clarity averaged 95%. Try extending that with one detail about who you met.'
            );
            setDockStatus('result');
          }, 700);
          timersRef.current.push(t);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      runDockSimulatedTurn();
    }
  };

  // Scenarios Audio Preview
  const handleToggleHearOpening = (e) => {
    if (e) e.stopPropagation();
    if (scenarioAudioTimerRef.current) clearTimeout(scenarioAudioTimerRef.current);
    if (hearingOpening) {
      setHearingOpening(false);
      return;
    }
    setHearingOpening(true);
    scenarioAudioTimerRef.current = setTimeout(() => {
      setHearingOpening(false);
    }, 3000);
  };

  // Progress Smart Revision Toggle
  const toggleMastered = (id) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Open Interactive "Try the Demo" Modal
  const openDemoModal = (scenarioId = 'freetalk', langId = selectedLangId) => {
    stopAudioAndTimers();
    setMobileMenuOpen(false);
    setDockPopoverOpen(false);
    setModalScenarioId(scenarioId);
    setModalLangId(langId);
    setModalSpoken('');
    setModalCorrection('');
    setModalScores([]);
    setModalTurns([]);
    setModalShowSummary(false);
    setDemoModalOpen(true);
  };

  const runModalFeedback = (spokenText, correctionText, scoresList, vocabList = []) => {
    setModalSpoken(spokenText);
    setModalCorrection('');
    setModalScores([]);

    const t = setTimeout(() => {
      setModalCorrection(correctionText);
      setModalScores(scoresList);
      setModalTurns((prev) => [
        ...prev,
        { spoken: spokenText, correction: correctionText, vocab: vocabList },
      ]);
    }, 420);
    timersRef.current.push(t);
  };

  const handleModalMicToggle = () => {
    if (modalListening) {
      stopAudioAndTimers();
      return;
    }
    stopAudioAndTimers();

    const fallback = modalScenario.presets[0];
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setModalListening(true);
      const t = setTimeout(() => {
        setModalListening(false);
        runModalFeedback(fallback.spoken, fallback.correction, fallback.scores, fallback.vocab);
      }, 1300);
      timersRef.current.push(t);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = modalLang.speechLang;
      rec.interimResults = true;
      setModalListening(true);
      setModalSpoken('');
      setModalCorrection('');

      let captured = '';
      rec.onresult = (event) => {
        captured = '';
        for (let i = 0; i < event.results.length; i++) {
          captured += event.results[i][0].transcript;
        }
        setModalSpoken(captured);
      };

      rec.onerror = () => {
        setModalListening(false);
        runModalFeedback(fallback.spoken, fallback.correction, fallback.scores, fallback.vocab);
      };

      rec.onend = () => {
        setModalListening(false);
        if (captured.trim()) {
          const words = captured
            .trim()
            .split(/\s+/)
            .slice(0, 4)
            .map((w, i) => ({ word: w, score: 91 + ((i * 3) % 7) }));
          runModalFeedback(
            captured.trim(),
            'Great spoken flow! Your clarity averaged 94%. Keep your verb tenses steady as you continue.',
            words,
            words.map((w) => w.word)
          );
        } else {
          runModalFeedback(fallback.spoken, fallback.correction, fallback.scores, fallback.vocab);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      setModalListening(false);
      runModalFeedback(fallback.spoken, fallback.correction, fallback.scores, fallback.vocab);
    }
  };

  // Derived Head-Section Zoom Choreography Values
  const heroExit = easeOutCubic(seg(heroZoom, 0, 0.24));
  const zoomP = easeOutCubic(seg(heroZoom, 0, 0.28));
  const stageScale = Math.min(1.08, Math.max(0.82, (viewportWidth - 32) / 960));

  const scrollWordLimit = Math.min(
    currentHeroLang.rawWords.length,
    Math.max(
      2,
      Math.floor(seg(heroZoom, 0.08, 0.38) * (currentHeroLang.rawWords.length - 1)) + 2
    )
  );
  const underlineP = seg(heroZoom, 0.36, 0.45);
  const fixP = easeOutCubic(seg(heroZoom, 0.46, 0.6));
  const bubbleP = easeOutCubic(seg(heroZoom, 0.54, 0.66));
  const toLeftP = easeOutCubic(seg(heroZoom, 0.72, 0.86));
  const ringP = easeOutCubic(seg(heroZoom, 0.78, 0.96));

  const activeCaptionIdx = HERO_STORY_CAPTIONS.findIndex(
    (c) => heroZoom >= c.start && heroZoom < c.end
  );
  const isManualHeroActive =
    isHeroListening || isStreamingSample || Boolean(heroLiveTranscript);
  const effectiveWordsShown = isManualHeroActive
    ? streamWordCount
    : isDesktop
    ? scrollWordLimit
    : currentHeroLang.rawWords.length;
  const effectiveFixP = isManualHeroActive
    ? showHeroCorrection
      ? 1
      : 0
    : isDesktop
    ? fixP
    : 1;
  const effectiveBubbleP = isManualHeroActive
    ? showHeroCorrection
      ? 1
      : 0
    : isDesktop
    ? bubbleP
    : 1;

  const revisionChips = [
    currentHeroLang.wordScores[1]?.word || 'went (past)',
    currentHeroLang.wordScores[2]?.word || 'the market',
    currentHeroLang.fixTag.split('·')[0].trim(),
  ];

  // Derived Active Stage Index for Shuffling Deck
  const activeStageIdx = Math.min(2, Math.round(stagesShuffle * 2));

  // Solid Cream (Light Mode) & Obsidian (Dark Mode) Theme Tokens
  const t = {
    page: isDark ? 'bg-[#080A0F] text-[#F8FAFC]' : 'bg-[#F5ECD7] text-[#1C1917]',
    surface: isDark
      ? 'bg-[#10131C] border-white/[0.08]'
      : 'bg-[#FCF8EE] border-[#E3D5BA]',
    surfaceElevated: isDark
      ? 'bg-[#161B26] border-white/[0.08]'
      : 'bg-[#EFE4CC] border-[#E3D5BA]',
    nav: isDark
      ? 'bg-[#10131C]/95 border-white/[0.1] shadow-[0_14px_40px_rgba(0,0,0,0.55)]'
      : 'bg-[#FCF8EE]/95 border-[#E3D5BA] shadow-[0_12px_36px_rgba(28,25,23,0.08)]',
    muted: isDark ? 'text-[#94A3B8]' : 'text-[#57534E]',
    faint: isDark ? 'text-[#64748B]' : 'text-[#78716C]',
    border: isDark ? 'border-white/[0.08]' : 'border-[#E3D5BA]',
    accentText: isDark ? 'text-teal-400' : 'text-teal-700',
    emeraldText: isDark ? 'text-emerald-400' : 'text-emerald-700',
  };

  const uniqueModalVocab = Array.from(
    new Set(modalTurns.flatMap((turn) => turn.vocab || []))
  );

  const heroReady = introPhase !== 'showing';

  return (
    <div
      className={`min-h-screen font-sans-ui transition-colors duration-300 selection:bg-teal-500/20 ${t.page}`}
      style={{ overflowX: 'clip' }}
    >
      {/* ====================================================================
          GOOGLE FONTS & KEYFRAME ANIMATIONS
         ==================================================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .font-serif-editorial { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-ui { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        .font-mono-tech {
          font-family: 'DM Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }

        html { scroll-behavior: smooth; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes voclyWave {
          0% { transform: scaleY(0.42); }
          100% { transform: scaleY(1.18); }
        }

        @keyframes auroraDrift {
          0% { transform: translate(-50%, 0px) scale(1); }
          50% { transform: translate(-48%, 16px) scale(1.06); }
          100% { transform: translate(-50%, 0px) scale(1); }
        }

        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.65; }
          100% { transform: scale(1.85); opacity: 0; }
        }

        @keyframes marqueeRun {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes sparkIdle {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes sparkPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.9; }
          50% { transform: scale(1.18); opacity: 1; }
        }

        @keyframes arcBreath {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.95; }
        }

        @keyframes arcRipple {
          0%, 100% { opacity: 0.3; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.06); }
        }

        @keyframes branchFlow {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes cinematicLetter {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes cinematicLine {
          0% { transform: scaleX(0); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: scaleX(1); opacity: 0.9; }
        }

        @keyframes introWaveDriftA {
          0% { transform: translateX(0%) scaleY(0.92); }
          50% { transform: translateX(-18%) scaleY(1.08); }
          100% { transform: translateX(-33.33%) scaleY(0.92); }
        }

        @keyframes introWaveDriftB {
          0% { transform: translateX(-33.33%) scaleY(1.06); }
          50% { transform: translateX(-16%) scaleY(0.9); }
          100% { transform: translateX(0%) scaleY(1.06); }
        }

        @keyframes introBarBreathe {
          0%, 100% { transform: scaleY(0.38); opacity: 0.35; }
          50% { transform: scaleY(1); opacity: 0.85; }
        }

        @keyframes introWaveFade {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-aurora { animation: auroraDrift 11s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulseRing 1.85s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .animate-marquee { animation: marqueeRun 34s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .animate-branch-flow { animation: branchFlow 1.6s linear infinite; }
      `}</style>

      {/* ====================================================================
          0. CINEMATIC "VOCLY" LOAD-IN INTRO OVERLAY WITH SOUNDWAVES
         ==================================================================== */}
      {introPhase !== 'done' && (
        <div
          onClick={() => setIntroPhase('done')}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark ? 'bg-[#080A0F] text-[#F8FAFC]' : 'bg-[#F5ECD7] text-[#1C1917]'
          } ${
            introPhase === 'exiting'
              ? 'opacity-0 scale-105 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* Soft Acoustic Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute w-[480px] h-[260px] rounded-full blur-[120px] opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(20,184,166,0.28) 0%, rgba(99,102,241,0.22) 55%, transparent 78%)',
            }}
          />

          {/* Slow Flowing Music / Mic Soundwaves Behind the Vocly Logo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              animation: 'introWaveFade 0.9s cubic-bezier(0.22,1,0.36,1) both',
              maskImage:
                'radial-gradient(ellipse 72% 58% at 50% 50%, #000 35%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 72% 58% at 50% 50%, #000 35%, transparent 100%)',
            }}
          >
            {/* Layered Flowing Sine-Wave Ribbons */}
            <svg
              viewBox="0 0 1800 320"
              preserveAspectRatio="none"
              className="absolute w-[180%] max-w-none h-[240px] sm:h-[300px] opacity-75"
            >
              <defs>
                <linearGradient id="introWaveGradA" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.05" />
                  <stop offset="35%" stopColor="#14B8A6" stopOpacity={isDark ? '0.55' : '0.45'} />
                  <stop offset="65%" stopColor="#6366F1" stopOpacity={isDark ? '0.55' : '0.45'} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="introWaveGradB" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.04" />
                  <stop offset="40%" stopColor="#6366F1" stopOpacity={isDark ? '0.42' : '0.32'} />
                  <stop offset="70%" stopColor="#14B8A6" stopOpacity={isDark ? '0.42' : '0.32'} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              <g
                style={{
                  animation: 'introWaveDriftA 7.5s ease-in-out infinite',
                  transformOrigin: 'center',
                }}
              >
                <path
                  d="M0 160 C 150 65, 300 255, 450 160 C 600 65, 750 255, 900 160 C 1050 65, 1200 255, 1350 160 C 1500 65, 1650 255, 1800 160"
                  fill="none"
                  stroke="url(#introWaveGradA)"
                  strokeWidth="2.4"
                />
                <path
                  d="M0 160 C 150 225, 300 95, 450 160 C 600 225, 750 95, 900 160 C 1050 225, 1200 95, 1350 160 C 1500 225, 1650 95, 1800 160"
                  fill="none"
                  stroke="url(#introWaveGradB)"
                  strokeWidth="1.6"
                />
              </g>

              <g
                style={{
                  animation: 'introWaveDriftB 9.2s ease-in-out infinite',
                  transformOrigin: 'center',
                }}
              >
                <path
                  d="M0 160 C 180 105, 360 215, 540 160 C 720 105, 900 215, 1080 160 C 1260 105, 1440 215, 1620 160 C 1710 132, 1755 148, 1800 160"
                  fill="none"
                  stroke="url(#introWaveGradA)"
                  strokeWidth="1.8"
                  strokeOpacity="0.7"
                />
              </g>
            </svg>

            {/* Symmetrical Slow-Breathing Mic Equalizer Bars */}
            <div className="relative flex items-center justify-center gap-[5px] sm:gap-[7px] h-36 sm:h-44 opacity-45">
              {[
                18, 28, 42, 34, 56, 74, 48, 86, 64, 96, 78, 100, 78, 96, 64, 86, 48, 74, 56, 34,
                42, 28, 18,
              ].map((h, i) => (
                <span
                  key={i}
                  className="w-[2.5px] sm:w-[3px] rounded-full bg-gradient-to-t from-teal-500/70 via-indigo-500/70 to-violet-500/70 origin-center"
                  style={{
                    height: `${h}%`,
                    animation: `introBarBreathe ${2.4 + (i % 5) * 0.35}s ease-in-out ${
                      (i % 7) * 0.14
                    }s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Vocly Emblem + Letter-by-Letter Wordmark */}
            <div className="flex items-center gap-4">
              <div style={{ animation: 'cinematicLetter 0.7s cubic-bezier(0.22,1,0.36,1) both' }}>
                <VoclyMark size="lg" />
              </div>
              <div className="flex items-baseline text-6xl sm:text-8xl font-semibold tracking-[-0.045em]">
                {['V', 'o', 'c'].map((ch, i) => (
                  <span
                    key={ch}
                    className="inline-block"
                    style={{
                      animation: `cinematicLetter 0.75s cubic-bezier(0.22,1,0.36,1) ${
                        110 + i * 75
                      }ms both`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
                {['l', 'y'].map((ch, i) => (
                  <span
                    key={ch}
                    className="inline-block font-serif-editorial italic font-normal text-[68px] sm:text-[106px] bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent pr-0.5"
                    style={{
                      animation: `cinematicLetter 0.8s cubic-bezier(0.22,1,0.36,1) ${
                        340 + i * 85
                      }ms both`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Acoustic Expanding Horizon Line */}
            <div
              className="mt-5 h-[2px] w-44 sm:w-56 rounded-full bg-gradient-to-r from-transparent via-teal-500 to-transparent origin-center"
              style={{ animation: 'cinematicLine 0.85s cubic-bezier(0.22,1,0.36,1) 360ms both' }}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          1. TOP TEAL -> INDIGO SCROLL-PROGRESS BAR
         ==================================================================== */}
      <div className="fixed top-0 inset-x-0 h-[2.5px] z-[60] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 shadow-[0_0_12px_rgba(20,184,166,0.65)] transition-[width] duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ====================================================================
          2. DIRECTION-AWARE SMOOTHLY EXPANDING / COMPRESSING FLOATING NAVBAR
         ==================================================================== */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
        <nav
          className={`w-full pointer-events-auto flex items-center justify-between border backdrop-blur-xl rounded-full transition-[max-width,padding,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            navCompressed
              ? 'max-w-[228px] md:max-w-[310px] px-3 py-2'
              : 'max-w-5xl px-4 sm:px-5 py-2.5'
          } ${t.nav}`}
        >
          {/* Brand Logo + Always-Visible Brand Name */}
          <a href="#" className="group flex items-center gap-2 shrink-0">
            <VoclyMark size="sm" />
            <span className="text-[17px] font-semibold tracking-tight whitespace-nowrap">
              Voc
              <span className="font-serif-editorial italic font-normal text-[21px] bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                ly
              </span>
            </span>
          </a>

          {/* Center Scroll-Spy Links with RollText (Smoothly collapse/expand) */}
          <div
            className={`hidden md:flex items-center overflow-hidden whitespace-nowrap text-[13px] font-medium transition-[max-width,opacity,gap,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              navCompressed
                ? 'max-w-0 opacity-0 gap-0 px-0 pointer-events-none'
                : 'max-w-[560px] opacity-100 gap-1 px-1'
            }`}
          >
            {NAV_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <a
                  key={sec.id}
                  href={sec.href}
                  className={`group nav-link inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 ${SMOOTH} ${
                    isActive
                      ? isDark
                        ? 'active bg-teal-500/15 text-teal-300 border-teal-400/30 shadow-[0_0_18px_rgba(20,184,166,0.16)]'
                        : 'active bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                      : `border-transparent ${t.muted} ${
                          isDark ? 'hover:text-[#F8FAFC]' : 'hover:text-[#1C1917]'
                        }`
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  )}
                  <RollText text={sec.label} />
                </a>
              );
            })}
          </div>

          {/* Right Controls (Desktop) */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              onClick={() => setIsDark((v) => !v)}
              aria-label="Toggle light and dark theme"
              className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer shrink-0 ${SMOOTH} ${
                isDark
                  ? 'bg-white/[0.05] border-white/[0.1] text-teal-300 hover:bg-white/[0.1]'
                  : 'bg-[#EFE4CC] border-[#E3D5BA] text-[#57534E] hover:bg-[#E3D5BA]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                navCompressed
                  ? 'max-w-0 opacity-0 ml-0 pointer-events-none'
                  : 'max-w-[118px] opacity-100 ml-2'
              }`}
            >
              <SecondaryLink
                href="https://github.com/NikhilAmbure/Vocly"
                isDark={isDark}
                className="px-3.5 py-2 text-xs"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <RollText text="GitHub" />
              </SecondaryLink>
            </div>

            <PrimaryButton
              onClick={() => openDemoModal('freetalk', selectedLangId)}
              className="ml-2 px-4 py-2 text-xs shrink-0"
            >
              <RollText text="Try the demo" />
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </PrimaryButton>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDark((v) => !v)}
              aria-label="Toggle theme"
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                isDark
                  ? 'bg-white/[0.05] border-white/[0.1] text-teal-300'
                  : 'bg-[#EFE4CC] border-[#E3D5BA] text-[#57534E]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden fixed top-20 inset-x-4 max-w-5xl mx-auto pointer-events-auto rounded-3xl border p-5 animate-[fadeSlideUp_0.25s_ease-out] ${t.nav}`}
          >
            <div className="flex flex-col gap-2">
              {NAV_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={sec.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between text-sm font-medium px-3.5 py-2 rounded-full border ${
                      isActive
                        ? isDark
                          ? 'active bg-teal-500/15 text-teal-300 border-teal-400/30'
                          : 'active bg-teal-50 text-teal-700 border-teal-200'
                        : 'border-transparent'
                    }`}
                  >
                    <RollText text={sec.label} />
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                  </a>
                );
              })}
              <div className={`pt-3 mt-2 border-t flex flex-col gap-2.5 ${t.border}`}>
                <PrimaryButton
                  onClick={() => openDemoModal('freetalk', selectedLangId)}
                  className="w-full py-2.5 text-sm"
                >
                  <RollText text="Try the demo" />
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
                <SecondaryLink
                  href="https://github.com/NikhilAmbure/Vocly"
                  isDark={isDark}
                  className="w-full py-2.5 text-sm"
                >
                  <GithubIcon className="w-4 h-4" />
                  <RollText text="View on GitHub" />
                </SecondaryLink>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          3. CENTERED HERO + SCROLL-ZOOMING VOICE STUDIO STAGE
         ==================================================================== */}
      <section ref={heroScrollRef} className="relative lg:h-[360vh]">
        <div className="relative lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center pt-28 sm:pt-32 lg:pt-0 pb-16 lg:pb-0 px-4 sm:px-6">
          {/* Ambient Dark-Mode Glow Only (keeps Light Mode pure solid cream) */}
          {isDark && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 w-[840px] h-[440px] rounded-full blur-[130px] animate-aurora"
              style={{
                background:
                  'radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(99,102,241,0.16) 48%, transparent 78%)',
              }}
            />
          )}

          {/* Pointer-Reactive Topographic Acoustic Wave Canvas */}
          <HeroWaveCanvas
            isDark={isDark}
            isActive={isHeroListening || isStreamingSample || dockStatus === 'listening'}
          />

          {/* Centered Editorial Headline + Dual CTAs (staggered reveal after Vocly intro) */}
          <div
            className={`relative z-20 max-w-5xl mx-auto w-full lg:-mt-16 will-change-transform ${
              isDesktop && heroExit > 0.35 ? 'pointer-events-none' : ''
            }`}
            style={{
              transform: isDesktop
                ? `translate3d(0, ${(-heroExit * 64).toFixed(1)}px, 0) scale(${(
                    1 -
                    heroExit * 0.1
                  ).toFixed(3)})`
                : 'none',
              opacity: isDesktop ? Math.max(0, 1 - heroExit * 1.45) : 1,
            }}
          >
            <h1
              className="text-center text-[42px] sm:text-6xl lg:text-[78px] font-semibold tracking-[-0.035em] leading-[1.06] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? 'translateY(0px)' : 'translateY(24px)',
                transitionDelay: heroReady ? '120ms' : '0ms',
              }}
            >
              <span className="inline-block">Speak it.</span>{' '}
              <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent pr-1">
                Fix it.
              </span>{' '}
              <span
                className="inline-flex items-center justify-center align-middle mx-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#11141D] border border-teal-400/40 shadow-[0_0_28px_rgba(20,184,166,0.28)]"
                aria-hidden="true"
              >
                <AcousticEqualizer active={true} bars={7} height={22} onDark={true} />
              </span>{' '}
              <span className="inline-block">Own it.</span>
            </h1>

            <p
              className={`mt-5 max-w-2xl mx-auto text-center text-base sm:text-lg leading-relaxed transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${t.muted}`}
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? 'translateY(0px)' : 'translateY(20px)',
                transitionDelay: heroReady ? '240ms' : '0ms',
              }}
            >
              Vocly is a voice AI language tutor that lets you have real spoken conversations,
              corrects your mistakes gently in real time, and tracks your progress.
            </p>

            <div
              className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? 'translateY(0px)' : 'translateY(18px)',
                transitionDelay: heroReady ? '360ms' : '0ms',
              }}
            >
              <PrimaryButton
                onClick={() => openDemoModal('freetalk', selectedLangId)}
                className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-[15px]"
              >
                <Mic className="w-4 h-4" />
                <RollText text="Try the demo" />
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </PrimaryButton>

              <SecondaryLink
                href="https://github.com/NikhilAmbure/Vocly"
                isDark={isDark}
                className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-[15px]"
              >
                <GithubIcon className="w-4 h-4" />
                <RollText text="View on GitHub" />
              </SecondaryLink>
            </div>
          </div>

          {/* DESKTOP PEEKING -> ZOOMING VOICE STUDIO + SMART REVISION QUEUE STAGE */}
          <div className="hidden lg:flex absolute inset-0 z-10 items-center justify-center pointer-events-none">
            <div
              className="relative will-change-transform"
              style={{
                width: 820,
                height: 495,
                transform: `translate3d(0, ${((1 - zoomP) * 58 - 1.5).toFixed(1)}vh, 0) scale(${(
                  (0.9 + zoomP * 0.1) *
                  stageScale
                ).toFixed(3)})`,
              }}
            >
              {/* INTERACTIVE EDITORIAL VOICE STUDIO CARD */}
              <div
                className={`pointer-events-auto absolute top-2 w-[780px] rounded-[32px] border overflow-hidden will-change-transform ${
                  isDark
                    ? 'bg-[#10131C]/96 border-white/[0.12] shadow-[0_36px_100px_-24px_rgba(0,0,0,0.88)]'
                    : 'bg-[#FCF8EE] border-[#E3D5BA] shadow-[0_32px_90px_-24px_rgba(28,25,23,0.18)]'
                }`}
                style={{
                  left: '50%',
                  transform: `translate3d(calc(-50% + ${(-toLeftP * 175).toFixed(
                    1
                  )}px), 0, 0) scale(${(1 - toLeftP * 0.16).toFixed(3)})`,
                }}
              >
                {/* Studio Header */}
                <div
                  className={`px-7 py-4 border-b flex items-center justify-between gap-3 ${t.border}`}
                >
                  <div className="flex items-center gap-2">
                    {HERO_LANGUAGES.map((lang) => {
                      const active = lang.id === selectedLangId;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => handleSelectHeroLang(lang.id)}
                          className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${SMOOTH} ${
                            active
                              ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(20,184,166,0.35)]'
                              : isDark
                              ? 'bg-white/[0.06] text-[#CBD5E1] hover:text-white'
                              : 'bg-[#EFE4CC] text-[#57534E] hover:text-[#1C1917]'
                          }`}
                        >
                          <RollText text={lang.label} />
                          <span className="font-mono-tech text-[10.5px] opacity-80">
                            {lang.cefr}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnglishHints((v) => !v)}
                    className={`group inline-flex items-center gap-2 text-xs font-medium cursor-pointer ${
                      isDark ? 'text-[#CBD5E1]' : t.muted
                    }`}
                  >
                    <RollText text="English hints" />
                    <span
                      className={`w-9 h-5 rounded-full p-0.5 flex items-center ${SMOOTH} ${
                        englishHints
                          ? 'bg-teal-600 justify-end'
                          : isDark
                          ? 'bg-white/15 justify-start'
                          : 'bg-[#D6D3CD] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </span>
                  </button>
                </div>

                {/* Studio Conversation Stage */}
                <div className="px-8 pt-6 pb-7">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono-tech uppercase tracking-wider text-[11.5px] font-medium ${
                        isDark ? 'text-[#94A3B8]' : t.faint
                      }`}
                    >
                      {currentHeroLang.scenarioLabel}
                    </span>
                    <span className={`italic text-xs ${isDark ? 'text-[#94A3B8]' : t.faint}`}>
                      “{currentHeroLang.prompt}”
                    </span>
                  </div>

                  {/* Word-by-word Spoken Transcript with Animated Underline & Strikethrough */}
                  {heroLiveTranscript ? (
                    <p className="mt-4 text-[34px] font-semibold tracking-tight min-h-[48px]">
                      “{heroLiveTranscript}”
                    </p>
                  ) : (
                    <p className="mt-4 text-[34px] leading-tight font-semibold tracking-tight flex flex-wrap gap-x-3 min-h-[48px]">
                      {currentHeroLang.rawWords.map((w, i) => {
                        const shown = i < effectiveWordsShown;
                        const isMistake = currentHeroLang.mistakeIndices.includes(i);
                        return (
                          <span
                            key={`${selectedLangId}-${i}`}
                            className="relative inline-block transition-all duration-200"
                            style={{
                              opacity: shown
                                ? isMistake && effectiveFixP > 0
                                  ? 1 - effectiveFixP * 0.56
                                  : 1
                                : 0.16,
                              transform: `translateY(${shown ? 0 : 8}px)`,
                            }}
                          >
                            {w}
                            {isMistake && (
                              <>
                                <span
                                  className="absolute left-0 -bottom-0.5 h-[3.5px] rounded bg-indigo-500"
                                  style={{
                                    width: `${(isManualHeroActive ? 1 : underlineP) * 100}%`,
                                  }}
                                />
                                <span
                                  className="absolute left-0 top-1/2 h-[2.5px] bg-indigo-500"
                                  style={{ width: `${effectiveFixP * 100}%` }}
                                />
                              </>
                            )}
                          </span>
                        );
                      })}
                    </p>
                  )}

                  {/* Corrected Line with Smooth Wipe Reveal */}
                  <p
                    className="mt-3 text-[32px] leading-tight font-semibold tracking-tight bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent min-h-[42px]"
                    style={{
                      clipPath: `inset(0 ${((1 - effectiveFixP) * 100).toFixed(1)}% 0 0)`,
                      opacity: effectiveFixP > 0.02 ? 1 : 0,
                    }}
                  >
                    {currentHeroLang.correctedPhrase.replace(/^'|'$/g, '')}
                  </p>

                  {/* Elastic Pop-In Word-Level Pronunciation Clarity Chips */}
                  <div className="mt-4 flex flex-wrap gap-2 min-h-[34px]">
                    {currentHeroLang.wordScores.map((chip, i) => {
                      const pop = isManualHeroActive
                        ? 1
                        : easeOutBack(seg(heroZoom, 0.54 + i * 0.03, 0.64 + i * 0.03));
                      return (
                        <span
                          key={chip.word}
                          className={`inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-full border ${
                            isDark
                              ? 'bg-[#161B26] border-white/[0.1] text-[#F8FAFC]'
                              : 'bg-[#EFE4CC] border-[#E3D5BA] text-[#1C1917]'
                          }`}
                          style={{
                            transform: `scale(${Math.max(0, pop).toFixed(3)})`,
                            opacity: pop > 0.02 ? 1 : 0,
                          }}
                        >
                          <span className="font-semibold">{chip.word}</span>
                          <span className={`font-mono-tech text-xs font-semibold ${t.emeraldText}`}>
                            {chip.score}%
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Gentle Fix Bubble + Inline Live Voice Controls */}
                  <div
                    className={`mt-5 rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${
                      isDark
                        ? 'bg-gradient-to-br from-teal-500/[0.15] via-indigo-500/[0.1] to-transparent border-teal-400/35'
                        : 'bg-gradient-to-br from-teal-50/90 via-indigo-50/50 to-[#FCF8EE] border-teal-200/90'
                    }`}
                    style={{
                      opacity: Math.max(0.28, effectiveBubbleP),
                      transform: `translateY(${((1 - effectiveBubbleP) * 16).toFixed(1)}px)`,
                    }}
                  >
                    <div className="text-sm leading-relaxed">
                      <span
                        className={`font-mono-tech text-[11px] font-semibold uppercase block mb-0.5 ${t.accentText}`}
                      >
                        {currentHeroLang.fixTag}
                      </span>
                      <span className={isDark ? 'text-[#E2E8F0]' : 'text-[#1C1917]'}>
                        {englishHints ? currentHeroLang.englishHint : currentHeroLang.tutorTail}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleToggleHeroMic}
                        className={`group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer ${SMOOTH} ${
                          isHeroListening
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-teal-600 to-indigo-600 hover:brightness-110'
                        }`}
                      >
                        {isHeroListening ? (
                          <MicOff className="w-3.5 h-3.5" />
                        ) : (
                          <Mic className="w-3.5 h-3.5" />
                        )}
                        <RollText text={isHeroListening ? 'Stop' : 'Speak'} />
                      </button>
                      <button
                        type="button"
                        onClick={handlePlayHeroSample}
                        className={`group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold cursor-pointer ${
                          isDark
                            ? 'border-white/[0.14] bg-white/[0.06] text-white'
                            : 'border-[#E3D5BA] bg-[#EFE4CC] text-[#1C1917]'
                        }`}
                      >
                        {isStreamingSample ? (
                          <Square className="w-3 h-3 fill-teal-500 text-teal-500" />
                        ) : (
                          <Play className="w-3 h-3 fill-teal-600 text-teal-600" />
                        )}
                        <RollText text="Sample" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMART REVISION QUEUE + ANIMATED CLARITY RING CARD (SPLITS IN ON SCROLL) */}
              <div
                className={`absolute top-6 w-[340px] rounded-[30px] border p-7 shadow-2xl will-change-transform ${
                  isDark
                    ? 'bg-[#10131C] border-teal-400/30 text-[#F8FAFC]'
                    : 'bg-[#FCF8EE] border-teal-500/35 text-[#1C1917]'
                }`}
                style={{
                  left: '50%',
                  opacity: toLeftP,
                  pointerEvents: toLeftP > 0.35 ? 'auto' : 'none',
                  transform: `translate3d(calc(-50% + ${(315 + (1 - toLeftP) * 120).toFixed(
                    1
                  )}px), 0, 0) scale(${(0.86 + toLeftP * 0.14).toFixed(3)})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono-tech text-xs font-medium ${
                      isDark ? 'text-[#CBD5E1]' : t.faint
                    }`}
                  >
                    Smart Revision Queue
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="mt-5 flex items-center gap-5">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90 shrink-0">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke={isDark ? 'rgba(255,255,255,0.12)' : '#E3D5BA'}
                      strokeWidth="9"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#14B8A6"
                      strokeWidth="9"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={264}
                      strokeDashoffset={264 * (1 - 0.95 * ringP)}
                    />
                  </svg>
                  <div>
                    <div className="text-5xl font-semibold tracking-tight">
                      {Math.round(95 * ringP)}%
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-[#94A3B8]' : t.faint}`}>
                      clarity in 14 days
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5">
                  {revisionChips.map((chip, i) => {
                    const e = easeOutCubic(seg(heroZoom, 0.74 + i * 0.04, 0.86 + i * 0.04));
                    return (
                      <div
                        key={chip}
                        className={`flex items-center gap-2.5 text-sm font-medium rounded-xl border px-3.5 py-2.5 ${t.surfaceElevated}`}
                        style={{
                          opacity: e,
                          transform: `translate3d(${(-(1 - e) * 180).toFixed(1)}px, ${(
                            -(1 - e) * 24
                          ).toFixed(1)}px, 0)`,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                        <span>{chip}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className="inline-block px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-semibold font-mono-tech"
                    style={{ opacity: ringP }}
                  >
                    -{Math.round(42 * ringP)}% slips
                  </span>
                  <button
                    type="button"
                    onClick={() => openDemoModal('freetalk', selectedLangId)}
                    className={`group text-xs font-semibold cursor-pointer ${t.accentText}`}
                  >
                    <RollText text="Try live →" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Narrative Caption + Progress Rail (safely below the Studio card) */}
            <div
              className="pointer-events-none absolute bottom-[68px] inset-x-0 mx-auto w-[440px] max-w-[90vw] text-center"
              style={{ opacity: seg(heroZoom, 0.16, 0.3) }}
            >
              {HERO_STORY_CAPTIONS.map((c, i) => {
                const isActive = i === (activeCaptionIdx === -1 ? 0 : activeCaptionIdx);
                return (
                  <div
                    key={c.step}
                    className="absolute bottom-4 inset-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `translateY(${isActive ? 0 : 12}px)`,
                    }}
                  >
                    <div
                      className={`font-mono-tech text-[11px] font-semibold uppercase tracking-wider ${t.accentText}`}
                    >
                      {c.step}
                    </div>
                    <div className="text-xl font-semibold tracking-tight mt-0.5">{c.title}</div>
                    <p
                      className={`text-sm mt-0.5 leading-snug ${
                        isDark ? 'text-[#CBD5E1]' : t.muted
                      }`}
                    >
                      {c.desc}
                    </p>
                  </div>
                );
              })}
              <div className="h-[80px]" />
              <div className="flex items-center justify-center gap-2">
                {HERO_STORY_CAPTIONS.map((c, i) => {
                  const isActive = i === (activeCaptionIdx === -1 ? 0 : activeCaptionIdx);
                  return (
                    <span
                      key={c.step}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        isDark ? 'bg-teal-400' : 'bg-teal-600'
                      }`}
                      style={{
                        width: isActive ? 30 : 8,
                        opacity: isActive ? 1 : 0.25,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET COMPLETE VOICE STUDIO + CORRECTIONS STACK (< 1024px) */}
          <div className="lg:hidden relative z-10 mt-10 max-w-2xl mx-auto w-full space-y-4">
            <div
              className={`rounded-[26px] border overflow-hidden shadow-xl ${
                isDark ? 'bg-[#10131C] border-white/[0.1]' : 'bg-[#FCF8EE] border-[#E3D5BA]'
              }`}
            >
              {/* Mobile Language & Hints Header */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${t.border}`}
              >
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {HERO_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleSelectHeroLang(lang.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer ${
                        lang.id === selectedLangId
                          ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white'
                          : isDark
                          ? 'bg-white/[0.06] text-[#94A3B8]'
                          : 'bg-[#EFE4CC] text-[#57534E]'
                      }`}
                    >
                      {lang.label} · {lang.cefr}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setEnglishHints((v) => !v)}
                  aria-label="Toggle English hints"
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                    englishHints
                      ? 'bg-teal-600 text-white border-teal-600'
                      : `${t.surfaceElevated} ${t.muted}`
                  }`}
                >
                  Hints
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono-tech text-[10.5px] uppercase tracking-wider ${t.faint}`}>
                    {currentHeroLang.scenarioLabel}
                  </span>
                  <span className={`font-mono-tech text-[10.5px] ${t.emeraldText}`}>
                    {currentHeroLang.latency}
                  </span>
                </div>

                {/* You Said with Inline Mistake Highlights */}
                <div className={`rounded-2xl border p-4 space-y-2 ${t.surfaceElevated}`}>
                  <span className={`font-mono-tech text-[10px] uppercase tracking-wider ${t.faint}`}>
                    You said
                  </span>
                  {heroLiveTranscript ? (
                    <p className="text-lg font-semibold leading-snug">“{heroLiveTranscript}”</p>
                  ) : (
                    <p className="text-lg font-semibold leading-snug flex flex-wrap gap-x-1.5">
                      {currentHeroLang.rawWords.map((word, idx) => {
                        const isMistake = currentHeroLang.mistakeIndices.includes(idx);
                        return (
                          <span
                            key={`${selectedLangId}-m-${idx}`}
                            className={
                              isMistake
                                ? 'line-through decoration-indigo-500 decoration-2 opacity-65'
                                : ''
                            }
                          >
                            {word}
                          </span>
                        );
                      })}
                    </p>
                  )}

                  {/* Corrected Phrase */}
                  <p className="text-lg font-semibold leading-snug bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {currentHeroLang.correctedPhrase.replace(/^'|'$/g, '')}
                  </p>

                  {/* Word Clarity Chips */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {currentHeroLang.wordScores.map((chip) => (
                      <span
                        key={chip.word}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${t.surface}`}
                      >
                        <span className="font-medium">{chip.word}</span>
                        <span className={`font-mono-tech text-[11px] font-semibold ${t.emeraldText}`}>
                          {chip.score}%
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vocly Gentle Fix Card */}
                <div
                  className={`rounded-2xl border p-4 space-y-1.5 ${
                    isDark
                      ? 'bg-gradient-to-br from-teal-500/[0.14] via-indigo-500/[0.08] to-transparent border-teal-400/30'
                      : 'bg-gradient-to-br from-teal-50/90 via-indigo-50/45 to-[#FCF8EE] border-teal-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono-tech text-[10.5px] font-semibold uppercase ${t.accentText}`}>
                      {currentHeroLang.fixTag}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-sm leading-relaxed">
                    {currentHeroLang.tutorLead}
                    <span className={`font-semibold ${t.accentText}`}>
                      {currentHeroLang.correctedPhrase}
                    </span>
                    {currentHeroLang.tutorTail}
                  </p>
                  {englishHints && (
                    <p className={`text-xs pt-1.5 border-t ${t.border} ${t.muted}`}>
                      {currentHeroLang.englishHint}
                    </p>
                  )}
                </div>

                {/* Mobile Voice Controls */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleHeroMic}
                    className={`group flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer ${
                      isHeroListening
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-teal-600 to-indigo-600'
                    }`}
                  >
                    {isHeroListening ? (
                      <MicOff className="w-3.5 h-3.5" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                    <RollText text={isHeroListening ? 'Listening…' : 'Speak'} />
                  </button>
                  <button
                    type="button"
                    onClick={handlePlayHeroSample}
                    className={`group flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-xs font-medium cursor-pointer ${t.surfaceElevated}`}
                  >
                    <Play className="w-3 h-3 fill-teal-600 text-teal-600" />
                    <RollText text="Play Sample" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Compact Smart Revision Summary Card */}
            <div
              className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${t.surface}`}
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 64 64" className="w-12 h-12 -rotate-90 shrink-0">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E3D5BA'}
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#14B8A6"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={163}
                    strokeDashoffset={163 * 0.05}
                  />
                </svg>
                <div>
                  <div className="text-sm font-semibold">95% clarity · -42% slips</div>
                  <div className={`text-xs ${t.faint}`}>
                    Saved to your Smart Revision Queue
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openDemoModal('freetalk', selectedLangId)}
                className={`group text-xs font-semibold shrink-0 cursor-pointer ${t.accentText}`}
              >
                <RollText text="Practice →" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. INFINITE LANGUAGE & SCENARIO TICKER
         ==================================================================== */}
      <div className={`relative border-y py-4 overflow-hidden ${t.border}`}>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r ${
            isDark ? 'from-[#080A0F]' : 'from-[#F5ECD7]'
          } to-transparent`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l ${
            isDark ? 'from-[#080A0F]' : 'from-[#F5ECD7]'
          } to-transparent`}
        />

        <div className="flex w-max animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-5 shrink-0">
              <span className={`text-xs sm:text-sm font-medium tracking-tight ${t.muted}`}>
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500" />
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          REST OF PAGE WRAPPER WITH STICKY ACOUSTIC DOT-MATRIX BACKGROUND
         ==================================================================== */}
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <AcousticDotMatrixCanvas
              isDark={isDark}
              isActive={dockStatus === 'listening' || hearingOpening}
            />
          </div>
        </div>

        <div className="relative z-10">
          {/* ================================================================
              5. SECTION #why — PROBLEM -> SOLUTION EDITORIAL CONTRAST
             ================================================================ */}
          <section id="why" className="scroll-mt-24 py-24 sm:py-32 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-0 items-start">
                <Reveal className="md:pr-12 lg:pr-16">
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.faint}`}
                  >
                    Old Language Apps
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-tight">
                    Tapping screens never taught you{' '}
                    <span className={`font-serif-editorial italic font-normal ${t.faint}`}>
                      to speak.
                    </span>
                  </h2>

                  <ul className="mt-8 space-y-6">
                    {[
                      {
                        title: 'Reading & tapping only',
                        desc: 'Flashcards and matching tiles don’t train real-time spoken reflexes.',
                      },
                      {
                        title: 'Shyness & fear of judgment',
                        desc: 'Hesitating in front of native speakers means you practice far less.',
                      },
                      {
                        title: 'Expensive human tutors',
                        desc: 'Hard to book, costly per hour, and rarely available for quick daily reps.',
                      },
                    ].map((item) => (
                      <li key={item.title} className={`pl-4 border-l ${t.border}`}>
                        <div className={`text-base font-medium ${t.muted}`}>{item.title}</div>
                        <p className={`mt-1 text-sm leading-relaxed ${t.faint}`}>{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal
                  delay={120}
                  className="md:pl-12 lg:pl-16 md:border-l md:border-teal-500/40"
                >
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                  >
                    Why Vocly
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-tight">
                    Your 24/7 voice partner,{' '}
                    <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      zero judgment.
                    </span>
                  </h2>

                  <ul className="mt-8 space-y-6">
                    {[
                      {
                        title: 'Real spoken conversations',
                        desc: 'Talk out loud in realistic scenes with instant, natural voice replies.',
                      },
                      {
                        title: 'Private & judgment-free',
                        desc: 'Make mistakes freely in private while Vocly guides you gently.',
                      },
                      {
                        title: '24/7 adaptive voice partner',
                        desc: 'Always ready for 3-minute warm-ups or deep roleplays across A1–C1.',
                      },
                    ].map((item) => (
                      <li key={item.title} className="pl-4 border-l-2 border-teal-500">
                        <div className="text-base font-semibold">{item.title}</div>
                        <p className={`mt-1 text-sm leading-relaxed ${t.muted}`}>{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================================================================
              6. SECTION #how-it-works — ALIGNED 3-STEP FLOW WITH INLINE CONNECTORS
             ================================================================ */}
          <section
            id="how-it-works"
            className={`scroll-mt-24 py-24 sm:py-32 px-4 sm:px-6 border-y ${t.border}`}
          >
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                  >
                    How It Works
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
                    Three simple steps{' '}
                    <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      to speak with confidence.
                    </span>
                  </h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-stretch">
                {/* STEP 01 */}
                <Reveal delay={0} className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className={`w-12 h-12 rounded-full border flex items-center justify-center font-mono-tech text-xs font-semibold shrink-0 ${
                        isDark
                          ? 'bg-[#10131C] border-teal-400/40 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.18)]'
                          : 'bg-[#FCF8EE] border-teal-200 text-teal-700 shadow-sm'
                      }`}
                    >
                      01
                    </span>
                    <span
                      className={`font-mono-tech text-[11px] uppercase tracking-wider shrink-0 ${t.faint}`}
                    >
                      Setup
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden md:block flex-1 h-[1.5px] ml-2 bg-gradient-to-r from-teal-500/45 to-indigo-500/45 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight leading-snug">
                    Pick your language, level & scenario
                  </h3>
                  <p className={`mt-2.5 text-sm leading-relaxed ${t.muted}`}>
                    Choose English, German, Japanese, or French (CEFR A1–C1) and a real-world
                    situation like a café, travel, or job interview.
                  </p>

                  <div className="mt-auto pt-6">
                    <div
                      className={`rounded-2xl border p-4 min-h-[116px] flex flex-col justify-between gap-2.5 ${t.surface}`}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {['English', 'German', 'Japanese', 'French'].map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setStepLang(lang)}
                            className={`group px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer ${SMOOTH} ${
                              stepLang === lang
                                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white'
                                : isDark
                                ? 'bg-white/[0.06] text-[#94A3B8] hover:text-white'
                                : 'bg-[#EFE4CC] text-[#57534E] hover:text-[#1C1917]'
                            }`}
                          >
                            <RollText text={lang} />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className={`font-mono-tech ${t.accentText}`}>
                          {stepLang} · A1–C1
                        </span>
                        <span className={t.faint}>Café · Travel · Interview</span>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* STEP 02 */}
                <Reveal delay={100} className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className={`w-12 h-12 rounded-full border flex items-center justify-center font-mono-tech text-xs font-semibold shrink-0 ${
                        isDark
                          ? 'bg-[#10131C] border-indigo-400/40 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.18)]'
                          : 'bg-[#FCF8EE] border-indigo-200 text-indigo-700 shadow-sm'
                      }`}
                    >
                      02
                    </span>
                    <span
                      className={`font-mono-tech text-[11px] uppercase tracking-wider shrink-0 ${t.faint}`}
                    >
                      Converse
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden md:block flex-1 h-[1.5px] ml-2 bg-gradient-to-r from-indigo-500/45 to-violet-500/45 rounded-full"
                    />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight leading-snug">
                    Talk naturally, out loud
                  </h3>
                  <p className={`mt-2.5 text-sm leading-relaxed ${t.muted}`}>
                    Speak freely with low-latency voice replies. Cut in mid-sentence anytime—just
                    like talking to a patient human partner.
                  </p>

                  <div className="mt-auto pt-6">
                    <div
                      className={`rounded-2xl border p-4 min-h-[116px] flex flex-col justify-between gap-2.5 ${t.surface}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          Live voice stream
                        </span>
                        <span className={`font-mono-tech text-[10.5px] ${t.faint}`}>170ms</span>
                      </div>
                      <div className="py-1 flex items-center justify-between gap-2">
                        <AcousticEqualizer active={true} bars={12} height={22} onDark={isDark} />
                        <span
                          className={`font-mono-tech text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                            isDark
                              ? 'bg-indigo-500/15 text-indigo-300'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          Barge-in ON
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* STEP 03 */}
                <Reveal delay={200} className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className={`w-12 h-12 rounded-full border flex items-center justify-center font-mono-tech text-xs font-semibold shrink-0 ${
                        isDark
                          ? 'bg-[#10131C] border-violet-400/40 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.18)]'
                          : 'bg-[#FCF8EE] border-violet-200 text-violet-700 shadow-sm'
                      }`}
                    >
                      03
                    </span>
                    <span
                      className={`font-mono-tech text-[11px] uppercase tracking-wider shrink-0 ${t.faint}`}
                    >
                      Improve
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight leading-snug">
                    Get gentle fixes & grow
                  </h3>
                  <p className={`mt-2.5 text-sm leading-relaxed ${t.muted}`}>
                    Receive instant, simple grammar and pronunciation feedback, a session recap,
                    and smart revision for words you missed.
                  </p>

                  <div className="mt-auto pt-6">
                    <div
                      className={`rounded-2xl border p-4 min-h-[116px] flex flex-col justify-between gap-1.5 ${t.surface}`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`line-through ${t.faint}`}>go to market</span>
                        <span className={`font-mono-tech font-medium ${t.emeraldText}`}>
                          95% clarity
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>went to the market</span>
                      </div>
                      <div className={`text-[11px] ${t.faint}`}>Saved to Smart Revision Queue</div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================================================================
              7. SECTION #stages — CEFR MASTERY PASSPORT SHUFFLING DECK
             ================================================================ */}
          <section
            id="stages"
            ref={stagesScrollRef}
            className={`scroll-mt-24 relative lg:h-[270vh] border-b ${t.border}`}
          >
            <div className="relative lg:sticky lg:top-0 lg:h-screen flex items-center py-24 lg:py-0 px-4 sm:px-6 overflow-hidden">
              <AmbientSoundWaves idPrefix="stages" isDark={isDark} className="opacity-50" />
              <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Column: Shuffling CEFR Mastery Passport Deck */}
                <div className="lg:col-span-7 order-2 lg:order-1">
                  {/* Desktop Scroll-Shuffling Stack */}
                  <div className="hidden lg:block relative h-[430px] w-full">
                    {FLUENCY_STAGES.map((stage, idx) => {
                      const style = getShuffleCardStyle(idx, stagesShuffle, 3, -1);
                      const circ = 138;
                      return (
                        <div
                          key={stage.id}
                          className={`absolute inset-0 rounded-[32px] border overflow-hidden shadow-2xl flex flex-col will-change-transform ${
                            isDark
                              ? 'bg-[#10131C] border-white/[0.12]'
                              : 'bg-[#FCF8EE] border-[#E3D5BA]'
                          }`}
                          style={style}
                        >
                          {/* Vibrant Passport Header Band */}
                          <div
                            className={`relative px-7 py-5 bg-gradient-to-r ${stage.gradient} text-white flex items-center justify-between overflow-hidden`}
                          >
                            <div className="relative z-10">
                              <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-white/80 block">
                                {stage.badge}
                              </span>
                              <div className="text-2xl font-semibold tracking-tight mt-0.5">
                                {stage.title}
                              </div>
                            </div>

                            {/* Circular Clarity Gauge */}
                            <div className="relative z-10 flex items-center gap-2.5 bg-black/20 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/20">
                              <svg viewBox="0 0 54 54" className="w-11 h-11 -rotate-90">
                                <circle
                                  cx="27"
                                  cy="27"
                                  r="22"
                                  stroke="rgba(255,255,255,0.25)"
                                  strokeWidth="4.5"
                                  fill="none"
                                />
                                <circle
                                  cx="27"
                                  cy="27"
                                  r="22"
                                  stroke="#FFFFFF"
                                  strokeWidth="4.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={circ}
                                  strokeDashoffset={circ * (1 - stage.clarity / 100)}
                                />
                              </svg>
                              <div>
                                <div className="text-base font-bold leading-none">
                                  {stage.clarity}%
                                </div>
                                <div className="font-mono-tech text-[9px] uppercase text-white/80 mt-0.5">
                                  Clarity
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Passport Card Body */}
                          <div className="flex-1 p-7 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span
                                  className={`font-mono-tech text-xs font-semibold ${t.accentText}`}
                                >
                                  CEFR {stage.cefr}
                                </span>
                                <span
                                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${t.surfaceElevated} ${t.muted}`}
                                >
                                  {stage.metricLabel}:{' '}
                                  <strong className="font-semibold">{stage.metricValue}</strong>
                                </span>
                              </div>
                              <p className={`text-sm leading-relaxed ${t.muted}`}>{stage.desc}</p>
                            </div>

                            {/* Editorial Pull-Quote + Action */}
                            <div className="space-y-4">
                              <div
                                className={`rounded-2xl border p-4 relative ${t.surfaceElevated}`}
                              >
                                <span
                                  className={`font-mono-tech text-[9.5px] uppercase tracking-wider block mb-1 ${t.faint}`}
                                >
                                  Sample Spoken Milestone
                                </span>
                                <p className="font-serif-editorial italic text-xl leading-snug">
                                  {stage.quote}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${stage.gradient}`}
                                    style={{ width: `${stage.clarity}%` }}
                                  />
                                </div>
                                <PrimaryButton
                                  onClick={() => openDemoModal(stage.scenarioId, selectedLangId)}
                                  className="px-4 py-2 text-xs shrink-0"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                  <RollText text={stage.cta} />
                                </PrimaryButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile / Tablet Stacked Mastery Passports */}
                  <div className="lg:hidden space-y-5">
                    {FLUENCY_STAGES.map((stage) => (
                      <div
                        key={stage.id}
                        className={`rounded-[26px] border overflow-hidden shadow-md ${t.surface}`}
                      >
                        <div
                          className={`px-5 py-4 bg-gradient-to-r ${stage.gradient} text-white flex items-center justify-between`}
                        >
                          <div>
                            <span className="font-mono-tech text-[10px] uppercase tracking-wider text-white/80 block">
                              {stage.badge}
                            </span>
                            <h3 className="text-xl font-semibold">{stage.title}</h3>
                          </div>
                          <span className="font-mono-tech text-xs font-bold px-2.5 py-1 rounded-full bg-black/20 border border-white/20">
                            {stage.cefr}
                          </span>
                        </div>
                        <div className="p-5 space-y-3.5">
                          <p className={`text-sm leading-relaxed ${t.muted}`}>{stage.desc}</p>
                          <div className={`rounded-xl border p-3 ${t.surfaceElevated}`}>
                            <p className="font-serif-editorial italic text-lg leading-snug">
                              {stage.quote}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className={`font-mono-tech text-xs font-semibold ${t.emeraldText}`}>
                              {stage.clarity}% clarity · {stage.metricValue}
                            </span>
                            <PrimaryButton
                              onClick={() => openDemoModal(stage.scenarioId, selectedLangId)}
                              className="px-4 py-2 text-xs"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <RollText text={stage.cta} />
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Narrative Header & Live CEFR Stage Rail */}
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                  <div>
                    <span
                      className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                    >
                      Stages of Spoken Fluency
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
                      Built for every{' '}
                      <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                        CEFR milestone.
                      </span>
                    </h2>
                    <p className={`mt-3 text-sm sm:text-base leading-relaxed ${t.muted}`}>
                      Vocly automatically calibrates its pace, hint depth, and grammar feedback as
                      you climb from A1 to C1.
                    </p>
                  </div>

                  <div className="hidden lg:flex flex-col gap-2.5 pt-2">
                    {FLUENCY_STAGES.map((stage, idx) => {
                      const active = activeStageIdx === idx;
                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                            active
                              ? isDark
                                ? 'bg-teal-500/12 border-teal-400/35 text-white'
                                : 'bg-[#FCF8EE] border-teal-500/40 text-[#1C1917] shadow-sm'
                              : `border-transparent opacity-55 ${t.muted}`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${stage.gradient}`}
                            />
                            <div>
                              <div className="text-sm font-semibold leading-tight">
                                {stage.title}
                              </div>
                              <div className={`text-[11px] ${t.faint}`}>{stage.subtitle}</div>
                            </div>
                          </div>
                          <span className={`font-mono-tech text-[11px] font-semibold ${t.accentText}`}>
                            {stage.cefr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              8. SECTION #scenarios — ORGANIC INTERACTIVE FLUENCY TREE
             ================================================================ */}
          <section
            id="scenarios"
            className="relative scroll-mt-24 py-24 sm:py-32 px-4 sm:px-6 overflow-hidden"
          >
            <AmbientSoundWaves
              idPrefix="scenarios"
              isDark={isDark}
              withBars={true}
              className="opacity-75 translate-y-6"
            />
            <div className="relative z-10 max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                  >
                    Scenarios · Fluency Tree
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
                    One voice,{' '}
                    <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      branching into real life.
                    </span>
                  </h2>
                  <p className={`mt-3 text-sm sm:text-base ${t.muted}`}>
                    Hover any branch of the tree to preview the voice opener and jump straight into
                    practice.
                  </p>
                </div>
              </Reveal>

              {/* Desktop Organic Fluency Tree */}
              <div className="hidden lg:block relative h-[520px] w-full">
                <svg
                  viewBox="0 0 1000 520"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="voclyBranchGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#0D9488" />
                      <stop offset="55%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>

                  <ellipse
                    cx="500"
                    cy="486"
                    rx="135"
                    ry="14"
                    fill={isDark ? 'rgba(20,184,166,0.12)' : 'rgba(13,148,136,0.12)'}
                  />

                  <path
                    d="M 500 475 L 500 390"
                    stroke={isDark ? 'rgba(255,255,255,0.18)' : '#D5C4A1'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {TREE_BRANCHES.map((branch) => {
                    const active = hoveredBranchId === branch.id;
                    return (
                      <g key={branch.id}>
                        <path
                          d={branch.path}
                          stroke={isDark ? 'rgba(255,255,255,0.12)' : '#D9C9A8'}
                          strokeWidth={active ? '3' : '2'}
                          strokeLinecap="round"
                          fill="none"
                        />
                        {active && (
                          <path
                            d={branch.path}
                            stroke="url(#voclyBranchGrad)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="10 8"
                            fill="none"
                            className="animate-branch-flow"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {TREE_BRANCHES.map((branch) => {
                  const sc = SCENARIOS.find((s) => s.id === branch.id);
                  if (!sc) return null;
                  const Icon = sc.icon;
                  const isHovered = hoveredBranchId === branch.id;

                  const popoverAlign =
                    branch.popoverSide === 'left'
                      ? 'left-0'
                      : branch.popoverSide === 'right'
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2';

                  return (
                    <div
                      key={branch.id}
                      onMouseEnter={() => {
                        setHoveredBranchId(branch.id);
                        setHearingOpening(false);
                      }}
                      onMouseLeave={() => {
                        setHoveredBranchId(null);
                        setHearingOpening(false);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${branch.x}%`,
                        top: `${branch.y}%`,
                        zIndex: isHovered ? 35 : 15,
                      }}
                    >
                      {isHovered && (
                        <div
                          className={`absolute ${
                            branch.y < 25 ? 'top-full pt-3' : 'bottom-full pb-3'
                          } ${popoverAlign} w-[330px] z-40 animate-[fadeSlideUp_0.2s_ease-out]`}
                        >
                          <div
                            className={`rounded-2xl border p-5 shadow-2xl ${
                              isDark
                                ? 'bg-[#111521] border-teal-400/35 text-[#F8FAFC]'
                                : 'bg-[#FCF8EE] border-teal-500/40 text-[#1C1917]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`font-mono-tech text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isDark
                                    ? 'bg-teal-500/15 text-teal-300'
                                    : 'bg-teal-50 text-teal-700'
                                }`}
                              >
                                CEFR {sc.level}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 font-mono-tech text-[10px] ${t.faint}`}
                              >
                                <Clock className="w-3 h-3" />
                                {sc.duration}
                              </span>
                            </div>

                            <p className={`text-xs leading-relaxed mb-3 ${t.muted}`}>
                              {sc.summary}
                            </p>

                            <div className={`rounded-xl border p-3 mb-3 space-y-2 ${t.surfaceElevated}`}>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-mono-tech text-[9.5px] uppercase tracking-wider ${t.accentText}`}
                                >
                                  Voice Opener
                                </span>
                                <button
                                  type="button"
                                  onClick={handleToggleHearOpening}
                                  className={`group inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium cursor-pointer ${
                                    hearingOpening
                                      ? 'bg-teal-600 text-white'
                                      : isDark
                                      ? 'bg-white/10 text-teal-300'
                                      : 'bg-[#FCF8EE] text-teal-700 border border-[#E3D5BA]'
                                  }`}
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <RollText text={hearingOpening ? 'Playing…' : 'Hear'} />
                                </button>
                              </div>
                              <p className="text-xs font-medium leading-snug">{sc.opening}</p>
                              <AcousticEqualizer
                                active={hearingOpening}
                                bars={14}
                                height={16}
                                onDark={isDark}
                              />
                            </div>

                            <PrimaryButton
                              onClick={() => openDemoModal(sc.id, selectedLangId)}
                              className="w-full py-2 text-xs"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <RollText text="Practice now" />
                              <ArrowRight className="w-3.5 h-3.5" />
                            </PrimaryButton>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openDemoModal(sc.id, selectedLangId)}
                        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full border cursor-pointer ${SMOOTH} ${
                          isHovered
                            ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white border-transparent shadow-[0_12px_30px_-6px_rgba(20,184,166,0.5)] scale-105'
                            : `${t.surface} hover:border-teal-500/50 shadow-sm`
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isHovered
                              ? 'bg-white/20 text-white'
                              : isDark
                              ? 'bg-teal-500/15 text-teal-300'
                              : 'bg-[#EFE4CC] text-teal-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="text-left pr-1">
                          <div className="text-xs font-semibold leading-tight whitespace-nowrap">
                            {sc.label}
                          </div>
                          <div
                            className={`font-mono-tech text-[9.5px] ${
                              isHovered ? 'text-white/80' : t.faint
                            }`}
                          >
                            {sc.level}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}

                <div className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20">
                  <div
                    className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border shadow-md ${
                      isDark
                        ? 'bg-[#10131C] border-teal-400/35 text-white'
                        : 'bg-[#FCF8EE] border-teal-500/35 text-[#1C1917]'
                    }`}
                  >
                    <VoclyMark size="sm" />
                    <div>
                      <div className="text-xs font-semibold leading-tight">Your Voice</div>
                      <div className={`font-mono-tech text-[9.5px] ${t.accentText}`}>
                        Hover a branch above
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Responsive Branching Tree */}
              <div className="lg:hidden relative pl-6 space-y-4">
                <div
                  aria-hidden="true"
                  className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-gradient-to-b from-teal-500/50 via-indigo-500/40 to-violet-500/30 rounded-full"
                />

                {SCENARIOS.map((sc) => {
                  const Icon = sc.icon;
                  const open = mobileExpandedScenarioId === sc.id;
                  return (
                    <div key={sc.id} className="relative">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[19px] top-5 w-3 h-3 rounded-full border-2 ${
                          open
                            ? 'bg-teal-500 border-teal-300'
                            : isDark
                            ? 'bg-[#10131C] border-white/25'
                            : 'bg-[#FCF8EE] border-[#D5C4A1]'
                        }`}
                      />
                      <div className={`rounded-2xl border overflow-hidden ${t.surface}`}>
                        <button
                          type="button"
                          onClick={() => setMobileExpandedScenarioId(open ? '' : sc.id)}
                          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                open
                                  ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white'
                                  : isDark
                                  ? 'bg-white/[0.06] text-teal-300'
                                  : 'bg-[#EFE4CC] text-teal-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold">{sc.label}</div>
                              <div className={`font-mono-tech text-[10px] ${t.faint}`}>
                                CEFR {sc.level} · {sc.duration}
                              </div>
                            </div>
                          </div>
                          <Plus
                            className={`w-4 h-4 text-teal-600 ${SMOOTH} ${
                              open ? 'rotate-45' : 'rotate-0'
                            }`}
                          />
                        </button>

                        {open && (
                          <div className={`px-4 pb-4 pt-1 border-t space-y-3 ${t.border}`}>
                            <p className={`text-xs leading-relaxed ${t.muted}`}>{sc.summary}</p>
                            <div className={`rounded-xl border p-3 text-xs ${t.surfaceElevated}`}>
                              <span
                                className={`font-mono-tech text-[10px] uppercase block mb-1 ${t.accentText}`}
                              >
                                Voice Opener
                              </span>
                              {sc.opening}
                            </div>
                            <PrimaryButton
                              onClick={() => openDemoModal(sc.id, selectedLangId)}
                              className="w-full py-2.5 text-xs"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <RollText text="Practice this scenario" />
                            </PrimaryButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================================================================
              9. SECTION #progress — PROGRESS DASHBOARD PREVIEW
             ================================================================ */}
          <section
            id="progress"
            className={`relative scroll-mt-24 py-24 sm:py-32 px-4 sm:px-6 border-t overflow-hidden ${t.border}`}
          >
            <AmbientSoundWaves
              idPrefix="progress"
              isDark={isDark}
              className="opacity-65 translate-y-12"
            />
            <div className="relative z-10 max-w-5xl mx-auto">
              <Reveal>
                <div className="max-w-2xl mb-12">
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                  >
                    Progress Dashboard
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
                    Track every minute,{' '}
                    <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      master every pattern.
                    </span>
                  </h2>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div
                  className={`rounded-[32px] border overflow-hidden ${
                    isDark
                      ? 'bg-[#10131C] border-white/[0.08] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.8)]'
                      : 'bg-[#FCF8EE] border-[#E3D5BA] shadow-[0_28px_80px_-30px_rgba(28,25,23,0.1)]'
                  }`}
                >
                  <div
                    className={`px-6 sm:px-9 py-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${t.border} ${
                      isDark
                        ? 'bg-gradient-to-r from-teal-500/14 via-indigo-500/10 to-transparent'
                        : 'bg-gradient-to-r from-teal-50/85 via-indigo-50/50 to-[#FCF8EE]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <VoclyMark />
                      <p className="text-sm sm:text-base font-medium leading-snug">
                        “Last time you struggled with past tense, let’s practice that.”
                      </p>
                    </div>
                    <PrimaryButton
                      onClick={() => openDemoModal('freetalk', 'en')}
                      className="px-5 py-2.5 text-xs shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <RollText text="Start warm-up" />
                    </PrimaryButton>
                  </div>

                  <div
                    className={`grid grid-cols-3 divide-x border-b ${t.border} ${
                      isDark ? 'divide-white/[0.08]' : 'divide-[#E3D5BA]'
                    }`}
                  >
                    {[
                      { label: 'min practiced', target: 142, suffix: '' },
                      { label: 'new words', target: 64, suffix: '' },
                      { label: 'clarity', target: 92, suffix: '%' },
                    ].map((metric) => (
                      <div key={metric.label} className="px-4 sm:px-9 py-6">
                        <div className="text-2xl sm:text-4xl font-semibold tracking-tight">
                          <CountUp target={metric.target} suffix={metric.suffix} />
                        </div>
                        <div
                          className={`mt-1 font-mono-tech text-[11px] uppercase tracking-wider ${t.faint}`}
                        >
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x ${
                      isDark ? 'divide-white/[0.08]' : 'divide-[#E3D5BA]'
                    }`}
                  >
                    <div className="md:col-span-6 p-6 sm:p-9 flex flex-col justify-between gap-8">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-sm font-semibold">Weekly Speaking Time</h3>
                            <p className={`text-xs ${t.faint}`}>Hover any bar to inspect</p>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono-tech text-xs font-semibold ${t.accentText}`}>
                              {WEEKLY_DATA.find((d) => d.day === hoveredDay)?.mins} mins
                            </div>
                            <div className={`font-mono-tech text-[10.5px] ${t.faint}`}>
                              +{WEEKLY_DATA.find((d) => d.day === hoveredDay)?.words} words
                            </div>
                          </div>
                        </div>

                        <div className="h-40 flex items-end justify-between gap-2.5 pt-4">
                          {WEEKLY_DATA.map((d) => {
                            const pct = Math.round((d.mins / 32) * 100);
                            const active = hoveredDay === d.day;
                            return (
                              <button
                                key={d.day}
                                onMouseEnter={() => setHoveredDay(d.day)}
                                onClick={() => setHoveredDay(d.day)}
                                className="flex-1 h-full flex flex-col items-center justify-end gap-2 cursor-pointer group"
                              >
                                <div className="w-full h-full flex items-end justify-center">
                                  <div
                                    className={`w-full max-w-[30px] rounded-t-lg ${SMOOTH} ${
                                      active
                                        ? 'bg-gradient-to-t from-teal-600 via-indigo-500 to-violet-500 shadow-[0_8px_20px_rgba(99,102,241,0.38)]'
                                        : isDark
                                        ? 'bg-white/[0.08] group-hover:bg-teal-500/45'
                                        : 'bg-[#E3D5BA] group-hover:bg-teal-500/45'
                                    }`}
                                    style={{ height: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  className={`font-mono-tech text-[10.5px] ${
                                    active ? `${t.accentText} font-semibold` : t.faint
                                  }`}
                                >
                                  {d.day}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`pt-6 border-t space-y-3.5 ${t.border}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Mistake-Drop Trends (30d)</span>
                          <span className={`font-mono-tech text-[10.5px] ${t.emeraldText}`}>
                            Improving
                          </span>
                        </div>
                        {MISTAKE_TRENDS.map((m) => (
                          <div key={m.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className={t.muted}>{m.label}</span>
                              <span className="font-mono-tech text-[11px]">
                                <span className={t.emeraldText}>{m.drop} mistakes</span>
                                <span className={`ml-2 ${t.faint}`}>{m.accuracy}%</span>
                              </span>
                            </div>
                            <div
                              className={`h-1.5 rounded-full overflow-hidden ${
                                isDark ? 'bg-white/[0.08]' : 'bg-[#E3D5BA]'
                              }`}
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500"
                                style={{ width: `${m.accuracy}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-6 p-6 sm:p-9">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-sm font-semibold">Smart Revision Queue</h3>
                          <p className={`text-xs ${t.faint}`}>Click any item to mark reviewed</p>
                        </div>
                        <span
                          className={`font-mono-tech text-[10.5px] px-2.5 py-0.5 rounded-full ${
                            isDark
                              ? 'bg-teal-500/15 text-teal-300'
                              : 'bg-teal-50 text-teal-700'
                          }`}
                        >
                          {REVISION_ITEMS.length - masteredIds.length} due
                        </span>
                      </div>

                      <div className="space-y-3">
                        {REVISION_ITEMS.map((item) => {
                          const done = masteredIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleMastered(item.id)}
                              className={`w-full text-left rounded-2xl border p-4 cursor-pointer ${SMOOTH} ${
                                done
                                  ? isDark
                                    ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75'
                                    : 'bg-emerald-50/70 border-emerald-200 opacity-85'
                                  : `${t.surfaceElevated} hover:border-teal-500/45`
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`font-mono-tech text-[10.5px] ${t.accentText}`}>
                                  {item.tag}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                    done ? t.emeraldText : t.faint
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{done ? 'Reviewed' : 'Mark reviewed'}</span>
                                </span>
                              </div>
                              <div className={`text-xs line-through ${t.faint}`}>{item.wrong}</div>
                              <div
                                className={`text-sm font-medium mt-0.5 ${
                                  done ? 'line-through opacity-75' : ''
                                }`}
                              >
                                {item.right}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================================================================
              10. SECTION #faq — ORIGINAL MINIMAL FAQ WITH SMOOTH EXPANSION
             ================================================================ */}
          <section id="faq" className="scroll-mt-24 py-24 sm:py-32 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <div className="text-center mb-12">
                  <span
                    className={`font-mono-tech text-[11px] uppercase tracking-[0.18em] ${t.accentText}`}
                  >
                    FAQ
                  </span>
                  <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08]">
                    Quick{' '}
                    <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      answers.
                    </span>
                  </h2>
                </div>
              </Reveal>

              <div
                className={`divide-y border-y ${t.border} ${
                  isDark ? 'divide-white/[0.08]' : 'divide-[#E3D5BA]'
                }`}
              >
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                        className="group w-full py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span
                          className={`text-base font-medium transition-colors duration-300 ${
                            isOpen ? t.accentText : 'group-hover:text-teal-600'
                          }`}
                        >
                          {item.q}
                        </span>
                        <Plus
                          className={`w-4 h-4 shrink-0 text-teal-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isOpen ? 'rotate-45' : 'rotate-0'
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p
                            className={`pb-5 text-sm sm:text-base leading-relaxed transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isOpen ? 'translate-y-0' : '-translate-y-2'
                            } ${t.muted}`}
                          >
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================================================================
              11. FINAL CTA + STRUCTURED FOOTER WITH OVERSIZED "Vocly" WORDMARK
             ================================================================ */}
          <section className="pb-16 sm:pb-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <div className="relative rounded-[34px] bg-[#0B0E17] text-[#F8FAFC] border border-white/[0.09] px-6 py-16 sm:px-14 sm:py-20 text-center overflow-hidden shadow-[0_32px_90px_-28px_rgba(15,23,42,0.45)]">
                  <AmbientSoundWaves
                    idPrefix="final-cta"
                    isDark={true}
                    onDarkSurface={true}
                    className="opacity-65"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[620px] h-[240px] rounded-full blur-[110px]"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(20,184,166,0.28) 0%, rgba(99,102,241,0.20) 50%, transparent 78%)',
                    }}
                  />

                  <div className="relative">
                    <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-teal-400">
                      Vocly Voice Tutor
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.06]">
                      Speak it. Fix it.{' '}
                      <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Own it.
                      </span>
                    </h2>
                    <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-[#94A3B8]">
                      Start a judgment-free voice conversation in seconds and feel your confidence
                      compound every day.
                    </p>

                    <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <PrimaryButton
                        onClick={() => openDemoModal('freetalk', selectedLangId)}
                        className="w-full sm:w-auto px-7 py-3.5 text-sm"
                      >
                        <Mic className="w-4 h-4" />
                        <RollText text="Try the demo" />
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </PrimaryButton>

                      <SecondaryLink
                        href="https://github.com/NikhilAmbure/Vocly"
                        isDark={true}
                        className="w-full sm:w-auto px-7 py-3.5 text-sm"
                      >
                        <GithubIcon className="w-4 h-4" />
                        <RollText text="View on GitHub" />
                      </SecondaryLink>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <footer
            className={`relative border-t pt-14 pb-28 px-4 sm:px-6 overflow-hidden ${t.border}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <VoclyMark />
                    <span className="text-lg font-semibold tracking-tight">
                      Voc
                      <span className="font-serif-editorial italic font-normal text-2xl bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                        ly
                      </span>
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed max-w-xs ${t.muted}`}>
                    Your 24/7 voice-first AI language partner for calm, real-time spoken fluency.
                  </p>
                </div>

                <div className="md:col-span-3 space-y-3">
                  <div
                    className={`font-mono-tech text-[10.5px] uppercase tracking-wider ${t.faint}`}
                  >
                    Explore
                  </div>
                  <ul className="space-y-2 text-sm">
                    {NAV_SECTIONS.map((sec) => (
                      <li key={sec.id}>
                        <a
                          href={sec.href}
                          className={`group inline-flex items-center ${t.muted} hover:text-teal-600 ${SMOOTH}`}
                        >
                          <RollText text={sec.label} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-4 space-y-3">
                  <div
                    className={`font-mono-tech text-[10.5px] uppercase tracking-wider ${t.faint}`}
                  >
                    Practice Now
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HERO_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => openDemoModal('freetalk', lang.id)}
                        className={`group px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer hover:border-teal-500/50 ${SMOOTH} ${t.surface} ${t.muted}`}
                      >
                        <RollText text={`${lang.label} · ${lang.cefr}`} />
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center gap-4 text-xs">
                    <a
                      href="https://github.com/NikhilAmbure/Vocly"
                      target="_blank"
                      rel="noreferrer"
                      className={`group inline-flex items-center gap-1.5 font-medium ${t.muted} hover:text-teal-600 ${SMOOTH}`}
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <RollText text="GitHub" />
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="#"
                      className={`group inline-flex items-center gap-1 font-medium ${t.muted} hover:text-teal-600 ${SMOOTH}`}
                    >
                      <RollText text="Back to top" />
                      <ArrowUp className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div
                className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${t.border} ${t.faint}`}
              >
                <span>© {new Date().getFullYear()} Vocly. All rights reserved.</span>
                <span>Speak it. Fix it. Own it.</span>
              </div>

              <div
                aria-hidden="true"
                className="mt-8 select-none text-center overflow-hidden pointer-events-none"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div
                  className={`text-[clamp(86px,22vw,230px)] font-semibold tracking-[-0.055em] leading-[0.82] ${
                    isDark ? 'text-white/[0.08]' : 'text-[#1C1917]/[0.09]'
                  }`}
                >
                  Voc
                  <span className="font-serif-editorial italic font-normal bg-gradient-to-r from-teal-500/45 via-indigo-500/45 to-violet-500/45 bg-clip-text text-transparent">
                    ly
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ====================================================================
          12. WISPR FLOW–STYLE MORPHING FLOATING VOICE PILL
         ==================================================================== */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center w-[calc(100%-2rem)] max-w-[400px] pointer-events-none">
        {dockPopoverOpen && (
          <div className="pointer-events-auto w-full mb-3 relative overflow-hidden rounded-2xl bg-[#11141D] text-white backdrop-blur-xl border border-teal-400/35 p-4 shadow-[0_20px_56px_rgba(0,0,0,0.55)] animate-[fadeSlideUp_0.22s_ease-out]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-400 via-indigo-500 to-violet-500"
            />
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-mono-tech text-[10px] uppercase tracking-wider text-teal-300">
                  {dockStatus === 'listening' && 'Listening…'}
                  {dockStatus === 'replying' && 'Vocly is replying…'}
                  {(dockStatus === 'idle' || dockStatus === 'result') && 'Vocly Live Feedback'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openDemoModal('freetalk', selectedLangId)}
                  className="group px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-[10.5px] font-medium text-teal-200 cursor-pointer"
                >
                  <RollText text="Open Studio" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAudioAndTimers();
                    setDockPopoverOpen(false);
                  }}
                  aria-label="Close voice feedback"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {dockSpoken ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-white/[0.06] border border-white/[0.1] px-3 py-2">
                  <span className="font-mono-tech text-[9.5px] uppercase text-[#CBD5E1] block">
                    You said
                  </span>
                  <span className="font-medium text-white">“{dockSpoken}”</span>
                </div>
                {dockReply && (
                  <div className="rounded-xl bg-teal-500/15 border border-teal-400/30 px-3 py-2">
                    <span className="font-mono-tech text-[9.5px] uppercase text-teal-300 block">
                      Vocly
                    </span>
                    <span className="leading-relaxed text-white">{dockReply}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[#CBD5E1]">
                  Speak a sentence—or pause for a live sample turn.
                </p>
                <AcousticEqualizer
                  active={dockStatus === 'listening'}
                  bars={8}
                  height={15}
                  onDark={true}
                />
              </div>
            )}
          </div>
        )}

        <div
          className={`pointer-events-auto group relative flex items-center justify-center rounded-full bg-[#0B0D13] text-white border transition-all duration-300 shadow-[0_16px_42px_rgba(11,13,19,0.48),inset_0_1px_0_rgba(255,255,255,0.14)] ${
            dockStatus === 'listening'
              ? 'h-12 px-2.5 gap-3.5 border-teal-400/55 shadow-[0_16px_44px_rgba(20,184,166,0.32)]'
              : 'h-11 px-2.5 gap-2.5 border-white/[0.14] hover:border-teal-400/50'
          }`}
        >
          {dockStatus === 'listening' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  stopAudioAndTimers();
                  setDockStatus('idle');
                  setDockPopoverOpen(false);
                }}
                aria-label="Cancel speaking"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <AcousticEqualizer active={true} bars={15} height={18} onDark={true} />
              </div>

              <button
                type="button"
                onClick={handleDockFinish}
                aria-label="Finish speaking"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_14px_rgba(20,184,166,0.5)] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </>
          ) : dockStatus === 'replying' ? (
            <div className="flex items-center gap-2.5 px-2.5">
              <AcousticEqualizer active={true} bars={9} height={16} onDark={true} />
              <span className="text-xs font-medium text-teal-200">Vocly is replying…</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDockMicClick}
              className="flex items-center gap-2.5 pr-2 cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(20,184,166,0.55)]">
                <VoclyVoiceEmblem listening={false} />
              </span>
              <span className="flex items-center gap-[2px] h-3 opacity-65 group-hover:opacity-100 transition-opacity">
                <span className="w-[2px] h-1.5 rounded-full bg-teal-300 group-hover:animate-[voclyWave_0.8s_ease-in-out_0s_infinite_alternate]" />
                <span className="w-[2px] h-2.5 rounded-full bg-indigo-300 group-hover:animate-[voclyWave_0.7s_ease-in-out_0.12s_infinite_alternate]" />
                <span className="w-[2px] h-3 rounded-full bg-white group-hover:animate-[voclyWave_0.75s_ease-in-out_0.24s_infinite_alternate]" />
                <span className="w-[2px] h-2 rounded-full bg-indigo-300 group-hover:animate-[voclyWave_0.82s_ease-in-out_0.36s_infinite_alternate]" />
                <span className="w-[2px] h-1.5 rounded-full bg-teal-300 group-hover:animate-[voclyWave_0.72s_ease-in-out_0.48s_infinite_alternate]" />
              </span>
              <RollText
                text="Click to speak"
                className="text-xs font-medium text-white/90 group-hover:text-white"
              />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          13. SCROLLBAR-FREE "VOCLY STUDIO" LIVE PRACTICE MODAL
         ==================================================================== */}
      {demoModalOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            stopAudioAndTimers();
            setDemoModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vocly Live Practice Demo"
            className={`relative w-full max-w-[490px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[28px] border shadow-2xl animate-[fadeSlideUp_0.24s_ease-out] ${t.surface}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500"
            />

            <div className={`px-6 pt-5 pb-4 border-b flex items-center justify-between ${t.border}`}>
              <div className="flex items-center gap-2.5">
                <VoclyMark size="sm" />
                <div>
                  <h3 className="text-base font-semibold leading-tight">Vocly Studio</h3>
                  <span
                    className={`font-mono-tech text-[10px] uppercase tracking-wider ${t.accentText}`}
                  >
                    {modalLang.label} · {modalScenario.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopAudioAndTimers();
                  setDemoModalOpen(false);
                }}
                aria-label="Close modal"
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${SMOOTH} ${
                  isDark ? 'hover:bg-white/10 text-[#94A3B8]' : 'hover:bg-black/5 text-[#57534E]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Compact Single-Row Language & Scenario Pickers */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {HERO_LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setModalLangId(l.id)}
                      className={`group px-3 py-1 rounded-full text-xs font-medium shrink-0 cursor-pointer ${SMOOTH} ${
                        modalLangId === l.id
                          ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white'
                          : `${t.surfaceElevated} ${t.muted}`
                      }`}
                    >
                      <RollText text={l.label} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        setModalScenarioId(sc.id);
                        setModalSpoken('');
                        setModalCorrection('');
                        setModalScores([]);
                        setModalShowSummary(false);
                      }}
                      className={`group px-3 py-1 rounded-full text-[11.5px] font-medium shrink-0 border cursor-pointer ${SMOOTH} ${
                        modalScenarioId === sc.id
                          ? isDark
                            ? 'bg-teal-500/15 border-teal-400/40 text-teal-300'
                            : 'bg-teal-50 border-teal-200 text-teal-700'
                          : `border-transparent ${t.faint} hover:text-current`
                      }`}
                    >
                      <RollText text={sc.label.split(' ')[0]} />
                    </button>
                  ))}
                </div>
              </div>

              {!modalShowSummary ? (
                <>
                  {/* Unified Stage: Prompt OR Live Feedback */}
                  {!modalSpoken ? (
                    <div
                      className={`rounded-2xl border p-5 text-center space-y-2 ${t.surfaceElevated}`}
                    >
                      <span
                        className={`font-mono-tech text-[10px] uppercase tracking-wider ${t.accentText}`}
                      >
                        Tutor Prompt
                      </span>
                      <p className="text-sm font-medium leading-relaxed">{modalScenario.opening}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 animate-[fadeSlideUp_0.25s_ease-out]">
                      <div className={`rounded-2xl border px-4 py-3 text-sm ${t.surfaceElevated}`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`font-mono-tech text-[10px] uppercase ${t.faint}`}>
                            You said
                          </span>
                          {modalScores.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              {modalScores.slice(0, 2).map((s) => (
                                <span
                                  key={s.word}
                                  className={`font-mono-tech text-[10px] px-2 py-0.5 rounded-full border ${t.surface}`}
                                >
                                  {s.word} <span className={t.emeraldText}>{s.score}%</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-medium">“{modalSpoken}”</p>
                      </div>

                      {modalCorrection && (
                        <div
                          className={`rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${
                            isDark
                              ? 'bg-teal-500/12 border-teal-400/35'
                              : 'bg-teal-50/90 border-teal-200'
                          }`}
                        >
                          <span
                            className={`font-mono-tech text-[10px] uppercase tracking-wider block mb-1 ${t.accentText}`}
                          >
                            Vocly Gentle Fix
                          </span>
                          {modalCorrection}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voice Trigger */}
                  <div className="py-1 flex flex-col items-center gap-2.5">
                    <div className="relative flex items-center justify-center">
                      {modalListening && (
                        <span className="pointer-events-none absolute w-20 h-20 rounded-full bg-teal-500/40 animate-pulse-ring" />
                      )}
                      <button
                        type="button"
                        onClick={handleModalMicToggle}
                        aria-label={modalListening ? 'Stop microphone' : 'Start speaking'}
                        className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer active:scale-[0.96] ${SMOOTH} ${
                          modalListening
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-br from-teal-500 to-indigo-600 shadow-[0_10px_28px_-6px_rgba(20,184,166,0.55)] hover:brightness-110'
                        }`}
                      >
                        {modalListening ? <MicOff className="w-5 h-5" /> : <VoclyVoiceEmblem />}
                      </button>
                    </div>
                    <AcousticEqualizer
                      active={modalListening}
                      bars={16}
                      height={18}
                      onDark={isDark}
                    />
                    <span className={`text-[11.5px] ${t.muted}`}>
                      {modalListening
                        ? 'Listening… speak naturally'
                        : 'Tap to speak, or try a phrase below'}
                    </span>
                  </div>

                  {/* 2 Concise One-Tap Try Phrases */}
                  <div className="grid grid-cols-1 gap-2">
                    {modalScenario.presets.slice(0, 2).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          runModalFeedback(
                            preset.spoken,
                            preset.correction,
                            preset.scores,
                            preset.vocab
                          )
                        }
                        className={`group flex items-center justify-between gap-3 text-left px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer hover:border-teal-500/55 ${SMOOTH} ${t.surfaceElevated}`}
                      >
                        <span className="truncate">
                          <span className={`${t.accentText} font-semibold mr-1.5`}>Try:</span>“
                          {preset.spoken}”
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 ${t.faint} group-hover:text-teal-500`}
                        />
                      </button>
                    ))}
                  </div>

                  {modalTurns.length > 0 && (
                    <div className={`pt-3 border-t flex items-center justify-between ${t.border}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setModalSpoken('');
                          setModalCorrection('');
                          setModalScores([]);
                        }}
                        className={`group inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${t.muted} hover:text-current`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <RollText text="Reset" />
                      </button>
                      <PrimaryButton
                        onClick={() => setModalShowSummary(true)}
                        className="px-4 py-2 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <RollText text={`Summary (${modalTurns.length})`} />
                      </PrimaryButton>
                    </div>
                  )}
                </>
              ) : (
                /* Compact Session Summary */
                <div className="space-y-4 animate-[fadeSlideUp_0.25s_ease-out]">
                  <div
                    className={`rounded-2xl border p-4 flex items-center justify-between ${
                      isDark
                        ? 'bg-teal-500/12 border-teal-400/30'
                        : 'bg-teal-50/90 border-teal-200'
                    }`}
                  >
                    <div>
                      <span
                        className={`font-mono-tech text-[10px] uppercase font-semibold ${t.accentText}`}
                      >
                        Session Recap
                      </span>
                      <p className="text-sm font-medium mt-0.5">
                        {modalTurns.length} turn{modalTurns.length > 1 ? 's' : ''} ·{' '}
                        {modalScenario.label}
                      </p>
                    </div>
                    <span className={`font-mono-tech text-lg font-semibold ${t.emeraldText}`}>
                      95%
                    </span>
                  </div>

                  {uniqueModalVocab.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueModalVocab.slice(0, 6).map((word) => (
                        <span
                          key={word}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${t.surfaceElevated}`}
                        >
                          <Check className="w-3 h-3 text-teal-500" />
                          <span>{word}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setModalShowSummary(false)}
                      className={`group inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer ${SMOOTH} ${t.border}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <RollText text="Back" />
                    </button>
                    <PrimaryButton
                      onClick={() => setDemoModalOpen(false)}
                      className="px-5 py-2 text-xs"
                    >
                      <RollText text="Done" />
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
