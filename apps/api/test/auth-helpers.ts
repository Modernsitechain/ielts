import type { TestingModuleBuilder } from "@nestjs/testing";
import { createLocalJWKSet, exportJWK, generateKeyPair, type JWTVerifyGetKey, SignJWT } from "jose";

import { AccessTokenVerifier } from "../src/modules/auth/access-token.verifier";
import { WorkosClient, type WorkosUser } from "../src/modules/auth/workos.client";

/**
 * Stands in for WorkOS in e2e tests: tokens are signed with a local key, and
 * user profiles come from `signIn` instead of the WorkOS API.
 */
export async function fakeWorkos() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const keys = createLocalJWKSet({
    keys: [{ ...(await exportJWK(publicKey)), kid: "e2e", alg: "RS256" }],
  });
  const profiles = new Map<string, WorkosUser>();

  return {
    /** Overrides the verifier and WorkOS client of the app under test. */
    override(builder: TestingModuleBuilder): TestingModuleBuilder {
      return builder
        .overrideProvider(AccessTokenVerifier)
        .useFactory({
          factory: () =>
            new (class extends AccessTokenVerifier {
              protected override getKeys(): JWTVerifyGetKey {
                return keys;
              }
            })({ get: () => undefined } as never),
        })
        .overrideProvider(WorkosClient)
        .useValue({
          getUser: async (id: string) => {
            const profile = profiles.get(id);
            if (!profile) throw new Error(`Unknown fake WorkOS user ${id}`);
            return profile;
          },
        });
    },

    /** A WorkOS user "signs in": returns their access token. */
    signIn(profile: WorkosUser): Promise<string> {
      profiles.set(profile.id, profile);
      return new SignJWT({})
        .setProtectedHeader({ alg: "RS256", kid: "e2e" })
        .setSubject(profile.id)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(privateKey);
    },
  };
}
