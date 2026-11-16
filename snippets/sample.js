// TypeScript Sample
// This file demonstrates TypeScript features including:
// - TypeScript types and interfaces
// - Classes and inheritance
// - Generics and type parameters
// - Modules and imports/exports
// - TypeScript decorators
// - Advanced TypeScript features

import { promises as fs } from "fs";

export class Store {
  constructor() {}

  async foo() {
    const buffer = await fs.readFile("test.yaml", "utf-8");
    return buffer.substr(0, buffer.length);
  }
}
