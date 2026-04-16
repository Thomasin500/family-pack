"use client";

import { useHousehold } from "@/hooks/use-household";
import { useAddTripMember, useRemoveTripMember } from "@/hooks/use-trips";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";

interface TripMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  currentMemberIds: string[];
}

export function TripMembersDialog({
  open,
  onOpenChange,
  tripId,
  currentMemberIds,
}: TripMembersDialogProps) {
  const { data: household } = useHousehold();
  const addMember = useAddTripMember();
  const removeMember = useRemoveTripMember();
  const confirm = useConfirm();

  const allMembers = household?.members ?? [];
  const onTrip = allMembers.filter((m: any) => currentMemberIds.includes(m.id));
  const notOnTrip = allMembers.filter((m: any) => !currentMemberIds.includes(m.id));

  function handleAdd(userId: string) {
    addMember.mutate(
      { tripId, userId },
      {
        onSuccess: () => toast.success("Member added"),
      }
    );
  }

  async function handleRemove(userId: string, name: string) {
    const ok = await confirm({
      title: `Remove ${name} from trip?`,
      description: "Their pack and everything in it will be deleted from this trip.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) {
      removeMember.mutate({ tripId, userId }, { onSuccess: () => toast.success("Member removed") });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Trip Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current members */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-outline">On this trip</p>
            {onTrip.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg bg-surface-low p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary-container/20 text-primary text-xs font-bold">
                    {member.role === "pet" ? (
                      <PawPrint className="size-3" />
                    ) : (
                      member.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold">{member.name}</span>
                    <Badge variant="muted" className="ml-2 capitalize text-[10px]">
                      {member.role}
                    </Badge>
                  </div>
                </div>
                {onTrip.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(member.id, member.name)}
                    className="text-destructive"
                    title="Remove from trip"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Available to add */}
          {notOnTrip.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-outline">
                Add to trip
              </p>
              {notOnTrip.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg bg-surface-low p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 items-center justify-center rounded-full bg-surface-high text-outline text-xs font-bold">
                      {member.role === "pet" ? (
                        <PawPrint className="size-3" />
                      ) : (
                        member.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold">{member.name}</span>
                      <Badge variant="muted" className="ml-2 capitalize text-[10px]">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleAdd(member.id)}
                    className="text-primary"
                    title="Add to trip"
                    disabled={addMember.isPending}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
