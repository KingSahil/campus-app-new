import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Auth0 Configuration
const AUTH0_DOMAIN = 'supremesahil.us.auth0.com'; // e.g., 'dev-xxxxx.us.auth0.com'
const AUTH0_CLIENT_ID = 'V2Pti9JcSRrcewATgR1xu4O0FHVGgXMq';

WebBrowser.maybeCompleteAuthSession();

// Create the authorization request config
const useProxy = Platform.select({ web: false, default: true });

export const auth0Config = {
    clientId: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    redirectUri: AuthSession.makeRedirectUri({ useProxy }),
    scopes: ['openid', 'profile', 'email'],
};

export const discovery = {
    authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
    tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
    revocationEndpoint: `https://${AUTH0_DOMAIN}/oauth/revoke`,
};

// Store for user session
let currentUser = null;
let accessToken = null;

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
        return { data: { user: currentUser }, error: null };
    },

    async getSession() {
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
        
        // Optionally clear Auth0 session
        await WebBrowser.openBrowserAsync(
            `https://${auth0Config.domain}/v2/logout?client_id=${auth0Config.clientId}&returnTo=${encodeURIComponent(auth0Config.redirectUri)}`
        );
        
        return { error: null };
    },
};
