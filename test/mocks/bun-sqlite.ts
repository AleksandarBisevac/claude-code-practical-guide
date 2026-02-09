export class Database {
  run() {}
  query() {
    return { run: () => ({ changes: 0 }), get: () => undefined, all: () => [] };
  }
  close() {}
}
