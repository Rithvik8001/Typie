"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

export default function SignUpPage() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!signUpWithEmail) throw new Error("Sign up not available");
      if (cleanEmail.length < 5 || !cleanEmail.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      await signUpWithEmail(cleanEmail, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="absolute left-4 top-4">
        <BackButton />
      </div>
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Click here to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
