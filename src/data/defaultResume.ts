import type { Resume } from '../types'

/** Seed document: a port of the original Overleaf LaTeX resume. */
export const defaultResume: Resume = {
  config: {
    // Mirrors the LaTeX preamble: fullpage 1in margins, then oddsidemargin
    // -0.375in / topmargin -0.5in, textwidth +1in, textheight +1in.
    margin: { top: 0.5, right: 0.375, bottom: 0.5, left: 0.625 },
    fontSize: 10,
    itemSize: 9,
    font: 'New Computer Modern',
    nameSize: 14.4,
    headingSize: 12,
    blockSpacing: 4,
    leading: 0.6,
    marker: '•',
  },
  header: {
    name: 'Aayush Shah',
    nameUrl: 'https://www.linkedin.com/in/akumaaayush/',
    email: 'shahaayush999@gmail.com',
    phone: '+977-9819353534',
    location: 'Kathmandu, Nepal',
    profiles: [
      { id: 'p1', label: 'LinkedIn', url: 'https://www.linkedin.com/in/akumaaayush/' },
      { id: 'p2', label: 'Github', url: 'https://github.com/akumaaayush/' },
    ],
  },
  sections: [
    {
      id: 's-summary',
      kind: 'bullets',
      title: 'Professional Summary',
      enabled: true,
      items: [
        {
          id: 'sum1',
          text: 'Software Engineer with 2+ years of experience building highly tailored ERP systems using Node.js, Vue.js, and PostgreSQL.',
        },
        { id: 'sum2', text: 'Specialized in developing scalable backend services with optimized SQL queries.' },
        { id: 'sum3', text: 'Experienced in translating requirements to development and deployment.' },
        {
          id: 'sum4',
          text: 'Passionate about building efficient, scalable, secure systems with modern technologies.',
        },
      ],
    },
    {
      id: 's-education',
      kind: 'timeline',
      title: 'Education',
      enabled: true,
      entries: [
        {
          id: 'edu1',
          org: 'Amrit Science Campus',
          location: 'Thamel, Kathmandu',
          role: 'Affl. Tribhuvan University; BSc. Computer Science and Information Technology; (Running)',
          period: '2019 - 2024',
          bullets: [],
        },
        {
          id: 'edu2',
          org: 'Eureka Higher Secondary School',
          location: 'Dharan, Nepal',
          role: 'Computer Science; National Examinations Board); GPA: 3.61',
          period: '2016 - 2018',
          bullets: [],
        },
      ],
    },
    {
      id: 's-skills',
      kind: 'bullets',
      title: 'Technical Skills',
      enabled: true,
      items: [
        { id: 'sk1', text: 'JavaScript, TypeScript' },
        { id: 'sk2', text: 'REST API, GraphQL' },
        { id: 'sk3', text: 'Express, NestJS' },
        { id: 'sk4', text: 'React, Vue, NextJS, Sass, Tailwind CSS' },
        { id: 'sk5', text: 'Database (PostgreSQL, MongoDB, Redis, Firestore), Raw SQL, Prisma, TypeORM' },
        { id: 'sk6', text: 'Postman, Insomnia, Swagger' },
        { id: 'sk7', text: 'Logging (ElasticSearch, Kibana, Logstash (ELK Stack), Sentry)' },
        { id: 'sk8', text: 'Git/Github, VSCode, IntelliJ IDEA, Jira' },
        { id: 'sk9', text: 'Amazon S3, MinIO, EC2, ECS, RDS' },
        { id: 'sk10', text: 'Docker, Jenkins, Github Actions, Linux, Server Administration, Bash Scripting' },
      ],
    },
    {
      id: 's-experience',
      kind: 'timeline',
      title: 'Experience',
      enabled: true,
      entries: [
        {
          id: 'exp1',
          org: 'Astra Softech Pvt. Ltd. (Golyan Group)',
          location: 'Kathmandu, Nepal',
          role: 'Software Engineer',
          period: 'August 2024 - Present',
          bullets: [
            {
              id: 'e1b1',
              label: 'API Development',
              text: 'Designed and maintained RESTful APIs to support ERP and e-commerce workflows, ensuring reliable communication between frontend and backend systems.',
            },
            {
              id: 'e1b2',
              label: 'E-commerce Integration',
              text: 'Designed and Developed schemas and APIs for an E-commerce Content Management System (CMS) directly linked with the manufacturing ERP. Features include CMS, product auto locking/unlocking mechanism, warehouse inventory management, tracking and so on.',
            },
            {
              id: 'e1b3',
              label: 'Microservices Architecture',
              text: 'Designed and developed modular backend services by decomposing monolithic ERP components into independently deployable microservices, improving maintainability and scalability of the system.',
            },
            {
              id: 'e1b4',
              label: 'Performance Optimization',
              text: 'Wrote and optimized complex SQL queries (CTEs, joins, aggregations, schema designs) for reporting and transactional workflows; improved report execution performance by proper analysis and implementation.',
            },
            {
              id: 'e1b5',
              label: 'Video Library',
              text: "Developed and maintained APIs for a video library system to store and view ERP's process and guides used by workers in the factory. Used and maintained self-hosted Min.IO (Amazon s3 equivalent) for securely storing and retrieving videos and images.",
            },
            {
              id: 'e1b6',
              label: 'CI/CD & Containerization',
              text: 'Worked with Docker-based environments and CI/CD pipelines (GitHub Actions) to automate build, testing, and deployment workflows, ensuring consistent and reliable releases.',
            },
            {
              id: 'e1b7',
              label: 'Deployment Automation Dashboard',
              text: 'Designed and implemented an internal deployment dashboard to automate microservice deployments and track service health, eliminating manual deployment steps and improving release speed, consistency, and operational reliability.',
            },
            {
              id: 'e1b8',
              label: 'Workflow Automation (n8n)',
              text: 'Implemented event-driven and scheduled workflows using n8n to automate email and messaging services for critical ERP events (order status changes, approvals, alerts). Integrated workflows with backend APIs and PostgreSQL triggers, ensuring reliable, timely notifications while reducing manual overhead and improving operational efficiency.',
            },
            {
              id: 'e1b9',
              label: 'Database',
              text: 'Designed database schema and Optimized database queries for PostgreSQL, massively improving report generation.',
            },
            {
              id: 'e1b10',
              label: 'Reports',
              text: 'Developed APIs for reports generation and graphs using highly optimized queries.',
            },
            {
              id: 'e1b11',
              label: 'Caching Strategy',
              text: 'Integrated Redis caching for frequently accessed reporting and operational data, reducing database load and improving API response times.',
            },
            {
              id: 'e1b12',
              label: 'Observability & Monitoring',
              text: 'Integrated Sentry and logging for real-time error tracking and performance monitoring; improved system visibility and reduced debugging time.',
            },
            {
              id: 'e1b13',
              label: 'Cross-functional Delivery',
              text: 'Collaborated with frontend engineers, QA engineers, and product teams to deliver integrated, high-quality features aligned with business requirements.',
            },
            {
              id: 'e1b14',
              label: 'Mentorship',
              text: 'Onboarded and mentored interns on backend development, API design, and SQL best practices.',
            },
            {
              id: 'e1b15',
              label: 'Documentation',
              text: 'Documented APIs, system workflows, and deployment processes to improve knowledge sharing and onboarding efficiency.',
            },
            {
              id: 'e1b16',
              label: 'Code Reviews',
              text: 'Participated in code reviews to ensure code quality, adherence to standards, and maintainability across services.',
            },
          ],
        },
        {
          id: 'exp2',
          org: 'Astra Softech Pvt. Ltd. (Golyan Group)',
          location: 'Kathmandu, Nepal',
          role: 'Software Engineer Intern',
          period: 'April 2024 - July 2024',
          bullets: [
            {
              id: 'e2b1',
              label: 'Service Decomposition',
              text: 'Refactored parts of a monolithic backend into modular services, introducing clearer service boundaries and improving codebase maintainability.',
            },
            {
              id: 'e2b2',
              label: 'ERP Development',
              text: 'Developed and maintained secure, scalable APIs for a knitwear manufacturing ERP system using Node.js/Express (backend).',
            },
            {
              id: 'e2b3',
              label: 'Redis Implementation',
              text: 'Implemented real-time data caching using Redis to enhance system responsiveness.',
            },
            {
              id: 'e2b4',
              label: 'Logging',
              text: 'Configured ELK stack (Elasticsearch, Logstash, Kibana) for centralized logging and system monitoring.',
            },
          ],
        },
      ],
    },
    {
      id: 's-soft',
      kind: 'bullets',
      title: 'Soft Skills',
      enabled: true,
      items: [
        { id: 'ss1', text: 'Critical Thinking' },
        { id: 'ss2', text: 'Research Oriented' },
        { id: 'ss3', text: 'Team Player' },
        { id: 'ss4', text: 'Problem Solving' },
        { id: 'ss5', text: 'Attention to Detail' },
      ],
    },
    {
      id: 's-projects',
      kind: 'projects',
      title: 'Projects',
      enabled: true,
      items: [
        {
          id: 'pr1',
          name: 'SastoReddit',
          summary: 'A Reddit clone project',
          stack: 'built with Next.js, GraphQL, PostgreSQL, TypeORM, ChakraUI, and Redis.',
          repoUrl: '',
          liveUrl: '',
        },
        {
          id: 'pr2',
          name: 'LinkDir',
          summary:
            'A link directory site that allows you to create and share a page with all your important links including a bio.',
          stack:
            'built with SvelteKit, Firebase (Authentication, Firestore Database, Storage), and TailwindCSS + DaisyUI',
          repoUrl: '',
          liveUrl: '',
        },
        {
          id: 'pr3',
          name: 'OurSpace',
          summary: 'A simple social networking site similar to Myspace.',
          stack: 'built with Next.js, Auth.js, PostgreSQL, Prisma',
          repoUrl: '',
          liveUrl: '',
        },
      ],
    },
    {
      id: 's-accomplishments',
      kind: 'labeled',
      title: 'Accomplishments',
      enabled: true,
      items: [
        {
          id: 'ac1',
          label: 'Second Runner Up',
          text: '- HExGenius, Hackathon organized by Himalaya College of Engineering',
          meta: 'July 2023',
        },
        {
          id: 'ac2',
          label: 'College Representative',
          text: '- Code for Change, a non-profit organization',
          meta: '2021 - 2022',
        },
      ],
    },
    {
      id: 's-languages',
      kind: 'bullets',
      title: 'Languages',
      enabled: true,
      items: [
        { id: 'l1', text: 'English (Professional)' },
        { id: 'l2', text: 'Nepali (Fluent)' },
        { id: 'l3', text: 'Hindi (Professional)' },
      ],
    },
  ],
}
