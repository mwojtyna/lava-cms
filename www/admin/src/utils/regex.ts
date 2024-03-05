/** Regex for page path */
export const urlRegex = /^(?:\/[a-z0-9]*(?:-[a-z0-9]+)*)*$/;

/**
 * Regex for the system name
 * Matches when first character is not a digit or underscore, and the rest are letters, numbers, or underscores
 */
export const systemNameRegex = /^[^\d_]\w*$/;

/**
 * Regex for display name
 * Matches when the string starts doesn't start with a whitespace character and contains any characters afterwards
 */
export const displayNameRegex = /^[^\s].*$/;

/**
 * Regex for `Connection settings -> Development URL`
 * Matches when the string starts with `http://` or `https://`
 */
export const devUrlRegex = /^https?:\/\/.*/;
