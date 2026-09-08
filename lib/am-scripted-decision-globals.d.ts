/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Script bindings specific to PingAM next-generation Scripted Decision nodes.
 *
 * @see https://docs.pingidentity.com/pingam/8.1/am-scripting/scripting-api-node.md
 */

declare const action: AMActionWrapper;
declare const nodeState: AMNodeState;
declare const requestCookies: Record<string, string> & { containsKey?: (key: string) => boolean };
declare const requestHeaders: { get: (headerName: string) => string[] | null };
declare const requestParameters: { get: (parameterName: string) => any[] | null };
declare const idRepository: AMIdRepository;
declare const cacheManager: AMCacheManager;
declare const callbacksBuilder: AMCallbacksBuilder;
declare const callbacks: AMCallbacks;
declare const existingSession: { get: (propertyName: string) => string | null } | undefined;
declare const jwtAssertion: AMJwtAssertion;
declare const jwtValidator: AMJwtValidator;
declare const oauthApplication: AMOAuthApplication | undefined;
declare const samlApplication: AMSAMLApplication | undefined;
declare const resumedFromSuspend: boolean;
declare let auditEntryDetail: string | Record<string, any>;

interface AMActionWrapper {
  goTo: (outcome: string) => AMActionWrapper;
  putSessionProperty: (key: string, value: string) => AMActionWrapper;
  removeSessionProperty: (key: string) => AMActionWrapper;
  withDescription: (description: string) => AMActionWrapper;
  withErrorMessage: (message: string) => AMActionWrapper;
  withHeader: (header: string) => AMActionWrapper;
  withIdentifiedAgent: (agentName: string) => AMActionWrapper;
  withIdentifiedUser: (username: string) => AMActionWrapper;
  withLockoutMessage: (message: string) => AMActionWrapper;
  withMaxIdleTime: (maxIdleTime: number) => AMActionWrapper;
  withMaxSessionTime: (maxSessionTime: number) => AMActionWrapper;
  withStage: (stage: string) => AMActionWrapper;
  suspend: (message: string, logic?: ((resumeUri: string) => void) | any, maximumSuspendDuration?: number) => AMActionWrapper;
}

interface AMNodeState {
  get: (propertyName: string) => any;
  getObject: (propertyName: string) => any;
  putShared: (propertyName: string, propertyValue: any) => AMNodeState;
  putTransient: (propertyName: string, propertyValue: any) => AMNodeState;
  mergeShared: (object: Record<string, any>) => AMNodeState;
  mergeTransient: (object: Record<string, any>) => AMNodeState;
}

interface AMScriptedIdentity {
  getAttributeValues: (attributeName: string) => string[];
  getName: () => string;
  getUniversalId: () => string;
  setAttribute: (attributeName: string, attributeValues: string[]) => void;
  addAttribute: (attributeName: string, attributeValue: string) => void;
  store: () => void;
  exists: () => boolean;
}

interface AMIdRepository {
  getIdentity: (username: string) => AMScriptedIdentity;
}

interface AMCache {
  get: (key: Record<string, string>) => any;
  refresh: (key: Record<string, string>) => void;
  invalidate: (key: Record<string, string>) => void;
  invalidateAll: () => void;
}

interface AMCacheManager {
  exists: (cacheName: string) => boolean;
  named: (cacheName: string) => AMCache | null;
}

