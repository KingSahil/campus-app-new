import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Auth0 Configuration - try env first, then fallback to app.json extra
const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN || Constants.expoConfig?.extra?.auth0Domain;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || Constants.expoConfig?.extra?.auth0ClientId;

// Validate environment variables
if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
    console.error('Auth0 Configuration Error:', {
        domain: AUTH0_DOMAIN ? 'Set' : 'Missing',
        clientId: AUTH0_CLIENT_ID ? 'Set' : 'Missing'
    });
    throw new Error('Auth0 environment variables are not configured. Check .env file.');
}

WebBrowser.maybeCompleteAuthSession();

// Create the authorization request config
// Detect if running in Expo Go or standalone app
const isExpoGo = Constants.appOwnership === 'expo';

// For Expo Go, use the proxy redirect URI
// For standalone apps, use custom scheme
const redirectUri = isExpoGo
    ? AuthSession.makeRedirectUri({
        useProxy: true,
        // This will use Expo's proxy server: https://auth.expo.io/@your-username/your-app
    })
    : Platform.select({
        android: `com.prosahil2150.campusappnew://${AUTH0_DOMAIN}/android/com.prosahil2150.campusappnew/callback`,
        ios: `com.prosahil2150.campusappnew://${AUTH0_DOMAIN}/ios/com.prosahil2150.campusappnew/callback`,
        default: AuthSession.makeRedirectUri({
            scheme: 'com.prosahil2150.campusappnew'
        })
    });

console.log('Auth0 Redirect URI:', redirectUri);
console.log('Running in Expo Go:', isExpoGo);

export const auth0Config = {
    clientId: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
};

export const discovery = {
    authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
    tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
    revocationEndpoint: `https://${AUTH0_DOMAIN}/oauth/revoke`,
};

// Storage keys
const USER_KEY = '@auth0_user';
const TOKEN_KEY = '@auth0_token';

// Store for user session (in-memory cache)
let currentUser = null;
let accessToken = null;
let sessionLoadPromise = null;

// Load session from storage
const loadSession = async () => {
    // If a load is already in progress, return that promise
    if (sessionLoadPromise) {
        return sessionLoadPromise;
    }

    sessionLoadPromise = (async () => {
        try {
            console.log('[Auth0] Loading session from storage...');
            const [userStr, token] = await Promise.all([
                AsyncStorage.getItem(USER_KEY),
                AsyncStorage.getItem(TOKEN_KEY),
            ]);

            if (userStr && token) {
                currentUser = JSON.parse(userStr);
                accessToken = token;
                console.log('[Auth0] Session loaded successfully:', currentUser.sub);
                return currentUser; // Return user for consistent behavior
            } else {
                console.log('[Auth0] No session found in storage');
                return null;
            }
        } catch (error) {
            console.error('[Auth0] Error loading session:', error);
            return null;
        } finally {
            sessionLoadPromise = null;
        }
    })();

    return sessionLoadPromise;
};

// Save session to storage
const saveSession = async (user, token) => {
    try {
        await Promise.all([
            AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
            AsyncStorage.setItem(TOKEN_KEY, token),
        ]);
        currentUser = user; // Update in-memory
        accessToken = token;
        console.log('[Auth0] Session saved to storage');
    } catch (error) {
        console.error('[Auth0] Error saving session:', error);
    }
};

// Clear session from storage
const clearSession = async () => {
    try {
        await Promise.all([
            AsyncStorage.removeItem(USER_KEY),
            AsyncStorage.removeItem(TOKEN_KEY),
        ]);
        currentUser = null;
        accessToken = null;
        console.log('[Auth0] Session cleared from storage');
    } catch (error) {
        console.error('[Auth0] Error clearing session:', error);
    }
};

export const auth0 = {
    async signInWithGoogle() {
        try {
            const request = new AuthSession.AuthRequest({
                clientId: auth0Config.clientId,
                scopes: auth0Config.scopes,
                redirectUri: auth0Config.redirectUri,
                usePKCE: true,
                extraParams: {
                    connection: 'google-oauth2',
                },
            });

            console.log('Auth request config:', {
                clientId: auth0Config.clientId,
                redirectUri: auth0Config.redirectUri,
            });

            const result = await request.promptAsync(discovery);
            console.log('Auth result:', result);

            if (result.type === 'success') {
                const { code } = result.params;
                console.log('Authorization code received');

                // Exchange code for token with PKCE
                const tokenResponse = await AuthSession.exchangeCodeAsync(
                    {
                        clientId: auth0Config.clientId,
                        code,
                        redirectUri: auth0Config.redirectUri,
                        extraParams: {
                            code_verifier: request.codeVerifier,
                        },
                    },
                    discovery
                );

                console.log('Token exchange successful');
                accessToken = tokenResponse.accessToken;

                if (!accessToken) {
                    throw new Error('No access token received');
                }

                // Get user info
                const userInfo = await fetch(`https://${auth0Config.domain}/userinfo`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                console.log('UserInfo response status:', userInfo.status);
                const userText = await userInfo.text();

                if (!userInfo.ok) {
                    throw new Error(`Failed to get user info: ${userText}`);
                }

                currentUser = JSON.parse(userText);
                accessToken = tokenResponse.accessToken;

                // Save session to persistent storage
                await saveSession(currentUser, accessToken);

                console.log('User authenticated:', currentUser);

                return { user: currentUser, error: null };
            }

            return { user: null, error: new Error('Authentication cancelled') };
        } catch (error) {
            console.error('Auth0 signInWithGoogle error:', error);
            return { user: null, error };
        }
    },

    async getUser() {
        // Load from storage if not in memory
        if (!currentUser) {
            console.log('[Auth0] getUser: No current user, loading session...');
            await loadSession();
        }
        console.log('[Auth0] getUser returning:', currentUser ? 'User found' : 'No user');
        return { data: { user: currentUser }, error: null };
    },

    async getSession() {
        // Load from storage if not in memory
        if (!currentUser) {
            await loadSession();
        }
        return {
            data: {
                session: currentUser ? { user: currentUser, access_token: accessToken } : null
            },
            error: null
        };
    },

    async signOut() {
        currentUser = null;
        accessToken = null;

        // Clear from persistent storage
        await clearSession();

        // Optionally clear Auth0 session (Native only)
        if (Platform.OS !== 'web') {
            await WebBrowser.openBrowserAsync(
                `https://${auth0Config.domain}/v2/logout?client_id=${auth0Config.clientId}&returnTo=${encodeURIComponent(auth0Config.redirectUri)}`
            );
        }

        return { error: null };
    },
};
