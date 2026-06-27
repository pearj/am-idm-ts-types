import { IDMObject, Fields, ResultType, ReferenceType } from "../lib/idm-ts";

// --- Mock schemas representing generated types ---

export type ManagedUserDefaults = {
  _tag?: "managed/user";
  _id?: string;
  userName: string;
  givenName: string;
  sn: string;
  mail: string;
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

// 6. Subtype fields and nested array wildcards (subtypes do not have relationship depth limits)
const st1 = subTypeObj.read("123", { fields: ["firstType/*/something", "firstType/*/subArray/*/a"] });
if (st1) {
  const firstType = st1.firstType;
  if (firstType && firstType.length > 0) {
    const something: string = firstType[0].something;
    const subArray = firstType[0].subArray;
    if (subArray && subArray.length > 0) {
      const a: string | undefined = subArray[0].a;
      // @ts-expect-error - 'b' was not selected
      subArray[0].b;
    }
    // @ts-expect-error - 'arOfString' was not selected
    firstType[0].arOfString;
  }
}

// 7. Enforcing relationship limit: only 1 level deep relationship is allowed
// @ts-expect-error - manager/manager/givenName goes 2 levels deep in relationships
userObj.read("123", { fields: ["manager/manager/givenName"] });

// @ts-expect-error - reports/*/reports/*/givenName goes 2 levels deep in relationships
userObj.read("123", { fields: ["reports/*/reports/*/givenName"] });

// This is fine: manager/manager selects the manager relationship at level 1 (allowed)
const user7 = userObj.read("123", { fields: ["manager/manager"] });
if (user7) {
  const innerManager = user7.manager?.manager;
  // @ts-expect-error - cannot access givenName on nested relationship reference since we can't select its fields
  innerManager?.givenName;
}
