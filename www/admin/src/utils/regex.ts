/** Regex for page path */
export const urlRegex = /^(?:\/[a-z0-9]*(?:-[a-z0-9]+)*)*$/;

/**
 * Regex for the system name, not display name
 * Matches when first character is not a digit or underscore, and the rest are letters, numbers, or underscores
 */
export const nameRegex = /^[^\d_]\w*$/;
