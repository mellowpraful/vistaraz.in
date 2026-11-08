import React from 'react';

/**
 * 12 Predefined Sanctuary Illustrated Avatars
 * IDs: avatar_01 to avatar_12
 * Visual style: Modern, minimal, youth-friendly, calming sanctuary aesthetics.
 */
export const AVATAR_LIST = [
  {
    id: 'avatar_01',
    name: 'Serene Fox',
    theme: 'Warmth & Comfort',
    bgColor: '#fef3c7',
    primaryColor: '#d97706',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#fef3c7" stroke="#fde68a" strokeWidth="2"/>
        {/* Fox Ears */}
        <polygon points="26,44 34,18 46,38" fill="#ea580c"/>
        <polygon points="30,40 35,24 43,36" fill="#fef08a"/>
        <polygon points="74,44 66,18 54,38" fill="#ea580c"/>
        <polygon points="70,40 65,24 57,36" fill="#fef08a"/>
        {/* Fox Head */}
        <ellipse cx="50" cy="56" rx="28" ry="24" fill="#f97316"/>
        {/* White Cheeks */}
        <path d="M22,56 C22,68 36,78 50,78 C64,78 78,68 78,56 C78,52 66,54 50,58 C34,54 22,52 22,56 Z" fill="#ffffff"/>
        {/* Sleeping Eyes */}
        <path d="M35,54 Q41,60 45,54" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M55,54 Q59,60 65,54" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Fox Nose */}
        <ellipse cx="50" cy="65" rx="3.5" ry="2.5" fill="#431407"/>
        {/* Cheeks blush */}
        <ellipse cx="32" cy="62" rx="4" ry="2" fill="#fca5a5" opacity="0.6"/>
        <ellipse cx="68" cy="62" rx="4" ry="2" fill="#fca5a5" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'avatar_02',
    name: 'Mindful Owl',
    theme: 'Wisdom & Calm',
    bgColor: '#ede9fe',
    primaryColor: '#7c3aed',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#ede9fe" stroke="#ddd6fe" strokeWidth="2"/>
        {/* Ear tufts */}
        <polygon points="26,38 22,18 38,28" fill="#6d28d9"/>
        <polygon points="74,38 78,18 62,28" fill="#6d28d9"/>
        {/* Body */}
        <ellipse cx="50" cy="54" rx="28" ry="26" fill="#8b5cf6"/>
        {/* Face circles */}
        <circle cx="39" cy="48" r="13" fill="#ffffff"/>
        <circle cx="61" cy="48" r="13" fill="#ffffff"/>
        {/* Calm eyes */}
        <path d="M33,48 Q39,53 45,48" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M55,48 Q61,53 67,48" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Beak */}
        <polygon points="47,54 53,54 50,61" fill="#f59e0b"/>
        {/* Feather details */}
        <path d="M44,66 Q50,70 56,66" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M40,73 Q50,77 60,73" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'avatar_03',
    name: 'Gentle Deer',
    theme: 'Peace & Serenity',
    bgColor: '#ecfdf5',
    primaryColor: '#059669',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="2"/>
        {/* Antlers */}
        <path d="M36,36 L30,20 M30,20 L24,18 M30,20 L32,13" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M64,36 L70,20 M70,20 L76,18 M70,20 L68,13" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Ears */}
        <ellipse cx="26" cy="40" rx="9" ry="5" fill="#d97706" transform="rotate(-30 26 40)"/>
        <ellipse cx="74" cy="40" rx="9" ry="5" fill="#d97706" transform="rotate(30 74 40)"/>
        {/* Head */}
        <ellipse cx="50" cy="54" rx="22" ry="24" fill="#f59e0b"/>
        {/* Snout */}
        <ellipse cx="50" cy="65" rx="12" ry="9" fill="#fef3c7"/>
        <ellipse cx="50" cy="62" rx="3.5" ry="2" fill="#451a03"/>
        {/* Gentle eyes */}
        <path d="M38,50 Q43,55 48,50" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M52,50 Q57,55 62,50" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Spots */}
        <circle cx="50" cy="42" r="2" fill="#ffffff" opacity="0.8"/>
        <circle cx="44" cy="44" r="1.5" fill="#ffffff" opacity="0.8"/>
        <circle cx="56" cy="44" r="1.5" fill="#ffffff" opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: 'avatar_04',
    name: 'Peaceful Otter',
    theme: 'Joy & Connection',
    bgColor: '#e0f2fe',
    primaryColor: '#0284c7',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2"/>
        {/* Small Ears */}
        <circle cx="28" cy="40" r="6" fill="#78350f"/>
        <circle cx="72" cy="40" r="6" fill="#78350f"/>
        {/* Head */}
        <ellipse cx="50" cy="54" rx="26" ry="22" fill="#92400e"/>
        {/* Muzzle */}
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fef3c7"/>
        {/* Dark Nose */}
        <polygon points="46,57 54,57 50,62" fill="#1e293b"/>
        {/* Calm closed eyes */}
        <path d="M37,49 Q42,54 46,49" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M54,49 Q58,54 63,49" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Whiskers */}
        <line x1="28" y1="62" x2="38" y2="61" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="66" x2="38" y2="64" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="72" y1="62" x2="62" y2="61" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="72" y1="66" x2="62" y2="64" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'avatar_05',
    name: 'Dawn Sunbird',
    theme: 'Hope & Optimism',
    bgColor: '#fff7ed',
    primaryColor: '#ea580c',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#fff7ed" stroke="#ffedd5" strokeWidth="2"/>
        {/* Crest */}
        <path d="M48,28 Q44,16 38,20 Q44,24 46,32" fill="#f97316"/>
        <path d="M52,28 Q56,16 62,20 Q56,24 54,32" fill="#fb923c"/>
        {/* Bird Body */}
        <ellipse cx="50" cy="54" rx="24" ry="22" fill="#fbbf24"/>
        {/* Soft Wing accent */}
        <path d="M30,52 C30,64 42,72 50,72 C58,72 70,64 70,52" fill="#f59e0b"/>
        {/* Eyes */}
        <path d="M38,48 Q42,52 46,48" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M54,48 Q58,52 62,48" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Sweet Beak */}
        <polygon points="46,52 54,52 50,60" fill="#ea580c"/>
        {/* Rosy blush */}
        <circle cx="34" cy="56" r="3.5" fill="#f87171" opacity="0.5"/>
        <circle cx="66" cy="56" r="3.5" fill="#f87171" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'avatar_06',
    name: 'Grounded Bear',
    theme: 'Strength & Sanctuary',
    bgColor: '#fdf4ff',
    primaryColor: '#c026d3',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#f5ebe0" stroke="#e6ccb2" strokeWidth="2"/>
        {/* Round Ears */}
        <circle cx="26" cy="34" r="9" fill="#7f5539"/>
        <circle cx="26" cy="34" r="5" fill="#ddb892"/>
        <circle cx="74" cy="34" r="9" fill="#7f5539"/>
        <circle cx="74" cy="34" r="5" fill="#ddb892"/>
        {/* Big cozy head */}
        <ellipse cx="50" cy="54" rx="28" ry="24" fill="#9c6644"/>
        {/* Snout */}
        <ellipse cx="50" cy="62" rx="14" ry="11" fill="#ddb892"/>
        <ellipse cx="50" cy="57" rx="4.5" ry="3" fill="#3d2b1f"/>
        <path d="M50,60 L50,66" stroke="#3d2b1f" strokeWidth="2" strokeLinecap="round"/>
        {/* Calm eyes */}
        <path d="M36,49 Q41,53 45,49" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M55,49 Q59,53 64,49" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'avatar_07',
    name: 'Mindful Lotus',
    theme: 'Tranquility & Rebirth',
    bgColor: '#fce7f3',
    primaryColor: '#db2777',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#fce7f3" stroke="#fbcfe8" strokeWidth="2"/>
        {/* Water Ripple Base */}
        <ellipse cx="50" cy="74" rx="32" ry="8" fill="#a7f3d0" opacity="0.6"/>
        {/* Outer Petals */}
        <path d="M22,66 C24,46 42,48 50,68 C38,70 26,70 22,66 Z" fill="#f472b6"/>
        <path d="M78,66 C76,46 58,48 50,68 C62,70 74,70 78,66 Z" fill="#f472b6"/>
        {/* Mid Petals */}
        <path d="M30,62 C34,36 50,42 50,68 C42,66 34,64 30,62 Z" fill="#ec4899"/>
        <path d="M70,62 C66,36 50,42 50,68 C58,66 66,64 70,62 Z" fill="#ec4899"/>
        {/* Center Petal with Aura */}
        <path d="M50,22 C42,38 44,56 50,68 C56,56 58,38 50,22 Z" fill="#db2777"/>
        {/* Gentle Zen Glow */}
        <circle cx="50" cy="52" r="5" fill="#fef08a" opacity="0.9"/>
      </svg>
    ),
  },
  {
    id: 'avatar_08',
    name: 'Ocean Dolphin',
    theme: 'Empathy & Light',
    bgColor: '#e0f2fe',
    primaryColor: '#0284c7',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2"/>
        {/* Ocean Waves */}
        <path d="M12,72 Q28,64 50,72 Q72,80 88,72" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Dolphin Body */}
        <path d="M24,64 C26,42 46,30 68,36 C76,40 82,48 80,56 C76,58 70,54 62,56 C46,60 34,68 24,64 Z" fill="#0284c7"/>
        {/* White Belly */}
        <path d="M40,54 C48,48 58,50 64,56 C52,58 44,58 40,54 Z" fill="#ffffff"/>
        {/* Gentle Eye */}
        <circle cx="68" cy="44" r="2.5" fill="#ffffff"/>
        <circle cx="68.5" cy="43.5" r="1.2" fill="#0f172a"/>
        {/* Snout */}
        <path d="M80,52 C84,52 86,55 82,57" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'avatar_09',
    name: 'Sanctuary Butterfly',
    theme: 'Transformation',
    bgColor: '#fae8ff',
    primaryColor: '#a855f7',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#fae8ff" stroke="#f0abfc" strokeWidth="2"/>
        {/* Antennae */}
        <path d="M48,34 Q42,20 34,22" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M52,34 Q58,20 66,22" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Upper Wings */}
        <path d="M48,46 C34,26 14,34 22,56 C28,64 46,58 48,54 Z" fill="#c084fc"/>
        <path d="M52,46 C66,26 86,34 78,56 C72,64 54,58 52,54 Z" fill="#c084fc"/>
        {/* Lower Wings */}
        <path d="M48,56 C36,60 26,74 36,80 C44,82 48,68 48,60 Z" fill="#e879f9"/>
        <path d="M52,56 C64,60 74,74 64,80 C56,82 52,68 52,60 Z" fill="#e879f9"/>
        {/* Body */}
        <ellipse cx="50" cy="52" rx="3.5" ry="16" fill="#581c87"/>
      </svg>
    ),
  },
  {
    id: 'avatar_10',
    name: 'Celestial Moon',
    theme: 'Rest & Safe Haven',
    bgColor: '#e2e8f0',
    primaryColor: '#475569',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
        {/* Stars */}
        <circle cx="28" cy="28" r="1.5" fill="#fef08a"/>
        <circle cx="76" cy="30" r="2" fill="#fef08a"/>
        <circle cx="30" cy="70" r="1.5" fill="#fef08a"/>
        <circle cx="74" cy="72" r="1" fill="#fef08a"/>
        {/* Glowing Crescent */}
        <path d="M54,22 C36,22 28,38 28,52 C28,68 40,78 56,78 C44,72 40,58 44,46 C48,36 54,28 54,22 Z" fill="#fde047"/>
        {/* Sleeping Eye on Moon */}
        <path d="M38,50 Q42,54 46,50" stroke="#713f12" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Soft cloud */}
        <path d="M42,70 C44,66 50,64 54,66 C58,62 66,62 70,66 C74,66 78,70 76,74 C70,76 46,76 42,70 Z" fill="#e2e8f0" opacity="0.85"/>
      </svg>
    ),
  },
  {
    id: 'avatar_11',
    name: 'Zen Panda',
    theme: 'Balance & Stillness',
    bgColor: '#f0fdf4',
    primaryColor: '#16a34a',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2"/>
        {/* Black Ears */}
        <circle cx="26" cy="32" r="9" fill="#1e293b"/>
        <circle cx="74" cy="32" r="9" fill="#1e293b"/>
        {/* White Head */}
        <ellipse cx="50" cy="54" rx="28" ry="24" fill="#ffffff"/>
        {/* Eye Patches */}
        <ellipse cx="36" cy="50" rx="8" ry="10" fill="#1e293b" transform="rotate(-15 36 50)"/>
        <ellipse cx="64" cy="50" rx="8" ry="10" fill="#1e293b" transform="rotate(15 64 50)"/>
        {/* Happy Sleeping Eyes */}
        <path d="M32,49 Q36,54 40,49" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M60,49 Q64,54 68,49" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Nose */}
        <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#1e293b"/>
        {/* Smile */}
        <path d="M46,66 Q50,69 54,66" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Bamboo Sprout */}
        <path d="M66,68 L74,60 M70,64 L74,66" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'avatar_12',
    name: 'Healing Sprout',
    theme: 'Growth & Healing',
    bgColor: '#f7fee7',
    primaryColor: '#65a30d',
    renderSvg: () => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#f7fee7" stroke="#d9f99d" strokeWidth="2"/>
        {/* Pot / Soil */}
        <ellipse cx="50" cy="74" rx="24" ry="7" fill="#78350f"/>
        <path d="M32,74 L36,88 L64,88 L68,74" fill="#92400e"/>
        {/* Stem */}
        <path d="M50,72 Q50,48 50,38" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Left Leaf */}
        <path d="M50,50 C36,46 32,30 48,36 C50,42 50,48 50,50 Z" fill="#22c55e"/>
        {/* Right Leaf */}
        <path d="M50,42 C64,38 68,22 52,28 C50,34 50,40 50,42 Z" fill="#4ade80"/>
        {/* Gentle Dewdrop */}
        <circle cx="37" cy="34" r="2.5" fill="#38bdf8"/>
        <circle cx="36" cy="33" r="0.8" fill="#ffffff"/>
      </svg>
    ),
  },
];

/**
 * Avatar Lookup Map by ID
 */
export const AVATAR_MAP = AVATAR_LIST.reduce((acc, avatar) => {
  acc[avatar.id] = avatar;
  return acc;
}, {});

/**
 * AvatarImage Component
 * Renders an illustrated SVG avatar by its ID (avatar_01 to avatar_12).
 * Falls back to avatar_01 if not found.
 */
export function AvatarImage({ avatarId, size = 64, className = '', alt = '' }) {
  const avatar = AVATAR_MAP[avatarId] || AVATAR_LIST[0];

  return (
    <div
      className={`vz-avatar-graphic ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      role="img"
      aria-label={alt || avatar.name}
    >
      {avatar.renderSvg()}
    </div>
  );
}

export default AVATAR_LIST;

