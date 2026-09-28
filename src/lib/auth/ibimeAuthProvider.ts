/**
 * ============================================================================
 * AUTH PROVIDER AGNÓSTICO PARA FRONT-END DE IBIME (OIDC / OAuth 2.0 con PKCE)
 * Protocolo de Autenticación Federada Hermética sin almacenamiento inseguro
 * ============================================================================
 * 
 * Características de Seguridad Zero-Trust:
 * 1. Implementa PKCE (RFC 7636) con SHA-256 para prevenir interceptación de códigos.
 * 2. Cero almacenamiento en localStorage para Access Tokens (mitigación total de XSS).
 * 3. Almacenamiento volátil en memoria (In-Memory Enclosed Closure).
 * 4. Verificación de parámetro 'state' para mitigación estricta de ataques CSRF.
 * 5. Agnóstico respecto a frameworks (compatible con React, Next.js, Vue o Vanilla JS).
 */

import { TenantId, InstitutionMetadata } from './multiTenantSession';

export interface IbimeAuthConfig {
  issuerUrl: string; // URL base de la pasarela central (ej: 'https://api.iskool.mx' o 'http://localhost:3000')
  clientId: string; // ID de cliente registrado (ej: 'ibime_portal_client')
  redirectUri: string; // URI de retorno autorizada (ej: 'https://ibime.iskool.mx/callback')
  tenantId: TenantId; // 'ibime'
  scope?: string; // 'openid profile email roles'
}

export interface IbimeAuthUser {
  id: string;
  email: string;
  role: string;
  school_id: string;
  tenant_id: TenantId;
  first_name?: string;
  last_name?: string;
  institution_metadata: InstitutionMetadata;
}

export interface IbimeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  user: IbimeAuthUser;
}

export class IbimeAuthProvider {
  private config: IbimeAuthConfig;
  // Token en memoria protegido contra robo por XSS
  private inMemoryAccessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private currentUser: IbimeAuthUser | null = null;

  constructor(config: IbimeAuthConfig) {
    this.config = {
      ...config,
      tenantId: 'ibime',
      scope: config.scope || 'openid profile email roles'
    };
  }

  // ==========================================================================
  // GENERADORES CRIPTOGRÁFICOS DE SEGURIDAD (PKCE & STATE)
  // ==========================================================================

  private generateRandomString(length: number = 64): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    globalThis.crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return globalThis.crypto.subtle.digest('SHA-256', data);
  }

  private base64UrlEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Genera el par criptográfico PKCE (Code Verifier y Code Challenge)
   */
  public async generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = this.generateRandomString(64);
    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64UrlEncode(hashed);
    return { codeVerifier, codeChallenge };
  }

  // ==========================================================================
  // FLUJO DE INICIO DE SESIÓN FEDERADO
  // ==========================================================================

  /**
   * Inicia el flujo de autenticación redirigiendo al Authorize Endpoint central
   */
  public async buildAuthorizeUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
    const { codeVerifier, codeChallenge } = await this.generatePkcePair();
    const state = this.generateRandomString(32);

    const url = new URL(`${this.config.issuerUrl}/api/auth/oauth/authorize`);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.config.scope || 'openid');
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);
    url.searchParams.set('tenant_id', this.config.tenantId);

    return {
      url: url.toString(),
      state,
      codeVerifier
    };
  }

  /**
   * Procesa el código de autorización retornado por el servidor central
   */
  public async handleAuthorizationCallback(params: {
    code: string;
    state: string;
    expectedState: string;
    codeVerifier: string;
  }): Promise<IbimeAuthUser> {
    // 1. Verificación CSRF de State
    if (!params.state || params.state !== params.expectedState) {
      throw new Error('Violación de seguridad CSRF: El parámetro state no coincide o es inválido.');
    }

    if (!params.code) {
      throw new Error('No se recibió el código de autorización requerido.');
    }

    // 2. Intercambio de Código por Token (Token Exchange con PKCE)
    const tokenUrl = `${this.config.issuerUrl}/api/auth/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.config.tenantId
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        code: params.code,
        code_verifier: params.codeVerifier,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en intercambio de token HTTP ${response.status}`);
    }

    const tokenData: IbimeTokenResponse = await response.json();

    // 3. Almacenamiento seguro en memoria
    this.inMemoryAccessToken = tokenData.access_token;
    this.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
    this.currentUser = tokenData.user;

    return this.currentUser;
  }

  // ==========================================================================
  // CONSULTA DE SESIÓN Y TOKENS EN MEMORIA
  // ==========================================================================

  public getUser(): IbimeAuthUser | null {
    return this.currentUser;
  }

  public getAccessToken(): string | null {
    if (!this.inMemoryAccessToken) return null;
    if (this.tokenExpiresAt && Date.now() > this.tokenExpiresAt) {
      this.inMemoryAccessToken = null;
      this.currentUser = null;
      return null;
    }
    return this.inMemoryAccessToken;
  }

  public isAuthenticated(): boolean {
    return this.getAccessToken() !== null && this.currentUser !== null;
  }

  /**
   * Limpia toda la memoria de sesión
   */
  public logout(): void {
    this.inMemoryAccessToken = null;
    this.tokenExpiresAt = null;
    this.currentUser = null;
  }
}
