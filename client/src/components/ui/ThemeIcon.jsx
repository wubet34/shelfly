export default function ThemeIcon({ theme }) {
  return theme === 'dark'
    ? <svg className="theme-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
    : <svg className="theme-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.7 8.7 0 1 0 20.5 15.3Z"/></svg>
}
