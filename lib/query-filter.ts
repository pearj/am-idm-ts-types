/* eslint-disable @typescript-eslint/no-explicit-any */
enum Kind {
  Equals = "eq",
  Greater = "gt",
  GreaterOrEqual = "ge",
  Less = "lt",
  LessOrEqual = "le",
  Contains = "co",
  StartsWith = "sw",
  And = "and",
  Or = "or",
  Not = "!",
  Presence = "pr",
  True = "true",
  False = "false",
}
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7];

type IsRelationship<T> = NonNullable<T> extends { readonly _ref: string } ? true : NonNullable<T> extends Array<{ readonly _ref: string }> ? true : false;

type NonRelationshipKeys<T> = {
  [K in Exclude<keyof T, "_tag"> & string]: IsRelationship<T[K]> extends true ? never : K;
}[Exclude<keyof T, "_tag"> & string];

type NormalizePath<S extends string> = S extends `${infer Head}/[${infer Tail}`
  ? NormalizePath<`${Head}/${Tail}`>
  : S extends `${infer Head}[${infer Tail}`
    ? NormalizePath<`${Head}/${Tail}`>
    : S;

type QueryPathsForKey<K extends string, V, Depth extends number> =
  NonNullable<V> extends Array<infer Element>
    ? K | `${K}/[${QueryPaths<Element, Depth> & string}`
    : NonNullable<V> extends object
      ? K | `${K}/${QueryPaths<V, Depth> & string}`
      : K;

export type QueryPaths<T, Depth extends number = 5> = [Depth] extends [never]
  ? never
  : T extends null | undefined
    ? never
    : T extends Array<infer Element>
      ? QueryPaths<Element, Depth>
      : IsRelationship<T> extends true
        ? never
        : T extends object
          ? {
              [K in NonRelationshipKeys<T>]: QueryPathsForKey<K, T[K], Prev[Depth]>;
            }[NonRelationshipKeys<T>]
          : never;

export type FilterField<T> = QueryPaths<T> | `/${QueryPaths<T> & string}`;

type StripLeadingSlash<S extends string> = S extends `/${infer Rest}` ? Rest : S;

export type PathValue<T, Path extends string> = PathValueHelper<T, NormalizePath<StripLeadingSlash<Path>>>;

type PathValueHelper<T, Path extends string> = [T] extends [any]
  ? T extends null | undefined
    ? never
    : Path extends `${infer Head}/${infer Tail}`
      ? Head extends keyof T
        ? PathValueHelper<NonNullable<T[Head]>, Tail>
        : T extends Array<infer Element>
          ? PathValueHelper<NonNullable<Element>, Path>
          : never
      : Path extends keyof T
        ? T[Path]
        : T extends Array<infer Element>
          ? Path extends keyof Element
            ? Element[Path]
            : never
          : never
  : never;

type FilterItem<A, K extends FilterField<A>> =
  | { kind: Kind.Equals; field: K; val: PathValue<A, K> }
  | { kind: Kind.Greater; field: K; val: PathValue<A, K> }
  | { kind: Kind.GreaterOrEqual; field: K; val: PathValue<A, K> }
  | { kind: Kind.Less; field: K; val: PathValue<A, K> }
  | { kind: Kind.LessOrEqual; field: K; val: PathValue<A, K> }
  | { kind: Kind.Contains; field: K; val: PathValue<A, K> }
  | { kind: Kind.StartsWith; field: K; val: PathValue<A, K> }
  | { kind: Kind.Presence; field: K };

export type Filter<A> =
  | { [K in FilterField<A>]: FilterItem<A, K> }[FilterField<A>]
  | { kind: Kind.True }
  | { kind: Kind.False }
  | { kind: Kind.Not; filter: Filter<A> }
  | { kind: Kind.And; a: Filter<A>; b: Filter<A> }
  | { kind: Kind.Or; a: Filter<A>; b: Filter<A> };

