import { Reflector } from "@nestjs/core";
import type { UserRole } from "@ielts-mock/question-schema";

/**
 * Roles allowed on a controller or route, checked by RolesGuard after
 * AuthGuard. A route's @Roles replaces its controller's.
 */
export const Roles = Reflector.createDecorator<UserRole[]>();
