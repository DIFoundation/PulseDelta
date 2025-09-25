"use client";

import { useAccount } from "wagmi";
import { useCouncil } from "@/hooks/useCouncil";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletModal } from "@/components/WalletModal";

interface CouncilAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that restricts access to council-only features
 */
export function CouncilAccessGuard({ children }: CouncilAccessGuardProps) {
  const { isConnected } = useAccount();
  const { isCouncilMember, isLoadingPending } = useCouncil();

  // Show loading state while checking council membership
  if (isLoadingPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying council access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Council Access Required</CardTitle>
            <p className="text-muted-foreground">
              Please connect your wallet to access council features
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <WalletModal />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not a council member
  if (!isCouncilMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <p className="text-muted-foreground">
              This page is restricted to council members only
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your wallet is not authorized to access council features. Contact
              the platform administrators if you believe this is an error.
            </p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children if user is a council member
  return <>{children}</>;
}
