/**
 * Knowledge Base — All the information about Ayush Aryan, structured into
 * searchable chunks for RAG retrieval.
 *
 * Each chunk has:
 * - id: Unique identifier
 * - content: The text to embed and retrieve
 * - category: Section of the portfolio (about, experience, skills, etc.)
 * - metadata: Additional context (company name, role, etc.)
 */

export interface KnowledgeChunk {
  id: string
  content: string
  category: string
  metadata?: Record<string, string>
  embedding?: number[] // Pre-computed embedding vector
}

/**
 * Build the knowledge base from all portfolio data.
 * Each chunk is a standalone piece of information that can be retrieved
 * independently to answer specific questions.
 */
export function buildKnowledgeBase(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = []

  // === About ===
  chunks.push({
    id: 'about-overview',
    category: 'About',
    content:
      "Ayush Aryan is a high-impact backend engineer who ships fast and builds scalable systems used by 400K+ users. He has a B.Tech in Data Science & AI from BML Munjal University and startup experience. He brings a product builder mindset — he doesn't just write code, he owns outcomes end-to-end.",
  })
  chunks.push({
    id: 'about-specialization',
    category: 'About',
    content:
      'Ayush specializes in Java, Spring Boot, Apache Kafka, Redis, Microservices Architecture, RAG, LLMs, and Distributed Systems. He builds production systems that move fast and scale hard.',
  })
  chunks.push({
    id: 'about-location',
    category: 'About',
    content:
      'Ayush Aryan is based in Gurugram, Haryana, India. He is open to remote and in-office opportunities. Born on 13 September 2002.',
  })
  chunks.push({
    id: 'about-looking-for',
    category: 'About',
    content:
      "Ayush Aryan is looking for founders and engineering leaders who need a cracked engineer to own backend architecture, ship rapidly, and build infrastructure that scales. He is open to Software Engineer roles or early-stage founding engineer positions.",
  })

  // === Why Hire Me ===
  chunks.push({
    id: 'why-ships-fast',
    category: 'Why Hire Me',
    content:
      "Ayush ships fast — 4 apps shipped to production, from concept to App Store in under 4 months. He has built and deployed microservices for 400K+ users.",
  })
  chunks.push({
    id: 'why-builds-scalable',
    category: 'Why Hire Me',
    content:
      'Ayush builds scalable systems — event-driven microservices processing 1M+ events/day, Redis caching cutting database load by 60%, and <50ms API latency at scale.',
  })
  chunks.push({
    id: 'why-owns-outcomes',
    category: 'Why Hire Me',
    content:
      "Ayush owns outcomes end-to-end — from architecture to production deployment. He has worked directly with founders in fast-paced startups, bringing a product builder mindset.",
  })
  chunks.push({
    id: 'why-fullstack',
    category: 'Why Hire Me',
    content:
      "Ayush is full-stack capable — strong backend core (Java, Spring Boot, Kafka) plus AI/ML (RAG, LLMs, LangChain) and mobile development (Flutter, 2 App Store launches).",
  })

  // === Experience ===
  chunks.push({
    id: 'exp-visionify',
    category: 'Experience',
    metadata: { company: 'Visionify Inc.', role: 'Software Engineer', period: 'September 2025 - Present' },
    content:
      'At Visionify Inc., Ayush architects and builds event-driven microservices serving 400K+ users with <50ms latency using Java, Spring Boot, and Apache Kafka. He designed a Redis caching layer cutting database load by 60% and improving API response times by 3x. He implemented distributed event streaming pipelines processing 1M+ events/day for real-time data ingestion across services. He owns end-to-end delivery of critical backend modules from architecture through deployment and monitoring.',
  })
  chunks.push({
    id: 'exp-eventstrat',
    category: 'Experience',
    metadata: { company: 'EventStrat', role: 'Software Developer (SDE 1)', period: 'February 2025 - September 2025' },
    content:
      "At EventStrat, Ayush built the backend architecture for an AI-powered event infrastructure platform from the ground up using Java and Spring Boot. He designed scalable microservices handling event websites, registrations, and real-time analytics for large-scale enterprise events. He implemented Kafka event pipelines ensuring reliable, fault-tolerant data ingestion. He worked directly with product and design teams in a fast-paced startup, shipping features quickly and owning outcomes.",
  })
  chunks.push({
    id: 'exp-visanka',
    category: 'Experience',
    metadata: { company: 'Visanka Technology', role: 'Backend Developer', period: 'December 2023 - August 2025' },
    content:
      'At Visanka Technology, Ayush led end-to-end backend development of a real-time cross-platform chat application from database schema design to API deployment. He built a real-time messaging system using Spring Boot + WebSocket, enabling instant communication between Flutter frontend and backend. He designed secure authentication flows and MongoDB data models that scaled with growing user base.',
  })
  chunks.push({
    id: 'exp-zolatte',
    category: 'Experience',
    metadata: { company: 'Zolatte', role: 'Flutter Developer', period: 'April 2023 - August 2023' },
    content:
      'At Zolatte, Ayush developed CHATGURU — one of the first Hindi-language AI apps — from concept to App Store and Play Store launch. He integrated the OpenAI API to deliver conversational AI to non-English speaking users. He built an offline-first architecture with local storage. He owned the entire product lifecycle from ideation to production deployment on both app stores.',
  })

  // === Skills & Technologies ===
  chunks.push({
    id: 'skills-languages',
    category: 'Skills',
    content:
      'Ayush Aryan works with these languages and databases: Java, C, Python, Dart/Flutter, HTML5, CSS3, MySQL, Firebase, MongoDB, Redis, and Apache Kafka.',
  })
  chunks.push({
    id: 'skills-frameworks',
    category: 'Skills',
    content:
      'Ayush uses these frameworks and libraries: Spring Boot, Node.js, OpenCV, and Scikit-learn.',
  })
  chunks.push({
    id: 'skills-aiml',
    category: 'Skills',
    content:
      "Ayush's AI and Machine Learning expertise includes: PyTorch, TensorFlow, LangChain, Hugging Face, RAG (Retrieval-Augmented Generation), LLMs (Large Language Models), OpenAI API, Natural Language Processing, and Deep Learning.",
  })
  chunks.push({
    id: 'skills-tools',
    category: 'Skills',
    content: 'Ayush uses these tools and platforms: Git, Postman, Heroku, and Jupyter.',
  })

  // === Education ===
  chunks.push({
    id: 'education-btech',
    category: 'Education',
    content:
      "Ayush Aryan earned a B.Tech in Data Science and Artificial Intelligence from BML Munjal University (October 2021 - June 2025, Graduated). Relevant coursework: Machine Learning & Deep Learning, Natural Language Processing, Data Structures and Algorithms, Database Management Systems, and Operating Systems.",
  })

  // === Projects ===
  chunks.push({
    id: 'project-ecommerce',
    category: 'Projects',
    content:
      'Ayush built an E-Commerce App using Flutter, Node.js, Express, MongoDB with Mongoose. Features include REST APIs, state management with Provider, and cross-platform support for Android and iOS.',
  })
  chunks.push({
    id: 'project-covid-tracker',
    category: 'Projects',
    content:
      'Ayush built a Covid-19 Tracker App using Flutter and REST API, providing real-time global and country-specific COVID-19 statistics with interactive charts, country flags, and safety guidelines.',
  })
  chunks.push({
    id: 'project-rainfall',
    category: 'Projects',
    content:
      "Ayush built a Rainfall Prediction App using Python and machine learning. The model uses the Australia Weather dataset with data preprocessing and classification algorithms to predict rainfall occurrence.",
  })

  // === Certifications ===
  chunks.push({
    id: 'cert-dsa',
    category: 'Certifications',
    content:
      "Ayush holds a Data Structures & Algorithms certification from Coding Ninjas. Certificate URL: https://certificate.codingninjas.com/view/dccbf8a8b00cc85c",
  })

  // === Contact ===
  chunks.push({
    id: 'contact-info',
    category: 'Contact',
    content:
      'Email: ayusharyan1309@gmail.com. Phone: +91 8340646275. Location: Gurugram, Haryana, India. LinkedIn: https://www.linkedin.com/in/ayusharyan1309/. GitHub: https://github.com/ayusharyan13. LeetCode: https://leetcode.com/elite_force/. GeeksforGeeks: https://auth.geeksforgeeks.org/user/ayusharyan1309/practice.',
  })

  // === Core Competencies ===
  chunks.push({
    id: 'competencies-list',
    category: 'Core Competencies',
    content:
      "Ayush Aryan's core competencies include: Java, Spring Boot, Microservices, Apache Kafka, Redis, Distributed Systems, System Design, Event-Driven Architecture, RAG (Retrieval-Augmented Generation), LLMs, LangChain, Machine Learning, Deep Learning, Natural Language Processing, PyTorch, REST API Design, WebSocket, MongoDB, Flutter, Product Building, High-Impact Engineering, and Cloud Architecture.",
  })

  // === Impact Stats ===
  chunks.push({
    id: 'impact-stats',
    category: 'Impact',
    content:
      "Ayush's impact metrics: 400K+ users served, 3+ years building products, 4 apps shipped to production, and 3+ years of Java/Spring Boot experience.",
  })

  return chunks
}
