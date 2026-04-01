/**
 * Haptic feedback utility using the Vibration API.
 * Falls back silently on devices that don't support it.
 */

const canVibrate = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;

/** Light tap — buttons, toggles, selections */
export const hapticLight = () => { if (canVibrate()) navigator.vibrate(10); };

/** Medium tap — confirmations, form submits */
export const hapticMedium = () => { if (canVibrate()) navigator.vibrate(25); };

/** Heavy tap — errors, warnings, important actions */
export const hapticHeavy = () => { if (canVibrate()) navigator.vibrate([30, 50, 30]); };

/** Success pattern — booking confirmed, payment success */
export const hapticSuccess = () => { if (canVibrate()) navigator.vibrate([15, 80, 15, 80, 30]); };

/** Notification tap */
export const hapticNotification = () => { if (canVibrate()) navigator.vibrate([20, 100, 20]); };
