/**
 * NexForge Enterprise Typography Design Tokens & Style Utilities
 *
 * Primary Font Family: "Manrope"
 * Fallback Stack: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
 * Technical Code/Telemetry: "JetBrains Mono", monospace (strictly reserved for equations, circuits & code)
 */

export const typography = {
  // Page level titles (28-36px, bold 700, tracking-tight)
  pageTitle: "font-sans text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight",
  
  // Section level titles (20-24px, semibold-bold 650-700, tracking-tight)
  sectionTitle: "font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug",
  
  // Card level titles (15-18px, semibold 600, tracking-tight)
  cardTitle: "font-sans text-sm sm:text-base font-semibold tracking-tight text-slate-900",
  
  // Subheadings and modal titles
  subheading: "font-sans text-sm font-semibold tracking-normal text-slate-800",
  
  // Body text (14-16px, regular 400 or medium 500, line-height 1.5-1.6)
  body: "font-sans text-sm sm:text-base text-slate-600 leading-relaxed font-normal",
  
  // Small body text / descriptions (12-14px)
  bodySmall: "font-sans text-xs sm:text-sm text-slate-500 leading-normal font-normal",
  
  // Labels / Overlines (11-13px, medium/semibold, subtle tracking)
  label: "font-sans text-xs font-semibold text-slate-700 tracking-wide",
  
  // Uppercase category badges / overlines (10-11px, bold, tracking-wider)
  labelCaps: "font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500",
  
  // Premium dominant metric numbers (large, strong, tabular-nums, font-extrabold 700-800)
  metricHero: "font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight tabular-nums",
  metricLarge: "font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums",
  metricMedium: "font-sans text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums",
  metricSmall: "font-sans text-base sm:text-lg font-bold text-slate-900 tracking-tight tabular-nums",
  
  // Metric units and companion text
  metricUnit: "font-sans text-xs sm:text-sm text-slate-400 font-medium",
  
  // Navigation items (13-15px, medium 500 / semibold 600)
  navItem: "font-sans text-xs sm:text-sm font-medium tracking-normal",
  navItemActive: "font-sans text-xs sm:text-sm font-bold tracking-tight text-orange-950",
  
  // Interactive buttons (13-15px, semibold 600, tracking-tight)
  button: "font-sans text-xs sm:text-sm font-semibold tracking-tight leading-none",
  
  // Technical code / raw math formulas / hardware telemetry ONLY
  codeMono: "font-mono text-xs tabular-nums",
  formulaMono: "font-mono text-xs sm:text-sm tracking-tight text-slate-800",
} as const;

export default typography;
