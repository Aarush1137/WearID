import { UserProfileRecord, UnauthorizedProfileAccessError } from "./schema";

/**
 * In-Memory Secure Repository for User Profiles (Private by Default)
 */
export class SecureProfileRepository {
  private profiles = new Map<string, UserProfileRecord>();

  /**
   * Creates a new user profile.
   * Invariant 7: Profiles are private by default.
   */
  public createProfile(params: {
    id: string;
    userId: string;
    name: string;
    encryptedMeasurements?: string;
    visibility?: "private" | "public";
  }): UserProfileRecord {
    const now = new Date().toISOString();
    const record: UserProfileRecord = {
      id: params.id,
      userId: params.userId,
      name: params.name,
      // Invariant 7: Unconditionally defaults to 'private'
      visibility: params.visibility ?? "private",
      encryptedMeasurements: params.encryptedMeasurements,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(record.id, record);
    return record;
  }

  /**
   * Retrieves profile by ID with strict Row-Level authorization.
   * Throws UnauthorizedProfileAccessError (403) on unauthorized public access.
   */
  public getProfile(profileId: string, requesterUserId?: string): UserProfileRecord {
    const record = this.profiles.get(profileId);
    if (!record) {
      throw new Error("Profile not found");
    }

    // Invariant 7 check: Private profiles only accessible by authenticated owner
    if (record.visibility === "private" && (!requesterUserId || requesterUserId !== record.userId)) {
      throw new UnauthorizedProfileAccessError(
        `Access denied to private profile ${profileId}. Authenticated owner credentials required.`
      );
    }

    return record;
  }

  public updateProfile(
    profileId: string,
    requesterUserId: string,
    updates: Partial<Pick<UserProfileRecord, "name" | "visibility" | "encryptedMeasurements">>
  ): UserProfileRecord {
    const record = this.getProfile(profileId, requesterUserId);
    const updated: UserProfileRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(profileId, updated);
    return updated;
  }

  public clear(): void {
    this.profiles.clear();
  }
}