export const equals = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.Equals,
    val: val as any,
  }) as any;
export const greater = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.Greater,
    val: val as any,
  }) as any;
export const greaterOrEqual = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.GreaterOrEqual,
    val: val as any,
  }) as any;
export const less = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.Less,
    val: val as any,
  }) as any;
export const lessOrEqual = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.LessOrEqual,
    val: val as any,
  }) as any;
export const contains = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.Contains,
    val: val as any,
  }) as any;
export const startsWith = <A, K extends FilterField<A>>(field: K, val: PathValue<A, K>): Filter<A> =>
  ({
    field,
    kind: Kind.StartsWith,
    val: val as any,
  }) as any;
export const presence = <A, K extends FilterField<A>>(field: K): Filter<A> =>
  ({
    field,
    kind: Kind.Presence,
  }) as any;
export const and = <A>(a: Filter<A>, b: Filter<A>): Filter<A> => ({
  a,
  b,
  kind: Kind.And,
});
export const or = <A>(a: Filter<A>, b: Filter<A>): Filter<A> => ({
  a,
  b,
  kind: Kind.Or,
});
export const not = <A>(filter: Filter<A>): Filter<A> => ({
  filter,
  kind: Kind.Not,
});
export const trueVal = <A>(): Filter<A> => ({
  kind: Kind.True,
});
export const falseVal = <A>(): Filter<A> => ({
  kind: Kind.False,
});

// combine 1 to many filters returning true if all are true (and)
export const allOf = <A>(...dsl: Filter<A>[]): Filter<A> => dsl.reduce((p, c) => and(p, c));

// combine 1 to many filters returning true if any are true (or)
export const anyOf = <A>(...dsl: Filter<A>[]): Filter<A> => dsl.reduce((p, c) => or(p, c));

// essentially sql's in operator.  Given a field and a collection of values
// this returns true if any are true.
export const oneOf = <A, K extends FilterField<A>>(field: K, ...vals: PathValue<A, K>[]): Filter<A> => anyOf(...vals.map((x) => equals(field, x)));

const escapeQuotes = (str: string): string => str.replace(/'/g, "\\'");
const prepareValue = (val: unknown): string => {
  if (typeof val === "string") {
    return `'${escapeQuotes(val ?? "")}'`;
  } else {
    return (val as any)?.toString() ?? "''";
  }
};

const formatFieldName = (field: string): string => (field.startsWith("/") ? field : `/${field}`);

/**
 * Convert a Filter instance to a _queryFilter string that can be used in a query.
 */
export const interpretToFilter = <A>(dsl: Filter<A>): string => {
  switch (dsl.kind) {
    case Kind.Equals:
    case Kind.Greater:
    case Kind.GreaterOrEqual:
    case Kind.Less:
    case Kind.LessOrEqual:
    case Kind.Contains:
    case Kind.StartsWith: {
      const fieldStr = formatFieldName(dsl.field.toString());
      const openBracketsCount = (fieldStr.match(/\[/g) || []).length;
      const baseFilter = `${fieldStr} ${dsl.kind} ${prepareValue(dsl.val)}`;
      return openBracketsCount > 0 ? `${baseFilter}${"]".repeat(openBracketsCount)}` : baseFilter;
    }
    case Kind.And:
    case Kind.Or:
      return `(${interpretToFilter(dsl.a)} ${dsl.kind} ${interpretToFilter(dsl.b)})`;
    case Kind.Presence: {
      const fieldStr = formatFieldName(dsl.field.toString());
      const openBracketsCount = (fieldStr.match(/\[/g) || []).length;
      const baseFilter = `${fieldStr} ${dsl.kind}`;
      return openBracketsCount > 0 ? `${baseFilter}${"]".repeat(openBracketsCount)}` : baseFilter;
    }
    case Kind.Not:
      return `${dsl.kind}(${interpretToFilter(dsl.filter)})`;
    case Kind.True:
    case Kind.False:
      return dsl.kind;
  }
};
