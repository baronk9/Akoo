'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, LayoutDashboard, Target, Zap, Layout, Settings, Star, Layers, MousePointerClick } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Founders');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">

      {/* Absolute Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50 z-0"></div>
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50 z-0"></div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-50 bg-[#0B0A0F]/80 backdrop-blur-md sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-blue-400/20">
            F
          </div>
          <span className="font-bold text-white text-lg tracking-wide group-hover:text-blue-400 transition-colors">Floee AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white font-medium transition-colors text-sm">
            Log in
          </Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
            Try Free <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4 flex flex-col items-center text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          All your AI Needs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in one Place</span>
        </h1>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['Market Analysis', 'Product Pages', 'Image Prompts', 'Ad Copy'].map((pill, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1823] border border-white/10 text-xs font-semibold text-gray-300">
              <Sparkles size={12} className="text-blue-400" /> {pill}
            </div>
          ))}
        </div>

        <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 transition-transform hover:-translate-y-1 mb-8">
          Start Generating Free
        </Link>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 justify-center">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0A0F] bg-gray-800 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=1A1823`} alt="User" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-xs text-gray-400 font-medium">Excellent 4.9/5 based on 100+ reviews</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-32">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-[#13111C]">
          {/* Fake Browser Header */}
          <div className="h-12 bg-[#0B0A0F] border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            <div className="mx-auto w-1/2 h-6 bg-[#1A1823] rounded-md border border-white/5 flex items-center justify-center text-[10px] text-gray-600">
              floee.ai/dashboard
            </div>
          </div>
          {/* Mock Dashboard Body */}
          <div className="p-8 grid grid-cols-12 gap-6 h-[400px] md:h-[600px] bg-gradient-to-br from-[#13111C] to-[#0d0c13] relative">
            {/* Sidebar mock */}
            <div className="hidden md:block col-span-3 space-y-3">
              <div className="h-10 border border-white/10 bg-white/5 rounded-xl"></div>
              <div className="h-10 border border-blue-500/30 bg-blue-500/10 rounded-xl"></div>
              <div className="h-10 border border-white/10 bg-white/5 rounded-xl"></div>
              <div className="mt-auto h-32 border border-white/10 bg-white/5 rounded-xl absolute bottom-8 w-[calc(25%-24px)]"></div>
            </div>
            {/* Main Content mock */}
            <div className="col-span-12 md:col-span-9 space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 h-32 rounded-2xl border border-white/10 bg-[#1A1823] relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
                </div>
                <div className="flex-1 h-32 rounded-2xl border border-white/10 bg-[#1A1823] p-4"></div>
              </div>
              {/* Active Generation view */}
              <div className="h-64 rounded-2xl border border-white/10 bg-[#1A1823] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50"></div>
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 z-10">
                  <Sparkles size={24} className="text-white relative left-0.5" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 h-4 pattern-diagonal-lines pattern-white pattern-source-overlay pattern-size-1 opacity-10"></div>
              </div>
            </div>

            {/* Floating Avatar overlay (from reference image) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-[#13111C] shadow-2xl overflow-hidden bg-gray-800 hidden md:block z-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="Happy User" />
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Gains Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Productivity Gains with Floee AI</h2>
          <p className="text-gray-400">The smart workflow engine that accelerates your dropshipping empire.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Smart Market Analysis', icon: Target, desc: 'We analyze the provided content to identify your target demographics, unique selling propositions, and competitive angles.' },
            { title: 'Targeted Ad Copy', icon: MousePointerClick, desc: 'Stop guessing. Generate high-converting Facebook and TikTok ad scripts proven to capture attention and direct clicks.' },
            { title: 'Rapid Generation', icon: Zap, desc: 'Get a completely finished product pipeline in 60 seconds. What used to take hours of manual research is now instantaneous.' },
            { title: 'Responsive Design Prompts', icon: Layout, desc: 'Create stunning visuals for your product pages with precise Nanobanana pro-optimized image prompts.' },
          ].map((feature, i) => (
            <div key={i} className="bg-[#13111C] border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role & Need Tabs */}
      <section id="solutions" className="max-w-5xl mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">For Every Role & Every Need</h2>
        </div>

        <div className="flex justify-center border-b border-white/10 mb-8 overflow-x-auto">
          {['Founders', 'Marketers', 'Agencies', 'Dropshippers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#13111C] border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Unified Workflow', icon: Layers, desc: 'Keep your research, copy, and creative prompts organized within single strategic workflows.' },
              { title: 'Market Precision', icon: Target, desc: 'Align every piece of copy with laser-focused buyer avatars to maximize conversion rates.' },
              { title: 'Time Savings', icon: Zap, desc: 'Push out ten valid product tests in the time it used to take to construct a single one.' },
              { title: 'Dynamic Learning', icon: LayoutDashboard, desc: 'Feed the AI specific product parameters and watch it construct tailored marketing funnels.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 bg-white/5 rounded-full p-2 h-fit border border-white/5">
                  <item.icon size={16} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get All AI for the Price of One</h2>
          <p className="text-gray-400">Stop paying for disparate subscriptions. Consolidate your launching toolset.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Competitors List */}
          <div className="bg-[#1A1823] border border-white/5 rounded-3xl p-8 opacity-70">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="font-semibold text-gray-300">Paying Separately</span>
            </div>
            <div className="space-y-4 text-sm font-medium">
              {[['Copywriting AI', '$49/mo'], ['Market Research Tool', '$99/mo'], ['Ad Inspiration DB', '$39/mo'], ['Prompt Engineer', '$50/hr'], ['Landing Page Builder', '$29/mo']].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-gray-400">
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 text-gray-300 font-bold">
                <span>Total (monthly)</span>
                <span className="text-red-400">~$266/mo</span>
              </div>
            </div>
          </div>

          {/* Floee AI Callout */}
          <div className="bg-gradient-to-br from-blue-900 to-[#13111C] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-900/20 transform md:scale-105 z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-8 relative z-10">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
              <span className="font-semibold text-white">Floee AI Engine</span>
            </div>

            <div className="text-center relative z-10 mb-8 border-b border-white/10 pb-8">
              <div className="text-6xl font-extrabold text-white mb-2">$39</div>
              <div className="text-blue-200 text-sm">per month, billed annually</div>
            </div>

            <ul className="space-y-3 mb-8 relative z-10 text-sm font-medium text-gray-200">
              {['Integrated AI Content Workflows', 'Smart Market Analysis Pipeline', '100+ Generation Credits included', 'Cloud-saved projects hub', 'Priority Support'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 font-bold transition-colors relative z-10 shadow-lg shadow-blue-500/20">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Join 10,000+ Happy Users</h2>
          <p className="text-gray-400">Discover how top media buyers and dropshippers scale with Floee AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Sarah L.', role: 'Agency Owner', stars: 5, text: 'The market analysis step accurately pinpoints demographics I hadn’t even considered. This software practically prints high-converting angles.' },
            { name: 'Marcus T.', role: 'Dropshipper', stars: 5, text: 'I used to spend 3 hours building a product page. Floee AI generates the copy, the image prompts, and ad creatives in 45 seconds.' },
            { name: 'Elena V.', role: 'E-com Founder', stars: 5, text: 'The output quality of the Ad Copy is incredible. It automatically structures the text for TikTok and Facebook with hooks included.' },
            { name: 'David C.', role: 'Media Buyer', stars: 4, text: 'Replaced three different AI tools with this one dashboard. Best UI I’ve used in the e-commerce space. Period.' }
          ].map((t, i) => (
            <div key={i} className="bg-[#1A1823] border border-white/5 rounded-2xl p-6 hover:bg-[#13111C] hover:border-white/10 transition-colors">
              <div className="flex gap-1 text-yellow-500 mb-3">
                {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-gray-300 mb-6 italic">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold font-white">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#13111C] border-y border-white/5 py-16 mb-32 relative z-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          <div>
            <div className="text-4xl font-extrabold text-blue-400 mb-2">10K+</div>
            <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-purple-400 mb-2">500K+</div>
            <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">AI Gens</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-blue-400 mb-2">90%</div>
            <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Cost Saved</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-purple-400 mb-2">10x</div>
            <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Launch Speed</div>
          </div>
        </div>
      </section>

      {/* Why Unique Grid */}
      <section className="max-w-6xl mx-auto px-4 mb-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Floee AI is Unique</h2>
          <p className="text-gray-400">We don&apos;t just provide chatbots. We construct entire strategic workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Generative Context', icon: Settings, items: ['Maintains context across steps', 'No prompt engineering required', 'Predictable output structures'] },
            { title: 'Optimized For E-Com', icon: Sparkles, items: ['Built for Shopify & TikTok', 'Sales psychology injected', 'Demographic targeting'] },
            { title: 'Centralized Hub', icon: LayoutDashboard, items: ['Save projects indefinitely', 'Copy to clipboard easily', 'Clean distraction-free UI'] },
          ].map((col, i) => (
            <div key={i} className="bg-[#1A1823] border border-white/5 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                <col.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 mb-40 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">FAQ</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "Can I use the generated content directly?", a: "Yes. All output is specifically formatted for immediate use on platforms like Shopify, Facebook Ad Manager, and TikTok." },
            { q: "Do I need to be an AI expert?", a: "Not at all. Floee AI removes the complexity of prompt engineering. Just upload your basic product details, and the engine handles the structured generation." },
            { q: "What is an 'AI Genesis' credit?", a: "One credit covers the generation of a specific component block, like generating a suite of Image Prompts or a block of Market Analysis." },
            { q: "Can I cancel my subscription anytime?", a: "Yes, you can upgrade, pause, or cancel your Pro tier subscription at any time directly from the dashboard." }
          ].map((faq, i) => (
            <div key={i} className="bg-[#1A1823] border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
              >
                <span className="font-semibold text-gray-200">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform ${openFaq === i ? 'rotate-180 bg-blue-500/20 text-blue-400' : 'text-gray-400'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-white/5 bg-[#0B0A0F] pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 group cursor-pointer mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-blue-400/20">
                  F
                </div>
                <span className="font-bold text-white text-lg tracking-wide">Floee AI</span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">The strategic AI workflow engine for modern e-commerce brands and dropshippers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Use Cases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm tracking-wide pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <span>© {new Date().getFullYear()} Floee AI. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
