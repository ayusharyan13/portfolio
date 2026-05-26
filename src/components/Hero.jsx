import { useState, useEffect } from 'react'
import { personalInfo } from '../data/portfolio'

const SocialIcon = ({ name }) => {
  const icons = {
    linkedin: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    mail: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
      </svg>
    ),
    leetcode: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 00-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 00-1.209 2.104 5.35 5.35 0 00-.125.513 5.527 5.527 0 00.062 2.362 5.83 5.83 0 00.349 1.017 5.938 5.938 0 001.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 00-1.951-.003l-2.396 2.392a3.021 3.021 0 01-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.47-.948-2.263a2.68 2.68 0 01.066-.523 2.545 2.545 0 01.619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 00-.207-1.943l-3.5-2.831c-.926-.753-2.075-1.155-3.254-1.153-.5.002-1.002.087-1.462.255L13.5 1.866A1.376 1.376 0 0013.483 0z" />
      </svg>
    ),
    gfg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.02 3.482c.2.005.398.032.585.08l.022-.005 1.19.305c.386.11.772.22 1.156.338.83.249 1.643.548 2.44.893l.138.063c.386.18.769.367 1.144.567l-.006.012c.757.402 1.433.873 2.023 1.4.67.596 1.13 1.265 1.38 2.004.24.714.217 1.472-.068 2.27-.184.52-.465 1.006-.844 1.456v.003c.064.286.097.582.097.886 0 2.209-1.991 4-4.448 4-.346 0-.682-.036-1.008-.104.37.396.597.922.597 1.503 0 1.243-1.007 2.25-2.25 2.25s-2.25-1.007-2.25-2.25c0-.581.227-1.107.597-1.503a3.205 3.205 0 00-1.008.104c-2.457 0-4.448-1.791-4.448-4 0-.304.033-.6.097-.886v-.003c-.38-.45-.66-.935-.844-1.455-.285-.8-.308-1.558-.068-2.27.25-.74.71-1.41 1.38-2.005.59-.527 1.266-.998 2.023-1.4l-.006-.012c.375-.2.758-.387 1.144-.567l.138-.063c.797-.345 1.61-.644 2.44-.893.384-.118.77-.228 1.155-.338l1.19-.305.022.005a2.11 2.11 0 01.585-.08 2.11 2.11 0 01.585-.08z" />
      </svg>
    ),
  }
  return icons[name] || null
}

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentTitle = personalInfo.titles[titleIndex]
    let timeout

    if (!isDeleting && charIndex < currentTitle.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 80)
    } else if (!isDeleting && charIndex === currentTitle.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 40)
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      setTitleIndex((i) => (i + 1) % personalInfo.titles.length)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, titleIndex])

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      itemScope
      itemType="https://schema.org/Person"
      itemProp="mainEntity"
    >
      <meta itemProp="name" content={personalInfo.name} />
      <meta itemProp="jobTitle" content="Software Engineer" />
      <meta itemProp="email" content={personalInfo.email} />
      <meta itemProp="telephone" content={personalInfo.phone} />
      <meta itemProp="url" content={personalInfo.siteUrl} />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d1117] to-[#0a0a1a]" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#12d640]/5 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0ea5e9]/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Available badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-[#12d640]/20 bg-[#12d640]/5 animate-fade-in">
          <span className="w-2 h-2 bg-[#12d640] rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm text-[#12d640] font-medium">
            Available for Opportunities — Gurugram, India
          </span>
        </div>

        {/* H1 for SEO */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 animate-fade-in tracking-tight">
          {personalInfo.name.split(' ')[0]}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#12d640] to-[#0ea5e9]">
            {personalInfo.name.split(' ')[1]}
          </span>
        </h1>

        {/* H2 for SEO hierarchy */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Software Engineer{' '}
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[#12d640]">•</span>
            <span>Java</span>
            <span className="text-[#12d640]">•</span>
            <span>Spring Boot</span>
            <span className="text-[#12d640]">•</span>
            <span>AI/ML</span>
          </span>
        </h2>

        {/* Typing animation */}
        <div className="h-12 sm:h-14 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <span className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300">
            I'm{' '}
            <span className="text-[#12d640] border-r-2 border-[#12d640] pr-1" style={{ animation: 'blink 0.8s step-end infinite' }}>
              {personalInfo.titles[titleIndex].substring(0, charIndex)}
            </span>
          </span>
        </div>

        {/* Keyword-rich description */}
        <p
          className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto mb-8 animate-fade-in leading-relaxed"
          style={{ animationDelay: '0.4s' }}
          itemProp="description"
          dangerouslySetInnerHTML={{ __html: personalInfo.heroDescription }}
        />

        {/* Inline skill tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {['Java', 'Spring Boot', 'Apache Kafka', 'Redis', 'Microservices', 'AI/ML', 'RAG', 'LLMs'].map((skill) => (
            <span key={skill} className="skill-tag text-xs sm:text-sm" itemProp="knowsAbout">
              {skill}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-3 bg-[#12d640] text-[#0a0a1a] font-semibold rounded-xl hover:bg-[#12d640]/90 transition-all duration-300 shadow-lg shadow-[#12d640]/20 hover:shadow-[#12d640]/30 hover:-translate-y-0.5"
          >
            Hire Me — I'm Ready
          </a>
          <a
            href={personalInfo.resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 hover:border-white/30 transition-all duration-300"
          >
            View Resume (PDF)
          </a>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 hover:border-white/30 transition-all duration-300"
          >
            See Projects
          </a>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          {personalInfo.socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#12d640] hover:bg-[#12d640]/10 hover:border-[#12d640]/30 transition-all duration-200"
              aria-label={link.name}
              itemProp="sameAs"
            >
              <SocialIcon name={link.icon} />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-[#12d640] rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
