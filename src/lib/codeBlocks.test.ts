/**
 * CC-22: the code-fence splitter.
 *
 * The case that matters most is the unterminated fence. A student who types
 * three backticks mid-sentence and never closes them must see their post
 * exactly as it renders today — never watch the rest of it vanish into a grey
 * box. Everything else here is ordinary parsing.
 */
import { describe, expect, it } from "vitest";
import {
  hasCodeBlock,
  resolveLanguage,
  splitCodeBlocks,
  stripCodeBlocks,
} from "./codeBlocks";

describe("splitCodeBlocks", () => {
  it("returns nothing for an empty string", () => {
    expect(splitCodeBlocks("")).toEqual([]);
  });

  it("returns a single text segment when there is no fence", () => {
    expect(splitCodeBlocks("Why is my loop infinite?")).toEqual([
      { kind: "text", content: "Why is my loop infinite?" },
    ]);
  });

  it("preserves newlines and indentation in prose", () => {
    const source = "Line one\n    indented\n\nLine four";
    expect(splitCodeBlocks(source)).toEqual([
      { kind: "text", content: source },
    ]);
  });

  it("splits prose, code, prose in order", () => {
    const segments = splitCodeBlocks(
      "Before\n```python\nprint(1)\n```\nAfter",
    );

    expect(segments).toEqual([
      { kind: "text", content: "Before" },
      { kind: "code", lang: "python", content: "print(1)" },
      { kind: "text", content: "After" },
    ]);
  });

  it("handles a fence at the very start", () => {
    expect(splitCodeBlocks("```c\nint x;\n```\ndone")).toEqual([
      { kind: "code", lang: "c", content: "int x;" },
      { kind: "text", content: "done" },
    ]);
  });

  it("handles a fence at the very end", () => {
    expect(splitCodeBlocks("intro\n```c\nint x;\n```")).toEqual([
      { kind: "text", content: "intro" },
      { kind: "code", lang: "c", content: "int x;" },
    ]);
  });

  it("handles several fences", () => {
    const segments = splitCodeBlocks(
      "a\n```py\n1\n```\nb\n```py\n2\n```\nc",
    );

    expect(segments.map((s) => s.kind)).toEqual([
      "text",
      "code",
      "text",
      "code",
      "text",
    ]);
  });

  it("treats an unterminated fence as plain text and swallows nothing", () => {
    const source = "Here is my code ```\nint main() {}\nand then it broke";
    const segments = splitCodeBlocks(source);

    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe("text");
    expect(segments[0].content).toContain("and then it broke");
  });

  it("keeps an unterminated fence opening literal", () => {
    const segments = splitCodeBlocks("```python\nprint(1)");

    expect(segments).toEqual([
      { kind: "text", content: "```python\nprint(1)" },
    ]);
  });

  it("records no language for an untagged fence", () => {
    expect(splitCodeBlocks("```\nsome code\n```")).toEqual([
      { kind: "code", lang: null, content: "some code" },
    ]);
  });

  it("keeps an unknown language tag rather than dropping the block", () => {
    expect(splitCodeBlocks("```verilog\nwire a;\n```")).toEqual([
      { kind: "code", lang: "verilog", content: "wire a;" },
    ]);
  });

  it("produces an empty code segment for an empty fence", () => {
    expect(splitCodeBlocks("```js\n```")).toEqual([
      { kind: "code", lang: "js", content: "" },
    ]);
  });

  it("ignores backticks that are not a whole line", () => {
    const source = "use ```` or ``` inline and carry on";
    expect(splitCodeBlocks(source)).toEqual([
      { kind: "text", content: source },
    ]);
  });

  it("preserves blank lines and indentation inside a block", () => {
    const code = "def f():\n\n    return 1";
    const segments = splitCodeBlocks("```python\n" + code + "\n```");

    expect(segments[0].kind).toBe("code");
    expect((segments[0] as { content: string }).content).toBe(code);
  });

  it("does not emit a text segment for whitespace between two fences", () => {
    const segments = splitCodeBlocks("```c\n1\n```\n\n```c\n2\n```");
    expect(segments.map((s) => s.kind)).toEqual(["code", "code"]);
  });

  it("never interprets markup inside a code block", () => {
    const segments = splitCodeBlocks("```js\n<script>alert(1)</script>\n```");
    expect((segments[0] as { content: string }).content).toBe(
      "<script>alert(1)</script>",
    );
  });
});

describe("resolveLanguage", () => {
  it("passes through a supported language", () => {
    expect(resolveLanguage("python")).toBe("python");
  });

  it("is case-insensitive and trims", () => {
    expect(resolveLanguage("  Python ")).toBe("python");
  });

  it("maps the aliases students actually type", () => {
    expect(resolveLanguage("c++")).toBe("cpp");
    expect(resolveLanguage("py")).toBe("python");
    expect(resolveLanguage("js")).toBe("javascript");
    expect(resolveLanguage("sh")).toBe("bash");
    expect(resolveLanguage("postgres")).toBe("sql");
  });

  it("returns null rather than guessing at an unknown language", () => {
    expect(resolveLanguage("verilog")).toBeNull();
    expect(resolveLanguage(null)).toBeNull();
    expect(resolveLanguage("")).toBeNull();
  });
});

describe("hasCodeBlock", () => {
  it("is false for prose and for an unterminated fence", () => {
    expect(hasCodeBlock("just a question")).toBe(false);
    expect(hasCodeBlock("```python\nnever closed")).toBe(false);
  });

  it("is true for a closed fence", () => {
    expect(hasCodeBlock("```python\nx = 1\n```")).toBe(true);
  });
});

describe("stripCodeBlocks", () => {
  it("keeps prose and drops code, for list previews", () => {
    expect(
      stripCodeBlocks("Why does this fail?\n```python\nprint(1)\n```\nThanks"),
    ).toBe("Why does this fail?\nThanks");
  });

  it("returns an empty string for a post that is only code", () => {
    expect(stripCodeBlocks("```python\nprint(1)\n```")).toBe("");
  });

  it("leaves a fence-free post untouched", () => {
    expect(stripCodeBlocks("plain question")).toBe("plain question");
  });
});
