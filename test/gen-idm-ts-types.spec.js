/* eslint-disable */
const path = require("path");
const fs = require("fs");

// Set NODE_CONFIG_DIR before importing the generator so the config package loads test fixtures
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, "fixtures/config");

const generator = require("../bin/gen-idm-ts-types.js");

describe("gen-idm-ts-types unit tests", () => {
  describe("coalesce", () => {
    it("should return the first non-null, non-undefined argument", () => {
      expect(generator.coalesce(null, undefined, "first", "second")).toBe("first");
    });

    it("should convert boolean string 'true' to boolean true", () => {
      expect(generator.coalesce("true")).toBe(true);
    });

    it("should convert boolean string 'false' to boolean false", () => {
      expect(generator.coalesce("false")).toBe(false);
    });

    it("should return null if all arguments are null/undefined", () => {
      expect(generator.coalesce(null, undefined)).toBeNull();
    });
  });

  describe("naming generators", () => {
    it("should generate managed type name in PascalCase with Managed prefix", () => {
      expect(generator.generateManagedTypeName("user")).toBe("ManagedUser");
      expect(generator.generateManagedTypeName("user_profile")).toBe("ManagedUserProfile");
    });

    it("should generate system type name", () => {
      expect(generator.generateSystemTypeName("scim", "account")).toBe("SystemScimAccount");
    });

    it("should generate system object name", () => {
      expect(generator.generateSystemObjName("scim", "account")).toBe("scimAccount");
    });

    it("should generate sub TS type name", () => {
      expect(generator.generateSubTsTypeName("ManagedUser", "preferences")).toBe("ManagedUserPreferences");
    });

    it("should correctly identify managed types", () => {
      expect(generator.isManagedType("ManagedUser")).toBe(true);
      expect(generator.isManagedType("SystemScimAccount")).toBe(false);
    });
  });

  describe("filterResourceCollection", () => {
    it("should filter for managed collections", () => {
      const collections = [{ path: "managed/user" }, { path: "system/scim/account" }, { path: "managed/organization" }];
      expect(generator.filterResourceCollection(collections)).toEqual([{ path: "managed/user" }, { path: "managed/organization" }]);
    });
  });

  describe("calcReturnByDefault", () => {
    it("should return returnByDefault value if specified", () => {
      expect(generator.calcReturnByDefault({ returnByDefault: true })).toBe(true);
      expect(generator.calcReturnByDefault({ returnByDefault: false })).toBe(false);
    });

    it("should return false for relationship types by default", () => {
      expect(generator.calcReturnByDefault({ type: "relationship" })).toBe(false);
    });

    it("should return false for arrays of relationships by default", () => {
      expect(generator.calcReturnByDefault({ type: "array", items: { type: "relationship" } })).toBe(false);
    });

    it("should return true for other types by default", () => {
      expect(generator.calcReturnByDefault({ type: "string" })).toBe(true);
    });
  });

  describe("compareName", () => {
    it("should sort objects by name ascending", () => {
      const array = [{ name: "zebra" }, { name: "apple" }, { name: "banana" }];
      expect(array.sort(generator.compareName)).toEqual([{ name: "apple" }, { name: "banana" }, { name: "zebra" }]);
    });
  });

  describe("flattenType", () => {
    it("should flatten types without null", () => {
      expect(generator.flattenType({ types: ["string"], nullable: false })).toBe("string");
      expect(generator.flattenType({ types: ["string", "number"], nullable: false })).toBe("string | number");
    });

    it("should flatten types with null", () => {
      expect(generator.flattenType({ types: ["string"], nullable: true })).toBe("string | null");
      expect(generator.flattenType({ types: ["string", "number"], nullable: true })).toBe("string | number | null");
    });
  });

  describe("isRequired", () => {
    it("should return true if property has required flag true", () => {
      expect(generator.isRequired({ required: true }, "name", {})).toBe(true);
    });

    it("should return true if parent has property in its required list", () => {
      expect(generator.isRequired({}, "name", { required: ["name", "age"] })).toBe(true);
    });

    it("should return false if property is not required", () => {
      expect(generator.isRequired({}, "name", { required: ["age"] })).toBe(false);
    });
  });

  describe("convertType", () => {
    beforeEach(() => {
      // Setup default configuration for conversion tests
      generator.setConfig({
        useUnknownInsteadOfAny: false,
        useUnknownInsteadOfAnyForManagedObj: null,
        useUnknownInsteadOfAnyForConnectorObj: null,
      });
    });

    afterEach(() => {
      // Reset config to null to force reloading in subsequent integration tests
      generator.setConfig(null);
    });

    it("should convert primitive types", () => {
      expect(generator.convertType({ type: "string" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["string"],
      });
      expect(generator.convertType({ type: "boolean" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["boolean"],
      });
      expect(generator.convertType({ type: "number" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["number"],
      });
      expect(generator.convertType({ type: "integer" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["number"],
      });
    });

    it("should handle nullable type arrays", () => {
      expect(generator.convertType({ type: ["string", "null"] }, "propName", "obj", "TsType", [])).toEqual({
        nullable: true,
        types: ["string"],
      });
    });

    it("should convert simple object maps to Record<string, any> or Record<string, unknown>", () => {
      expect(generator.convertType({ type: "object" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["Record<string, any>"],
      });

      generator.setConfig({ useUnknownInsteadOfAny: true });
      expect(generator.convertType({ type: "object" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["Record<string, unknown>"],
      });
    });

    it("should convert arrays of primitives", () => {
      expect(generator.convertType({ type: "array", items: { type: "string" } }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["string[]"],
      });
    });

    it("should convert arrays of untyped elements to any[] or unknown[]", () => {
      expect(generator.convertType({ type: "array" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["any[]"],
      });

      generator.setConfig({ useUnknownInsteadOfAny: true });
      expect(generator.convertType({ type: "array" }, "propName", "obj", "TsType", [])).toEqual({
        nullable: false,
        types: ["unknown[]"],
      });
    });

    it("should throw error for relationship properties in non-Managed object schemas", () => {
      expect(() => {
        generator.convertType({ type: "relationship" }, "propName", "obj", "SystemScimAccount", []);
      }).toThrow(/Relationships are only supported for Managed Objects/);
    });

    it("should convert relationship property in Managed objects", () => {
      const subTypes = [];
      const result = generator.convertType(
        {
          type: "relationship",
          resourceCollection: [{ path: "managed/user" }],
        },
        "manager",
        "user",
        "ManagedUser",
        subTypes,
      );

      expect(result).toEqual({
        nullable: false,
        types: ["ReferenceType<ManagedUser, ManagedUserDefaults>"],
      });
    });

    it("should handle relationship property with multiple paths", () => {
      const subTypes = [];
      const result = generator.convertType(
        {
          type: "relationship",
          resourceCollection: [{ path: "managed/user" }, { path: "managed/organization" }],
        },
        "manager",
        "user",
        "ManagedUser",
        subTypes,
      );

      expect(result).toEqual({
        nullable: false,
        types: ["ReferenceType<ManagedUser, ManagedUserDefaults> | ReferenceType<ManagedOrganization, ManagedOrganizationDefaults>"],
      });
    });

    it("should fall back for relationship properties with no managed paths", () => {
      const subTypes = [];
      const result = generator.convertType(
        {
          type: "relationship",
          resourceCollection: [{ path: "system/scim/account" }],
        },
        "syncTarget",
        "user",
        "ManagedUser",
        subTypes,
      );

      expect(result).toEqual({
        nullable: false,
        types: ["ReferenceType<Record<string, any>>"],
      });
    });
  });

  describe("integration test - generateIdmTsTypes", () => {
    const outputDir = path.resolve(__dirname, "fixtures/output");
    const outputFile = path.join(outputDir, "idm.ts");

    beforeAll(() => {
      // Ensure the output directory is clean/setup
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    });

    it("should successfully generate Typescript types from the seed configuration files", async () => {
      // Trigger the configuration generator
      await generator.generateIdmTsTypes();

      // Verify the output file exists
      expect(fs.existsSync(outputFile)).toBe(true);

      const generatedContent = fs.readFileSync(outputFile, "utf-8");

      // Verify template rendered managed object definitions
      expect(generatedContent).toContain("export type ManagedUserDefaults");
      expect(generatedContent).toContain("export type ManagedUserNonDefaults");
      expect(generatedContent).toContain("export type ManagedUser");

      // Verify template rendered connector definitions
      expect(generatedContent).toContain("export type SystemScimAccount =");
      expect(generatedContent).toContain("export type SystemUsersWithManagersAccount =");

      // Verify base structure matches expected format
      expect(generatedContent).toContain("export const idm = {");
      expect(generatedContent).toContain("managed/user");
      expect(generatedContent).toContain("system/UsersWithManagers/__ACCOUNT__");

      // Finally a snapshot test
      expect(generatedContent).toMatchSnapshot("idm.ts");
    });
  });
});
