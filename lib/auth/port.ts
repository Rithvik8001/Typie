export interface AuthPort {
  getSession(): Promise<import("../types").User | null>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
}
