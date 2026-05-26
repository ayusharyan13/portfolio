import { personalInfo } from '../data/portfolio'

export default function Contact() {
  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Contact</h2>

        <p className="text-gray-400 mb-10 -mt-4 max-w-2xl">
          Interested in working together? I'm actively exploring opportunities where I can own
          backend systems and build products that scale.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Location */}
          <div className="glass-card rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#12d640]/10 text-[#12d640] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1">Location</h3>
              <p className="text-sm text-gray-400">Gurugram, Haryana, India</p>
            </div>
          </div>

          {/* Social */}
          <div className="glass-card rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#12d640]/10 text-[#12d640] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-2">Social Profiles</h3>
              <div className="flex items-center gap-3">
                {personalInfo.socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#12d640] transition-colors"
                    aria-label={link.name}
                  >
                    {link.name === 'LinkedIn' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                    {link.name === 'GitHub' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    {link.name === 'Email' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                    )}
                    {link.name === 'LeetCode' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.483 0a1.374 1.374 0 00-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 00-1.209 2.104 5.35 5.35 0 00-.125.513 5.527 5.527 0 00.062 2.362 5.83 5.83 0 00.349 1.017 5.938 5.938 0 001.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 00-1.951-.003l-2.396 2.392a3.021 3.021 0 01-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.47-.948-2.263a2.68 2.68 0 01.066-.523 2.545 2.545 0 01.619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 00-.207-1.943l-3.5-2.831c-.926-.753-2.075-1.155-3.254-1.153-.5.002-1.002.087-1.462.255L13.5 1.866A1.376 1.376 0 0013.483 0z" />
                      </svg>
                    )}
                    {link.name === 'GeeksforGeeks' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.02 3.482c.2.005.398.032.585.08l.022-.005 1.19.305c.386.11.772.22 1.156.338.83.249 1.643.548 2.44.893l.138.063c.386.18.769.367 1.144.567l-.006.012c.757.402 1.433.873 2.023 1.4.67.596 1.13 1.265 1.38 2.004.24.714.217 1.472-.068 2.27-.184.52-.465 1.006-.844 1.456v.003c.064.286.097.582.097.886 0 2.209-1.991 4-4.448 4-.346 0-.682-.036-1.008-.104.37.396.597.922.597 1.503 0 1.243-1.007 2.25-2.25 2.25s-2.25-1.007-2.25-2.25c0-.581.227-1.107.597-1.503a3.205 3.205 0 00-1.008.104c-2.457 0-4.448-1.791-4.448-4 0-.304.033-.6.097-.886v-.003c-.38-.45-.66-.935-.844-1.455-.285-.8-.308-1.558-.068-2.27.25-.74.71-1.41 1.38-2.005.59-.527 1.266-.998 2.023-1.4l-.006-.012c.375-.2.758-.387 1.144-.567l.138-.063c.797-.345 1.61-.644 2.44-.893.384-.118.77-.228 1.155-.338l1.19-.305.022.005a2.11 2.11 0 01.585-.08 2.11 2.11 0 01.585-.08z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="glass-card rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#12d640]/10 text-[#12d640] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1">Email</h3>
              <p className="text-sm text-gray-400">{personalInfo.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="glass-card rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#12d640]/10 text-[#12d640] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1">Phone</h3>
              <p className="text-sm text-gray-400">{personalInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
