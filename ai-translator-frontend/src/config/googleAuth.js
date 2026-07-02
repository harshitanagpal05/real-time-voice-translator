export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const hasGoogleSignIn = Boolean(GOOGLE_CLIENT_ID);

if (typeof window !== 'undefined' && !window.__voxaiGoogleAuthLogged) {
	window.__voxaiGoogleAuthLogged = true;
	const runtime = import.meta.env.DEV ? 'development' : 'production';
	const origin = window.location.origin;

	if (GOOGLE_CLIENT_ID) {
		console.info(`[VoxAI Google OAuth][${runtime}] clientId=${GOOGLE_CLIENT_ID} origin=${origin}`);
	} else {
		console.warn(`[VoxAI Google OAuth][${runtime}] clientId is missing origin=${origin}`);
	}
}