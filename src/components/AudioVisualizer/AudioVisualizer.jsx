/**
 * AudioVisualizer.jsx
 * Concentric glowing ripple rings and frequency bars around the voice orb.
 */

import './AudioVisualizer.css';

export default function AudioVisualizer({ isListening, isSpeaking, isTranslating }) {
  const active = isListening || isSpeaking || isTranslating;
  const stateClass = isListening ? 'vis-listening' : isSpeaking ? 'vis-speaking' : isTranslating ? 'vis-translating' : '';

  return (
    <div className={`audio-visualizer ${active ? 'active' : ''} ${stateClass}`} id="audio-visualizer">
      <div className="vis-ring ring-1" />
      <div className="vis-ring ring-2" />
      <div className="vis-ring ring-3" />
      <div className="vis-ring ring-4" />
      <div className="vis-ring ring-5" />

      <div className="vis-bars">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="vis-bar"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}
