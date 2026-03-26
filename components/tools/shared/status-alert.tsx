import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type StatusAlertProps = {
  status: "success" | "error"
  title: string
  message: string
}

export function StatusAlert({ status, title, message }: StatusAlertProps) {
  const isError = status === "error"
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
