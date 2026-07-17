/** Luxury easing curves for cinematic animations */

export const EASE = {
  /** Standard luxury — smooth deceleration */
  luxury:     [0.25, 0.46, 0.45, 0.94] as [number,number,number,number],
  /** Dramatic expo out — for reveals */
  outExpo:    [0.16, 1.00, 0.30, 1.00] as [number,number,number,number],
  /** Cinematic pan — film-camera movement */
  cinema:     [0.77, 0.00, 0.18, 1.00] as [number,number,number,number],
  /** Circular in-out — premium UI transitions */
  inOutCirc:  [0.85, 0.00, 0.15, 1.00] as [number,number,number,number],
  /** Elastic — button press, spring */
  elastic:    [0.34, 1.56, 0.64, 1.00] as [number,number,number,number],
  /** Sine in-out — gentle breathing */
  sineInOut:  [0.45, 0.05, 0.55, 0.95] as [number,number,number,number],
  /** Back — slight overscroll */
  backOut:    [0.34, 1.30, 0.64, 1.00] as [number,number,number,number]} as const;

/** Duration constants in seconds */
export const DUR = {
  instant:    0.15,
  fast:       0.3,
  normal:     0.5,
  slow:       0.8,
  cinematic:  1.4,
  epic:       2.2,
  intro:      3.0} as const;

