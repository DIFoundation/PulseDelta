/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Minus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface Outcome {
	id: string
	name: string
	description?: string
}

interface OutcomeConfigurationProps {
	outcomes: Outcome[]
	onChange: (outcomes: Outcome[]) => void
	minOutcomes?: number
	maxOutcomes?: number
}

/**
 * Outcome configuration component for market creation
 * Allows users to add, remove, and edit market outcomes
 */
export function OutcomeConfiguration({
	outcomes,
	onChange,
	minOutcomes = 2,
	maxOutcomes = 10,
}: OutcomeConfigurationProps) {
	const [errors, setErrors] = useState<Record<string, string>>({})

	const addOutcome = () => {
		if (outcomes.length >= maxOutcomes) return

		const newOutcome: Outcome = {
			id: `outcome-${Date.now()}`,
			name: "",
			description: "",
		}

		onChange([...outcomes, newOutcome])
	}

	const removeOutcome = (id: string) => {
		if (outcomes.length <= minOutcomes) return
		onChange(outcomes.filter((outcome) => outcome.id !== id))
	}

	const updateOutcome = (id: string, field: keyof Outcome, value: string) => {
		const updatedOutcomes = outcomes.map((outcome) =>
			outcome.id === id ? { ...outcome, [field]: value } : outcome
		)
		onChange(updatedOutcomes)

		// Clear error for this field
		const errorKey = `${id}-${field}`
		if (errors[errorKey]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[errorKey]
				return newErrors
			})
		}
	}

	const validateOutcomes = () => {
		const newErrors: Record<string, string> = {}

		outcomes.forEach((outcome) => {
			if (!outcome.name.trim()) {
				newErrors[`${outcome.id}-name`] = "Outcome name is required"
			}
		})

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Market Outcomes</span>
					<span className="text-sm text-muted-foreground">
						{outcomes.length}/{maxOutcomes}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{outcomes.length < minOutcomes && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You need at least {minOutcomes} outcomes for your market.
						</AlertDescription>
					</Alert>
				)}

				<div className="space-y-3">
					{outcomes.map((outcome, index) => (
						<motion.div
							key={outcome.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
							className="glass-subtle p-4 rounded-lg space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium">Outcome {index + 1}</Label>
								{outcomes.length > minOutcomes && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeOutcome(outcome.id)}
										className="text-destructive hover:text-destructive">
										<Minus className="w-4 h-4" />
									</Button>
								)}
							</div>

							<div className="space-y-2">
								<Input
									placeholder="e.g., Yes, No, Option A"
									value={outcome.name}
									onChange={(e) =>
										updateOutcome(outcome.id, "name", e.target.value)
									}
									className={
										errors[`${outcome.id}-name`] ? "border-destructive" : ""
									}
								/>
								{errors[`${outcome.id}-name`] && (
									<p className="text-xs text-destructive">
										{errors[`${outcome.id}-name`]}
									</p>
								)}

								<Input
									placeholder="Optional description"
									value={outcome.description || ""}
									onChange={(e) =>
										updateOutcome(outcome.id, "description", e.target.value)
									}
								/>
							</div>
						</motion.div>
					))}
				</div>

				<Button
					variant="outline"
					onClick={addOutcome}
					disabled={outcomes.length >= maxOutcomes}
					className="w-full glass-card bg-transparent">
					<Plus className="w-4 h-4 mr-2" />
					Add Outcome
				</Button>

				{outcomes.length >= maxOutcomes && (
					<p className="text-xs text-muted-foreground text-center">
						Maximum number of outcomes reached
					</p>
				)}
			</CardContent>
		</Card>
	)
}
