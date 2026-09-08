/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface EncryptedValue {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HashedValue {}

type HashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512" | "Bcrypt" | "Scrypt" | "PBKDF2";

/**
 * These are the valid actions available to a particular situation during synchronization.
 *
 * * `CREATE` - Create and link a target object.
 * * `UPDATE` - Link and update a target object.
 * * `DELETE` - Delete and unlink the target object.
 * * `LINK` - Link the correlated target object.
 * * `UNLINK` - Unlink the linked target object.
 * * `EXCEPTION` - Flag the link situation as an exception.
 * * `IGNORE` - Do not change the link or target object state.
 * * `REPORT` - Do not perform any action but report what would happen if the default action were performed.
 * * `NOREPORT` - Do not perform any action or generate any report.
 * * `ASYNC` - An asynchronous process has been started, so do not perform any action or generate any report.
 *
 * @see https://backstage.forgerock.com/docs/idm/7.2/synchronization-guide/sync-actions.html#sync-actions
 */
type Action = "CREATE" | "UPDATE" | "DELETE" | "LINK" | "UNLINK" | "EXCEPTION" | "IGNORE" | "REPORT" | "NOREPORT" | "ASYNC";

/**
 * Extends the OpenIDM interface with IDM-specific methods not supported in AM.
 */
interface OpenIDM {
  encrypt: (value: any, cipher: string, alias: string) => EncryptedValue;
  decrypt: (value: EncryptedValue) => any;
  isEncrypted: (value: any) => value is EncryptedValue;
  hash: (value: any, algorithm?: HashAlgorithm) => HashedValue;
  isHashed: (value: any) => value is HashedValue;
  matches: (string: string, value: HashedValue) => boolean;
}

type LogFunction = (message: string, ...params: any[]) => void;

interface Logger {
  info: LogFunction;
  debug: LogFunction;
  error: LogFunction;
  trace: LogFunction;
  warn: LogFunction;
}

interface IdentityServer {
  getProperty: (name: string, defaultVal?: string | null, substitute?: boolean) => string;
  getInstallLocation: () => string;
  getProjectLocation: () => string;
  getWorkingLocation: () => string;
}

declare const identityServer: IdentityServer;
declare const logger: Logger;
declare const injectedGlobalMocks: any;
