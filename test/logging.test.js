import { describe, expect, it, vi } from "vitest";
import { createTaskLogger } from "../src/lib/logging.js";

describe("createTaskLogger", () => {
  it("logs info to stdout and warnings via task-lib", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warning = vi.fn();
    const logger = createTaskLogger({ warning });

    logger.info("hello");
    logger.warning("careful");
    logger.startGroup("Preview");
    logger.endGroup();

    expect(logSpy).toHaveBeenCalledWith("hello");
    expect(logSpy).toHaveBeenCalledWith("##[group]Preview");
    expect(logSpy).toHaveBeenCalledWith("##[endgroup]");
    expect(warning).toHaveBeenCalledWith("careful");

    logSpy.mockRestore();
  });
});
