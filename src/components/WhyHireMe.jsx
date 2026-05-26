import { personalInfo } from '../data/portfolio'

export default function WhyHireMe() {
  return (
    <section className="relative py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Why Hire Me</h2>

        <div className="glass-card rounded-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {personalInfo.whyHireMe.map((item) => (
              <div key={item.title} className="text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>
                <h4 className="text-lg font-semibold text-[#12d640] mb-2">{item.title}</h4>
                <p
                  className="text-sm text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.desc }}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-[#12d640] font-medium tracking-wider mb-4">
              #ShipFast #BuildScalable #OwnOutcomes #CrackedEngineer #ProductBuilder
            </p>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#12d640] text-[#0a0a1a] font-semibold rounded-xl hover:bg-[#12d640]/90 transition-all duration-300 shadow-lg shadow-[#12d640]/20"
            >
              Let's Talk
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
