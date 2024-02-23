/**
 * Wait for the specified time (in milliseconds).
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))