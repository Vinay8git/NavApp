//Hero Section
import React from "react";
import "./hero.css";


const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13.6 4.8L6.6 11.8 2.4 7.6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 3l1.6 4.1L18 8.7l-4.4 1.5L12 14l-1.6-3.8L6 8.7l4.4-1.5L12 3z"
      fill="currentColor"
      opacity="0.9"
    />
    <circle cx="19" cy="5" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="5" cy="6" r="1.5" fill="currentColor" opacity="0.4" />
  </svg>
);


const Hero: React.FC = () => {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <div className="hero__eyebrow">
         <SparkleIcon />
          Navigation as a Service
        </div>

        <h1 id="hero-title" className="hero__title">
          Ship navigation experiences charters love.
        </h1>

        <p className="hero__desc">
          NavApp is a lightweight toolkit to embed location, routing and
          discovery into your product. Designed for speed, themed for clarity,
          and built with a clean UI, so your team ships faster.
        </p>

        <ul className="hero__bullets" aria-label="Key benefits">
          <li className="hero__bullet">
            <CheckIcon className="hero__bullet-icon" />
            Zero-config theming with a bluish UI that just works.
          </li>
          <li className="hero__bullet">
            <CheckIcon className="hero__bullet-icon" />
            Realtime pins, routes and clusters with tiny payloads.
          </li>
          <li className="hero__bullet">
            <CheckIcon className="hero__bullet-icon" />
            Client‑friendly.
          </li>
        </ul>

        <div className="hero__cta">
          <a className="btn btn--primary" href="#get-started" aria-label="Get started">
            Get Started
          </a>
          <a className="btn btn--ghost" href="#demo" aria-label="See live demo">
            Explore
          </a>
        </div>

        {/* Trust bar (lightweight credibility strip) */}
        <div className="hero__trust">
          <div className="hero__avatars" aria-hidden>
            <span className="avatar">VD</span>
            <span className="avatar">MB</span>
            <span className="avatar">GA</span>
            <span className="avatar">DAF</span>
          </div>
          <p className="hero__trust-text">
            Trusted by teams shipping location features worldwide.
          </p>
        </div>
      </div>

      <div className="hero__visual" role="img" aria-label="Stylized world map with routes">
        <svg
          className="hero__map-svg"
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--brand-dot)" stopOpacity="0.35" />
              <stop offset="80%" stopColor="var(--brand-dot)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--brand-dot)" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="gridStroke" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--nav-muted)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--nav-muted)" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="route" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--brand-dot)" />
              <stop offset="100%" stopColor="var(--nav-link)" />
            </linearGradient>

            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="12" floodOpacity="0.25" />
            </filter>
          </defs>

          {/*Some Glow or kind of Box Shadow*/}
          <circle cx="300" cy="200" r="180" fill="url(#glow)" />

          {/* globe body */}
          <circle
            cx="300"
            cy="200"
            r="160"
            fill="rgba(45,123,240,0.08)"
            stroke="var(--border)"
            strokeOpacity="0.6"
            filter="url(#softShadow)"
          />

          <ellipse cx="300" cy="200" rx="140" ry="70" fill="none" stroke="url(#gridStroke)" />
          <ellipse cx="300" cy="200" rx="120" ry="50" fill="none" stroke="url(#gridStroke)" />
          <ellipse cx="300" cy="200" rx="90" ry="30" fill="none" stroke="url(#gridStroke)" />

          <g transform="rotate(25 300 200)">
            <ellipse cx="300" cy="200" rx="140" ry="70" fill="none" stroke="url(#gridStroke)" />
            <ellipse cx="300" cy="200" rx="120" ry="50" fill="none" stroke="url(#gridStroke)" />
            <ellipse cx="300" cy="200" rx="90" ry="30" fill="none" stroke="url(#gridStroke)" />
          </g>
          <g transform="rotate(-25 300 200)">
            <ellipse cx="300" cy="200" rx="140" ry="70" fill="none" stroke="url(#gridStroke)" />
            <ellipse cx="300" cy="200" rx="120" ry="50" fill="none" stroke="url(#gridStroke)" />
          </g>

          <path
            d="M160 170 C240 120, 360 120, 440 170"
            fill="none"
            stroke="url(#route)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M220 250 C260 210, 340 210, 380 250"
            fill="none"
            stroke="url(#route)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M260 190 C290 160, 380 160, 420 200"
            fill="none"
            stroke="url(#route)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <g className="pin">
            <circle cx="160" cy="170" r="5" fill="var(--brand-dot)" />
            <circle className="pin__pulse" cx="160" cy="170" r="5" />
          </g>
          <g className="pin">
            <circle cx="300" cy="200" r="5" fill="var(--brand-dot)" />
            <circle className="pin__pulse" cx="300" cy="200" r="5" />
          </g>
          <g className="pin">
            <circle cx="440" cy="170" r="5" fill="var(--brand-dot)" />
            <circle className="pin__pulse" cx="440" cy="170" r="5" />
          </g>
          <g className="pin">
            <circle cx="380" cy="250" r="5" fill="var(--brand-dot)" />
            <circle className="pin__pulse" cx="380" cy="250" r="5" />
          </g>
        </svg>
      </div>
    </section>
  );
};

export default Hero;