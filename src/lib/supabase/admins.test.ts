import { describe, expect, it } from "vitest";
import { adminEmails, isAdminEmail } from "./admins";

describe("adminEmails", () => {
  it("falls back to the shop account when ADMIN_EMAILS is unset or blank", () => {
    expect(adminEmails(undefined)).toEqual(["oresteutensils@gmail.com"]);
    expect(adminEmails(" , ")).toEqual(["oresteutensils@gmail.com"]);
  });

  it("parses a comma-separated override, normalising case and spaces", () => {
    expect(adminEmails(" Owner@Example.com, staff@example.com ")).toEqual([
      "owner@example.com",
      "staff@example.com",
    ]);
  });
});

describe("isAdminEmail", () => {
  const allowed = ["owner@example.com"];

  it("accepts a listed account regardless of case", () => {
    expect(isAdminEmail("Owner@Example.com", allowed)).toBe(true);
  });

  it("rejects any other signed-in account", () => {
    expect(isAdminEmail("someone@example.com", allowed)).toBe(false);
    expect(isAdminEmail("", allowed)).toBe(false);
    expect(isAdminEmail(null, allowed)).toBe(false);
    expect(isAdminEmail(undefined, allowed)).toBe(false);
  });
});
