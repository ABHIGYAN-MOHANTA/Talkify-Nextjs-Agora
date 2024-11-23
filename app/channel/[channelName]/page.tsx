'use client'

import Call from "@/components/call"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { use } from "react"

interface PageProps {
  params: Promise<{ channelName: string }>
}

export default function Page({ params }: PageProps) {
  const { channelName } = use(params)

  return (
    <main className="relative min-h-screen bg-gray-900">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">
            Channel: {channelName}
          </h1>
        </div>
      </div>

      <Call
        appId={process.env.NEXT_PUBLIC_AGORA_APP_ID || ""}
        token={process.env.NEXT_PUBLIC_AGORA_TEMP_TOKEN || ""}
        channelName={channelName}
      />
    </main>
  )
}

Page.ErrorBoundary = function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-xl font-bold mb-2">Error Loading Channel</h2>
        <p className="text-gray-400">{error.message}</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}