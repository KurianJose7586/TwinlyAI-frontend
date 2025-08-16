import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { WebsiteHeader } from "@/components/website-header"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <WebsiteHeader currentPage="pricing" />

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find the Plan That's Right for You</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to transform your resume into an intelligent AI assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-white text-2xl font-bold mb-4">Free</h3>
            <div className="text-4xl font-bold text-white mb-2">
              ₹0<span className="text-base text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-8 text-base">For individuals starting out.</p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>1 Bot</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>100 Queries/month</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Embeddable Widget (with branding)</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Plus Plan */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-white text-2xl font-bold mb-4">Plus</h3>
            <div className="text-4xl font-bold text-white mb-2">
              ₹200<span className="text-base text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-8 text-base">For a more professional look.</p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>2 Bots</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>500 Queries/month</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Remove Branding</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              <Link href="/auth">Choose Plus</Link>
            </Button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-zinc-900 rounded-xl p-8 border-2 border-blue-500 shadow-xl shadow-blue-500/20 transform scale-105 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap">
                Most Popular
              </span>
            </div>
            <h3 className="text-white text-2xl font-bold mb-4 mt-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-2">
              ₹799<span className="text-base text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-8 text-base">For professionals and developers.</p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>10 Bots</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>2,500 Queries/month</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Developer API Access</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Source Citations</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              <Link href="/auth">Start Pro Trial</Link>
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-white text-2xl font-bold mb-4">Enterprise</h3>
            <div className="text-4xl font-bold text-white mb-2">Custom</div>
            <p className="text-gray-400 mb-8 text-base">For businesses and organizations.</p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Unlimited Bots</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>High-Volume Queries</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>SSO & SLA</span>
              </li>
              <li className="flex items-start text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>Advanced Integrations</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full border-zinc-600 text-gray-300 hover:bg-zinc-700 bg-transparent py-3"
            >
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Additional CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of professionals who have transformed their resumes with AI
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
            <Link href="/auth">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
