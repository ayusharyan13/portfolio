import { personalInfo } from '../data/portfolio'

function SkillCategory({ title, items, children }) {
  return (
    <div className="glass-card rounded-xl p-6 sm:p-8">
      <h3 className="text-base font-semibold text-white mb-5">{title}</h3>
      <div className="flex flex-wrap items-center gap-4">
        {items?.map((item) => (
          <img
            key={item.name}
            src={item.logo}
            alt={`${item.name} — Technology used by Ayush Aryan`}
            className="h-10 sm:h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            loading="lazy"
            itemProp="knowsAbout"
          />
        ))}
        {children}
      </div>
    </div>
  )
}

export default function Skills() {
  const { skills } = personalInfo

  return (
    <section id="skills" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Skills & Technologies</h2>

        <div className="space-y-5">
          <SkillCategory title="Languages & Databases" items={skills.languages} />
          <SkillCategory title="Frameworks & Libraries" items={skills.frameworks} />
          <SkillCategory title="AI & Machine Learning" items={skills.aiMl}>
            {skills.aiBadges.map((badge) => (
              <span key={badge} className="skill-tag" itemProp="knowsAbout">
                {badge}
              </span>
            ))}
          </SkillCategory>
          <SkillCategory title="Tools & Platforms" items={skills.tools} />
        </div>
      </div>
    </section>
  )
}
