export interface AuthPort {
  getSession(): Promise<import("../types").User | null>;
  signInWithGoogle?(): Promise<void>;
  signUpWithEmail(
    email: string,
    password: string
  ): Promise<import("../types").User>;
  signInWithEmail(
    email: string,
    password: string
  ): Promise<import("../types").User>;
  signOut(): Promise<void>;
}
