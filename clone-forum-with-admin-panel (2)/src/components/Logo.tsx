export default function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg-ember" x1="8" y1="6" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffcf6b" />
          <stop offset="0.55" stopColor="#ff5c39" />
          <stop offset="1" stopColor="#d63f16" />
        </linearGradient>
      </defs>
      {/* маска фантома */}
      <path
        d="M24 4C13 4 7 12.5 7 21c0 5 2 9.6 5.4 13.2L10 42l7-3.4c2 .9 4.5 1.4 7 1.4s5-.5 7-1.4L38 42l-2.4-7.8C39 30.6 41 26 41 21 41 12.5 35 4 24 4z"
        fill="url(#lg-ember)"
      />
      <path
        d="M24 6.5C14.4 6.5 9.3 13.8 9.3 21c0 4.5 1.8 8.6 4.9 11.9l.6.6-1.7 5.6 5-2.4.7.3c1.7.8 3.5 1.1 5.2 1.1s3.5-.3 5.2-1.1l.7-.3 5 2.4-1.7-5.6.6-.6c3.1-3.3 4.9-7.4 4.9-11.9 0-7.2-5.1-14.5-14.7-14.5z"
        fill="#0a0d11"
      />
      {/* глаза */}
      <path d="M15 19.5c2.6-1.6 6-1.7 8-.2l-1.6 3.4c-1.9 1.3-4.6 1.2-6.4.2L15 19.5z" fill="url(#lg-ember)" />
      <path d="M33 19.5c-2.6-1.6-6-1.7-8-.2l1.6 3.4c1.9 1.3 4.6 1.2 6.4.2L33 19.5z" fill="url(#lg-ember)" />
      {/* молния */}
      <path d="M25.5 25L20 32h3.4l-1.6 6 5.8-7.6h-3.5l1.4-5.4z" fill="#ffcf6b" />
    </svg>
  );
}
