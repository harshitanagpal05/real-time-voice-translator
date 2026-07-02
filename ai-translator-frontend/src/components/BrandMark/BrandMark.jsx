import { useId } from 'react';

export default function BrandMark({ size = 36, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const classes = ['brand-mark', className].filter(Boolean).join(' ');
  const glowId = `brandMarkGlow-${uid}`;
  const waveId = `brandMarkWave-${uid}`;
  const shadowId = `brandMarkShadow-${uid}`;

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 12) rotate(58) scale(34 32)">
          <stop offset="0%" stopColor="#6A0DAD" />
          <stop offset="52%" stopColor="#E040FB" />
          <stop offset="100%" stopColor="#FF8C00" />
        </radialGradient>
        <linearGradient id={waveId} x1="10" y1="10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="1" stopColor="#FFF7ED" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6A0DAD" floodOpacity="0.45" />
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#FF8C00" floodOpacity="0.12" />
        </filter>
      </defs>

      <circle cx="22" cy="22" r="20" fill={`url(#${glowId})`} filter={`url(#${shadowId})`} />

      <g fill={`url(#${waveId})`}>
        <rect x="10" y="14" width="4" height="16" rx="2" />
        <rect x="16" y="10" width="4" height="24" rx="2" />
        <rect x="22" y="8" width="4" height="28" rx="2" />
        <rect x="28" y="14" width="4" height="16" rx="2" />
      </g>

      <path
        d="M34.5 10.5l1.16 2.34 2.34 1.16-2.34 1.16-1.16 2.34-1.16-2.34-2.34-1.16 2.34-1.16 1.16-2.34Z"
        fill="#F8FAFC"
        opacity="0.95"
      />
    </svg>
  );
}