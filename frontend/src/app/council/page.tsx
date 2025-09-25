"use client";

import { CouncilMarketApproval } from "@/components/CouncilMarketApproval";
import { CouncilManagement } from "@/components/CouncilManagement";
import { CouncilAccessGuard } from "@/components/CouncilAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Council curation page for market approval and management
 * Features market review, approval/flagging, and council member management
 */
export default function CouncilPage() {
  return (
    <CouncilAccessGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">PulseDelta Council</h1>
            <p className="text-muted-foreground">
              Review and approve markets, manage council members
            </p>
          </div>

          <Tabs defaultValue="markets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="markets">Market Review</TabsTrigger>
              <TabsTrigger value="management">Council Management</TabsTrigger>
            </TabsList>

            <TabsContent value="markets">
              <CouncilMarketApproval />
            </TabsContent>

            <TabsContent value="management">
              <CouncilManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </CouncilAccessGuard>
  );
}
