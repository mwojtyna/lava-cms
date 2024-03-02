/** Regex for page path */
export const urlRegex = /^(?:\/[a-z0-9]*(?:-[a-z0-9]+)*)*$/;

/**
 * Regex for the system name
 * Matches when first character is not a digit or underscore, and the rest are letters, numbers, or underscores
 */
export const systemNameRegex = /^[^\d_]\w*$/;

/**
 * Regex for display name
 * Matches when the string starts with a word character and contains only word characters and whitespace
 */
export const displayNameRegex = /^\w[\w\s]*$/;

/**
 * Regex for `Connection settings -> Development URL`
 * Matches when the string starts with `http://` or `https://`
 */
export const devUrlRegex = /^https?:\/\/.*/;
