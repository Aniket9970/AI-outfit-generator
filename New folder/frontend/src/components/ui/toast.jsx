import * as React from "react"
import { cn } from "../../lib/utils"

const Toast = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-4 right-4 z-50 min-w-[300px] rounded-md bg-white p-4 shadow-lg",
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
})
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
})
ToastDescription.displayName = "ToastDescription"

export { Toast, ToastTitle, ToastDescription } 