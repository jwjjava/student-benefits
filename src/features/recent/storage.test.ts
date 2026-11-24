import { describe, expect, it } from "vitest";
import { toggleSavedId } from "@/features/saved/storage";
import { pushRecent } from "./storage";

describe("pushRecent", () => {
  it("맨 앞에 넣고 중복을 지운다", () => {
    expect(pushRecent(["a", "b", "c"], "b", 10)).toEqual(["b", "a", "c"]);
  });

  it("limit개만 남긴다", () => {
    expect(pushRecent(["a", "b", "c"], "d", 3)).toEqual(["d", "a", "b"]);
  });
});

describe("toggleSavedId", () => {
  it("없으면 맨 앞에 추가", () => {
    expect(toggleSavedId(["a"], "b")).toEqual(["b", "a"]);
  });

  it("있으면 제거", () => {
    expect(toggleSavedId(["a", "b"], "a")).toEqual(["b"]);
  });
});
