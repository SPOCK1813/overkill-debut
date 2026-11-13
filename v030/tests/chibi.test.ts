import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderLayeredChibi } from "../src/components/chibi/LayeredChibi";
import {
  chibiMoodForExpression,
  renderSarinaChibi,
  SARINA_CHIBI_CANVAS,
  SARINA_CHIBI_PART_ORDER,
} from "../src/components/chibi/sarina/SarinaChibi";

const partsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/chibi/sarina/parts");

describe("SarinaChibi", () => {
  it("keeps the replaceable 512x512 layer manifest and files in sync", () => {
    expect(SARINA_CHIBI_CANVAS).toEqual({ width: 512, height: 512, anchor: { x: 256, y: 512 } });
    expect(readdirSync(partsDirectory).filter((name) => name.endsWith(".png")).sort()).toEqual(
      [...SARINA_CHIBI_PART_ORDER].map((part) => `${part}.png`).sort(),
    );

    for (const part of SARINA_CHIBI_PART_ORDER) {
      const png = readFileSync(resolve(partsDirectory, `${part}.png`));
      expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      expect(png.readUInt32BE(16)).toBe(512);
      expect(png.readUInt32BE(20)).toBe(512);
      expect(png[25]).toBe(6); // RGBA PNG: alpha channel present.
    }
    const manifest = JSON.parse(readFileSync(resolve(partsDirectory, "manifest.json"), "utf8"));
    expect(manifest.canvas).toEqual({ width: 512, height: 512, format: "RGBA PNG", transparentBackground: true });
    expect(manifest.anchor).toMatchObject({ x: 256, y: 512 });
    expect(manifest.partsBackToFront).toEqual(SARINA_CHIBI_PART_ORDER.map((part) => `${part}.png`));
  });

  it("renders all layers once in canonical back-to-front order", () => {
    const markup = renderSarinaChibi({ placement: "home" });
    const parts = [...markup.matchAll(/data-part="([^"]+)"/g)].map((match) => match[1]);
    expect(parts).toEqual(SARINA_CHIBI_PART_ORDER);
    expect(markup).toContain('data-action="chibi-tap"');
    expect(markup).toContain('data-chibi-mood="idle"');
    expect(markup).toContain('data-chibi-placement="home"');
  });

  it("maps story expressions to visual-only moods", () => {
    expect(chibiMoodForExpression("normal")).toBe("idle");
    expect(chibiMoodForExpression("smile")).toBe("happy");
    expect(chibiMoodForExpression("angry")).toBe("troubled");
    expect(chibiMoodForExpression("troubled")).toBe("troubled");
    expect(chibiMoodForExpression("cry")).toBe("troubled");
  });

  it("is manifest-driven so another member can reuse the same renderer", () => {
    const markup = renderLayeredChibi({
      id: "miyu",
      displayName: "MiYU",
      assetBase: "/assets/chibi/miyu/parts",
      partOrder: SARINA_CHIBI_PART_ORDER,
    }, { placement: "home" });
    expect(markup).toContain('data-character="miyu"');
    expect(markup).toContain('class="chibi-sprite chibi-sprite--home"');
    expect(markup).toContain('src="/assets/chibi/miyu/parts/body.png"');
  });

  it("can render a talking story chibi without changing the shared screen structure", () => {
    const markup = renderSarinaChibi({ placement: "story", mood: "talk", talking: true });
    expect(markup).toContain('data-chibi-placement="story"');
    expect(markup).toContain('data-chibi-mood="talk"');
    expect(markup).toContain('data-chibi-talking="true"');
    expect(markup).toContain("mouth_1.png");
    expect(markup).toContain("mouth_2.png");
    expect(markup).toContain("mouth_3.png");
  });
});
