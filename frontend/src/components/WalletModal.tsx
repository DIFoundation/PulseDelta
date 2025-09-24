/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useConnect, useAccount, useDisconnect } from "wagmi"
import { Wallet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// 🔥 Fallback icons for popular wallets
const walletIcons: Record<string, string> = {
	metaMask: "/wallets/metamask.svg",
	walletConnect: "/wallets/walletconnect.svg",
	coinbaseWallet: "/wallets/coinbase.svg",
	phantom: "/wallets/phantom.svg",
}

interface WalletModalProps {
	children?: React.ReactNode
}

export function WalletModal({ children }: WalletModalProps) {
	const [open, setOpen] = useState(false)
	const { connect, connectors, error, isPending } = useConnect()
	const { isConnected } = useAccount()
	const { disconnect } = useDisconnect()

	const handleConnect = async (connector: any) => {
		try {
			await connect({ connector })
			setOpen(false)
			toast({
				title: "Wallet Connected",
				description: "Successfully connected to your wallet",
			})
		} catch (error) {
			toast({
				title: "Connection Failed",
				description: "Failed to connect wallet",
				variant: "destructive",
			})
		}
	}

	const walletVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
		hover: { scale: 1.02, transition: { duration: 0.2 } },
		tap: { scale: 0.98 },
	}

	const modalVariants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.95 },
	}

	if (isConnected) {
		return (
			<Button
				variant="outline"
				onClick={() => disconnect()}
				className="glass-card hover:bg-destructive/10">
				Disconnect
			</Button>
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button className="primary-gradient text-primary-foreground">
						<Wallet className="mr-2 h-4 w-4" />
						Connect Wallet
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="glass-card border-glass-border max-w-md">
				<motion.div
					variants={modalVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					transition={{ duration: 0.2 }}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Wallet className="h-5 w-5" />
							Connect Your Wallet
						</DialogTitle>
					</DialogHeader>

					<div className="mt-6 space-y-3">
						{connectors.map((connector) => {
							// check for connector icon, fallback to our manual map
							const iconUrl =
								(connector as any).icon || walletIcons[connector.id] || null

							return (
								<motion.div
									key={connector.id}
									variants={walletVariants}
									initial="hidden"
									animate="visible"
									whileHover="hover"
									whileTap="tap">
									<Button
										variant="outline"
										className="w-full glass-card justify-start text-left p-4 h-auto hover:bg-primary/5"
										onClick={() => handleConnect(connector)}
										disabled={isPending}>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-primary/10">
												{iconUrl ? (
													<img
														src={iconUrl}
														alt={connector.name}
														className="w-6 h-6 object-contain"
													/>
												) : (
													<Wallet className="w-4 h-4 text-muted-foreground" />
												)}
											</div>
											<div>
												<div className="font-medium">{connector.name}</div>
												<div className="text-sm text-muted-foreground">
													Connect using {connector.name}
												</div>
											</div>
										</div>
										{isPending && (
											<div className="ml-auto">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
											</div>
										)}
									</Button>
								</motion.div>
							)
						})}
					</div>

					<AnimatePresence>
						{error && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
								<div className="flex items-center gap-2 text-destructive">
									<AlertCircle className="h-4 w-4" />
									<span className="text-sm font-medium">Connection Error</span>
								</div>
								<p className="text-sm text-destructive/80 mt-1">{error.message}</p>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="mt-6 text-center">
						<p className="text-xs text-muted-foreground">
							By connecting a wallet, you agree to PulseDelta&apos;s{" "}
							<a href="#" className="text-primary hover:underline">
								Terms of Service
							</a>{" "}
							and{" "}
							<a href="#" className="text-primary hover:underline">
								Privacy Policy
							</a>
						</p>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	)
}
