"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Keyboard, LayoutDashboard } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function Home() {
  const { user, signIn, signOut } = useAuth();
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="absolute left-4 top-4">
        <BackButton />
      </div>
      <Card className="w-full max-w-3xl rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Keyboard aria-hidden className="h-6 w-6" />
            <span className="sr-only">Typie</span>
          </div>
          <CardTitle className="text-3xl font-mono tracking-tight">
            Typie
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Minimal typing test. Practice speed and accuracy with clean UI.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/play">
                <Keyboard className="mr-2 h-4 w-4" /> Start Typing Test
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            {user ? (
              <Button
                variant="outline"
                onClick={signOut}
                size="lg"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                Sign out
              </Button>
            ) : (
              <Button variant="outline" onClick={signIn} size="lg">
                Sign in with Google
              </Button>
            )}
          </div>
          {user && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Avatar>
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span>Signed in as {user.name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
