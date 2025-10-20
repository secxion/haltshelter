const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Story = require('./models/Story');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Add your new stories here. Each must have a unique title.
function getRandomDateIn2025() {
  // Jan 1, 2025 to Aug 31, 2025
  const start = new Date('2025-01-01T00:00:00Z').getTime();
  const end = new Date('2025-08-31T23:59:59Z').getTime();
  return new Date(start + Math.random() * (end - start));
}

function getRandomDateIn2024() {
  // Jan 1, 2024 to Dec 31, 2024
  const start = new Date('2024-01-01T00:00:00Z').getTime();
  const end = new Date('2024-12-31T23:59:59Z').getTime();
  return new Date(start + Math.random() * (end - start));
}

const newStories = [
  // ...existing code...
  {
    title: "Milo's Leap: The Cat Who Learned to Trust",
    category: "Success Story",
    excerpt: "Milo, a stray tabby, was terrified of people. With patience, he became a lap cat in his forever home.",
    content: `<h2>From Hiss to Purr</h2><p>Milo spent weeks hiding in the shelter. Volunteer Emily visited daily, reading and offering treats. Slowly, Milo emerged, and one day, he climbed into her lap. Emily adopted him, and now Milo is the king of cuddles at home.</p>`,
    featuredImage: {
      url: "/images/stories/milos-leap-the-cat-who-learned-to-trust.png",
      altText: "Tabby cat Milo curled up on a couch",
      caption: "Milo, finally at peace"
    },
    tags: ["cat", "trust", "adoption", "shy-animal"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Penny's Second Chance: The Piglet Who Beat the Odds",
  category: "Recent Rescue",
    excerpt: "Penny, a runt piglet, was found abandoned and near death. With care, she grew strong and found a loving farm home.",
    content: `<h2>Against All Odds</h2><p>Penny was discovered shivering beside a rural road, too weak to stand. HALT volunteers bottle-fed her around the clock. Slowly, Penny gained weight and confidence. She now lives on a sanctuary farm, where she plays in the mud and greets visitors with happy grunts.</p>`,
    featuredImage: {
      url: "/images/stories/pennys-second-chance-the-piglet-who-beat-the-odds.png",
      altText: "Penny the piglet rooting in straw",
      caption: "Penny, healthy and happy at her new home"
    },
    tags: ["pig", "rescue", "farm-animal", "recovery"],
    isFeatured: false,
    isPublished: true
  },
  // Add more stories here, following the same format
  {
    title: "From Numbers to Nurture: Priya's Fundraising Feats",
    category: "Volunteer Spotlight",
    excerpt: "Priya, a former accountant, used her skills to launch creative fundraisers that kept the shelter thriving during tough times.",
    content: `<h2>Crunching Numbers, Changing Lives</h2>
    <p>When donations slowed, Priya stepped up. She organized virtual trivia nights, bake sales, and even a "pet photo contest" that brought the community together. Her attention to detail ensured every dollar was accounted for and put to good use.</p>
    <h2>Building Community</h2>
    <p>Priya's events weren't just about raising money—they built lasting relationships with local businesses and families. Her efforts helped fund medical care, food, and enrichment for the animals, and inspired others to get involved.</p>
    <h2>Legacy of Leadership</h2>
    <p>Now, Priya mentors new volunteers in fundraising and outreach, ensuring HALT's future is bright. Her story proves that every skill, even from a different field, can make a huge impact in animal rescue.</p>`,
    featuredImage: {
      url: "/images/stories/from-numbers-to-nurture-priyas-fundraising-feats.jpg",
      altText: "Priya at a fundraising event with shelter animals",
      caption: "Priya, turning numbers into hope for animals"
    },
    tags: ["volunteer", "fundraising", "community", "leadership"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "The Night Shift: Carlos and the After-Hours Animal Care",
    category: "Volunteer Spotlight",
    excerpt: "Carlos, a night owl, became the shelter's unsung hero by caring for animals after hours and handling emergencies with calm expertise.",
    content: `<h2>Quiet Dedication</h2>
    <p>While most volunteers worked during the day, Carlos took the night shift. He comforted anxious animals, cleaned kennels, and was always ready for late-night emergencies. His calm presence made the shelter a safer, more welcoming place.</p>
    <h2>Going the Extra Mile</h2>
    <p>Carlos once stayed up all night with a sick puppy, ensuring it got the care it needed. His dedication saved lives and gave staff peace of mind, knowing the animals were in good hands.</p>
    <h2>Inspiring Others</h2>
    <p>Carlos's story reminds us that heroes aren't always in the spotlight. His behind-the-scenes work is a vital part of HALT's success, and he encourages others to help however they can—even if it's after dark.</p>`,
    featuredImage: {
      url: "/images/stories/the-night-shift-carlos-and-the-after-hours-animal-care.jpg",
      altText: "Carlos caring for animals in the shelter at night",
      caption: "Carlos, the night shift hero"
    },
    tags: ["volunteer", "night-shift", "animal-care", "emergency"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "A Friend to Felines: Maria's Cat Room Magic",
    category: "Volunteer Spotlight",
    excerpt: "Maria, a dedicated volunteer, transformed the shelter's cat room and helped dozens of shy cats find loving homes.",
    content: `<h2>Transforming the Cat Room</h2>
    <p>When Maria first joined HALT, the cat room was a quiet place where shy cats often hid from visitors. Maria brought in toys, cozy beds, and spent hours each week simply sitting and reading aloud. Slowly, the cats began to trust her—and then, the world.</p>
    <h2>Patience Pays Off</h2>
    <p>Maria's gentle approach helped even the most timid cats blossom. She created "cat social hours" to help them interact and play. Her efforts led to a record number of adoptions, and the cat room is now a favorite stop for visitors and volunteers alike.</p>
    <h2>Inspiring Others</h2>
    <p>Maria now mentors new volunteers, teaching them the value of patience and quiet companionship. Her story is a reminder that small acts of kindness can change lives—both feline and human.</p>`,
    featuredImage: {
      url: "/images/stories/a-friend-to-felines-marias-cat-room-magic.jpg",
      altText: "Maria sitting with cats in a colorful shelter room",
      caption: "Maria, surrounded by her feline friends"
    },
    tags: ["volunteer", "cats", "adoption", "mentorship"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "The Power of Persistence: James and the Dog Training Program",
    category: "Volunteer Spotlight",
    excerpt: "James, a longtime volunteer, started a training program that helped dozens of shelter dogs become adoptable family pets.",
    content: `<h2>Seeing Potential</h2>
    <p>James noticed that many dogs were overlooked due to behavioral issues. He began working with them after hours, using positive reinforcement and patience to teach basic manners and build trust.</p>
    <h2>Building a Program</h2>
    <p>With support from HALT, James launched a formal training program. Volunteers now work with dogs daily, and the shelter has seen a dramatic increase in successful adoptions—especially for dogs once considered "difficult."</p>
    <h2>Leaving a Legacy</h2>
    <p>James's dedication has inspired others to get involved. Many of his "graduates" return to visit, tails wagging, with their new families. His story shows the power of persistence and the difference one person can make.</p>`,
    featuredImage: {
      url: "/images/stories/the-power-of-persistence-james-and-the-dog-training-program.jpg",
      altText: "James training a group of shelter dogs outdoors",
      caption: "James, making a difference one dog at a time"
    },
    tags: ["volunteer", "dog-training", "adoption", "success"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Tiny Paws, Big Heart: The Journey of Hazel the Hamster",
    category: "Success Story",
    excerpt: "Hazel, a tiny hamster left behind in a classroom, found a loving home and became a symbol of resilience for her new family.",
    content: `<h2>Left Behind</h2>
    <p>Hazel was discovered in an empty classroom after the school year ended, her cage nearly out of food and water. A janitor brought her to HALT, where staff quickly nursed her back to health. Despite her small size, Hazel showed a huge appetite for life.</p>
    <h2>Winning Hearts</h2>
    <p>Hazel's playful antics and gentle nature made her a favorite among volunteers. She loved running in her wheel and nibbling sunflower seeds. When the Thompson family visited, their young daughter—who had struggled with shyness—instantly bonded with Hazel.</p>
    <h2>A New Beginning</h2>
    <p>Hazel now lives in a spacious habitat, enjoying daily playtime and cuddles. Her story inspired the Thompson family to volunteer at HALT, helping other small animals find their own happy endings.</p>`,
    featuredImage: {
      url: "/images/stories/tiny-paws-big-heart-the-journey-of-hazel-the-hamster.jpg",
      altText: "Hazel the hamster peeking out of her habitat",
      caption: "Hazel, happy and healthy in her new home"
    },
    tags: ["hamster", "rescue", "family", "small-animal"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Bun-Bun's Garden: The Rabbit Who Taught Us Patience",
    category: "Foster Story",
    excerpt: "Bun-Bun, a shy rabbit rescued from neglect, blossomed in foster care and taught her caregivers the value of patience and love.",
    content: `<h2>Rescue and Recovery</h2>
    <p>Bun-Bun was rescued from a backyard hutch, underweight and fearful of people. At HALT, she received medical care and was placed with an experienced foster family. The first weeks were slow—Bun-Bun hid in her box and refused to eat in front of anyone.</p>
    <h2>Blossoming in Foster Care</h2>
    <p>With gentle encouragement and plenty of fresh greens, Bun-Bun began to emerge from her shell. She discovered a love for digging in her foster family's garden and soon became a regular companion during outdoor playtime.</p>
    <h2>A Lesson in Patience</h2>
    <p>After three months, Bun-Bun was ready for adoption. Her foster family decided to make her a permanent member, grateful for the lessons she taught them about patience, trust, and the quiet joy of caring for animals in need.</p>`,
    featuredImage: {
      url: "/images/stories/bun-buns-garden-the-rabbit-who-taught-us-patience.jpg",
      altText: "Bun-Bun the rabbit exploring a garden",
      caption: "Bun-Bun, enjoying her forever home"
    },
    tags: ["rabbit", "foster", "patience", "adoption"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Hope on Three Legs: The Triumph of Daisy the Tripod Dog",
    category: "Medical Success",
    excerpt: "Daisy, a young border collie, lost a leg after an accident but gained a new life and family through HALT's care.",
    content: `<h2>A Shocking Discovery</h2>
    <p>Daisy was found limping along a rural road, her front leg badly injured. A kind passerby brought her to HALT, where our veterinary team determined her leg could not be saved. The decision to amputate was difficult, but Daisy's spirit never wavered.</p>
    <h2>Learning to Run Again</h2>
    <p>After surgery, Daisy amazed everyone with her resilience. Within days, she was hopping around the recovery room, tail wagging. Volunteers took turns helping her with physical therapy, and soon Daisy was running faster than most four-legged dogs!</p>
    <h2>A New Beginning</h2>
    <p>When the Parker family visited HALT, they were looking for a dog who could inspire their young son, who uses a wheelchair. Daisy and the boy bonded instantly. Now, Daisy is a beloved family member, showing everyone that courage and love matter more than anything else.</p>`,
    featuredImage: {
      url: "/images/stories/hope-on-three-legs-the-triumph-of-daisy-the-tripod-dog.jpg",
      altText: "Daisy the three-legged border collie running in a field",
      caption: "Daisy, unstoppable and joyful"
    },
    tags: ["dog", "amputation", "medical-success", "inspiration"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "From Barn to Best Friend: The Story of Rosie the Rescue Pig",
    category: "Recent Rescue",
    excerpt: "Rosie, a pot-bellied pig, was rescued from neglect and now lives her best life as a therapy animal.",
    content: `<h2>Rescue from Neglect</h2>
    <p>Rosie was discovered living in a cramped, dirty barn with little food or water. HALT's rescue team worked with local authorities to bring her to safety. At first, Rosie was shy and wary, but gentle care and plenty of treats helped her blossom.</p>
    <h2>Finding Her Place</h2>
    <p>Rosie quickly became a favorite at the shelter, charming everyone with her intelligence and affection. She learned to walk on a leash, play with toys, and even paint with her snout!</p>
    <h2>Therapy Pig Extraordinaire</h2>
    <p>Recognizing her gentle nature, HALT partnered with a local school for children with special needs. Rosie now visits weekly, bringing smiles and comfort to dozens of children. Her story is a testament to the power of second chances and the healing bond between animals and people.</p>`,
    featuredImage: {
      url: "/images/stories/from-barn-to-best-friend-the-story-of-rosie-the-rescue-pig.jpg",
      altText: "Rosie the pot-bellied pig with children at a school",
      caption: "Rosie, the therapy pig, at work"
    },
    tags: ["pig", "rescue", "therapy-animal", "school"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Sasha's Sanctuary: The Goose Who Found a Flock",
    category: "Success Story",
    excerpt: "Sasha, a domestic goose abandoned at a city pond, found a new family and purpose at HALT.",
    content: `<h2>From Lonely to Loved</h2><p>Sasha was left behind when her flock migrated. Volunteers rescued her and brought her to HALT, where she quickly became a favorite. Eventually, a local farm with a pond and other geese welcomed Sasha, and she now leads her new flock with confidence.</p>`,
    featuredImage: {
      url: "/images/stories/sashas-sanctuary-the-goose-who-found-a-flock.jpg",
      altText: "Sasha the goose swimming with her new flock",
      caption: "Sasha, happy and home at last"
    },
    tags: ["goose", "rescue", "flock", "farm-animal"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Oliver's Outreach: The Cat Who Comforts Seniors",
    category: "Success Story",
    excerpt: "Oliver, once a stray, now brings joy to residents at a local senior center as a therapy cat.",
    content: `<h2>From Stray to Star</h2><p>Oliver was found injured and alone. After healing at HALT, his gentle nature made him the perfect candidate for a therapy animal. He now visits a senior center weekly, curling up in laps and brightening lives with his purrs and affection.</p>`,
    featuredImage: {
      url: "/images/stories/olivers-outreach-the-cat-who-comforts-seniors.jpg",
      altText: "Oliver the orange tabby cat sitting on a senior's lap",
      caption: "Oliver, the therapy cat, at work"
    },
    tags: ["cat", "therapy", "senior-center", "outreach"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Willow's Wish: The Foster Kitten Who Stayed Forever",
    category: "Foster Story",
    excerpt: "Willow, a tiny gray kitten, was meant to be a short-term foster. She quickly won her foster family's hearts and became a permanent member.",
    content: `<h2>Foster Fail, Forever Home</h2><p>Willow arrived at HALT as a sickly orphan. The Martins agreed to foster her, nursing her back to health. As Willow grew, so did her bond with the family. When adoption day came, the Martins realized they couldn't let her go. Willow now rules the house, a true foster success.</p>`,
    featuredImage: {
      url: "/images/stories/willows-wish-the-foster-kitten-who-stayed-forever.jpg",
      altText: "Willow the gray kitten playing with a toy mouse",
      caption: "Willow, happy in her forever home"
    },
    tags: ["kitten", "foster", "adoption", "family"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Harvey's Healing: The Dog Who Overcame Injury",
    category: "Medical Success",
    excerpt: "Harvey, a young terrier, was found with a broken leg. After surgery and rehab, he found a loving home.",
    content: `<h2>From Hurt to Hope</h2><p>Harvey was rescued after being hit by a car. HALT's medical team performed surgery, and volunteers helped with his rehabilitation. Harvey's resilience inspired everyone. He was adopted by a nurse, and now enjoys long walks and endless affection.</p>`,
    featuredImage: {
      url: "/images/stories/harveys-healing-the-dog-who-overcame-injury.jpg",
      altText: "Harvey the terrier running in a grassy field",
      caption: "Harvey, healthy and full of life"
    },
    tags: ["dog", "medical", "recovery", "adoption"],
    isFeatured: false,
    isPublished: true
  },
  {
    title: "Benny's Big Day: The Senior Dog Finds a Family",
    category: "Success Story",
    excerpt: "Benny, a 10-year-old beagle mix, waited months for a home. His adoption brought joy to a whole neighborhood.",
    content: `<h2>Patience Rewarded</h2><p>Benny arrived at HALT after his elderly owner passed away. Despite his sweet nature, many overlooked him for younger dogs. But the Johnson family saw Benny's gentle soul. They adopted him, and now Benny enjoys daily walks, warm beds, and visits to the local park, where he's become a favorite among children and neighbors alike.</p>`,
    featuredImage: {
      url: "/images/stories/bennys-big-day-the-senior-dog-finds-a-family.jpg",
      altText: "Benny the beagle mix wagging his tail in a backyard",
      caption: "Benny, loving his new life with the Johnsons"
    },
    tags: ["dog", "adoption", "senior-animal", "family"],
    isFeatured: false,
    isPublished: true
  },
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function addStories() {
  await connectDB();
  let added = 0;
  let updated = 0;
  for (const storyData of newStories) {
    storyData.slug = generateSlug(storyData.title);
    // Assign a random createdAt and publishedAt date
    let randomDate;
    // Pick 3 specific stories to be in 2024
    if ([
      "Milo's Leap: The Cat Who Learned to Trust",
      "Hope on Three Legs: The Triumph of Daisy the Tripod Dog",
      "Benny's Big Day: The Senior Dog Finds a Family"
    ].includes(storyData.title)) {
      randomDate = getRandomDateIn2024();
    } else {
      randomDate = getRandomDateIn2025();
    }
    storyData.createdAt = randomDate;
    storyData.publishedAt = randomDate;
    const exists = await Story.findOne({ slug: storyData.slug });
    if (exists) {
      // Update selected fields if story exists, including createdAt and publishedAt
      const updateFields = {
        featuredImage: storyData.featuredImage,
        excerpt: storyData.excerpt,
        content: storyData.content,
        tags: storyData.tags,
        isFeatured: storyData.isFeatured,
        isPublished: storyData.isPublished,
        createdAt: storyData.createdAt,
        publishedAt: storyData.publishedAt
      };
      await Story.updateOne({ slug: storyData.slug }, { $set: updateFields });
      console.log(`✏️  Updated existing: ${storyData.title}`);
      updated++;
      continue;
    }
  const story = new Story(storyData);
  await story.save();
  console.log(`✅ Added: ${storyData.title}`);
  added++;
  }
  console.log(`🎉 Added ${added} new stories.`);
  console.log(`📝 Updated ${updated} existing stories.`);
  process.exit(0);
}

addStories();
