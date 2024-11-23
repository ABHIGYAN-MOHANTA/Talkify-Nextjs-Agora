'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Radio, VideoIcon } from 'lucide-react'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [channelName, setChannelName] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      channel: { value: string }
    }
    router.push(`/channel/${target.channel.value}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 mb-16">
          <div className="flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <VideoIcon size={32} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Talkify
          </h1>
          <p className="text-gray-400 text-center max-w-2xl text-lg">
            Join or create a channel to start your real-time video streaming experience.
            Connect with others in high-quality, low-latency video calls.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-300"
                  htmlFor="channel"
                >
                  Channel Name
                </label>
                <div className="relative">
                  <Radio className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-3 px-12
                             text-gray-100 placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200"
                    id="channel"
                    type="text"
                    name="channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Enter channel name"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full group relative flex items-center justify-center
                         bg-gradient-to-r from-blue-500 to-purple-600
                         py-3 px-6 rounded-lg font-semibold
                         transform transition-all duration-200
                         hover:scale-[1.02] hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Join Channel
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {['HD Video', 'Low Latency', 'Secure'].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 text-sm bg-gray-800 rounded-full text-gray-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}