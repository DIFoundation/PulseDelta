import React from "react";
import { motion } from "framer-motion";
import { X, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  className,
}: TagProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200";
  
  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
    secondary: "bg-muted text-muted-foreground border border-muted-foreground/20 hover:bg-muted/80",
    outline: "bg-transparent text-foreground border border-border hover:bg-muted/50",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Hash className="h-3 w-3" />
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove tag"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.span>
  );
}

interface TagsListProps {
  tags: string[];
  variant?: "default" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: (tag: string) => void;
  className?: string;
  maxTags?: number;
}

export function TagsList({
  tags,
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  className,
  maxTags,
}: TagsListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayTags.map((tag, index) => (
        <Tag
          key={`${tag}-${index}`}
          variant={variant}
          size={size}
          removable={removable}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
        >
          {tag}
        </Tag>
      ))}
      {remainingCount > 0 && (
        <Tag variant="secondary" size={size}>
          +{remainingCount} more
        </Tag>
      )}
    </div>
  );
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
  maxTags,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !value.includes(trimmedTag) && (!maxTags || value.length < maxTags)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-lg bg-background">
        {value.map((tag, index) => (
          <Tag
            key={`${tag}-${index}`}
            variant="default"
            size="sm"
            removable
            onRemove={() => removeTag(tag)}
          >
            {tag}
          </Tag>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
