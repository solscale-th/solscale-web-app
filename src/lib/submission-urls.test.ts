import { describe, expect, it } from "vitest";
import {
  collectUrls,
  formatSubmissionNote,
  looksLikeUrl,
  normalizeUrl,
  parseSubmissionNote,
  splitPastedUrls,
} from "./submission-urls";

describe("normalizeUrl", () => {
  it("adds https when the protocol is missing", () => {
    expect(normalizeUrl("instagram.com/p/abc")).toBe("https://instagram.com/p/abc");
  });

  it("keeps an existing http(s) protocol", () => {
    expect(normalizeUrl("http://tiktok.com/@n")).toBe("http://tiktok.com/@n");
  });
});

describe("looksLikeUrl", () => {
  it("accepts typical social links", () => {
    expect(looksLikeUrl("https://instagram.com/p/abc")).toBe(true);
    expect(looksLikeUrl("youtube.com/watch?v=1")).toBe(true);
  });

  it("rejects javascript and empty values", () => {
    expect(looksLikeUrl("")).toBe(false);
    expect(looksLikeUrl("javascript:alert(1)")).toBe(false);
    expect(looksLikeUrl("not a url")).toBe(false);
  });
});

describe("collectUrls", () => {
  it("trims, normalizes, and drops duplicates and blanks", () => {
    expect(
      collectUrls([
        " instagram.com/p/a ",
        "https://instagram.com/p/a",
        "",
        "https://tiktok.com/@n/video/1",
      ])
    ).toEqual(["https://instagram.com/p/a", "https://tiktok.com/@n/video/1"]);
  });
});

describe("formatSubmissionNote / parseSubmissionNote", () => {
  it("round-trips urls and an optional note", () => {
    const formatted = formatSubmissionNote(
      ["https://instagram.com/p/a", "tiktok.com/@n/video/1"],
      " Caption notes "
    );
    expect(formatted).toBe(
      "https://instagram.com/p/a\nhttps://tiktok.com/@n/video/1\n\nCaption notes"
    );
    expect(parseSubmissionNote(formatted)).toEqual({
      urls: ["https://instagram.com/p/a", "https://tiktok.com/@n/video/1"],
      note: "Caption notes",
    });
  });

  it("keeps prose-only notes without inventing urls", () => {
    expect(parseSubmissionNote("Posted the Reel. Links in DM.")).toEqual({
      urls: [],
      note: "Posted the Reel. Links in DM.",
    });
  });
});

describe("splitPastedUrls", () => {
  it("splits whitespace and commas into separate urls", () => {
    expect(splitPastedUrls("https://a.com/1, https://b.com/2\nhttps://c.com/3")).toEqual([
      "https://a.com/1",
      "https://b.com/2",
      "https://c.com/3",
    ]);
  });
});
