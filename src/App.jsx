import { seoJsonLd, faqSchema, personalInfo } from './data/portfolio'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import ImpactStats from './components/ImpactStats'
import WhyHireMe from './components/WhyHireMe'
import CoreCompetencies from './components/CoreCompetencies'
import Education from './components/Education'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'

export default function App() {
  const allSchemas = [seoJsonLd, faqSchema]

  return (
    <>
      {/* Skip-to-content link for keyboard and screen reader users */}
      <a href="#hero" className="skip-nav">
        Skip to content
      </a>

      <div className="min-h-screen bg-[#0a0a1a] text-gray-200" itemScope itemType="https://schema.org/ProfilePage">
      {/* Schema.org JSON-LD - Person, WebSite, ProfilePage, FAQ */}
      {allSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Visible breadcrumbs for SEO + UX */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 hidden sm:block">
        <nav aria-label="Breadcrumb">
          <ol
            className="flex items-center gap-2 text-sm text-gray-400"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              <meta itemProp="position" content="1" />
              <span itemProp="name" className="text-gray-300 font-medium">Home</span>
            </li>
            <span className="text-gray-600">/</span>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              <meta itemProp="position" content="2" />
              <a href="#about" itemProp="item" className="hover:text-[#12d640] transition-colors">
                <span itemProp="name">About</span>
              </a>
            </li>
            <span className="text-gray-600">/</span>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              <meta itemProp="position" content="3" />
              <a href="#experience" itemProp="item" className="hover:text-[#12d640] transition-colors">
                <span itemProp="name">Experience</span>
              </a>
            </li>
            <span className="text-gray-600">/</span>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              <meta itemProp="position" content="4" />
              <a href="#contact" itemProp="item" className="hover:text-[#12d640] transition-colors">
                <span itemProp="name">Contact</span>
              </a>
            </li>
          </ol>
        </nav>
      </div>

      <Navbar />
      <main>
        <Hero />
        <About />
        <ImpactStats />
        <WhyHireMe />
        <CoreCompetencies />
        <Education />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />

      {/* Floating RAG Chatbot */}
      <Chatbot />
    </div>
    </>
  )
}
