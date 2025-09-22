"use client"

import { motion } from "framer-motion"
import { Navigation } from "@/components/Navigation"

interface LayoutProps {
	children: React.ReactNode
}

/**
 * Main layout component with navigation and glassmorphism background
 */
export function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			{/* Background gradient */}
			<div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent-success/5 pointer-events-none" />

			{/* Floating orbs for visual depth */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<motion.div
					className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-success/10 rounded-full blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			{/* Main content */}
			<div className="relative z-10">
				<Navigation />

				<main className="container mx-auto px-4 pb-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}>
						{children}
					</motion.div>
				</main>

				{/* Footer */}
				<footer className="mt-20 border-t border-glass-border bg-card/50 backdrop-blur-sm">
					<div className="container mx-auto px-4 py-8">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="flex items-center space-x-2 mb-4 md:mb-0">
								<div className="w-6 h-6 primary-gradient rounded-lg"></div>
								<span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									PulseDelta
								</span>
							</div>

							<div className="flex items-center space-x-6 text-sm text-muted-foreground">
								<a href="#" className="hover:text-foreground transition-colors">
									Terms
								</a>
								<a href="#" className="hover:text-foreground transition-colors">
									Privacy
								</a>
								<a href="#" className="hover:text-foreground transition-colors">
									Docs
								</a>
								<a href="#" className="hover:text-foreground transition-colors">
									Support
								</a>
							</div>
						</div>

						<div className="mt-6 pt-6 border-t border-glass-border text-center text-xs text-muted-foreground">
							<p>
								© 2024 PulseDelta. All rights reserved. Built with ❤️ for the Web3
								community.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}
