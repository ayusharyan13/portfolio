import { personalInfo } from '../data/portfolio'

export default function Experience() {
  return (
    <section id="experience" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Experience</h2>

        <p className="text-gray-400 mb-10 -mt-4 max-w-3xl">
          I've shipped products across startups — owning backend architecture, infrastructure, and
          delivery end-to-end. I <span className="text-[#12d640] font-medium">ship fast</span>,{' '}
          <span className="text-[#12d640] font-medium">build scalable</span> systems, and{' '}
          <span className="text-[#12d640] font-medium">own outcomes</span>.{' '}
          <span className="text-xs text-gray-500 tracking-wider">
            #ShipFast #BuildScalable #CrackedEngineer #Java #SpringBoot #Microservices #Kafka #Redis #AI #RAG #LLM #BackendEngineering #DistributedSystems #Gurugram
          </span>
        </p>

        <div className="space-y-6">
          {personalInfo.experience.map((exp, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 sm:p-8 relative group"
              itemScope
              itemType="https://schema.org/OrganizationRole"
            >
              <meta itemProp="roleName" content={exp.role} />
              <meta itemProp="startDate" content={exp.period.split(' - ')[0]} />
              {exp.period.includes('Present') ? (
                <meta itemProp="endDate" content={new Date().toISOString().split('T')[0]} />
              ) : (
                <meta itemProp="endDate" content={exp.period.split(' - ')[1]} />
              )}

              <div className="grid md:grid-cols-4 gap-4 md:gap-6">
                {/* Left: Company & period */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-[#12d640]">
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" className="hover:underline" itemProp="affiliation">
                      {exp.company}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{exp.period}</p>
                  <p className="text-sm text-gray-400 mt-2 font-medium">{exp.role}</p>

                  {/* Visible skill tags per role */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.tech.split(', ').map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Highlights */}
                <div className="md:col-span-3">
                  <ul className="space-y-3">
                    {exp.highlights.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12d640] mt-2 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
