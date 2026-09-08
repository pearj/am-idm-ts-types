/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Common script bindings available to all next-generation PingAM scripts.
 *
 * @see https://docs.pingidentity.com/pingam/8.1/am-scripting/script-bindings.md
 */

/**
 * Access the name of the current cookie as a string.
 */
declare const cookieName: string;

/**
 * Make outbound HTTP calls.
 */
declare const httpClient: AMHttpClient;

/**
 * Get localized message based on client locale.
 */
declare const locales: AMLocales;

/**
 * Write a message to the AM debug log (SLF4J next-gen logger wrapper).
 */
declare const logger: AMLogger;

/**
 * Identify the current journey and get information about its configuration.
 */
declare const journey: AMJourney;

/**
 * Evaluate policies using the policy engine API.
 */
declare const policy: AMPolicy;

/**
 * Access the realm to which the user is authenticating.
 */
declare const realm: string;

/**
 * Access the name of the running script.
 */
declare const scriptName: string;

/**
 * Reference secrets and credentials from scripts.
 */
declare const secrets: AMSecrets;

/**
 * Reference system properties.
 */
declare const systemEnv: AMSystemEnv;

/**
 * Access utility functions such as base64, cryptographic operations, and type conversions.
 */
declare const utils: AMUtils;

interface AMHttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH" | string;
  headers?: Record<string, string>;
  form?: Record<string, any>;
  clientName?: string;
  token?: string;
  body?: any;
}

interface AMResponseScriptWrapper {
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly headers: Record<string, any> | Map<string, any>;
  json: () => any;
  text: () => string;
  formData: () => Record<string, any>;
}

interface AMHttpClientResponsePromise extends Promise<AMResponseScriptWrapper> {
  get: () => AMResponseScriptWrapper;
}

interface AMHttpClient {
  send: (uri: string, requestOptions?: AMHttpRequestOptions) => AMHttpClientResponsePromise;
}

interface AMLocales {
  getLocalizedMessage: (localizations: Record<string, string>) => string;
}

type AMLogFunction = (message: string, ...params: any[]) => void;

interface AMLogger {
  trace: AMLogFunction;
  debug: AMLogFunction;
  info: AMLogFunction;
  warn: AMLogFunction;
  error: AMLogFunction;
  isTraceEnabled: () => boolean;
  isDebugEnabled: () => boolean;
  isInfoEnabled: () => boolean;
  isWarnEnabled: () => boolean;
  isErrorEnabled: () => boolean;
}

interface AMJourney {
  name: () => string;
  identityResource: () => string;
  innerJourney: () => boolean;
  mustRun: () => boolean;
}

interface AMPolicySubject {
  ssoToken?: string;
  jwt?: string;
  claims?: any;
  [key: string]: any;
}

interface AMPolicyEvaluationResult {
  resource: string;
  actions: Record<string, boolean>;
  attributes?: Record<string, any>;
  advices?: Record<string, any>;
}

interface AMPolicy {
  evaluate: (subject: AMPolicySubject, application: string, resources: string[], environment: Record<string, string[]>) => AMPolicyEvaluationResult[];
}

interface AMGenericSecret {
  getAsBytes: () => number[];
  getAsUtf8: () => string;
}

interface AMSecrets {
  getGenericSecret: (secretLabel: string) => AMGenericSecret;
}

interface AMSystemEnv {
  getProperty: (propertyName: string, defaultValue?: string, returnType?: any) => any;
}

interface AMSubtleCryptoKeyAlgorithm {
  name: "AES" | "RSA" | "HMAC" | "ECDSA" | string;
  length?: number;
  modulusLength?: number;
  namedCurve?: "P-256" | "P-384" | "P-521" | string;
  hash?: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | string;
  [key: string]: any;
}

interface AMSubtleDeriveKeyParams {
  name: "PBKDF2" | string;
  hash: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | string;
  salt: number[];
  iterations: number;
}

interface AMSubtleCrypto {
  generateKey: (algorithm: string | AMSubtleCryptoKeyAlgorithm) => any;
  deriveKey: (algorithmParams: AMSubtleDeriveKeyParams, baseKey: number[], derivedKeyLength: number) => number[];
  encrypt: (algorithm: string, key: any, data: number[]) => number[];
  decrypt: (algorithm: string, key: any, data: number[]) => number[];
  digest: (algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | string, data: number[]) => string;
  sign: (algorithm: string | Record<string, any>, key: any, data: number[]) => number[];
  verify: (algorithm: string | Record<string, any>, key: any, data: number[], signature: number[]) => boolean;
}

interface AMUtils {
  base64: {
    encode: (toEncode: string | number[]) => string;
    decode: (toDecode: string) => string;
    decodeToBytes: (toDecode: string) => number[];
  };
  base64url: {
    encode: (toEncode: string | number[]) => string;
    decode: (toDecode: string) => string;
    decodeToBytes: (toDecode: string) => number[];
  };
  crypto: {
    randomUUID: () => string;
    getRandomValues: <T extends any[] | Uint8Array>(array: T) => T;
    subtle: AMSubtleCrypto;
  };
  types: {
    bytesToString: (bytes: number[]) => string;
    stringToBytes: (str: string) => number[];
  };
}
