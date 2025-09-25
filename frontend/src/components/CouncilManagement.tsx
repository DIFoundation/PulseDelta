"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserMinus, Users, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCouncil } from "@/hooks/useCouncil";
import { toast } from "react-toastify";

/**
 * Council management component for adding/removing council members
 */
export function CouncilManagement() {
  const { setCouncilMember, isSettingCouncil } = useCouncil();
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [isAdding, setIsAdding] = useState(true);

  // Mock council members list - in real app, this would be fetched from contract
  const councilMembers = [
    {
      address: "0x1234567890123456789012345678901234567890",
      isActive: true,
      addedAt: "2024-01-15",
    },
    {
      address: "0x9876543210987654321098765432109876543210",
      isActive: true,
      addedAt: "2024-01-20",
    },
  ];

  const handleAddMember = async () => {
    if (!newMemberAddress.trim()) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newMemberAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    try {
      await setCouncilMember({
        address: newMemberAddress,
        enabled: isAdding,
      });

      toast.success(
        isAdding
          ? "Council member added successfully"
          : "Council member removed successfully"
      );
      setNewMemberAddress("");
    } catch (error) {
      console.error("Failed to update council member:", error);
      toast.error("Failed to update council member");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Council Management</h2>
        <p className="text-muted-foreground">
          Manage council members and their permissions
        </p>
      </div>

      {/* Add/Remove Council Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isAdding ? "Add Council Member" : "Remove Council Member"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={isAdding ? "default" : "outline"}
              onClick={() => setIsAdding(true)}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button
              variant={!isAdding ? "destructive" : "outline"}
              onClick={() => setIsAdding(false)}
              size="sm"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remove Member
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={newMemberAddress}
              onChange={(e) => setNewMemberAddress(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddMember}
              disabled={isSettingCouncil || !newMemberAddress.trim()}
              variant={isAdding ? "default" : "destructive"}
            >
              {isSettingCouncil
                ? "Processing..."
                : isAdding
                ? "Add Member"
                : "Remove Member"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Only existing council members can add or remove other members
          </div>
        </CardContent>
      </Card>

      {/* Current Council Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Council Members ({councilMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {councilMembers.map((member, index) => (
              <motion.div
                key={member.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-sm">
                      {member.address.slice(0, 6)}...{member.address.slice(-4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added: {member.addedAt}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={member.isActive ? "default" : "secondary"}
                    className={
                      member.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Council Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {councilMembers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {councilMembers.filter((m) => m.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-sm text-muted-foreground">Pending Reviews</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
