import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface MarketCardProps {
  id: string;
  question: string;
  deadline: string;
  yesOdds: number;
  noOdds: number;
  totalPool: number;
  participants: number;
  category: string;
  status: "open" | "closed";
}

export default function MarketCard({
  id,
  question,
  deadline,
  yesOdds,
  noOdds,
  totalPool,
  participants,
  category,
  status
}: MarketCardProps) {
  return (
    <Card className="bg-gradient-card shadow-card hover-lift border-border transition-smooth group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge 
            variant={status === "open" ? "default" : "secondary"}
            className={status === "open" ? "bg-success" : ""}
          >
            {status === "open" ? "Live" : "Closed"}
          </Badge>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {category}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold mb-4 line-clamp-2 group-hover:text-primary transition-smooth">
          {question}
        </h3>

        {/* Odds Display */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">YES</div>
            <div className="text-lg font-bold text-success">{yesOdds}%</div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">NO</div>
            <div className="text-lg font-bold text-destructive">{noOdds}%</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            ${totalPool.toLocaleString()}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {participants}
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {deadline}
          </div>
          <Link to={`/market/${id}`}>
            <Button size="sm" variant={status === "open" ? "default" : "secondary"}>
              {status === "open" ? "Predict" : "View"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}