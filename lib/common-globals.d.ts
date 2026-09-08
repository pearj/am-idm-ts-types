/* eslint-disable @typescript-eslint/no-explicit-any */
declare const openidm: OpenIDM;

interface IDMBaseObject {
  readonly _id: string;
}

type Revision = {
  readonly _rev: string;
};

type Result = IDMBaseObject & Revision & Record<string, any>;

type PatchRemoveOperation = "remove";
type PatchValueOperation = "add" | "replace" | "increment" | "transform";
type PatchFromOperation = "copy" | "move";
type PatchOperation = PatchValueOperation | PatchRemoveOperation | PatchFromOperation;

type PatchOpts =
  | {
      operation: PatchValueOperation;
      field: string;
      value: any;
    }
  | {
      operation: PatchRemoveOperation;
      field: string;
      value?: any;
    }
  | {
      operation: PatchFromOperation;
      from: string;
      field: string;
    };

/**
 * Functions (access to managed objects, system objects, and configuration objects) within IDM are accessible to scripts via the `openidm` object.
 *
 * This interface contains the common CRUDPAQ methods supported across both IDM and AM next-generation scripts.
 *
 * @see https://backstage.forgerock.com/docs/idm/7.2/scripting-guide/scripting-func-ref.html
 * @see https://docs.pingidentity.com/pingam/8.1/am-scripting/script-bindings.md#common-openidm
 */
interface OpenIDM {
  /**
   * This function creates a new resource object.
   *
   * @example
   * ```javascript
   * openidm.create("managed/user", ID, JSON object);
   * ```
   *
   * @param resourceName - The container in which the object will be created, for example, `managed/user`.
   * @param newResourceId - The identifier of the object to be created, if the client is supplying the ID. If the server should generate the ID, pass null here.
   * @param content - The content of the object to be created.
   * @param params - Additional parameters that are passed to the create request.
   * @param fields - An array of the fields that should be returned in the result. The list of fields can include wild cards, such as `*` or `*_ref`. If no fields are specified, the entire new object is returned.
   * @return The created resource object.
   * @throws An exception is thrown if the object could not be created.
   */
  create: (resourceName: string, newResourceId: string | null, content: object, params?: object | null, fields?: string[]) => Result;

  /**
   * This function performs a partial modification of a managed or system object. Unlike the update function, only the modified attributes are provided, not the entire object.
   *
   * @param resourceName - The full path to the object being updated, including the ID.
   * @param rev - The revision of the object to be updated. Use null if the object is not subject to revision control, or if you want to skip the revision check and update the object, regardless of the revision.
   * @param value - An array of one or more JSON objects. The value of the modifications to be applied to the object.
   * @param params - Additional parameters that are passed to the patch request.
   * @param fields - An array of the fields that should be returned in the result.
   * @returns The modified resource object.
   * @throws An exception is thrown if the object could not be updated.
   */
  patch: (resourceName: string, rev: string | null, value: PatchOpts[], params?: object | null, fields?: string[]) => Result;

  /**
   * This function reads and returns a resource object.
   *
   * @example
   * ```javascript
   * openidm.read("managed/user/"+userId, null, ["*", "manager"]);
   * ```
   *
   * @param resourceName - The full path to the object to be read, including the ID.
   * @param params - The parameters that are passed to the read request.
   * @param fields - An array of the fields that should be returned in the result.
   * @returns The resource object, or `null` if not found.
   */
  read: (resourceName: string, params?: object | null, fields?: string[]) => Result | null;

  /**
   * This function updates an entire resource object.
   *
   * @param id - The identifier of the object to be updated
   * @param rev - The revision of the object to be updated. Use `null` if the object is not subject to revision control.
   * @param value - The complete replacement object.
   * @param params - The parameters that are passed to the update request.
   * @param fields - An array of the fields that should be returned in the result.
   * @returns The modified resource object.
   * @throws An exception is thrown if the object could not be updated.
   */
  update: (resourceName: string, rev: string | null, value: object, params?: object | null, fields?: string[]) => Result;

  /**
   * This function deletes a resource object.
   *
   * @param resourceName - The complete path to the to be deleted, including its ID.
   * @param rev - The revision of the object to be deleted. Use `null` if the object is not subject to revision control.
   * @param params - The parameters that are passed to the delete request.
   * @param fields - An array of the fields that should be returned in the result.
   * @returns Returns the deleted object if successful.
   * @throws An exception is thrown if the object could not be deleted.
   */
  delete: (resourceName: string, rev: string | null, params?: object | null, fields?: string[]) => Result;

  /**
   * This function performs a query on the specified resource object.
   *
   * @param resourceName - The resource object on which the query should be performed.
   * @param params - The parameters that are passed to the query (_queryFilter, or _queryId).
   * @param fields - A list of the fields that should be returned in the result.
   * @returns The result of the query.
   */
  query: (resourceName: string, params: QueryFilter, fields?: string[]) => QueryResult<Result>;

  /**
   * This function invokes a custom action on the specified resource.
   */
  action: (resource: string, actionName: string, content?: object | null, params?: object | null, fields?: string[]) => any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Cookie = {};

interface QueryResult<T> {
  /**
   * (For JDBC repositories only) the time, in milliseconds, that IDM took to process the query.
   */
  "query-time-ms"?: number;

  /**
   * The list of entries retrieved by the query.
   */
  result: T[];

  /**
   * The number of records in the result.
   */
  resultCount?: number;
  pagedResultsCookie?: Cookie;
  totalPagedResultsPolicy?: string;
  totalPagedResults?: number;
  remainingPagedResults?: number;
}

type QueryFilter = (QueryFilterParams | QueryIdParams | QueryExpressionParams) & QueryOpts;

type QueryFilterParams = {
  _queryFilter: string;
};
type QueryIdParams = {
  _queryId: string;
};
type QueryExpressionParams = { _queryExpression: string };

interface QueryOpts {
  _pageSize?: number;
  _pagedResultsOffset?: number;
  _pagedResultsCookie?: Cookie;
  _totalPagedResultsPolicy?: string;
  _sortKeys?: string;
}
