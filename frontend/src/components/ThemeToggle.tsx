"use client"

import { motion } from "framer-motion"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme()

	// Resolve the effective theme when "system" is selected
	const currentTheme = theme === "system" ? systemTheme : theme

	const iconVariants = {
		initial: { scale: 0, rotate: -180 },
		animate: { scale: 1, rotate: 0 },
		exit: { scale: 0, rotate: 180 },
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="glass-card p-2 hover:bg-primary/10 transition-all duration-200"
					aria-label="Toggle theme">
					<motion.div
						key={currentTheme}
						variants={iconVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.2 }}>
						{currentTheme === "light" && <Sun className="h-4 w-4" />}
						{currentTheme === "dark" && <Moon className="h-4 w-4" />}
						{currentTheme === undefined && <Monitor className="h-4 w-4" />}
					</motion.div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="glass-card border-glass-border">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<Sun className="mr-2 h-4 w-4" />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<Moon className="mr-2 h-4 w-4" />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<Monitor className="mr-2 h-4 w-4" />
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
