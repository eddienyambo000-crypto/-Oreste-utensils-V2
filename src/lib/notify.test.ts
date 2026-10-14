import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { notifyOwner, signPayload } = await import("./notify");

const lead = {
  type: "lead" as const,
  businessName: "Hotel X",
  contactName: "Ana",
  phone: "0788000000",
  businessType: "Hotel",
  need: null,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("signPayload", () => {
  it("is an HMAC-SHA256 of the exact body", () => {
    const body = JSON.stringify({ a: 1 });
    const expected = createHmac("sha256", "s3cret").update(body).digest("hex");
    expect(signPayload(body, "s3cret")).toBe(`sha256=${expected}`);
  });
});

describe("notifyOwner", () => {
  it("does nothing without a webhook URL", async () => {
    vi.stubEnv("OWNER_WEBHOOK_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await notifyOwner(lead);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a signed summary with a link to the admin", async () => {
    vi.stubEnv("OWNER_WEBHOOK_URL", "https://hooks.example/oreste");
    vi.stubEnv("OWNER_WEBHOOK_SECRET", "s3cret");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    await notifyOwner(lead);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://hooks.example/oreste");
    const payload = JSON.parse(init.body);
    expect(payload).toMatchObject({ type: "lead", businessName: "Hotel X" });
    expect(payload.adminUrl).toMatch(/\/admin\/leads$/);
    expect(init.headers["X-Oreste-Signature"]).toBe(signPayload(init.body, "s3cret"));
  });

  it("never throws when the webhook is down", async () => {
    vi.stubEnv("OWNER_WEBHOOK_URL", "https://hooks.example/oreste");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyOwner(lead)).resolves.toBeUndefined();
  });
});
