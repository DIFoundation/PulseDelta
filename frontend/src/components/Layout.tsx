"use client"

import { ReactNode } from "react"
import { Wallet, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface LayoutProps {
	children: ReactNode
}

const navigation = [
	{ name: "Markets", href: "/markets" },
	{ name: "Dashboard", href: "/dashboard" },
]

export default function Layout({ children }: LayoutProps) {
	const pathname = usePathname()

	return (
		<div className="min-h-screen bg-background">
			{/* Navigation Header */}
			<header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-lg">P</span>
							</div>
							<span className="text-xl font-bold text-gradient-primary">
								PredictChain
							</span>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-8">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={`text-sm font-medium transition-smooth ${
										pathname === item.href
											? "text-primary"
											: "text-muted-foreground hover:text-foreground"
									}`}>
									{item.name}
								</Link>
							))}
						</nav>

						{/* Wallet & Mobile Menu */}
						<div className="flex items-center space-x-4">
							<Button variant="outline" size="sm" className="hidden sm:flex">
								<Wallet className="w-4 h-4 mr-2" />
								Connect Wallet
							</Button>

							{/* Mobile Menu */}
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" className="md:hidden">
										<Menu className="w-5 h-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="right" className="w-80">
									<div className="py-6">
										<nav className="space-y-4">
											{navigation.map((item) => (
												<Link
													key={item.name}
													href={item.href}
													className={`block text-sm font-medium transition-smooth ${
														pathname === item.href
															? "text-primary"
															: "text-muted-foreground hover:text-foreground"
													}`}>
													{item.name}
												</Link>
											))}
										</nav>
										<Button variant="outline" size="sm" className="mt-6 w-full">
											<Wallet className="w-4 h-4 mr-2" />
											Connect Wallet
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main>{children}</main>

			{/* Footer */}
			<footer className="bg-card border-t border-border mt-20">
				<div className="container mx-auto px-4 py-12">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						<div>
							<h3 className="font-semibold mb-4">Platform</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										About
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										How it Works
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Features
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Resources</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Documentation
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										API
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										FAQ
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Community</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										GitHub
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Discord
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Twitter
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Legal</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Terms
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Privacy
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground transition-smooth">
										Contact
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-border mt-12 pt-8 text-center">
						<p className="text-sm text-muted-foreground">
							© 2024 PredictChain. Built on BlockDAG. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
