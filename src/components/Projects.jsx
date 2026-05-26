import { personalInfo } from '../data/portfolio'

export default function Projects() {
  return (
    <section id="projects" className="relative py-20 sm:py-28" itemScope itemType="https://schema.org/ItemList">
      <h2 className="section-title max-w-6xl mx-auto px-4 sm:px-6">Projects</h2>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalInfo.projects.map((project, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden group"
              itemScope
              itemType="https://schema.org/SoftwareApplication"
              itemProp="itemListElement"
            >
              <meta itemProp="name" content={project.title} />
              <meta itemProp="applicationCategory" content="WebApplication" />
              <meta itemProp="operatingSystem" content="Web" />

              {/* Image */}
              <div className="aspect-video bg-white/5 overflow-hidden">
                <img
                  src={project.image}
                  alt={`${project.title} — ${project.description}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  itemProp="screenshot"
                />
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#12d640] transition-colors">
                  {project.title}
                </h3>

                {/* Tech stack badges */}
                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.split(', ').map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-[#12d640]/10 text-[#12d640] border border-[#12d640]/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-400 leading-relaxed line-clamp-2" itemProp="description">
                  {project.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                    itemProp="url"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Source Code
                  </a>
                  {project.details && (
                    <a
                      href={project.details}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Project Details
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
