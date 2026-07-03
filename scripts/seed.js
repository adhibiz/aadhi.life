import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

try {
  const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

const db = getFirestore();

const seedData = async () => {
  console.log("Starting Firebase Seed...");

  try {
    // 1. Profile Meta
    console.log("Seeding site_meta/profile...");
    await db.collection('site_meta').doc('profile').set({
      name: "Aadhi",
      nickname: "adhi.x",
      tagline: "Learning. Building. Sharing.",
      bio: "Self-taught builder from Tenkasi. 7 years of YouTube, audiobooks, and making things work.",
      email: "adhi2003@hotmail.com",
      phone: "",
      location_current: "Chennai, TN",
      location_home: "Tenkasi, TN",
      github: "https://github.com/adhibiz",
      linkedin: "https://linkedin.com/in/adhibiz",
      instagram: "https://instagram.com/me_adhi.x",
      available_for: ["Internships", "Freelance projects", "Workshop facilitation", "Collaborations", "Speaking / Guest sessions"],
      open_to_work: true,
      profile_image_url: "",
      profile_image_public_id: "",
      resume_url: "",
      resume_public_id: ""
    });

    // 2. Projects
    console.log("Seeding projects...");
    const projects = [
      {
        title: "Campus Digital Twin",
        status: "completed",
        short_desc: "A 3D model of Saveetha campus in Unreal Engine 5.",
        full_desc: "Built an interactive, fully navigable digital twin of the Saveetha Engineering College campus using Unreal Engine 5 for the Smart India Hackathon.",
        tech_tags: ["Unreal Engine 5", "Blueprints", "3D Modeling"],
        cover_image_url: "",
        cover_image_public_id: "",
        github_url: "",
        demo_url: "",
        team: "Solo",
        duration: "3 months",
        featured: true,
        order: 1,
        created_at: FieldValue.serverTimestamp()
      },
      {
        title: "Lost Lab VR",
        status: "in-progress",
        short_desc: "A VR escape room experience built for Meta Quest.",
        full_desc: "Developing a highly immersive VR escape room featuring complex interactive puzzles and physical interactions.",
        tech_tags: ["Unreal Engine 5", "VR", "Meta Quest", "C++"],
        cover_image_url: "",
        cover_image_public_id: "",
        github_url: "",
        demo_url: "",
        team: "Solo",
        duration: "Ongoing",
        featured: true,
        order: 2,
        created_at: FieldValue.serverTimestamp()
      },
      {
        title: "Smart QR Canteen",
        status: "completed",
        short_desc: "A QR-based ordering system for the college canteen.",
        full_desc: "Built a web-based QR scanning system to handle queue management and order processing at the campus canteen.",
        tech_tags: ["React", "Firebase", "Tailwind CSS"],
        cover_image_url: "",
        cover_image_public_id: "",
        github_url: "",
        demo_url: "",
        team: "Team of 3",
        duration: "2 months",
        featured: false,
        order: 3,
        created_at: FieldValue.serverTimestamp()
      },
      {
        title: "UE5 Workshop Series",
        status: "completed",
        short_desc: "Hands-on Unreal Engine 5 workshop for 20+ students.",
        full_desc: "Designed and facilitated a complete introductory workshop series teaching UE5 basics, lighting, and simple Blueprints.",
        tech_tags: ["UE5", "Teaching", "Public Speaking"],
        cover_image_url: "",
        cover_image_public_id: "",
        github_url: "",
        demo_url: "",
        team: "Solo",
        duration: "2 weeks",
        featured: false,
        order: 4,
        created_at: FieldValue.serverTimestamp()
      }
    ];

    for (const project of projects) {
      await db.collection('projects').add(project);
    }

    // 3. Blog Posts
    console.log("Seeding blog posts...");
    const blogPosts = [
      {
        title: "Why I left school at 8th standard and never looked back",
        slug: "why-i-left-school",
        excerpt: "Traditional education wasn't for me. I wanted to build.",
        body: "I left school after the 8th standard because I felt traditional education wasn't teaching me how things actually worked. I wanted to build, take things apart, and understand the systems behind them.",
        category: "Personal",
        published: true,
        cover_image_url: "",
        cover_image_public_id: "",
        reading_time: 5,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      },
      {
        title: "How I learned Unreal Engine 5 without a teacher",
        slug: "learning-ue5",
        excerpt: "YouTube, documentation, and a lot of crashing.",
        body: "My real education started on YouTube. When my father bought me my first laptop in 2018, everything changed. I went deep into hardware, programming, and eventually earned a Diploma in Computer Engineering.",
        category: "Tech",
        published: true,
        cover_image_url: "",
        cover_image_public_id: "",
        reading_time: 7,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      },
      {
        title: "What running a workshop for 20 students taught me about communication",
        slug: "workshop-communication",
        excerpt: "Teaching is the best way to learn.",
        body: "I've overcome my stage fear, become Joint Secretary of a dev community, and realized that teaching others is absolutely the best way to solidify your own knowledge.",
        category: "Leadership",
        published: true,
        cover_image_url: "",
        cover_image_public_id: "",
        reading_time: 4,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      }
    ];

    for (const post of blogPosts) {
      await db.collection('blog_posts').add(post);
    }

    // 4. Skills
    console.log("Seeding skills...");
    const skills = [
      { category: "Game Development", items: ["Unreal Engine 5", "Blueprint Visual Scripting", "VR Development (Meta Quest)", "Level Design", "Game Packaging"], is_learning: false, order: 1 },
      { category: "Networking and Systems", items: ["Cisco CCNA (certified)", "OS Installation", "Android ROM Flashing", "System Troubleshooting", "Windows/Linux"], is_learning: false, order: 2 },
      { category: "Programming and Web", items: ["HTML/CSS", "JavaScript (basic)", "Python (basic)", "Git/GitHub"], is_learning: false, order: 3 },
      { category: "AI and Tools", items: ["ChatGPT", "Claude AI", "Midjourney (learning)", "Prompt Engineering"], is_learning: false, order: 4 },
      { category: "Content and Design", items: ["Instagram Reels", "Video Editing", "Canva", "Content Strategy"], is_learning: false, order: 5 },
      { category: "Leadership and Soft Skills", items: ["Event Organization", "Public Speaking", "Student Mentoring", "Community Building", "Self-Learning"], is_learning: false, order: 6 },
      { category: "Currently Learning", items: ["Communication Skills", "Content Creation Strategy", "Startup Fundamentals"], is_learning: true, order: 7 }
    ];

    for (const skill of skills) {
      await db.collection('skills').add(skill);
    }

    // 5. Timeline
    console.log("Seeding timeline...");
    const timeline = [
      { year: "2013", title: "Left school after 8th standard", description: "Chose a different path. Enrolled in ITI.", order: 1 },
      { year: "2015", title: "Discovered YouTube self-learning", description: "A senior showed me YouTube. That changed everything.", order: 2 },
      { year: "2016", title: "Father's laptop — started building", description: "Taught myself OS installation, Android ROMs, system troubleshooting.", order: 3 },
      { year: "2018", title: "Diploma in Computer Engineering", description: "Only student in the batch for 3 years. Pure self-learning.", order: 4 },
      { year: "2021", title: "B.Tech at Saveetha, Chennai", description: "Lateral entry. Left Tenkasi with big dreams and no connections.", order: 5 },
      { year: "2022", title: "Broke stage fear, built network", description: "Joined Game and App Dev Community. Found my people.", order: 6 },
      { year: "2023", title: "Became Joint Secretary", description: "Started leading workshops. Teaching is how I learn best.", order: 7 },
      { year: "2024", title: "Campus Digital Twin in UE5", description: "Built a 3D model of Saveetha campus in Unreal Engine 5.", order: 8 },
      { year: "2025", title: "Final year — building toward a company", description: "Communication, content, direction. Finding the way.", order: 9 }
    ];

    for (const entry of timeline) {
      await db.collection('timeline').add(entry);
    }

    // 6. Now Page
    console.log("Seeding now_page...");
    await db.collection('now_page').doc('current').set({
      currently: "Final year B.Tech IT at Saveetha Engineering College, Chennai.",
      building: ["Campus Digital Twin (Unreal Engine 5)", "Lost Lab — VR escape room"],
      learning: ["Communication skills and public speaking", "Content creation strategy for documenting my journey"],
      listening_to: "Audiobooks focused on business, startup fundamentals, and mindset development.",
      goal: "Build toward founding a tech company. Find my direction and the right problems to solve.",
      last_updated: FieldValue.serverTimestamp()
    });

    // 7. Guestbook
    console.log("Seeding guestbook...");
    const guestbookEntries = [
      { name: "Marcus K.", message: "Love the UE5 projects, Aadhi. Keep building!", approved: true, created_at: FieldValue.serverTimestamp() },
      { name: "Sarah", message: "Your journey from Tenkasi is super inspiring.", approved: true, created_at: FieldValue.serverTimestamp() }
    ];

    for (const entry of guestbookEntries) {
      await db.collection('guestbook').add(entry);
    }

    console.log("\nDatabase seed completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
};

seedData();
