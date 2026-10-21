import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { encryptToken, decryptToken } from '@/lib/security/tokenCipher';
import { signOAuthState, verifyOAuthState } from '@/lib/security/oauthState';
import { GOOGLE_DIRECTOR_WORKSPACE_SCOPES } from './googleOAuthService';

const SCOPES = [...GOOGLE_DIRECTOR_WORKSPACE_SCOPES];

export class GoogleAuthService {
  private static getOAuth2Client() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.iskool.mx';
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/integrations/google/callback`
    );
  }

  static generateAuthUrl(schoolId: string, userId: string): string {
    const oauth2Client = this.getOAuth2Client();
    const state = signOAuthState({
      flow: 'workspace_connect',
      tenantId: schoolId,
      email: userId
    });

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state,
      include_granted_scopes: true
    });
  }

  static async handleCallback(code: string, stateString: string) {
    const stateVerification = verifyOAuthState(stateString);
    if (!stateVerification.valid || !stateVerification.payload) {
      throw new Error('Estado OAuth inválido o expirado. Violación de verificación Anti-CSRF.');
    }

    const { tenantId: schoolId, email: userId } = stateVerification.payload;

    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const emailAddress = userInfo.data.email;

    if (!emailAddress) {
      throw new Error('No se pudo obtener la dirección de correo de Google.');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('email_accounts')
      .upsert({
        school_id: schoolId,
        user_id: userId,
        email_address: emailAddress,
        provider: 'google_workspace',
        access_token_encrypted: encryptToken(tokens.access_token),
        refresh_token_encrypted: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        is_active: true,
        shadow_mode: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email_address' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAuthenticatedGmailClient(accountId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: account, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error || !account) throw new Error('Cuenta de correo no encontrada.');

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: decryptToken(account.access_token_encrypted),
      refresh_token: account.refresh_token_encrypted ? decryptToken(account.refresh_token_encrypted) : undefined,
      expiry_date: account.token_expires_at ? new Date(account.token_expires_at).getTime() : undefined,
    });

    oauth2Client.on('tokens', async (newTokens) => {
      const existingDecrypted = account.refresh_token_encrypted ? decryptToken(account.refresh_token_encrypted) : undefined;
      const refTokenToStore = newTokens.refresh_token ?? existingDecrypted;
      await supabase.from('email_accounts').update({
        access_token_encrypted: encryptToken(newTokens.access_token),
        refresh_token_encrypted: refTokenToStore ? encryptToken(refTokenToStore) : null,
        token_expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString()
      }).eq('id', accountId);
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }
}
