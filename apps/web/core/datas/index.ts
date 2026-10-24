import "server-only";

import type { TestRecord } from "@/core/models/records";
import { listeningDemo1 } from "./listening-demo-1";
import { readingDemo1 } from "./reading-demo-1";

// Dummy data standing in for the database. Only core/services may read it.

export const tests: TestRecord[] = [readingDemo1, listeningDemo1];

export { attempts } from "./attempts";
