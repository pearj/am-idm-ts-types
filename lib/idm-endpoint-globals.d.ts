/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Request object provided to IDM custom endpoint scripts.
 *
 * @see https://docs.pingidentity.com/pingidm/8.1/scripting-guide/script-custom-endpoints.html#custom-endpoint-scripts
 */
interface IDMCustomEndpointRequest {
  /**
   * The HTTP CREST method of the request ("create", "read", "update", "delete", "patch", "query", "action").
   */
  method: "create" | "read" | "update" | "delete" | "patch" | "query" | "action" | string;

  /**
   * The path of the resource without the `endpoint/` prefix, such as `echo`.
   */
  resourcePath: string;

  /**
   * Any additional parameters provided in the request (e.g. query parameters).
   */
  additionalParameters: Record<string, any>;

  /**
   * Content / payload based on the request.
   */
  content?: any;

  /**
   * The identifier of the new object available as the result of a `create` request.
   */
  newResourceId?: string | null;

  /**
   * The revision of the object.
   */
  revision?: string | null;

  /**
   * The array of patch operations when method is `patch`.
   */
  patchOperations?: PatchOpts[];

  /**
   * Paging cookie for query requests.
   */
  pagedResultsCookie?: Cookie | null;

  /**
   * Paging offset for query requests.
   */
  pagedResultsOffset?: number;

  /**
   * Page size for query requests.
   */
  pageSize?: number;

  /**
   * The query identifier when a predefined query is executed.
   */
  queryId?: string;

  /**
   * The query filter expression for query requests.
   */
  queryFilter?: any;

  /**
   * The action name when method is `action`.
   */
  action?: string;
}

/**
 * Context of the request, including headers and security context chain.
 *
 * @see https://docs.pingidentity.com/pingidm/8.1/scripting-guide/request-context.html
 */
interface IDMCustomEndpointContext {
  current?: Record<string, any>;
  parent?: IDMCustomEndpointContext;
  toJsonValue?: () => { getObject: () => Record<string, any> };
  [key: string]: any;
}

declare const request: IDMCustomEndpointRequest;
declare const context: IDMCustomEndpointContext;
