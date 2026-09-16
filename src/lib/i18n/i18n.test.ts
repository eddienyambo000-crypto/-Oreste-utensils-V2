import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { dictionaries } from "./dictionaries";
import { en } from "./dictionaries/en";

/** Flattens a dictionary to sorted key paths; arrays contribute their length. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[len=${value.length}]`];
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k))
      .sort();
  }
  return [prefix];
}

/** Collects paths of any empty/whitespace-only string in a dictionary. */
function emptyStringPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return value.trim() === "" ? [prefix] : [];
  if (Array.isArray(value)) return value.flatMap((v, i) => emptyStringPaths(v, `${prefix}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      emptyStringPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [];
}

const enPaths = keyPaths(en);

describe("i18n dictionaries", () => {
  it("ships every configured locale", () => {
    for (const locale of LOCALES) expect(dictionaries[locale]).toBeTruthy();
  });

  for (const locale of LOCALES) {
    it(`"${locale}" has exactly the same keys as English (no missing / extra / wrong array length)`, () => {
      expect(keyPaths(dictionaries[locale])).toEqual(enPaths);
    });

    it(`"${locale}" has no empty strings`, () => {
      expect(emptyStringPaths(dictionaries[locale])).toEqual([]);
    });
  }
});