interface AMCallbacksBuilder {
  textOutputCallback: (messageType: number, message: string) => void;
  suspendedTextOutputCallback: (messageType: number, message: string) => void;
  hiddenValueCallback: (id: string, value: string) => void;
  choiceCallback: (prompt: string, choices: string[], defaultChoice: number, multipleSelectionsAllowed: boolean) => void;
  nameCallback: (prompt: string, defaultName?: string) => void;
  passwordCallback: (prompt: string, echoOn: boolean) => void;
  textInputCallback: (prompt: string, defaultText?: string) => void;
  scriptTextOutputCallback: (message: string) => void;
  redirectCallback: (redirectUrl: string, redirectData: Record<string, any>, method: string, statusParameter?: string, redirectBackUrlCookie?: string) => void;
  metadataCallback: (outputValue: any) => void;
  stringAttributeInputCallback: (name: string, prompt: string, value: string, required: boolean, policies?: any, validateOnly?: boolean, failedPolicies?: string[]) => void;
  numberAttributeInputCallback: (name: string, prompt: string, value: number, required: boolean, policies?: any, validateOnly?: boolean, failedPolicies?: string[]) => void;
  booleanAttributeInputCallback: (name: string, prompt: string, value: boolean, required: boolean, policies?: any, validateOnly?: boolean, failedPolicies?: string[]) => void;
  confirmationCallback: (promptOrMessageType: string | number, optionsOrType: string[] | number, defaultOption: number) => void;
  languageCallback: (language: string, country: string) => void;
  selectIdPCallback: (providers: any[]) => void;
  termsAndConditionsCallback: (version: string, terms: string, createDate: string) => void;
  [key: string]: any;
}

interface AMCallbacks {
  isEmpty: () => boolean;
  getBooleanAttributeInputCallbacks: () => boolean[];
  getChoiceCallbacks: () => number[][];
  getConfirmationCallbacks: () => number[];
  getConsentMappingCallbacks: () => boolean[];
  getDeviceProfileCallbacks: () => string[];
  getHiddenValueCallbacks: () => Record<string, string>;
  getHttpCallbacks: () => string[];
  getIdpCallbacks: () => Record<string, any>[];
  getKbaCreateCallbacks: () => Record<string, string>[];
  getLanguageCallbacks: () => string[];
  getNameCallbacks: () => string[];
  getNumberAttributeInputCallbacks: () => number[];
  getPasswordCallbacks: () => string[];
  getSelectIdPCallbacks: () => Record<string, any>[];
  getStringAttributeInputCallbacks: () => string[];
  getTermsAndConditionsCallbacks: () => boolean[];
  getTextInputCallbacks: () => string[];
  getValidatedPasswordCallbacks: () => Record<string, any>[];
  getValidatedUsernameCallbacks: () => Record<string, any>[];
  getX509CertificateCallbacks: () => Record<string, any>[];
  [key: string]: any;
}

interface AMJwtAssertion {
  generateJwt: (jwtData: {
    jwtType: "SIGNED" | "SIGNED_THEN_ENCRYPTED" | "ENCRYPTED_THEN_SIGNED" | string;
    jwsAlgorithm?: "HS256" | "RS256" | string;
    issuer?: string;
    audience?: string;
    subject?: string;
    type?: string;
    jwtId?: string;
    claims?: Record<string, any>;
    stableId?: string;
    accountId?: string;
    validityMinutes?: number;
    privateKey?: Record<string, any>;
    signingKey?: string;
    encryptionKey?: string;
    [key: string]: any;
  }) => string;
}

interface AMJwtValidator {
  validateJwtClaims: (jwtData: {
    jwtType: "SIGNED" | "SIGNED_THEN_ENCRYPTED" | "ENCRYPTED_THEN_SIGNED" | string;
    jwt: string;
    issuer?: string;
    audience?: string;
    subject?: string;
    type?: string;
    claims?: Record<string, any>;
    stableId?: string;
    accountId?: string;
    signingKey?: string;
    encryptionKey?: string;
    [key: string]: any;
  }) => Record<string, any> | null;
}

interface AMOAuthApplication {
  getApplicationId: () => string;
  getRequestProperties: () => Record<string, any>;
  getClientProperties: () => Record<string, any>;
}

interface AMSAMLApplication {
  getFlowInitiator: () => "IDP" | "SP" | string;
  getApplicationId: () => string;
  getAuthnRequest: () => Record<string, any>;
  getAssertion: () => Record<string, any> | null;
  getIdpAttributes: () => Record<string, string[]>;
  getSpAttributes: () => Record<string, string[]>;
}
