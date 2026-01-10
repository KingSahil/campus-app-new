import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

// Create the authorization request config
const useProxy = Platform.select({ web: false, default: true });

export const auth0Config = {
    clientId: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    redirectUri: AuthSession.makeRedirectUri({
        scheme: "campusapp",
        path: "/callback" 
    }),
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

// Load session from storage
const loadSession = async () => {
    try {
        const [userStr, token] = await Promise.all([
            AsyncStorage.getItem(USER_KEY),
            AsyncStorage.getItem(TOKEN_KEY),
        ]);
        
        if (userStr && token) {
            currentUser = JSON.parse(userStr);
            accessToken = token;
            console.log('Session loaded from storage');
        }
    } catch (error) {
        console.error('Error loading session:', error);
    }
};

// Save session to storage
const saveSession = async (user, token) => {
    try {
        await Promise.all([
            AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
            AsyncStorage.setItem(TOKEN_KEY, token),
        ]);
        console.log('Session saved to storage');
    } catch (error) {
        console.error('Error saving session:', error);
    }
};

// Clear session from storage
const clearSession = async () => {
    try {
        await Promise.all([
            AsyncStorage.removeItem(USER_KEY),
            AsyncStorage.removeItem(TOKEN_KEY),
        ]);
        console.log('Session cleared from storage');
    } catch (error) {
        console.error('Error clearing session:', error);
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

            const result = await request.promptAsync(discovery, { useProxy });
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
            await loadSession();
        }
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
        
        // Optionally clear Auth0 session
        await WebBrowser.openBrowserAsync(
            `https://${auth0Config.domain}/v2/logout?client_id=${auth0Config.clientId}&returnTo=${encodeURIComponent(auth0Config.redirectUri)}`
        );
        
        return { error: null };
    },
};
