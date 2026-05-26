import { personalInfo } from '../data/portfolio'

export default function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28" itemScope itemType="https://schema.org/Person">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">About Me</h2>
        <h3 className="sr-only" itemProp="jobTitle">Software Engineer specializing in Java, Spring Boot, and AI/ML</h3>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
          {/* Profile image */}
          <div className="md:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#12d640] to-[#0ea5e9] rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500" />
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/assets/img/project/ProfilePicFinal.jpg"
                  alt="Ayush Aryan — Software Engineer, Java Spring Boot Backend Developer based in Gurugram, India"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  itemProp="image"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-3 space-y-5">
            {personalInfo.aboutBio.map((para, i) => (
              <p
                key={i}
                className="text-gray-300 leading-relaxed text-base sm:text-lg"
                dangerouslySetInnerHTML={{ __html: para }}
                itemProp={i === 0 ? 'description' : undefined}
              />
            ))}

            {/* Tech stack line */}
            <div className="flex flex-wrap gap-2 mt-2">
              {personalInfo.techStackDescription.split(' • ').map((tech) => (
                <span key={tech} className="skill-tag text-xs" itemProp="knowsAbout">
                  {tech}
                </span>
              ))}
            </div>

            <div className="glass-card rounded-xl p-6 mt-4">
              <p
                className="text-gray-400 italic text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: personalInfo.lookingFor }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Birthday:</span>
                  <span className="text-gray-200" itemProp="birthDate">{personalInfo.birthday}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Role:</span>
                  <span className="text-gray-200" itemProp="jobTitle">Software Engineer @ Visionify</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Building:</span>
                  <span className="text-gray-200">Microservices for 400K+ users</span>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Location:</span>
                  <span className="text-gray-200" itemProp="homeLocation">{personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Email:</span>
                  <span className="text-gray-200" itemProp="email">{personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12d640]" />
                  <span className="text-gray-400 w-24 shrink-0">Phone:</span>
                  <span className="text-gray-200" itemProp="telephone">{personalInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mt-20">
          <h3 className="text-xl font-semibold text-white mb-6">Interests & Specializations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {personalInfo.interests.map((interest) => (
              <div
                key={interest.name}
                className="glass-card rounded-xl p-4 flex items-center gap-3"
                itemProp="knowsAbout"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
                  style={{ backgroundColor: `${interest.color}15`, color: interest.color }}
                >
                  {interest.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-200">{interest.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
