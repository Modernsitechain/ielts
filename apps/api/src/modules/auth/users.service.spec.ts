import type { CurrentUser } from "@ielts-mock/question-schema";

import type { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import type { WorkosClient } from "./workos.client";

const student: CurrentUser = { id: "u1", email: "a@example.com", name: "Ana", role: "student" };

function setup(existing: CurrentUser | null) {
  const repository = {
    findByWorkosId: jest.fn().mockResolvedValue(existing),
    create: jest.fn().mockResolvedValue(student),
  };
  const workos = {
    getUser: jest.fn().mockResolvedValue({ id: "user_1", email: "a@example.com", name: "Ana" }),
  };
  const service = new UsersService(
    repository as unknown as UsersRepository,
    workos as unknown as WorkosClient,
  );
  return { service, repository, workos };
}

describe("UsersService", () => {
  it("returns an existing user without calling WorkOS", async () => {
    const { service, workos } = setup({ ...student, role: "admin" });
    await expect(service.resolve("user_1")).resolves.toMatchObject({ role: "admin" });
    expect(workos.getUser).not.toHaveBeenCalled();
  });

  it("creates a student from the WorkOS profile on first sign-in", async () => {
    const { service, repository } = setup(null);
    await expect(service.resolve("user_1")).resolves.toEqual(student);
    expect(repository.create).toHaveBeenCalledWith({
      id: "user_1",
      email: "a@example.com",
      name: "Ana",
    });
  });
});
