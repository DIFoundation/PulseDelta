"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Toast {
	id: string
	title?: string
	description?: string
	type?: "success" | "error" | "warning" | "info"
	duration?: number
	action?: {
		label: string
		onClick: () => void
	}
}

interface ToastProps {
	toast: Toast
	onDismiss: (id: string) => void
}

const toastIcons = {
	success: CheckCircle,
	error: AlertCircle,
	warning: AlertTriangle,
	info: Info,
}

const toastStyles = {
	success: "border-secondary/20 bg-secondary/10 text-secondary-foreground",
	error: "border-destructive/20 bg-destructive/10 text-destructive-foreground",
	warning: "border-accent/20 bg-accent/10 text-accent-foreground",
	info: "border-primary/20 bg-primary/10 text-primary-foreground",
}

/**
 * Toast notification component with glassmorphism styling
 * Supports different types and auto-dismiss functionality
 */
export function ToastComponent({ toast, onDismiss }: ToastProps) {
	const Icon = toastIcons[toast.type || "info"]

	React.useEffect(() => {
		if (toast.duration && toast.duration > 0) {
			const timer = setTimeout(() => {
				onDismiss(toast.id)
			}, toast.duration)

			return () => clearTimeout(timer)
		}
	}, [toast.id, toast.duration, onDismiss])

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.3 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.5 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={cn(
				"backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10 rounded-xl shadow-lg p-4 max-w-sm w-full",
				toastStyles[toast.type || "info"]
			)}>
			<div className="flex items-start space-x-3">
				<Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />

				<div className="flex-1 min-w-0">
					{toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
					{toast.description && (
						<p className="text-sm opacity-90 mt-1">{toast.description}</p>
					)}

					{toast.action && (
						<Button
							variant="ghost"
							size="sm"
							onClick={toast.action.onClick}
							className="mt-2 h-8 px-2 text-xs">
							{toast.action.label}
						</Button>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDismiss(toast.id)}
					className="h-6 w-6 opacity-70 hover:opacity-100">
					<X className="w-4 h-4" />
				</Button>
			</div>
		</motion.div>
	)
}

/**
 * Toast container component
 */
interface ToastContainerProps {
	toasts: Toast[]
	onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
	return (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			<AnimatePresence>
				{toasts.map((toast) => (
					<ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
				))}
			</AnimatePresence>
		</div>
	)
}

/**
 * Toast hook for managing toast notifications
 */
export function useToast() {
	const [toasts, setToasts] = React.useState<Toast[]>([])

	const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substr(2, 9)
		setToasts((prev) => [...prev, { ...toast, id }])
	}, [])

	const dismissToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id))
	}, [])

	const dismissAll = React.useCallback(() => {
		setToasts([])
	}, [])

	return {
		toasts,
		addToast,
		dismissToast,
		dismissAll,
	}
}
