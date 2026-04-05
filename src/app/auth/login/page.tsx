'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'
import { clientLogger } from '@/lib/utils/client-logger'
import { useLoginRateLimit } from '@/lib/auth/client-rate-limiter'
import {
  CheckCircle, Menu, X, ChevronRight, Lock, Building2,
  TrendingUp, Star, DollarSign, FileText, Briefcase,
  BarChart3, Shield, Clock, Zap, Award, Users, Package,
  Handshake, Globe, HeadphonesIcon
} from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

type LoginInput = z.infer<typeof loginSchema>

export default function VendorLoginPage() {
  const router = useRouter()
  const { signIn, loading, user } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  })

  const rateLimit = useLoginRateLimit(email)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null)
    setEmail(data.email)

    if (rateLimit.isLocked) {
      const remainingMinutes = Math.ceil(rateLimit.remainingTime / 60000)
      setSubmitError(`Too many failed attempts. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`)
      return
    }

    try {
      clientLogger.info('Attempting vendor login', { email: data.email })
      const { error } = await signIn(data.email, data.password)

      if (error) {
        clientLogger.error('Vendor login failed', { email: data.email, error: error.message })
        const result = rateLimit.recordFailed()
        if (result.isLocked) {
          setSubmitError('Too many failed attempts. Account locked for 15 minutes.')
          return
        }
        if (error.message.includes('Invalid login credentials')) {
          setSubmitError(`Invalid email or password. ${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? 's' : ''} remaining.`)
        } else if (error.message.includes('Email not confirmed')) {
          setSubmitError('Please verify your email address before signing in.')
        } else {
          setSubmitError(error.message || 'An error occurred during sign in.')
        }
        return
      }

      clientLogger.info('Vendor login successful', { email: data.email })
      rateLimit.clearAttempts()
      router.push('/vendors')
      router.refresh()
    } catch (err) {
      clientLogger.error('Vendor login exception', { email: data.email, error: err instanceof Error ? err.message : String(err) })
      setSubmitError('An unexpected error occurred. Please try again.')
    }
  }

  React.useEffect(() => {
    if (!loading && user && user.role === 'VENDOR') {
      router.push('/vendors')
    }
  }, [user, loading, router])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const isLoading = loading || isSubmitting

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              LOANZ360
            </h1>
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('hero')} className="text-gray-300 hover:text-orange-500 transition-colors font-medium">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-orange-500 transition-colors font-medium">Features</button>
              <button onClick={() => scrollToSection('portal')} className="text-gray-300 hover:text-orange-500 transition-colors font-medium">Access Portal</button>
              <button
                onClick={() => scrollToSection('portal')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Vendor Login</span>
              </button>
            </nav>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4 space-y-2">
              <button onClick={() => scrollToSection('hero')} className="block w-full text-left px-4 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-colors">Features</button>
              <button onClick={() => scrollToSection('portal')} className="block w-full text-left px-4 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-colors">Access Portal</button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-400">Vendor Partner Portal</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Deliver Services,{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Grow Together
                </span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Join LOANZ360's trusted vendor network. Offer your services — document verification,
                property valuation, legal consultation, and more — to India's fastest-growing loan platform.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Premium Contracts', desc: 'Priority allocation for top-rated vendors', icon: CheckCircle },
                  { title: 'Transparent Earnings', desc: 'Real-time payments and payout tracking', icon: CheckCircle },
                  { title: 'Dedicated Support', desc: '24/7 vendor support and assistance', icon: CheckCircle },
                  { title: 'Performance Bonuses', desc: 'Earn more based on quality ratings', icon: CheckCircle },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection('portal')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center space-x-2"
                >
                  <span>Access Vendor Portal</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="bg-gray-800/50 backdrop-blur border border-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:block hidden">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <Briefcase className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="text-2xl font-bold text-white">32</p>
                      <p className="text-xs text-gray-400">Active Contracts</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <DollarSign className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold text-white">₹4.8L</p>
                      <p className="text-xs text-gray-400">Total Earnings</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <Star className="w-8 h-8 text-yellow-500 mb-2" />
                      <p className="text-2xl font-bold text-white">4.9</p>
                      <p className="text-xs text-gray-400">Service Rating</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-2xl font-bold text-white">94%</p>
                      <p className="text-xs text-gray-400">Completion Rate</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Services</p>
                    {[
                      { text: 'Document verification completed', icon: FileText, color: 'text-green-500' },
                      { text: 'Property valuation submitted', icon: Building2, color: 'text-blue-500' },
                      { text: 'New contract assigned: Legal', icon: Briefcase, color: 'text-orange-500' },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 flex items-center space-x-3">
                        <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                        <span className="text-xs text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 shadow-lg shadow-orange-500/30">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 bg-gray-900/50 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Vendors', icon: Users },
              { value: '₹50Cr+', label: 'Payments Processed', icon: DollarSign },
              { value: '4.8★', label: 'Average Rating', icon: Star },
              { value: '98%', label: 'On-time Delivery', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <stat.icon className="w-6 h-6 text-orange-500 mx-auto" />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-400">Vendor Tools</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful tools to manage your services, track earnings, and grow your vendor business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Package, title: 'Service Management', desc: 'List, manage, and update your service offerings with ease. Set rates, availability, and service areas.', color: 'orange' },
              { icon: FileText, title: 'Contract Tracking', desc: 'View all active, pending, and completed contracts in one place. Never miss a deadline.', color: 'blue' },
              { icon: DollarSign, title: 'Earnings Dashboard', desc: 'Real-time view of earnings, pending payments, and detailed payout history.', color: 'green' },
              { icon: BarChart3, title: 'Performance Analytics', desc: 'Track service ratings, completion rates, and response times to improve your ranking.', color: 'purple' },
              { icon: Shield, title: 'Verified Vendor Badge', desc: 'Build trust with LOANZ360 verification. Higher tier = more premium contracts.', color: 'yellow' },
              { icon: HeadphonesIcon, title: '24/7 Vendor Support', desc: 'Dedicated support team available round-the-clock to resolve any issues instantly.', color: 'pink' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 hover:bg-gray-800/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="portal" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Info */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
                  <Lock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-400">Secure Portal Access</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Sign In to Your{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Vendor Account
                  </span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Access your dashboard, manage contracts, track earnings, and grow your business with LOANZ360.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Handshake, title: 'Trusted by 500+ Vendors', desc: 'Join India\'s fastest-growing loan service network' },
                  { icon: Globe, title: 'Pan-India Presence', desc: 'Service customers across all major cities' },
                  { icon: Award, title: 'Premium Tier Benefits', desc: 'Unlock better rates and priority contracts as you grow' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Vendor Sign In</h3>
                <p className="text-gray-400 mt-2 text-sm">Access your vendor portal and manage your services</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    error={errors.email?.message}
                    variant="default"
                    disabled={isLoading || rateLimit.isLocked}
                    autoFocus
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <PasswordInput
                    {...register('password')}
                    label="Password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    variant="default"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                      disabled={isLoading}
                    />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {submitError && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                    {submitError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="orange"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || rateLimit.isLocked}
                >
                  {rateLimit.isLocked
                    ? `Locked (${Math.ceil(rateLimit.remainingTime / 1000)}s)`
                    : isLoading
                    ? 'Signing in...'
                    : 'Sign In to Vendor Portal'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  New vendor partner?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/auth/register')}
                    className="text-orange-400 font-medium hover:text-orange-300 transition-colors"
                  >
                    Register now
                  </button>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-orange-500/70" />
                  256-bit SSL encrypted · LOANZ360 Vendor Network
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-3">LOANZ360</h3>
              <p className="text-gray-400 text-sm">India's trusted loan management platform connecting lenders, partners, and service providers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Vendor Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Document Verification</li>
                <li>Property Valuation</li>
                <li>Legal Consultation</li>
                <li>Credit Assessment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>vendors@loanz360.com</li>
                <li>+91 1800-LOANZ360</li>
                <li>Mon–Sat: 9AM–7PM IST</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 pt-6 text-center text-xs text-gray-500">
            © 2026 LOANZ360. All rights reserved. · Vendor Portal
          </div>
        </div>
      </footer>
    </div>
  )
}
