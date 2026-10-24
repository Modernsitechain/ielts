import "server-only";

import type { TestRecord } from "@/core/models/records";
import { listeningDemo1 } from "./listening-demo-1";
import { readingDemo1 } from "./reading-demo-1";

// Dummy data pengganti database. Hanya boleh dibaca oleh core/services.

export const tests: TestRecord[] = [readingDemo1, listeningDemo1];

export { attempts } from "./attempts";
