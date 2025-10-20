const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Import models
const Story = require('./models/Story');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for story seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Sample stories data
const sampleStories = [
  {
    title: "Bella's Second Chance: A Tale of Hope and Healing",
    category: "Success Story",
    excerpt: "When Bella arrived at HALT Shelter, she was broken in body and spirit. Today, she's living her best life with a family who adores her.",
    content: `<h2>A Heartbreaking Arrival</h2>
    <p>Bella came to us on a cold November morning, brought in by a Good Samaritan who found her wandering the streets. The 3-year-old Golden Retriever mix was severely underweight, her golden coat matted and dull, and she carried herself with the weariness of an animal who had given up hope.</p>
    
    <h2>The Road to Recovery</h2>
    <p>Our veterinary team immediately got to work. Bella was suffering from malnutrition, several untreated wounds, and what appeared to be a broken spirit. But beneath that sad exterior, our staff could see glimpses of the loving dog she was meant to be.</p>
    
    <p>For weeks, Bella barely lifted her head when volunteers approached. She would eat her food mechanically and retreat to the back of her kennel. Our behavior specialist, Sarah, spent hours just sitting quietly near Bella's kennel, reading books aloud and occasionally offering treats.</p>
    
    <h2>The Breakthrough</h2>
    <p>The turning point came on a sunny Tuesday afternoon. Sarah was reading near Bella's kennel when she heard a soft whimper. Looking up, she saw Bella pressed against the front of her kennel, tail giving the slightest wag. It was the first sign of the beautiful soul that had been hiding inside.</p>
    
    <h2>Finding Forever</h2>
    <p>As Bella's confidence grew, so did interest from potential adopters. The Henderson family fell in love with her gentle nature and patient demeanor. They had two young children and were looking for a dog who could be both a companion and a teacher about kindness.</p>
    
    <p>The adoption day was magical. Bella seemed to know she was going home – her tail wouldn't stop wagging as she walked to the car with her new family.</p>
    
    <h2>Bella Today</h2>
    <p>Six months later, we received the most wonderful update. Bella has gained 15 pounds of healthy weight, her coat is lustrous and golden again, and she's become the neighborhood's unofficial greeter, welcoming everyone with her gentle demeanor and ever-wagging tail.</p>
    
    <p>The Hendersons report that Bella has taught their children about compassion and second chances. "She's not just our pet," Mrs. Henderson wrote, "she's a reminder that love can heal anything."</p>`,
    featuredImage: {
      url: "/images/stories/bella-second-chance.jpg",
      altText: "Beautiful golden retriever Bella sitting happily in a sunny garden with her new family",
      caption: "Bella in her new home, transformed by love and care"
    },
    tags: ["rescue", "golden-retriever", "recovery", "family-dog", "heartwarming"],
    isFeatured: true,
    isPublished: true
  },

  {
    title: "Emergency Kitten Rescue During the Storm",
    category: "Recent Rescue",
    excerpt: "When Hurricane winds threatened a litter of newborn kittens, our emergency response team sprang into action in the middle of the night.",
    content: `<h2>A Call in the Storm</h2>
    <p>At 2:47 AM, during one of the worst storms our city had seen in years, our emergency hotline rang. A frantic voice reported hearing the cries of what sounded like newborn kittens coming from beneath a collapsed shed in their backyard.</p>
    
    <h2>Racing Against Time</h2>
    <p>Our emergency response coordinator, Mike, immediately assembled a rescue team. Despite the dangerous conditions – 60 mph winds and flooding roads – the team knew that newborn kittens wouldn't survive much longer in the cold and wet conditions.</p>
    
    <p>Armed with flashlights, blankets, and portable heaters, the team carefully made their way to the scene. The homeowner led them to where they could hear the faint mewing coming from beneath several feet of debris.</p>
    
    <h2>The Delicate Rescue</h2>
    <p>Working by flashlight in the pouring rain, the team carefully moved piece after piece of debris. After an hour of painstaking work, they found them – a mother cat with five tiny kittens, all soaked and shivering but alive.</p>
    
    <p>The mother cat, later named Storm, was protective but seemed to understand that these humans were there to help. She allowed the team to gently place her and her babies in a warm carrier.</p>
    
    <h2>Safe at the Shelter</h2>
    <p>Back at HALT Shelter, our overnight veterinary team was waiting. Storm and her kittens were immediately placed in a warm, quiet nursery room. The kittens – weighing less than 4 ounces each – were estimated to be only 3-4 days old.</p>
    
    <h2>A Mother's Love</h2>
    <p>Storm proved to be an excellent mother. Despite her own ordeal, she was completely devoted to her babies: Thunder, Lightning, Rain, Gust, and little Drizzle. Under her care and with round-the-clock support from our staff, all five kittens thrived.</p>
    
    <h2>Happy Endings</h2>
    <p>Eight weeks later, Storm and her kittens were ready for adoption. The family who originally called for help asked to adopt Storm, saying she had shown them what true courage looked like. The five kittens found wonderful homes with families who had been following their story on social media.</p>
    
    <p>This rescue reminded us why we do what we do – because every life matters, no matter how small or how dangerous the conditions we face to save them.</p>`,
    featuredImage: {
      url: "/images/stories/emergency-kitten-rescue.jpg",
      altText: "Mother cat Storm with her five rescued kittens in a warm shelter nursery",
      caption: "Storm and her five babies safe and warm at HALT Shelter"
    },
    tags: ["emergency-rescue", "kittens", "mother-cat", "storm-rescue", "hero-story"],
    isFeatured: true,
    isPublished: true
  },

  {
    title: "Max's Medical Miracle: Overcoming the Odds",
    category: "Medical Success",
    excerpt: "When Max arrived with a severe spinal injury, veterinarians weren't sure he'd ever walk again. Today, he's proof that miracles happen every day.",
    content: `<h2>A Critical Arrival</h2>
    <p>Max, a 2-year-old German Shepherd mix, was brought to us after being hit by a car. The damage was severe – a compressed spinal cord that left his hind legs paralyzed. Our veterinary team, led by Dr. Sarah Chen, was honest about the prognosis: the chances of Max walking again were less than 30%.</p>
    
    <h2>Choosing Hope</h2>
    <p>Many shelters might have made the difficult decision to end Max's suffering, but our team saw something special in his eyes – a determination that matched their own. Dr. Chen consulted with veterinary neurologists and developed an aggressive treatment plan.</p>
    
    <h2>The Treatment Journey</h2>
    <p>Max's recovery plan included:</p>
    <ul>
      <li>Anti-inflammatory medications to reduce spinal swelling</li>
      <li>Daily physical therapy sessions</li>
      <li>Hydrotherapy in our specialized therapy pool</li>
      <li>Acupuncture treatments twice weekly</li>
      <li>Most importantly, lots of love and encouragement</li>
    </ul>
    
    <h2>Small Signs of Progress</h2>
    <p>For weeks, there was no improvement. Max remained cheerful and loving, learning to navigate his world with just his front legs. Our physical therapist, Jamie, worked with him daily, moving his hind legs through range-of-motion exercises.</p>
    
    <p>Then, six weeks after his arrival, something amazing happened. During a therapy session, Jamie noticed the slightest twitch in Max's left hind leg. It was barely perceptible, but it was there.</p>
    
    <h2>The Breakthrough</h2>
    <p>From that first twitch, Max's progress was remarkable. Within days, he was feeling sensation in both legs. A week later, he took his first wobbly steps. The entire shelter staff gathered to cheer as Max walked the length of the hallway, his tail wagging so hard his whole body wiggled.</p>
    
    <h2>Max Today</h2>
    <p>Three months after his accident, Max was not only walking but running, jumping, and playing like any healthy dog. His adopter, retired physical therapist Robert Williams, says Max has become his inspiration.</p>
    
    <p>"Max teaches me something new about resilience every day," Robert shares. "He never gave up, and he's taught me to approach my own challenges with the same determination."</p>
    
    <p>Max's story reminds us that with advanced medical care, dedication, and love, even the most challenging cases can have beautiful outcomes.</p>`,
    featuredImage: {
      url: "/images/stories/max-medical-miracle.jpg",
      altText: "German Shepherd mix Max running happily in a park after his recovery",
      caption: "Max running free – a true medical miracle"
    },
    tags: ["medical-miracle", "spinal-injury", "physical-therapy", "german-shepherd", "never-give-up"],
    isFeatured: false,
    isPublished: true
  },

  {
    title: "Luna's Journey Home: A Foster Success Story",
    category: "Foster Story",
    excerpt: "Pregnant and scared, Luna needed more than shelter walls could provide. Thanks to our foster program, she and her puppies got the perfect start.",
    content: `<h2>A Scared Mother-to-Be</h2>
    <p>Luna, a young Labrador mix, came to us heavily pregnant and terrified of humans. She had been living on the streets for weeks, scrounging for food and seeking shelter wherever she could find it. The shelter environment, while safe, was too stressful for an expectant mother.</p>
    
    <h2>Enter Our Foster Heroes</h2>
    <p>The Martinez family had been foster volunteers with HALT for three years. When we called about Luna, they didn't hesitate. "We knew she needed a quiet, calm place to have her babies," says Maria Martinez. "Our guest room had been converted into a perfect nursery for situations just like this."</p>
    
    <h2>A Safe Haven</h2>
    <p>In the Martinez home, Luna slowly began to relax. Away from the noise and activity of the shelter, her true personality emerged. She was gentle, intelligent, and despite her rough start, still trusted that good people existed.</p>
    
    <h2>The Big Day</h2>
    <p>Two weeks after arriving at her foster home, Luna gave birth to six healthy puppies. The Martinez family watched in amazement as Luna's maternal instincts took over. She was devoted, protective, and incredibly loving to her babies: Estrella, Cielo, Amor, Esperanza, Corazón, and little Milagro.</p>
    
    <h2>Learning to Love Again</h2>
    <p>As the weeks passed, Luna's transformation was remarkable. With the patient love of the Martinez family, she learned that humans could be trusted. She became playful, affectionate, and even protective of the family's two young daughters.</p>
    
    <h2>The Hardest Decision</h2>
    <p>When the puppies were eight weeks old and ready for adoption, the Martinez family faced an impossible choice. They had fallen deeply in love with Luna. "We told ourselves we were just fostering," laughs Carlos Martinez, "but Luna had become part of our family."</p>
    
    <h2>A Perfect Ending</h2>
    <p>The Martinez family decided to adopt Luna permanently – what we call a "foster fail" (the best kind of failure!). All six puppies found wonderful homes, many with families who had followed their story on social media.</p>
    
    <p>Luna now serves as a "demo dog" for the Martinez family's continued fostering efforts. She helps scared and traumatized dogs learn that homes can be safe, loving places.</p>
    
    <p>"Luna taught us that sometimes animals don't just need shelter," Maria reflects. "They need to feel like they belong somewhere. Foster families provide that bridge between rescue and forever home."</p>`,
    featuredImage: {
      url: "/images/stories/luna-journey-home.jpg",
      altText: "Luna the Labrador mix lying contentedly with her six puppies in a cozy home setting",
      caption: "Luna with her six babies in their loving foster home"
    },
    tags: ["foster-success", "pregnant-dog", "labrador-mix", "foster-fail", "family-story"],
    isFeatured: false,
    isPublished: true
  },

  {
    title: "Volunteer Spotlight: Sarah's Five Years of Dedication",
    category: "Volunteer Spotlight",
    excerpt: "Meet Sarah Chen, a volunteer whose dedication has touched hundreds of animals and inspired countless others to join our mission.",
    content: `<h2>How It All Started</h2>
    <p>Five years ago, Sarah Chen was going through a difficult time in her life. Recently divorced and struggling with depression, she was looking for something meaningful to fill her weekends. A friend suggested volunteering at HALT Shelter.</p>
    
    <p>"I honestly thought I'd help for a few weeks and move on," Sarah admits. "I had no idea how much these animals would change my life."</p>
    
    <h2>Finding Her Calling</h2>
    <p>Sarah started with basic tasks – cleaning kennels, feeding animals, and helping with laundry. But the staff quickly noticed her natural ability with fearful and traumatized animals. She had a patient, gentle approach that seemed to calm even the most anxious dogs.</p>
    
    <p>Within six months, Sarah was leading our behavioral rehabilitation program for dogs with special needs.</p>
    
    <h2>The Numbers Tell a Story</h2>
    <p>In her five years with HALT, Sarah has:</p>
    <ul>
      <li>Volunteered over 1,200 hours</li>
      <li>Worked directly with more than 300 animals</li>
      <li>Helped 47 "difficult to adopt" dogs find homes</li>
      <li>Trained 23 new volunteers in animal behavior</li>
      <li>Led 15 community education workshops</li>
    </ul>
    
    <h2>Her Special Touch</h2>
    <p>Sarah's specialty is working with animals who have behavioral challenges. Dogs who are fearful, reactive, or have been returned to the shelter multiple times find healing in her patient approach.</p>
    
    <p>"I think my own struggles with anxiety help me understand what these animals are feeling," she explains. "They're not 'bad' dogs – they're just scared and need someone to believe in them."</p>
    
    <h2>Beyond the Shelter</h2>
    <p>Sarah's impact extends far beyond our walls. She's become a community educator, speaking at schools about responsible pet ownership and the importance of spaying and neutering. She's also mentored dozens of new volunteers, many of whom credit her with helping them find their own passion for animal welfare.</p>
    
    <h2>The Ripple Effect</h2>
    <p>Perhaps Sarah's greatest achievement is the ripple effect of her work. Families who adopted dogs she helped rehabilitate often become donors or volunteers themselves. The dogs she's helped have gone on to become therapy animals, family companions, and even service dogs.</p>
    
    <h2>Looking Forward</h2>
    <p>When asked about her plans for the future, Sarah smiles. "As long as HALT will have me, I'll be here. These animals saved me first – now it's my turn to save them."</p>
    
    <p>Sarah's story reminds us that volunteering isn't just about what we give – it's about what we receive in return. The healing goes both ways, and the impact lasts a lifetime.</p>`,
    featuredImage: {
      url: "/images/stories/volunteer-sarah-spotlight.jpg",
      altText: "Sarah Chen kneeling in a kennel, gently petting a shy rescue dog",
      caption: "Sarah working her magic with a fearful rescue dog"
    },
    tags: ["volunteer-spotlight", "behavior-training", "community-impact", "dedication", "inspiration"],
    isFeatured: false,
    isPublished: true
  },

  {
    title: "Highway Heroes: The Great Interstate Rescue",
    category: "News",
    excerpt: "When a transport truck accident scattered 25 dogs across Interstate 95, our emergency team coordinated the largest rescue operation in our history.",
    content: `<h2>The Call That Changed Everything</h2>
    <p>At 6:23 AM on a foggy Tuesday morning, our emergency coordinator received a call that would mobilize every resource HALT Shelter had. A transport truck carrying 25 rescue dogs from a high-kill shelter in the South had overturned on Interstate 95, and the dogs had scattered across the highway and into the surrounding woods.</p>
    
    <h2>Immediate Response</h2>
    <p>Within 30 minutes, HALT had deployed:</p>
    <ul>
      <li>12 volunteer rescue teams</li>
      <li>3 veterinarians with mobile units</li>
      <li>2 animal control officers</li>
      <li>Search and rescue coordinators</li>
      <li>Local law enforcement partnerships</li>
    </ul>
    
    <h2>The Search Begins</h2>
    <p>The scene was chaotic. Scared dogs were running in all directions, some injured from the accident, others simply terrified by the noise and confusion. State police had closed a 2-mile section of the interstate, giving our teams room to work.</p>
    
    <p>Some dogs were easy to catch – they were so scared they simply froze. Others, driven by adrenaline and fear, had run deep into the wooded areas adjacent to the highway.</p>
    
    <h2>Community Mobilization</h2>
    <p>Word of the rescue spread quickly through social media. Within hours, we had over 100 volunteers from the community joining the search effort. Local businesses donated food, water, and supplies. A nearby veterinary clinic opened their doors for emergency treatment.</p>
    
    <h2>The Long Search</h2>
    <p>By nightfall, we had safely captured 19 of the 25 dogs. But 6 were still missing, somewhere in the 50-square-mile search area. Our teams worked through the night, using thermal imaging equipment donated by the local fire department.</p>
    
    <h2>Against All Odds</h2>
    <p>The search continued for six days. Volunteers placed food and water stations throughout the woods. They set up humane traps and maintained a 24-hour watch. Local residents were asked to check their properties and report any sightings.</p>
    
    <p>One by one, the missing dogs were found. The last dog – a scared Beagle mix named Hope – was found on day six, weak but alive, hiding under a porch three miles from the accident site.</p>
    
    <h2>The Aftermath</h2>
    <p>All 25 dogs survived the ordeal. Most had only minor injuries – cuts, bruises, and dehydration. Three required surgery for more serious injuries, but all made full recoveries.</p>
    
    <h2>A Silver Lining</h2>
    <p>The publicity from the rescue brought unprecedented attention to animal welfare in our region. Adoption applications poured in, not just for the highway dogs, but for all the animals in our care. Within two months, we had achieved something we'd never accomplished before – an empty shelter.</p>
    
    <h2>The Highway Heroes Today</h2>
    <p>All 25 "Highway Heroes" as they came to be known, found loving homes. Many of their adopters stay in touch, sharing updates and photos. Several of the dogs have gone on to become therapy animals, perhaps understanding better than most what it means to overcome trauma.</p>
    
    <p>The rescue also forged lasting partnerships with other rescue organizations, veterinary clinics, and community groups. It showed us what's possible when an entire community comes together for a common cause.</p>`,
    featuredImage: {
      url: "/images/stories/highway-heroes.jpg",
      altText: "Multiple rescue volunteers working together to safely capture scared dogs near a highway",
      caption: "Volunteers coordinating the largest rescue operation in HALT history"
    },
    tags: ["emergency-rescue", "community-effort", "highway-accident", "25-dogs", "hero-story"],
    isFeatured: true,
    isPublished: true
  }
];

async function seedStories() {
  try {
    await connectDB();
    
    // Clear existing stories
    await Story.deleteMany({});
    console.log('🗑️  Cleared existing stories');
    
    // Helper function to generate slug
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
    };
    
    // Insert sample stories one by one to trigger pre-save middleware
    const stories = [];
    for (const storyData of sampleStories) {
      // Manually add slug if not present
      if (!storyData.slug) {
        storyData.slug = generateSlug(storyData.title);
      }
      const story = new Story(storyData);
      const savedStory = await story.save();
      stories.push(savedStory);
    }
    console.log(`✅ Successfully seeded ${stories.length} stories`);
    
    // Display what was created
    stories.forEach(story => {
      console.log(`   📖 ${story.title} (${story.category}) - Slug: ${story.slug}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding stories:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedStories();
