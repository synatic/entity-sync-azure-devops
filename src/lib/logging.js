/**
 * @returns {import('@synatic/entity-sync-core').SyncLogger}
 */
export function createConsoleLogger() {
  return {
    info(message) {
      console.log(message);
    },
    warning(message) {
      console.warn(message);
    },
    startGroup(name) {
      console.log(`--- ${name} ---`);
    },
    endGroup() {
      // no-op
    },
  };
}

/**
 * @param {{ warning: Function }} taskLib
 * @returns {import('@synatic/entity-sync-core').SyncLogger}
 */
export function createTaskLogger(taskLib) {
  return {
    info(message) {
      console.log(message);
    },
    warning(message) {
      taskLib.warning(message);
    },
    startGroup(name) {
      console.log(`##[group]${name}`);
    },
    endGroup() {
      console.log("##[endgroup]");
    },
  };
}
