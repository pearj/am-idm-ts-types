import { IDMObject, Fields, ResultType, ReferenceType, idmObject } from "../lib/idm-ts";
import { equals, Filter, presence, startsWith } from "../lib/query-filter";

// --- Mock schemas representing generated types ---

export type SubManagedUserPreferences = {
  // tslint:disable-next-line: no-duplicate-string
  _tag?: "managed/user/preferences";

  /**
   * Send me news and updates
   */
  updates?: boolean;

  /**
   * Send me special offers and services
   */
  marketing?: boolean;
};

export type ManagedUserDefaults = {
  _tag?: "managed/user";
  _id?: string;
  userName: string;
  givenName: string;
  sn: string;
  mail: string;
  preferences?: SubManagedUserPreferences;
} & IDMBaseObject;

export type ManagedUserNonDefaults = {
  manager?: ReferenceType<ManagedUser, ManagedUserDefaults>;
  reports?: ReferenceType<ManagedUser, ManagedUserDefaults>[];
};

export type ManagedUser = ManagedUserDefaults & ManagedUserNonDefaults;

// Subtype types
export type SubManagedSubTypeTestFirstTypeSubArray = {
  _tag?: "managed/SubTypeTest/firstType/subArray";
  a?: string;
  b?: string;
};

export type SubManagedSubTypeTestFirstType = {
  _tag?: "managed/SubTypeTest/firstType";
  something: string;
  subArray?: SubManagedSubTypeTestFirstTypeSubArray[];
  semiDefinedObj?: Record<string, any>;
  arOfString?: string[];
};

export type ManagedSubTypeTestDefaults = {
  _tag?: "managed/SubTypeTest";
  firstType?: SubManagedSubTypeTestFirstType[] | null;
} & IDMBaseObject;

export type ManagedSubTypeTestNonDefaults = {};

export type ManagedSubTypeTest = ManagedSubTypeTestDefaults & ManagedSubTypeTestNonDefaults;

// --- Test wrapper setup ---

const userObj = new IDMObject<ManagedUser, ManagedUserDefaults>("managed/user");
const subTypeObj = new IDMObject<ManagedSubTypeTest, ManagedSubTypeTestDefaults>("managed/SubTypeTest");

// --- Compilation validation tests ---

// 1. Direct fields only
const user1 = userObj.read("123", { fields: ["userName", "givenName"] });
if (user1) {
  const name: string = user1.userName;
  const given: string = user1.givenName;
  // @ts-expect-error - mail was not selected
  user1.mail;
  // @ts-expect-error - manager was not selected
  user1.manager;
}

// 2. Relationship field with subfields (1 level deep)
const user2 = userObj.read("123", { fields: ["givenName", "manager/givenName"] });
if (user2) {
  const given: string = user2.givenName;
  const managerName = user2.manager?.givenName; // should be string | undefined
  const managerRef = user2.manager?._ref; // should be string | undefined
  // @ts-expect-error - manager mail was not selected
  user2.manager?.mail;
  // @ts-expect-error - direct mail was not selected
  user2.mail;
}

// 3. Array of relationship field with subfields (1 level deep)
const user3 = userObj.read("123", { fields: ["givenName", "reports/*/userName"] });
if (user3) {
  const given: string = user3.givenName;
  const reports = user3.reports;
  if (reports && reports.length > 0) {
    const rName = reports[0].userName; // should be string | undefined
    const rRef = reports[0]._ref; // should be string
    // @ts-expect-error - reports mail was not selected
    reports[0].mail;
  }
}

// 4. Wildcard fields (*)
const user4 = userObj.read("123", { fields: ["*"] });
if (user4) {
  const name: string = user4.userName;
  const mail: string = user4.mail;
  // @ts-expect-error - manager is non-default and not in *
  user4.manager;
}

// 5. Wildcards in relationship
const user5 = userObj.read("123", { fields: ["givenName", "manager/*"] });
if (user5) {
  const given: string = user5.givenName;
  const managerUserName = user5.manager?.userName; // default field of manager, should be string | undefined
  // @ts-expect-error - manager is ReferenceType of defaults, manager.manager is non-default, so it shouldn't be accessible
  user5.manager?.manager;
}

