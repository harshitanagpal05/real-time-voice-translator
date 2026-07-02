import { motion } from 'framer-motion';
import './InfoPage.css';
import './AboutFounderPage.css';

const PASSIONS = [
  'AI Enthusiast',
  'Software Developer',
  'Passionate about building impactful real-world AI solutions',
  'Focused on creating accessible technology for everyone',
];

const SOCIAL_LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/harshita-nagpal05/',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/harshitanagpal05',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.305.762-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.286 0 .315.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:workharshita@outlook.com',
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

function ExternalIcon() {
  return (
    <svg className="founder-link-external" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function AboutFounderPage() {
  return (
    <div className="info-page founder-page">
      <header className="info-page-header">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>About the Founder</motion.h1>
      </header>

      <motion.div
        className="founder-profile-card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="founder-avatar-wrap">
          <div className="founder-avatar-glow" />
          <div className="founder-avatar">HN</div>
        </div>
        <h2 className="founder-name">Harshita Nagpal</h2>
        <span className="founder-role">Founder & Developer, VoxAI</span>

        <p className="founder-bio">
          Harshita Nagpal is the founder and developer of VoxAI, an AI-powered real-time voice
          translation platform built with the vision of breaking language barriers and making
          global communication effortless.
        </p>

        <ul className="founder-passions">
          {PASSIONS.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {p}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="founder-vision-grid">
        <motion.div
          className="founder-vision-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="founder-vision-label">Vision</span>
          <p>To make communication across different languages seamless using the power of Artificial Intelligence.</p>
        </motion.div>
        <motion.div
          className="founder-vision-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="founder-vision-label mission">Mission</span>
          <p>Building intelligent, user-friendly and innovative AI tools that connect people worldwide.</p>
        </motion.div>
      </div>

      <motion.section
        className="founder-connect"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="founder-connect-title">Connect with Founder</h3>
        <p className="founder-connect-desc">Reach out, collaborate, or follow the journey behind VoxAI.</p>
        <div className="founder-social-grid">
          {SOCIAL_LINKS.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.href}
              className={`founder-social-card founder-social-${link.id} glass-card`}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="founder-social-icon">{link.icon}</span>
              <span className="founder-social-label">{link.label}</span>
              {link.external && <ExternalIcon />}
            </motion.a>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
