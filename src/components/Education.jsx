import { personalInfo } from '../data/portfolio'

export default function Education() {
  const { education } = personalInfo

  return (
    <section id="education" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Education</h2>

        <div
          className="glass-card rounded-2xl overflow-hidden"
          itemScope
          itemType="https://schema.org/EducationalOccupationalCredential"
        >
          <meta itemProp="educationalLevel" content="Bachelor's Degree" />

          <div className="grid md:grid-cols-5 gap-0">
            {/* Logo */}
            <div
              className="md:col-span-2 bg-white/5 p-8 flex items-center justify-center"
              itemProp="recognizedBy"
              itemScope
              itemType="https://schema.org/CollegeOrUniversity"
            >
              <meta itemProp="name" content={education.school} />
              <img
                src={education.logo}
                alt={`${education.school} — B.Tech in Data Science and Artificial Intelligence`}
                className="max-w-[200px] h-auto"
                loading="lazy"
              />
            </div>

            {/* Details */}
            <div className="md:col-span-3 p-6 sm:p-8 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white" itemProp="credentialCategory">{education.degree}</h3>
                <p className="text-sm text-[#12d640] font-medium mt-1">{education.school}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                  {education.period}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#12d640]/10 text-[#12d640] border border-[#12d640]/20">
                  {education.status}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-200 mb-2">Relevant Coursework</p>
                <div className="flex flex-wrap gap-2">
                  {education.coursework.map((course) => (
                    <span key={course} className="skill-tag text-xs">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        {personalInfo.certifications.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-6">Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {personalInfo.certifications.map((cert) => (
                <a
                  key={cert.title}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl overflow-hidden group"
                  itemScope
                  itemType="https://schema.org/CreativeWork"
                >
                  <meta itemProp="name" content={cert.title} />
                  <meta itemProp="provider" content="Coding Ninjas" />
                  <div className="aspect-video bg-white/5 flex items-center justify-center p-6">
                    <img
                      src={cert.image}
                      alt={`${cert.title} — Certification`}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      itemProp="image"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#12d640] transition-colors" itemProp="about">
                      {cert.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
