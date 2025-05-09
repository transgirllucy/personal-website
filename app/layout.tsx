import type React from "react"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Personal Site",
  description: "Personal website about a 19 yr old transgirl doing Linux stuff",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/98.css" />
      </head>
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
