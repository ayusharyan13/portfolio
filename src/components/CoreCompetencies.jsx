import { personalInfo } from '../data/portfolio'

export default function CoreCompetencies() {
  return (
    <section className="relative py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Core Competencies</h2>

        <div className="flex flex-wrap gap-3 justify-center">
          {personalInfo.coreCompetencies.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
