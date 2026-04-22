/**
 * MindNest — RAG Knowledge Base Seeder
 * Usage: npx tsx scripts/seed-knowledge.ts
 *
 * Reads credentials from .env.local, embeds each document via Voyage AI,
 * and inserts directly into Supabase (no running server required).
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { VoyageAIClient } from 'voyageai'

// ── Load .env.local ─────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const VOYAGE_API_KEY    = process.env.VOYAGE_API_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !VOYAGE_API_KEY) {
  console.error('Missing required env vars. Check NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const voyage   = new VoyageAIClient({ apiKey: VOYAGE_API_KEY })

// ── Knowledge documents ──────────────────────────────────────────────────────

interface KnowledgeDoc {
  title:    string
  content:  string
  source:   string
  category: string
}

const documents: KnowledgeDoc[] = [

  // ── WHO Milestone Guidelines ───────────────────────────────────────────────

  {
    title:    'WHO Developmental Milestones: Birth to 12 Months',
    category: 'WHO',
    source:   'WHO Caring for Child Development (CCD) Programme',
    content: `The World Health Organization identifies key developmental milestones in the first year of life across four domains: motor, language, social-emotional, and cognitive development.

Motor development: By 2 months, infants lift their head when placed on their tummy. By 4 months, they push up on arms during tummy time and bring hands to midline. By 6 months, they roll from tummy to back and sit with support. By 9 months, they pull themselves to a sitting position and begin to crawl. By 12 months, most infants can pull to stand and cruise along furniture, with some beginning to walk independently.

Language development: Newborns communicate through crying. By 2 months, they begin cooing. By 4–6 months, babbling with vowel sounds emerges. By 6–9 months, canonical babbling appears ("bababa", "mamama"). By 12 months, infants typically say 1–2 words with consistent meaning, respond to their name, and follow simple one-step instructions.

Social-emotional development: The social smile appears around 6–8 weeks and is a critical early milestone. By 4 months, infants laugh and show excitement. Stranger anxiety emerges around 8–9 months, indicating a secure attachment bond. By 12 months, infants show clear preference for primary caregivers and engage in joint attention by following a point or gaze.

Cognitive development: Object permanence begins to develop around 8 months. Infants begin to imitate actions and gestures by 9–12 months, a critical foundation for learning. The WHO emphasises that responsive caregiving and stimulating play interactions during this period directly accelerate all domains of development.`,
  },

  {
    title:    'WHO Developmental Milestones: 12 to 24 Months',
    category: 'WHO',
    source:   'WHO Caring for Child Development (CCD) Programme',
    content: `The second year of life is characterised by rapid gains in language, mobility, and emerging independence. The World Health Organization tracks the following milestones across this period.

Motor development: Walking typically becomes stable and fluid between 12–18 months. By 18 months, toddlers can run (though with frequent falls), climb onto low furniture, and walk up stairs with support. By 24 months, most children can kick a ball, jump with both feet leaving the ground, and manage stairs alternating feet with support.

Language development: By 15 months, most toddlers have a vocabulary of 5–10 words. By 18 months, the vocabulary should reach 10–20 words and the child should be able to follow two-step instructions. By 24 months, two-word phrases emerge ("more milk", "daddy gone") and the vocabulary typically exceeds 50 words. A child who does not have at least 50 words and two-word combinations by 24 months should be referred for speech-language assessment.

Social-emotional development: Toddlers engage in parallel play — playing alongside but not yet truly with other children. Pretend play begins around 18 months, a significant cognitive-social milestone. Separation anxiety peaks around 18 months and gradually subsides. Empathy emerges: toddlers notice and respond to others' distress.

Cognitive development: Between 18–24 months, symbolic thinking develops rapidly — children use one object to represent another, the foundation of language, mathematics, and reading. Problem-solving by trial and error transitions to simple insight. Shape sorters, simple puzzles, and cause-and-effect toys are developmentally ideal during this period.`,
  },

  {
    title:    'WHO Developmental Milestones: 24 to 48 Months',
    category: 'WHO',
    source:   'WHO Caring for Child Development (CCD) Programme',
    content: `The preschool years from 24 to 48 months involve extraordinary developmental progress across all domains. The WHO describes this period as critical for the foundations of school readiness, executive function, and social competence.

Motor development: By 30 months, children jump with both feet, run with greater control, and can balance briefly on one foot. By 36 months, they pedal a tricycle, climb ladders, and walk up and down stairs independently. By 48 months, hopping on one foot, skipping, and catching a large ball are expected.

Language development: Sentence length grows from two words at 24 months to four-to-six word sentences by 36 months. By 36 months, strangers should understand 75% of what a child says. By 48 months, children tell stories with a beginning, middle, and end, ask complex "why" and "how" questions, and understand most conversational grammar. Vocabulary grows at approximately 5–10 new words per week during this period.

Social-emotional development: Cooperative play develops between 30–36 months. Children begin to internalise rules and develop a conscience — they feel pride when they do well and guilt or shame when they behave badly. Friendships form. By 48 months, children can name and communicate emotions in language, a powerful predictor of later wellbeing.

Cognitive development: Symbolic and pretend play becomes elaborate. Children understand the concept of same and different, sort by multiple attributes, and begin to recognise letters, numbers, and written words. Executive function — the ability to hold a rule in mind and act on it — develops rapidly and is the strongest predictor of school success.`,
  },

  // ── AAP Speech and Language ────────────────────────────────────────────────

  {
    title:    'AAP Speech and Language Development: Birth to 24 Months',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Bright Futures Developmental Surveillance Guidelines',
    content: `The American Academy of Pediatrics (AAP) identifies speech and language development as one of the most critical domains to monitor in the first two years. Early identification and intervention for delays produces dramatically better outcomes than later intervention.

Key milestones by age: By 2 months, infants should make cooing sounds and quieten to a familiar voice. By 4 months, they babble and laugh. By 6 months, they babble with consonant sounds and respond to their name. By 9 months, they use gestures like waving and pointing, and vary their babbling in pitch and tone. By 12 months, they say 1–3 words with meaning, understand "no", and respond to simple one-step instructions. By 18 months, they have at least 10 words and can point to body parts when named. By 24 months, they use two-word phrases and have a vocabulary of at least 50 words.

Red flags that warrant immediate referral to a speech-language pathologist: No babbling by 12 months; no gestures (pointing, waving, showing) by 12 months; no single words by 16 months; no two-word spontaneous phrases by 24 months; any loss of previously acquired language or social skills at any age.

The AAP strongly recommends the serve-and-return interaction model — where caregivers respond to the infant's vocalisations, gaze, and gestures by mirroring, expanding, or commenting. Research shows that the quantity and quality of parent-directed speech directly predicts vocabulary size at age 3, reading ability at school entry, and lifetime educational achievement. Television and passive screen exposure do not support language development in children under 2.`,
  },

  {
    title:    'AAP Speech and Language Development: 24 to 48 Months and Late Talker Guidance',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Bright Futures and Council on Children with Disabilities',
    content: `The American Academy of Pediatrics provides detailed guidance for monitoring speech and language development in the preschool years and distinguishing late talkers from children with true language disorders.

Milestones at 24–48 months: By 30 months, children should produce three-word sentences and be understood by familiar caregivers most of the time. By 36 months, four-to-six word sentences are typical, strangers understand about 75% of speech, and the child follows two-step unrelated instructions ("Get your shoes and bring me the book"). By 48 months, speech is mostly clear, the child tells stories, asks complex questions, and engages in back-and-forth conversation.

Late talkers versus language delay: A late talker has fewer words than expected for age but demonstrates strong comprehension, social engagement, use of gestures, and varied babbling — many catch up spontaneously by age 3 without intervention. A language delay involves deficits across multiple language dimensions: comprehension, expression, and social use. Children with language delays benefit from early speech-language pathology intervention.

The AAP recommends that pediatricians conduct formal developmental screening at 9, 18, and 30 months using validated tools such as the Ages and Stages Questionnaires (ASQ) or the Modified Checklist for Autism in Toddlers (M-CHAT). Referral to a speech-language pathologist should never be delayed by a "wait and see" approach when red flags are present. Early intervention services (typically available through the state at no cost for children under 3) are most effective when started as early as possible.

Bilingual children: Children raised in bilingual households may have smaller vocabularies in each individual language but equivalent total vocabulary across both languages. Bilingualism does not cause language delay.`,
  },

  // ── AAP Safe Sleep ─────────────────────────────────────────────────────────

  {
    title:    'AAP Safe Sleep Guidelines for Infants',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Safe Sleep Recommendations (2022 Update)',
    content: `The American Academy of Pediatrics 2022 updated safe sleep guidelines provide comprehensive recommendations for reducing the risk of sleep-related infant deaths, including sudden infant death syndrome (SIDS), accidental suffocation, and unexplained infant death.

Core safe sleep recommendations: Always place infants on their BACK to sleep for every sleep, for the entire first year. Use a firm, flat, non-inclined sleep surface with a fitted sheet. Infants should sleep in their own sleep space — a crib, bassinet, or play yard — that meets current safety standards. Room-sharing without bed-sharing is recommended for at least the first 6 months, and ideally for the first year.

What to avoid: Soft bedding, pillows, bumper pads, blankets, and stuffed animals in the sleep space create suffocation and entrapment risks. Inclined sleepers, swings, bouncers, and car seats are not safe for routine sleep. Bed-sharing with a sleeping adult increases SIDS risk, particularly when the adult is a smoker, has consumed alcohol, or is very tired. Overheating is a risk factor — keep the room 68–72°F (20–22°C) and dress infants lightly.

Tummy time is essential for development: While back sleeping is critical for safe sleep, supervised tummy time when the infant is awake and alert — beginning from day one — is equally important. Tummy time prevents positional plagiocephaly (flat head), builds neck and shoulder strength, and accelerates gross motor development. The AAP recommends working up to at least 30 minutes of tummy time per day by 7 weeks.

Breastfeeding, pacifier use at sleep onset, and avoiding smoke exposure are additional evidence-based protective factors against SIDS. The AAP recommends feeding human milk for at least the first 6 months.`,
  },

  // ── CDC Developmental Milestones ──────────────────────────────────────────

  {
    title:    'CDC Learn the Signs. Act Early: Developmental Milestones 2 to 15 Months',
    category: 'CDC',
    source:   'CDC Learn the Signs. Act Early. Programme (2022 Updated Milestone Checklists)',
    content: `The Centers for Disease Control and Prevention (CDC) updated its developmental milestone checklists in 2022, shifting from listing milestones that "most children" achieve by a given age to listing milestones that "most children" (75th percentile) should be meeting — enabling earlier identification of developmental concerns.

2-month milestones: Calms down when spoken to or picked up; looks at your face; makes sounds other than crying; reacts to loud sounds; watches you as you move.

4-month milestones: Smiles on their own to get attention; chuckles; holds head steady without support when held; holds a toy when placed in hand; uses both arms to swing at toys.

6-month milestones: Knows familiar people; likes to look at self in mirror; laughs; takes turns making sounds with you; blows raspberries; rolls from tummy to back; pushes up on straight arms during tummy time; leans on hands to support self when sitting.

9-month milestones: Is shy, clingy, or fearful around strangers; shows several facial expressions; looks when you call name; reacts when you leave; smiles or laughs at peek-a-boo; makes different sounds (mamama, bababa); lifts things up with one hand; moves things from one hand to the other; uses fingers to rake food toward self; sits without support.

12-month milestones: Waves bye-bye; calls parent mama/dada; pulls up to standing; walks holding on to furniture.

15-month milestones: Copies other children while playing; shows you an object; claps; has at least 3 words; tries to use things the right way (cup, book, comb); stacks at least 2 small objects; walks without holding on.

Act Early: Talk to your child's doctor if your child is not meeting these milestones. Do not wait to see if they will catch up on their own.`,
  },

  {
    title:    'CDC Learn the Signs. Act Early: Developmental Milestones 18 Months to 4 Years',
    category: 'CDC',
    source:   'CDC Learn the Signs. Act Early. Programme (2022 Updated Milestone Checklists)',
    content: `The CDC's updated 2022 milestone checklists for toddlers and preschoolers provide specific, observable behaviours caregivers and clinicians should look for, with clear guidance on when to seek evaluation.

18-month milestones: Moves away from you but looks to make sure you are close; points to show you something interesting; puts hands out for you to wash them; looks at a few pages in a book with you; copies you doing chores (sweeping); plays with toys in a simple way (pushing a toy car); has at least 10 words; walks up stairs with some help.

2-year milestones: Notices when others are hurt or upset; looks at your face to see how to react in a new situation; uses things to pretend play; shows simple problem-solving; follows two-step instructions; uses at least 50 words and strings two together; runs; kicks a ball.

2½-year milestones: Plays next to other children and sometimes plays with them; shows you what they can do ("Look at me!"); follows two-step instructions with the words "and" and "then"; knows about 50 words; says two or more words together with one action word; names things in a book; draws lines and scribbles.

3-year milestones: Calms down within 10 minutes after you leave; notices other children and joins to play; draws a circle; avoids touching hot objects after being warned; buttons some buttons; puts on clothes.

4-year milestones: Pretends to be something else during play; comforts others who are hurt or sad; avoids danger; likes to help; changes behaviour based on where they are; says sentences of 4+ words; names a few colours; tells what comes next in a story.

Act Early: Do not wait. Early intervention services for children under 3 are federally mandated and provided at no cost. Referral at the first sign of concern produces the best outcomes.`,
  },

  // ── AAP Nutrition ─────────────────────────────────────────────────────────

  {
    title:    'AAP Nutrition Guidelines: Breastfeeding and Infant Feeding Birth to 6 Months',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Breastfeeding and the Use of Human Milk (2022)',
    content: `The American Academy of Pediatrics 2022 policy statement on breastfeeding updated its guidance significantly, extending the recommendation for exclusive breastfeeding and strengthening the evidence base for human milk feeding.

Exclusive breastfeeding: The AAP now recommends exclusive breastfeeding for the first 6 months of life, continued breastfeeding alongside introduction of solid foods for at least the first 2 years, and continued breastfeeding beyond 2 years as long as mutually desired by mother and child. This extends the previous recommendation of breastfeeding through at least 12 months.

Evidence base: Breastfeeding is associated with reduced risk of sudden infant death syndrome (SIDS), respiratory infections, ear infections, gastrointestinal illness, type 1 and type 2 diabetes, obesity, childhood leukaemia, and necrotising enterocolitis in preterm infants. For mothers, breastfeeding reduces the risk of breast cancer, ovarian cancer, type 2 diabetes, and hypertension.

Formula feeding: When breastfeeding is not possible or not chosen, iron-fortified commercial infant formula is the appropriate alternative for the first 12 months. Cow's milk should not be introduced before 12 months. Soy, goat, and homemade formulas are not recommended as primary infant nutrition.

Introduction of solids: Around 6 months of age, most infants show signs of readiness for solid foods: they can sit with minimal support, have lost the tongue-thrust reflex, and show interest in food. Early introduction of allergenic foods (peanut, egg, dairy) is now recommended between 4–6 months for high-risk infants and around 6 months for all infants, as early exposure reduces allergy risk.

Vitamin D: All breastfed infants should receive 400 IU of vitamin D daily beginning within the first few days of life.`,
  },

  {
    title:    'AAP Nutrition Guidelines: Feeding Toddlers and Preschoolers 12 to 48 Months',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Bright Futures Nutrition and Council on Nutrition Guidelines',
    content: `The American Academy of Pediatrics provides comprehensive guidance on feeding children from 12 months to 4 years, addressing the transition from infant feeding to a varied family diet and the management of the extreme pickiness that characterises this developmental period.

Milk transition: Whole cow's milk replaces formula or breast milk as the primary milk source from 12–24 months — children this age need the fat for brain development. Limit milk to 16–24 oz per day to prevent displacement of solid food intake and iron deficiency. From age 2, low-fat or non-fat milk is appropriate. Plant-based milks (oat, almond, rice) are nutritionally inferior and not recommended as the primary milk source before age 5 without dietitian oversight.

Iron and zinc: Iron deficiency anaemia is the most common nutritional deficiency in toddlers. Emphasise iron-rich foods: red meat, poultry, fish, beans, lentils, iron-fortified cereals. Pair with vitamin C to enhance absorption. Annual haemoglobin screening is recommended between 12–24 months.

Picky eating: The Ellyn Satter Division of Responsibility model is the evidence base for managing picky eating: the parent decides what food is offered, where, and when — the child decides whether and how much to eat. Pressuring children to eat increases food refusal. Repeated neutral exposure (10–15 exposures) to a rejected food is the most effective strategy for acceptance. Food neophobia peaks between 18 months and 3 years and is developmentally normal.

Avoid: Added sugars, honey before 12 months, low-nutrient foods displacing nutrient-dense options, juice as a drink (maximum 4 oz/day if offered at all for ages 1–3), and sweetened beverages of any kind.

Choking hazards to avoid before age 4: whole grapes, whole nuts, popcorn, raw carrots, large chunks of apple, and hot dogs cut in rounds.`,
  },

  // ── WHO Physical Activity ──────────────────────────────────────────────────

  {
    title:    'WHO Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5',
    category: 'WHO',
    source:   'WHO Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years (2019)',
    content: `The World Health Organization published its first comprehensive guidelines on physical activity, sedentary behaviour, and sleep for children under 5 in 2019. Meeting these guidelines is associated with better motor development, cognitive development, healthy growth, and long-term health outcomes.

Physical activity recommendations by age:

Infants (under 12 months): Should be physically active several times daily in a variety of ways, particularly through interactive floor-based play. Supervised tummy time when awake — beginning from birth, working up to 30 minutes total per day — is specifically recommended for all infants who are not yet mobile.

Toddlers 1–2 years: At least 180 minutes of physical activity spread throughout the day — of any intensity. This includes all movement including play, walking, crawling, dancing, and outdoor time. More is better.

Children 3–4 years: At least 180 minutes of physical activity per day, of which at least 60 minutes is moderate-to-vigorous intensity. Active play — running, climbing, jumping, chasing — qualifies.

Sedentary screen time limits: Children under 1 year should have no screen time. Children 1–2 years should have no sedentary screen time (video chat with family is acceptable). Children 3–4 years should have no more than 1 hour per day of sedentary screen time.

Sedentary time: Restrained time in strollers, high chairs, or on a caregiver's back should not exceed 1 hour continuously for infants and toddlers. When sedentary, reading and storytelling with a caregiver is encouraged.

Sleep: Infants 0–3 months need 14–17 hours of sleep; 4–11 months need 12–16 hours; 1–2 years need 11–14 hours; 3–4 years need 10–13 hours including naps. Consistent bedtime routines significantly improve sleep onset and duration.`,
  },

  // ── AAP Screen Time ────────────────────────────────────────────────────────

  {
    title:    'AAP Screen Time Guidelines for Children Under 5',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Media and Young Minds Policy Statement (2016, updated guidance 2024)',
    content: `The American Academy of Pediatrics provides clear evidence-based guidelines on screen media use for young children, emphasising that the type, quality, and context of screen use matters as much as quantity.

Guidelines by age:

Under 18 months: Avoid screen media use other than video chatting (with grandparents or family members). The brain of a child under 18 months is not developmentally ready to learn effectively from two-dimensional screens. Language, social skills, and motor development are all built through face-to-face interaction, not passive viewing.

18–24 months: If parents choose to introduce digital media, choose high-quality programming only (PBS Kids, Sesame Workshop content) and watch together with the child. Solo viewing is not recommended. Children this age can begin to learn from screens when a parent co-views and helps them connect what they see on screen to the real world.

2–5 years: Limit to 1 hour per day of high-quality programming. Co-viewing and discussing content is associated with better learning outcomes. Fast-paced programs, apps with heavy advertising, and violent content are not appropriate. Video games with complex controls are not developmentally appropriate before age 3.

What matters most: The content and context of screen use matter more than screen time per se. An hour of Sesame Street watched with a parent and discussed is developmentally very different from an hour of YouTube autoplay watched alone. Displacement is the key concern — screen time that displaces sleep, physical activity, reading, and face-to-face interaction causes harm.

The AAP does not recommend using screens to calm toddlers as a regular strategy, as this may interfere with the development of emotional self-regulation skills.`,
  },

  // ── Serve-and-Return Research ──────────────────────────────────────────────

  {
    title:    'Serve-and-Return Interaction: The Foundation of Brain Architecture',
    category: 'Research',
    source:   'Harvard Center on the Developing Child — Science of Early Childhood Development',
    content: `Serve-and-return interaction is the single most important process for building healthy brain architecture in the first years of life. The concept — developed and researched extensively at Harvard's Center on the Developing Child — describes the back-and-forth exchange between a caregiver and an infant or young child that literally constructs the neural connections underpinning language, cognition, and social-emotional development.

How it works: When a baby babbles, reaches out, or makes a facial expression, that is the "serve." When a caregiver responds by making eye contact, speaking back, imitating the sound, or engaging with what the child is interested in, that is the "return." The exchange then continues with the child responding again, and so on. Each round of this interaction activates and strengthens the neural pathways that form the architecture of the developing brain.

The research evidence: Studies using brain imaging, language assessment, and long-term educational tracking consistently show that:
- Children who experience high levels of serve-and-return interaction by 18 months have larger vocabularies at age 3
- The number of conversational turns per day (not simply the number of words spoken at a child) is the strongest predictor of language development and academic achievement
- Serve-and-return interaction buffers against the effects of early adversity and toxic stress on the developing brain
- The absence of serve-and-return — parental depression, neglect, chronic stress — is associated with epigenetic changes that affect lifelong stress response systems

Practical application: Parents do not need special training to provide serve-and-return. Following the child's lead — noticing what they are interested in, joining that interest, and building on it — is the natural human interaction that builds brains. Activities like peek-a-boo, reading together, narrating daily routines, responding to babbling as if it were speech, and playing on the floor are all serve-and-return interactions.`,
  },

  // ── AAP Early Literacy ────────────────────────────────────────────────────

  {
    title:    'AAP Literacy Promotion: Reading Aloud from Birth',
    category: 'AAP',
    source:   'American Academy of Pediatrics — Literacy Promotion: An Essential Component of Primary Care (2014, reaffirmed 2021)',
    content: `The American Academy of Pediatrics recommends that pediatricians advise parents to read aloud with children beginning at birth. The evidence base for early shared book reading is among the strongest in all of developmental paediatrics.

Why reading from birth matters: Reading aloud to infants and young children — even before they understand the words — provides a rich serve-and-return interaction, introduces vocabulary they would not encounter in everyday speech, builds phonological awareness (the ability to hear and manipulate sounds in language), and establishes the physical and emotional association between books and warmth, safety, and connection that motivates a lifelong love of reading.

The "word gap" and vocabulary development: Research consistently demonstrates that children from lower socioeconomic backgrounds enter kindergarten with significantly smaller vocabularies than their more affluent peers, and this gap predicts school performance throughout the educational career. Shared book reading is one of the most powerful and accessible interventions to address this gap, as books expose children to a vastly wider range of vocabulary than everyday conversation.

What the research shows: Children who are read to daily from birth hear 1.4 million more words by age 5 than children who are never read to. Each additional book read per day in the first 5 years is associated with approximately 1.5 additional words recognised at school entry. Frequent readers show stronger phonological awareness, reading readiness, and reading achievement in school.

Recommendations by age: For infants — simple high-contrast or board books; point at pictures and name them. For toddlers — repetitive books with rhyme and rhythm; read the same books many times (repetition builds vocabulary). For preschoolers — books with richer vocabulary; stop and discuss; ask "what do you think will happen next?"

The AAP encourages pediatricians to provide developmentally appropriate books at every well-child visit from 6 months through 5 years.`,
  },

  // ── CDC Autism Early Signs ────────────────────────────────────────────────

  {
    title:    'CDC Early Signs of Autism and When to Seek Help',
    category: 'CDC',
    source:   'CDC Learn the Signs. Act Early. — Autism Spectrum Disorder Screening Guidance',
    content: `The Centers for Disease Control and Prevention emphasises that early identification of autism spectrum disorder (ASD) and prompt access to early intervention produces significantly better long-term outcomes than later diagnosis. ASD can be reliably diagnosed by 18–24 months by a qualified specialist.

Early signs across development:

Social communication and interaction: Not responding to name by 12 months; not pointing at things to show interest (proto-declarative pointing) by 14 months; not playing "pretend" games by 18 months; avoiding eye contact; preferring to be alone; difficulty understanding other people's feelings; delayed speech or no speech; repeating words or phrases over and over (echolalia); difficulty in conversation; flat or unusual facial expressions or tone of voice.

Restricted and repetitive behaviours: Lining up toys or other objects; getting very upset by minor changes in routine; obsessive interests; flapping hands, rocking body, or spinning self; unusual reactions to sounds, smells, tastes, sights, or textures; very rigid routines that cause significant distress when disrupted.

Specific red flags that warrant immediate evaluation: No babbling by 12 months; no gestures (pointing, waving, reaching) by 12 months; no single words by 16 months; no two-word phrases by 24 months; ANY regression or loss of previously acquired language, social skills, or play skills at any age — this is always an urgent referral.

Screening: The CDC and AAP recommend universal ASD screening at 18 and 24 months using the Modified Checklist for Autism in Toddlers (M-CHAT-R/F). A positive screen should be followed by a full diagnostic evaluation, not a watching period.

Early intervention: Children who begin behavioural intervention before age 3 show the greatest developmental gains. Early Start Denver Model (ESDM), Applied Behaviour Analysis (ABA), and speech-language therapy are the most evidence-supported approaches.`,
  },
]

// ── Embed and insert ─────────────────────────────────────────────────────────

async function embedAndInsert(doc: KnowledgeDoc, index: number): Promise<void> {
  const label = `[${index + 1}/${documents.length}] "${doc.title}"`

  try {
    // Embed title + content together for richer semantic representation
    const response = await voyage.embed({
      input: `${doc.title}\n\n${doc.content}`,
      model: 'voyage-3',
    })

    const embedding = response.data?.[0]?.embedding as number[] | undefined
    if (!embedding) throw new Error('No embedding returned from Voyage AI')

    const { error } = await supabase
      .from('knowledge_documents')
      .insert({
        title:     doc.title,
        content:   doc.content,
        source:    doc.source,
        category:  doc.category,
        embedding: JSON.stringify(embedding),
      })

    if (error) throw new Error(`Supabase insert failed: ${error.message}`)

    console.log(`✓ ${label}`)
  } catch (err) {
    console.error(`✗ ${label}`, err)
  }
}

async function main() {
  console.log(`\nMindNest RAG Knowledge Base Seeder`)
  console.log(`Seeding ${documents.length} documents into Supabase...\n`)

  // Run sequentially to avoid rate limiting
  for (let i = 0; i < documents.length; i++) {
    await embedAndInsert(documents[i], i)
  }

  console.log('\nDone.')
}

main()
