import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { skills, technologies } from '../../db/schema/skills.schema';
import { v4 as uuidv4 } from 'uuid';

// Database connection (adjust these values based on your setup)
const connectionString = process.env.DATABASE_URL || 'postgresql://sorin:root@localhost:5432/profiler_hr';
const client = postgres(connectionString);
const db = drizzle(client);

const skillsData = [
  // Programming Languages
  { id: uuidv4(), name: 'JavaScript', category: 'Programming Language', description: 'Dynamic programming language for web development' },
  { id: uuidv4(), name: 'TypeScript', category: 'Programming Language', description: 'Typed superset of JavaScript' },
  { id: uuidv4(), name: 'Python', category: 'Programming Language', description: 'High-level programming language' },
  { id: uuidv4(), name: 'Java', category: 'Programming Language', description: 'Object-oriented programming language' },
  { id: uuidv4(), name: 'C#', category: 'Programming Language', description: 'Object-oriented programming language by Microsoft' },
  { id: uuidv4(), name: 'Go', category: 'Programming Language', description: 'Statically typed programming language by Google' },
  { id: uuidv4(), name: 'Rust', category: 'Programming Language', description: 'Systems programming language' },
  { id: uuidv4(), name: 'PHP', category: 'Programming Language', description: 'Server-side scripting language' },
  { id: uuidv4(), name: 'Ruby', category: 'Programming Language', description: 'Dynamic, object-oriented programming language' },
  { id: uuidv4(), name: 'Swift', category: 'Programming Language', description: 'Programming language for iOS development' },
  
  // Web Development
  { id: uuidv4(), name: 'HTML', category: 'Web Development', description: 'Markup language for web pages' },
  { id: uuidv4(), name: 'CSS', category: 'Web Development', description: 'Styling language for web pages' },
  { id: uuidv4(), name: 'React', category: 'Web Development', description: 'JavaScript library for building user interfaces' },
  { id: uuidv4(), name: 'Vue.js', category: 'Web Development', description: 'Progressive JavaScript framework' },
  { id: uuidv4(), name: 'Angular', category: 'Web Development', description: 'TypeScript-based web application framework' },
  { id: uuidv4(), name: 'Node.js', category: 'Web Development', description: 'JavaScript runtime for server-side development' },
  { id: uuidv4(), name: 'Express.js', category: 'Web Development', description: 'Web framework for Node.js' },
  { id: uuidv4(), name: 'Next.js', category: 'Web Development', description: 'React framework for production' },
  { id: uuidv4(), name: 'Nuxt.js', category: 'Web Development', description: 'Vue.js framework for production' },
  
  // Database
  { id: uuidv4(), name: 'SQL', category: 'Database', description: 'Structured Query Language' },
  { id: uuidv4(), name: 'PostgreSQL', category: 'Database', description: 'Open source relational database' },
  { id: uuidv4(), name: 'MySQL', category: 'Database', description: 'Popular relational database' },
  { id: uuidv4(), name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
  { id: uuidv4(), name: 'Redis', category: 'Database', description: 'In-memory data structure store' },
  { id: uuidv4(), name: 'SQLite', category: 'Database', description: 'Lightweight relational database' },
  
  // DevOps & Cloud
  { id: uuidv4(), name: 'Docker', category: 'DevOps', description: 'Containerization platform' },
  { id: uuidv4(), name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration platform' },
  { id: uuidv4(), name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform' },
  { id: uuidv4(), name: 'Azure', category: 'Cloud', description: 'Microsoft cloud platform' },
  { id: uuidv4(), name: 'Google Cloud', category: 'Cloud', description: 'Google cloud platform' },
  { id: uuidv4(), name: 'Terraform', category: 'DevOps', description: 'Infrastructure as code tool' },
  { id: uuidv4(), name: 'Jenkins', category: 'DevOps', description: 'Continuous integration tool' },
  { id: uuidv4(), name: 'Git', category: 'DevOps', description: 'Version control system' },
  
  // Mobile Development
  { id: uuidv4(), name: 'React Native', category: 'Mobile Development', description: 'Framework for building mobile apps' },
  { id: uuidv4(), name: 'Flutter', category: 'Mobile Development', description: 'UI toolkit for mobile development' },
  { id: uuidv4(), name: 'iOS Development', category: 'Mobile Development', description: 'Native iOS app development' },
  { id: uuidv4(), name: 'Android Development', category: 'Mobile Development', description: 'Native Android app development' },
  
  // Testing
  { id: uuidv4(), name: 'Jest', category: 'Testing', description: 'JavaScript testing framework' },
  { id: uuidv4(), name: 'Cypress', category: 'Testing', description: 'End-to-end testing framework' },
  { id: uuidv4(), name: 'Selenium', category: 'Testing', description: 'Web application testing framework' },
  { id: uuidv4(), name: 'Unit Testing', category: 'Testing', description: 'Software testing methodology' },
  
  // Soft Skills
  { id: uuidv4(), name: 'Project Management', category: 'Soft Skills', description: 'Planning and managing projects' },
  { id: uuidv4(), name: 'Team Leadership', category: 'Soft Skills', description: 'Leading and managing teams' },
  { id: uuidv4(), name: 'Communication', category: 'Soft Skills', description: 'Effective communication skills' },
  { id: uuidv4(), name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical and critical thinking' },
  { id: uuidv4(), name: 'Agile Methodology', category: 'Soft Skills', description: 'Agile project management approach' },
];

const technologiesData = [
  // Frontend Frameworks & Libraries
  { id: uuidv4(), name: 'React', category: 'Frontend Framework', description: 'JavaScript library for building user interfaces', version: '18.x' },
  { id: uuidv4(), name: 'Vue.js', category: 'Frontend Framework', description: 'Progressive JavaScript framework', version: '3.x' },
  { id: uuidv4(), name: 'Angular', category: 'Frontend Framework', description: 'TypeScript-based web application framework', version: '17.x' },
  { id: uuidv4(), name: 'Svelte', category: 'Frontend Framework', description: 'Compile-time optimized framework', version: '4.x' },
  { id: uuidv4(), name: 'jQuery', category: 'Frontend Library', description: 'JavaScript library for DOM manipulation', version: '3.x' },
  
  // Backend Frameworks
  { id: uuidv4(), name: 'Express.js', category: 'Backend Framework', description: 'Web framework for Node.js', version: '4.x' },
  { id: uuidv4(), name: 'NestJS', category: 'Backend Framework', description: 'Node.js framework for scalable applications', version: '10.x' },
  { id: uuidv4(), name: 'Django', category: 'Backend Framework', description: 'Python web framework', version: '4.x' },
  { id: uuidv4(), name: 'Flask', category: 'Backend Framework', description: 'Lightweight Python web framework', version: '2.x' },
  { id: uuidv4(), name: 'Spring Boot', category: 'Backend Framework', description: 'Java framework for microservices', version: '3.x' },
  { id: uuidv4(), name: 'ASP.NET Core', category: 'Backend Framework', description: 'Microsoft web framework', version: '8.x' },
  
  // Databases
  { id: uuidv4(), name: 'PostgreSQL', category: 'Database', description: 'Open source relational database', version: '15.x' },
  { id: uuidv4(), name: 'MySQL', category: 'Database', description: 'Popular relational database', version: '8.x' },
  { id: uuidv4(), name: 'MongoDB', category: 'Database', description: 'NoSQL document database', version: '7.x' },
  { id: uuidv4(), name: 'Redis', category: 'Database', description: 'In-memory data structure store', version: '7.x' },
  { id: uuidv4(), name: 'Elasticsearch', category: 'Database', description: 'Search and analytics engine', version: '8.x' },
  
  // Cloud Platforms
  { id: uuidv4(), name: 'AWS EC2', category: 'Cloud Platform', description: 'Amazon Elastic Compute Cloud', version: null },
  { id: uuidv4(), name: 'AWS Lambda', category: 'Cloud Platform', description: 'Amazon serverless computing', version: null },
  { id: uuidv4(), name: 'AWS RDS', category: 'Cloud Platform', description: 'Amazon Relational Database Service', version: null },
  { id: uuidv4(), name: 'Azure App Service', category: 'Cloud Platform', description: 'Microsoft web app hosting', version: null },
  { id: uuidv4(), name: 'Google Cloud Functions', category: 'Cloud Platform', description: 'Google serverless computing', version: null },
  
  // DevOps Tools
  { id: uuidv4(), name: 'Docker', category: 'DevOps Tool', description: 'Containerization platform', version: '24.x' },
  { id: uuidv4(), name: 'Kubernetes', category: 'DevOps Tool', description: 'Container orchestration platform', version: '1.28' },
  { id: uuidv4(), name: 'Jenkins', category: 'DevOps Tool', description: 'Continuous integration tool', version: '2.x' },
  { id: uuidv4(), name: 'GitLab CI', category: 'DevOps Tool', description: 'Continuous integration platform', version: null },
  { id: uuidv4(), name: 'GitHub Actions', category: 'DevOps Tool', description: 'GitHub automation platform', version: null },
  { id: uuidv4(), name: 'Terraform', category: 'DevOps Tool', description: 'Infrastructure as code tool', version: '1.6' },
  
  // Testing Tools
  { id: uuidv4(), name: 'Jest', category: 'Testing Tool', description: 'JavaScript testing framework', version: '29.x' },
  { id: uuidv4(), name: 'Cypress', category: 'Testing Tool', description: 'End-to-end testing framework', version: '13.x' },
  { id: uuidv4(), name: 'Playwright', category: 'Testing Tool', description: 'Web testing and automation', version: '1.x' },
  { id: uuidv4(), name: 'Selenium', category: 'Testing Tool', description: 'Web application testing framework', version: '4.x' },
  
  // Development Tools
  { id: uuidv4(), name: 'Visual Studio Code', category: 'Development Tool', description: 'Code editor by Microsoft', version: '1.x' },
  { id: uuidv4(), name: 'IntelliJ IDEA', category: 'Development Tool', description: 'IDE by JetBrains', version: '2023.x' },
  { id: uuidv4(), name: 'Postman', category: 'Development Tool', description: 'API development platform', version: '10.x' },
  { id: uuidv4(), name: 'Figma', category: 'Development Tool', description: 'Design and prototyping tool', version: null },
];

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed lookup tables...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(skills);
    await db.delete(technologies);
    
    // Insert skills
    console.log('📚 Inserting skills...');
    await db.insert(skills).values(skillsData);
    console.log(`✅ Inserted ${skillsData.length} skills`);
    
    // Insert technologies
    console.log('🔧 Inserting technologies...');
    await db.insert(technologies).values(technologiesData);
    console.log(`✅ Inserted ${technologiesData.length} technologies`);
    
    console.log('🎉 Seed data inserted successfully!');
    
    // Display some sample IDs that can be used for testing
    console.log('\n📋 Sample IDs for testing:');
    console.log('Skills:');
    skillsData.slice(0, 5).forEach(skill => {
      console.log(`  - ${skill.name}: ${skill.id}`);
    });
    
    console.log('\nTechnologies:');
    technologiesData.slice(0, 5).forEach(tech => {
      console.log(`  - ${tech.name}: ${tech.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
};

// Run the seed function
seedData(); 