// 6. Subtype fields (subtypes do not support nested field selection; selecting the subtype base returns the entire subtype)
const st1 = subTypeObj.read("123", { fields: ["firstType"] });
if (st1) {
  const firstType = st1.firstType;
  if (firstType && firstType.length > 0) {
    const something: string = firstType[0].something;
    const subArray = firstType[0].subArray;
    if (subArray && subArray.length > 0) {
      const a: string | undefined = subArray[0].a;
      const b: string | undefined = subArray[0].b; // now accessible since full object is returned
    }
    const arOfString: string[] | undefined = firstType[0].arOfString; // now accessible
  }
}

// @ts-expect-error - firstType/something is not valid because subtypes cannot be traversed in field selection (invalid)
subTypeObj.read("123", { fields: ["firstType/something"] });

// @ts-expect-error - firstType/*/something is not valid because subtypes cannot be traversed in field selection (invalid)
subTypeObj.read("123", { fields: ["firstType/*/something"] });

// 7. Enforcing relationship limit: only 1 level deep relationship is allowed
// @ts-expect-error - manager/manager/givenName goes 2 levels deep in relationships
userObj.read("123", { fields: ["manager/manager/givenName"] });

// @ts-expect-error - reports/*/reports/*/givenName goes 2 levels deep in relationships
userObj.read("123", { fields: ["reports/*/reports/*/givenName"] });

// @ts-expect-error - manager/manager goes 2 levels deep in relationships (invalid)
userObj.read("123", { fields: ["manager/manager"] });

// @ts-expect-error - reports/*/reports goes 2 levels deep in relationships (invalid)
userObj.read("123", { fields: ["reports/*/reports"] });

// --- Query Filter Type Checking Tests ---

// 1. Direct fields and leading slashes are fine
equals<ManagedUser, "userName">("userName", "joel");
equals<ManagedUser, "/userName">("/userName", "joel");
presence<ManagedUser, "mail">("mail");
presence<ManagedUser, "/mail">("/mail");

// 2. Subtype fields and nested array paths are fine (no * wildcard needed)
// @ts-expect-error - firstType is an array, must use /[ syntax
equals<ManagedSubTypeTest, "firstType/something">("firstType/something", "foo");
// @ts-expect-error - firstType is an array, must use /[ syntax
equals<ManagedSubTypeTest, "/firstType/something">("/firstType/something", "foo");
// @ts-expect-error - subArray is an array, must use /[ syntax
equals<ManagedSubTypeTest, "firstType/subArray/a">("firstType/subArray/a", "bar");

// 3. Relationships are NOT allowed
// @ts-expect-error - manager is a relationship field
equals<ManagedUser, "manager">("manager", {} as any);
// @ts-expect-error - reports is a relationship field
presence<ManagedUser, "reports">("reports");
// @ts-expect-error - manager with leading slash not allowed
equals<ManagedUser, "/manager">("/manager", {} as any);

// 4. Traversing relationships is NOT allowed
// @ts-expect-error - manager/givenName traverses a relationship
equals<ManagedUser, "manager/givenName">("manager/givenName", "joel");
// @ts-expect-error - reports/userName traverses a relationship
presence<ManagedUser, "reports/userName">("reports/userName");

// 5. Value type checking is strictly enforced
equals<ManagedUser, "userName">("userName", "joel"); // OK
// @ts-expect-error - userName expects string, not number
equals<ManagedUser, "userName">("userName", 123);

// 6. Array search syntax filters
equals<ManagedSubTypeTest, "/firstType/[subArray/[a">("/firstType/[subArray/[a", "zxc");
startsWith<ManagedSubTypeTest, "/firstType/[subArray/[a">("/firstType/[subArray/[a", "zxc");
presence<ManagedSubTypeTest, "/firstType/[subArray/[a">("/firstType/[subArray/[a");

// First level nested search
startsWith<ManagedSubTypeTest, "/firstType/[something">("/firstType/[something", "Test");

// Two levels, with Record property (semiDefinedObj)
startsWith<ManagedSubTypeTest, "/firstType/[semiDefinedObj/bob">("/firstType/[semiDefinedObj/bob", "ye");

// Single level presence check
presence<ManagedSubTypeTest, "/firstType/[subArray">("/firstType/[subArray");

const managedSubTypeObj = idmObject<ManagedSubTypeTest, ManagedSubTypeTestDefaults>("managed/SubTypeTest");
const newLocal: Filter<ManagedSubTypeTest> = equals("/firstType/[subArray/[a", "zxc");

const userMarketing: Filter<ManagedUser> = equals("/preferences/marketing", true);
const userUpdates: Filter<ManagedUser> = equals("/preferences/updates", true);
