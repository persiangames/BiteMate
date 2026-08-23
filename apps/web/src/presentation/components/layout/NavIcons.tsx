const iconProps = {
  viewBox: '0 0 24 24',
  width: 26,
  height: 26,
  fill: 'none',
  'aria-hidden': true,
} as const;

export function NavFeedIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M4.5 9.2h15v9.3a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V9.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 9.2c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 11.2v6.2M9 13.8h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function NavNearbyIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.8" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function NavMeetupsIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M8.2 13.4c-2.2 0-4.2 1.4-4.2 3.4V18h8.4v-1.2c0-2-2-3.4-4.2-3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="8.6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.2 13.6c1.9.2 3.6 1.5 3.6 3.2V18H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="15.8" cy="8.8" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function NavChatIcon() {
  return (
    <svg {...iconProps}>
      <path
        d="M5 16.8V7.8A2.3 2.3 0 0 1 7.3 5.5h9.4A2.3 2.3 0 0 1 19 7.8v6.2a2.3 2.3 0 0 1-2.3 2.3H9.2L5 19.2v-2.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.5 9.6h7M8.5 12.4h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function NavProfileIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
