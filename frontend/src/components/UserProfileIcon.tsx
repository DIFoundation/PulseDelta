"use client";

import { useAccount } from "wagmi";
import { User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";

interface UserProfileIconProps {
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserProfileIcon({
  showBadge = true,
  size = "md",
}: UserProfileIconProps) {
  const { address, isConnected } = useAccount();
  const { userStats } = useUserProfile(address);

  const getVolumeMilestone = (volume: number) => {
    if (volume >= 1000000) return { level: "Whale", color: "bg-purple-500" };
    if (volume >= 100000) return { level: "Shark", color: "bg-blue-500" };
    if (volume >= 10000) return { level: "Dolphin", color: "bg-green-500" };
    if (volume >= 1000) return { level: "Fish", color: "bg-yellow-500" };
    return { level: "Minnow", color: "bg-gray-500" };
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <div
          className={`${sizeClasses[size]} bg-muted rounded-full flex items-center justify-center`}
        >
          <Wallet className={iconSizeClasses[size]} />
        </div>
      </div>
    );
  }

  const milestone = userStats
    ? getVolumeMilestone(parseFloat(userStats.totalVolume))
    : { level: "Minnow", color: "bg-gray-500" };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center`}
      >
        <User className={`${iconSizeClasses[size]} text-white`} />
      </div>
      {showBadge && (
        <Badge
          className={`absolute -top-1 -right-1 ${milestone.color} text-white text-xs px-1 py-0`}
        >
          {milestone.level.charAt(0)}
        </Badge>
      )}
    </div>
  );
}


