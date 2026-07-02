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
 * @param {{ info: Function, warning: Function, debug?: Function }} taskLib
 * @returns {import('@synatic/entity-sync-core').SyncLogger}
 */
export function createTaskLogger(taskLib) {
  return {
    info(message) {
      taskLib.info(message);
    },
    warning(message) {
      taskLib.warning(message);
    },
    startGroup(name) {
      taskLib.startGroup(name);
    },
    endGroup() {
      taskLib.endGroup();
    },
  };
}
