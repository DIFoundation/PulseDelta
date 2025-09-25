/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useConnect, useAccount, useDisconnect, useSwitchChain } from "wagmi"
import { Wallet, AlertCircle, ChevronDown, LogOut, RefreshCw, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { useBDAGBalance } from "@/hooks/useBalance"
import { blockdagPrimordial } from "@/chains"

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
	const [copied, setCopied] = useState(false)
	const { connect, connectors, error, isPending } = useConnect()
	const { isConnected, address, chainId } = useAccount()
	const { disconnect } = useDisconnect()
	const { switchChain } = useSwitchChain()
	const { balance, formatted, symbol, isLoading: balanceLoading } = useBDAGBalance()

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

	const handleDisconnect = () => {
		disconnect()
		toast({
			title: "Wallet Disconnected",
			description: "Successfully disconnected from your wallet",
		})
	}

	const handleSwitchChain = async () => {
		try {
			await switchChain({ chainId: blockdagPrimordial.id })
			toast({
				title: "Network Switched",
				description: "Successfully switched to BlockDAG Primordial",
			})
		} catch (error) {
			toast({
				title: "Switch Failed",
				description: "Failed to switch network",
				variant: "destructive",
			})
		}
	}

	const copyAddress = async () => {
		if (address) {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			toast({
				title: "Address Copied",
				description: "Wallet address copied to clipboard",
			})
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	const formatBalance = (balance: string) => {
		const num = parseFloat(balance)
		if (num === 0) return "0"
		if (num < 0.001) return "< 0.001"
		if (num < 1) return num.toFixed(3)
		if (num < 1000) return num.toFixed(2)
		return (num / 1000).toFixed(1) + "K"
	}

	const isWrongNetwork = chainId !== blockdagPrimordial.id

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
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className={`glass-card hover:bg-primary/5 transition-all duration-200 ${
							isWrongNetwork ? "border-destructive/50 bg-destructive/5" : ""
						}`}>
						<div className="flex items-center space-x-2">
							{/* Network Status Indicator */}
							<div
								className={`w-2 h-2 rounded-full ${
									isWrongNetwork ? "bg-destructive" : "bg-accent-success"
								}`}
							/>
							
							{/* Balance */}
							<div className="flex items-center space-x-1">
								{balanceLoading ? (
									<RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
								) : (
									<span className="text-sm font-medium">
										{formatBalance(formatted)} {symbol}
									</span>
								)}
							</div>

							{/* Address */}
							<span className="text-sm text-muted-foreground">
								{formatAddress(address!)}
							</span>

							<ChevronDown className="w-3 h-3 text-muted-foreground" />
						</div>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="glass-card border-glass-border w-64">
					{/* Wallet Info */}
					<div className="px-3 py-2 border-b border-glass-border">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Connected</span>
							<div className="flex items-center space-x-1">
								<div
									className={`w-2 h-2 rounded-full ${
										isWrongNetwork ? "bg-destructive" : "bg-accent-success"
									}`}
								/>
								<span className="text-xs text-muted-foreground">
									{isWrongNetwork ? "Wrong Network" : "BlockDAG"}
								</span>
							</div>
						</div>
					</div>

					{/* Balance Display */}
					<div className="px-3 py-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Balance</span>
							<div className="flex items-center space-x-1">
								{balanceLoading ? (
									<RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
								) : (
									<span className="text-sm font-medium">
										{formatBalance(formatted)} {symbol}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Address */}
					<div className="px-3 py-2">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Address</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={copyAddress}
								className="h-6 px-2 text-xs">
								{copied ? (
									<Check className="w-3 h-3 text-accent-success" />
								) : (
									<Copy className="w-3 h-3" />
								)}
							</Button>
						</div>
						<div className="text-xs font-mono text-muted-foreground mt-1">
							{formatAddress(address!)}
						</div>
					</div>

					<DropdownMenuSeparator />

					{/* Network Switch */}
					{isWrongNetwork && (
						<>
							<DropdownMenuItem
								onClick={handleSwitchChain}
								className="text-destructive focus:text-destructive">
								<RefreshCw className="w-4 h-4 mr-2" />
								Switch to BlockDAG
							</DropdownMenuItem>
							<DropdownMenuSeparator />
						</>
					)}

					{/* Disconnect */}
					<DropdownMenuItem
						onClick={handleDisconnect}
						className="text-destructive focus:text-destructive">
						<LogOut className="w-4 h-4 mr-2" />
						Disconnect
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
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
