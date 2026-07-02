export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const hasGoogleSignIn = Boolean(GOOGLE_CLIENT_ID);