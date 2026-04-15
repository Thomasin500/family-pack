"use client";

import { useState } from "react";
import { useCreateHousehold, useJoinHousehold } from "@/hooks/use-household";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, UserPlus } from "lucide-react";

export function HouseholdSetup() {
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const createHousehold = useCreateHousehold();
  const joinHousehold = useJoinHousehold();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!householdName.trim()) return;
    createHousehold.mutate({ name: householdName.trim() });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinHousehold.mutate({ inviteCode: inviteCode.trim() });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to Family Pack
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new household or join an existing one to get started.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-5" />
              Create a Household
            </CardTitle>
            <CardDescription>
              Start a new household and invite your family to join.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="household-name">Household Name</Label>
                <Input
                  id="household-name"
                  placeholder="e.g. The Smiths"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  disabled={createHousehold.isPending}
                />
              </div>
              {createHousehold.isError && (
                <p className="mt-2 text-sm text-destructive">
                  {createHousehold.error?.message ?? "Failed to create household."}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!householdName.trim() || createHousehold.isPending}
              >
                {createHousehold.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Household"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Join a Household
            </CardTitle>
            <CardDescription>
              Enter an invite code to join an existing household.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleJoin}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={joinHousehold.isPending}
                />
              </div>
              {joinHousehold.isError && (
                <p className="mt-2 text-sm text-destructive">
                  {joinHousehold.error?.message ?? "Failed to join household."}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!inviteCode.trim() || joinHousehold.isPending}
              >
                {joinHousehold.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Household"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
