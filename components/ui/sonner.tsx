"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-green-200 group-[.toaster]:bg-green-50 [&_svg]:text-green-600",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50 [&_svg]:text-red-600",
          warning: "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50 [&_svg]:text-amber-600",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50 [&_svg]:text-blue-600",
          loading: "group-[.toaster]:border-slate-200 group-[.toaster]:bg-slate-50 [&_svg]:text-slate-600",
          closeButton: "group-[.toast]:text-slate-400 group-[.toast]:hover:text-slate-600 ml-auto order-last",
        },
      }}
      expand={false}
      richColors
      duration={3000}
      visibleToasts={4}
    />
  )
}

export { Toaster }
