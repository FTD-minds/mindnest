-- =============================================================================
-- MindNest — Seed Developmental Milestones 0–48 Months
-- Migration: 20260421000001_seed_developmental_milestones.sql
-- =============================================================================
-- 45 milestones across 9 age bands, 5 brain areas
-- Based on WHO Multicentre Growth Reference Study, AAP developmental guidelines,
-- CDC Learn the Signs. Act Early., and Bayley Scales of Infant Development.
-- Bands: 0–3, 3–6, 6–9, 9–12, 12–18, 18–24, 24–36, 36–42, 42–48 months
-- Premium: first 3 per band = false, remaining = true
-- is_emerging: true = milestone is actively emerging at this age
-- =============================================================================

INSERT INTO public.developmental_milestones
  (age_months, brain_area, milestone_title, description, how_to_support, is_emerging, is_premium)
VALUES

-- =============================================================================
-- BAND 1 — 0–3 months
-- =============================================================================

(2, 'Social-Emotional',
 'Social smile',
 'Your baby begins smiling in response to your face, voice, and loving touch — not from gas, but from genuine social connection. This is one of the most significant early milestones: it signals that your baby recognises you and is beginning to communicate joy.',
 'Get close, make eye contact, and smile warmly. Pause and wait — give your baby time to respond. Talk softly while you change, feed, and hold them. These back-and-forth moments of smiling and cooing are the earliest conversations, and every one of them builds your baby''s social brain.',
 TRUE, FALSE),

(3, 'Motor',
 'Head control during tummy time',
 'When placed on their tummy, your baby lifts and holds their head up briefly, building the shoulder and neck strength that underpins every motor milestone to come — rolling, sitting, crawling, and walking all begin here.',
 'Aim for 3–5 tummy time sessions per day, starting with just 1–2 minutes after a nappy change. Get down at eye level to encourage your baby to look up at you. A rolled towel under the chest can help if they find it difficult. Never leave baby unattended on their tummy.',
 TRUE, FALSE),

(1, 'Language',
 'Cries to communicate needs',
 'From birth, crying is your baby''s primary language. Over the first weeks, different cries begin to emerge for hunger, discomfort, fatigue, and overstimulation. Responding consistently to cries does not spoil babies — it builds the secure attachment that underlies all future communication.',
 'Try to respond within a few minutes of crying. Learn your baby''s different cry patterns — hungry cries are often rhythmic and repetitive; overtired cries are higher-pitched. Narrate as you respond: "I hear you — you''re hungry, let''s get you some milk." This teaches language even before babies can speak.',
 TRUE, FALSE),

(2, 'Cognitive',
 'Tracks moving objects with eyes',
 'Your baby begins following a slowly moving face, toy, or light with their eyes from side to side and up and down. This visual tracking is the foundation of attention, focus, and the ability to learn from the world. It reflects the rapid maturation of the visual cortex in the first weeks of life.',
 'Hold a brightly coloured toy or your face about 20–30 cm from your baby''s eyes — that''s their optimal focal distance. Move it slowly from side to side and watch their gaze follow. Do this when baby is alert and calm, not when drowsy or overstimulated. Even a few minutes of tracking practice each day makes a difference.',
 TRUE, TRUE),

(1, 'Sensory',
 'Calms to familiar voice and gentle touch',
 'Newborns recognise the primary caregiver''s voice from birth — they heard it in the womb. Being held skin-to-skin, hearing a familiar voice, and gentle rocking activate the parasympathetic nervous system and lower cortisol. Your presence is genuinely regulating their nervous system.',
 'Wear or carry your baby when possible — skin-to-skin contact releases oxytocin in both of you. Speak and sing softly, even while doing everyday tasks. Swaddling mimics the snug feeling of the womb and can reduce startle responses. When baby is distressed, your calm voice and steady heartbeat are the most powerful tools you have.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 2 — 3–6 months
-- =============================================================================

(4, 'Language',
 'Babbles with vowel sounds',
 'Your baby begins making strings of vowel sounds — "ooh", "aah", "eeh" — and experimenting with their voice like a little scientist. They''re discovering that their mouth makes sound, and that sound gets a response from you. This is the foundation of all spoken language.',
 'Talk back! Imitate their sounds, then pause and wait for them to respond. This serve-and-return conversation is exactly how language develops. Narrate your day: "Now we''re getting dressed — here comes your sleeve." Simple, repetitive language heard in loving interaction is the best language lesson there is.',
 TRUE, FALSE),

(5, 'Motor',
 'Rolls from tummy to back',
 'Your baby discovers they can use momentum and push with one arm to flip from their tummy onto their back — often surprising themselves! Rolling develops core strength, spatial awareness, and the ability to change their own position in the world, a key step toward independence.',
 'Keep up tummy time to build the strength needed for rolling. Place interesting toys just out of reach to motivate movement. Clear a safe floor space and supervise closely — once rolling starts, babies can move further than you expect. Never leave them unattended on a changing table or raised surface.',
 TRUE, FALSE),

(4, 'Social-Emotional',
 'Laughs and squeals in response to play',
 'That first real laugh is unforgettable. Your baby has developed enough social understanding to find things funny — especially surprising sounds, gentle tickles, and silly faces from the people they love. Laughter is a social act: it''s shared joy, and it deepens your bond every time.',
 'Play peek-a-boo, blow raspberries, make funny sounds, and watch what makes your baby light up. The best play at this age is face-to-face interaction with you — no toys needed. Follow your baby''s lead: if something makes them smile, do it again. If they look away, they''re taking a break — wait for them to return.',
 TRUE, FALSE),

(5, 'Cognitive',
 'Recognises familiar faces and responds differently to strangers',
 'Your baby has memorised the faces of their primary caregivers and now shows clear recognition — a bigger smile, more vocalisations, and excited arm and leg movements — for familiar people versus reserved interest in strangers. This is sophisticated memory and early social cognition.',
 'Spend lots of face time with your baby: feeding, bath time, nappy changes — all are opportunities for close connection. Introduce new people gradually and calmly. If baby seems uncertain about a new face, narrate: "That''s Auntie Jo — she loves you very much." Your calm reassurance helps them feel safe.',
 TRUE, TRUE),

(5, 'Sensory',
 'Reaches for and grasps nearby objects',
 'Your baby starts reaching intentionally for objects within their visual field and is beginning to grip them — graduating from the reflexive newborn grasp to an intentional, coordinated reach-and-hold. This marks the beginning of voluntary motor control and hands-on exploration of the world.',
 'Offer toys that are easy to grip — soft rattles, silicone rings, fabric squares. Hold objects within reaching distance and let baby work to grasp them. Different textures, weights, and temperatures (safe and supervised) give rich sensory input. Let them bring objects to their mouth — this is how babies explore, not a bad habit.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 3 — 6–9 months
-- =============================================================================

(6, 'Language',
 'Canonical babbling — consonant-vowel strings',
 'Your baby begins stringing consonants and vowels together: "bababa", "mamama", "dadada". This canonical babbling is a critical language milestone — it means the neural pathways for speech production are maturing. Babies who babble actively at 6 months are on track for strong language development.',
 'Babble back! Respond to "bababa" with "ba ba ba — yes!" This teaches conversation turns and that their voice matters. Read simple board books with clear, repetitive language. Sing songs with actions. Label everything you do together: "Up! Now down. There''s your nose — and there''s mine."',
 TRUE, FALSE),

(8, 'Motor',
 'Sits independently without support',
 'Your baby can now hold themselves upright in a sitting position without you holding them — hands free to explore. Independent sitting is a major postural milestone that unlocks a whole new view of the world and frees both hands for play, investigation, and developing fine motor skills.',
 'Once baby can tripod sit (using arms for support), practise sitting them on a firm flat surface with toys nearby. Stay close and spot for wobbles — falling is part of learning. A Boppy pillow or rolled blanket can give confidence without removing the challenge. Avoid prolonged time in bouncers or seats that hold them upright passively.',
 TRUE, FALSE),

(8, 'Social-Emotional',
 'Stranger anxiety and clear preference for caregivers',
 'Your baby now has a strong, specific attachment to their primary caregivers and may cry or cling when approached by unfamiliar people. This is developmentally healthy — it means your attachment bond is working exactly as it should. Stranger anxiety typically peaks between 8–12 months.',
 'Acknowledge their feelings: "You feel nervous about someone new — that''s okay." Don''t force cuddles or hand-overs. Let baby observe new people from your arms first. Brief separations followed by warm reunions build secure attachment. Your calm, confident demeanour when handing baby to someone trusted helps them co-regulate.',
 TRUE, FALSE),

(8, 'Cognitive',
 'Object permanence begins',
 'Your baby is starting to understand that things exist even when they can''t see them — a concept called object permanence. They may look for a dropped toy, reach for a partially hidden object, or search for a face that disappeared behind a cloth. This is a landmark cognitive leap.',
 'Play peek-a-boo endlessly — it''s not just fun, it''s practising object permanence. Hide a toy under a cloth and watch baby find it. Let toys fall from the high chair and watch their eyes track downward. These simple games are building a sophisticated understanding of how the world works.',
 TRUE, TRUE),

(7, 'Sensory',
 'Transfers objects from hand to hand',
 'Your baby can now take an object held in one hand and pass it deliberately to the other — a beautifully coordinated bilateral movement requiring both sides of the brain to communicate. This hand-to-hand transfer is an important precursor to more complex manipulation skills.',
 'Offer objects that are easy to grip and transfer — rings, soft blocks, teething toys. Watch as they experiment: offering an object and seeing if they take it from you builds both motor skill and turn-taking. Let them explore freely. Avoid jumperoos and walkers that restrict natural movement exploration.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 4 — 9–12 months
-- =============================================================================

(11, 'Language',
 'First words with consistent meaning',
 'Your baby says their first real word — a sound consistently used to mean the same thing, like "mama" to call you, "up" to be lifted, or "dog" for the family pet. First words typically emerge between 10–14 months. Quality matters more than quantity at this stage.',
 'Use the same simple words repeatedly in context: "more?", "up!", "bye bye." When baby makes a sound that seems intentional, respond as if it''s a word: "Yes! Dog! There''s the dog!" This confirms they''re communicating. Read board books with single clear images. Label everything in your environment consistently.',
 TRUE, FALSE),

(10, 'Motor',
 'Pulls to stand and cruises along furniture',
 'Your baby hauls themselves upright using furniture, your legs, or anything sturdy — and then begins shuffling sideways while holding on. This cruising builds the leg strength, balance, and coordination that will soon power independent walking. It''s effortful, exciting, and irresistible to stop.',
 'Ensure furniture is stable and won''t tip. Create a safe cruising circuit using a low table, sofa, and sturdy chairs placed close together. Let baby fall — learning to fall safely is important. Barefoot or socks with grips on hard floors gives better feedback than shoes at this stage. Shoes are for outdoors, not for learning to walk.',
 TRUE, FALSE),

(10, 'Social-Emotional',
 'Proto-declarative pointing — sharing interest',
 'Your baby starts pointing to things not to get them, but to share them with you: "Look at that!" This proto-declarative pointing is one of the most important social-communication milestones and a key marker of joint attention — the foundation of all language and social learning.',
 'Follow your baby''s point every time, look at what they''re showing you, and name it: "Yes! A bird! A big bird flying!" This validates their communication attempt and teaches them that pointing works. Point things out yourself: "Look — a dog!" Wait for them to follow your gaze. Shared attention is the engine of language.',
 TRUE, FALSE),

(10, 'Cognitive',
 'Imitates actions and gestures',
 'Your baby now deliberately copies actions they observe — waving, clapping, banging a spoon, shaking their head. Imitation is how humans learn: it requires attention, memory, motor planning, and social motivation all working together. A baby who imitates is learning at full speed.',
 'Play imitation games: clap slowly, pause, see if baby claps back. Wave, bang, shake — and wait for baby to copy. Read books with actions and do the actions together. These imitation games are precursors to pretend play and are building neural pathways that will support language, social skills, and academic learning.',
 TRUE, TRUE),

(10, 'Sensory',
 'Pincer grasp — picks up small objects with thumb and index finger',
 'Your baby graduates from a whole-hand raking grasp to a precise pincer grasp — using just the tip of their thumb and index finger to pick up small objects like cereal pieces, small toys, or bits of soft food. This refined grip is a significant fine motor milestone with lifelong implications.',
 'Offer small, safe, age-appropriate finger foods: cooked peas, soft fruit pieces, small pasta. Scatter a few on the tray of the high chair and let baby work at picking them up. Small stacking toys and shape sorters also develop pincer skills. Always supervise closely with small objects and food.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 5 — 12–18 months
-- =============================================================================

(15, 'Language',
 'Vocabulary grows to 10–20 words',
 'Your toddler''s word bank is expanding rapidly — from a few words at 12 months to 10–20 by 18 months. These early words include names for important people, familiar objects, and action words. Even approximations count: "wa-wa" for water, "ba" for ball. The number of words at 18 months strongly predicts language at age 5.',
 'Talk constantly in simple, clear sentences and pause for a response. Avoid finishing their sentences or words for them — wait and give them the chance. Name everything. Read the same simple books repeatedly — repetition builds vocabulary. Limit screen time: language is learned through back-and-forth interaction, not passive viewing.',
 TRUE, FALSE),

(13, 'Motor',
 'Walks independently',
 'Those first solo steps are a defining moment — most babies take their first independent steps between 9 and 15 months, with 12 months being the average. Early walkers are not ahead; late walkers are not behind. The range of 9–18 months is entirely normal. Walking with a wide stance and bent knees is typical at first.',
 'Let baby practise on safe, flat surfaces. Avoid walkers and baby seats — they delay independent walking. Shoes are not necessary indoors; bare feet or non-slip socks give the best sensory feedback. Offer a hand when baby needs confidence, but don''t hold both hands — let them find their own balance. Celebrate every wobbly step.',
 TRUE, FALSE),

(15, 'Social-Emotional',
 'Parallel play — plays alongside other children',
 'Your toddler plays next to other children rather than with them — content in their company but not yet truly interactive. This is developmentally appropriate and lays the social groundwork for cooperative play later. Watching, imitating, and occasionally touching another child''s toys is how toddlers begin learning social skills.',
 'Arrange regular play opportunities with other toddlers — small groups are less overwhelming than large ones. Don''t force sharing: toddlers don''t have the brain development to share voluntarily until around 3. Narrate what you see: "Look, Maya is building with blocks too!" Sharing will emerge in its own time.',
 TRUE, FALSE),

(15, 'Cognitive',
 'Symbolic play begins — uses objects to represent others',
 'Your toddler begins using one object to represent another — a banana becomes a phone, a block becomes a car. This symbolic thinking is a major cognitive leap: it means they can hold a mental representation of something that isn''t there. It''s the same cognitive skill underlying language, mathematics, and reading.',
 'Play along and extend the pretend play: if they hold the banana to their ear, say "Hello? Who''s calling?" Offer simple props — a toy kitchen, play animals, dolls — without scripting how to use them. Follow their lead. Resist the urge to demonstrate the "right" way: free pretend play is where the magic happens.',
 TRUE, TRUE),

(14, 'Sensory',
 'Explores textures, temperatures, and materials with hands and mouth',
 'Your toddler is a relentless sensory investigator — squishing, smearing, licking, banging, and dropping everything they encounter. This is not messiness for its own sake; it''s how they build a map of the physical world. Rich sensory exploration at this age supports sensory processing, fine motor development, and scientific thinking.',
 'Embrace the mess where you can. Offer safe sensory experiences: water play, sand, playdough, cooked pasta, jelly, mud. Serve a variety of food textures — even rejected foods build sensory tolerance through repeated exposure. Let them feed themselves. A bath mat under the high chair saves sanity.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 6 — 18–24 months
-- =============================================================================

(20, 'Language',
 'Two-word phrases emerge',
 'Your toddler begins combining two words: "more milk", "daddy go", "big dog", "no nap". This is a significant language leap beyond single words, showing your child can now express relationships between ideas. By 24 months, most children produce at least 50 words and some two-word combinations.',
 'Expand what they say by one word: if they say "more," you say "more juice?" If they say "daddy go," you say "yes, daddy went to work." This gentle expansion — just one word further than where they are — is one of the most powerful language teaching strategies. Never correct; only model. Read books with repetitive simple text.',
 TRUE, FALSE),

(20, 'Motor',
 'Runs and begins to kick a ball',
 'Your toddler runs — albeit with a stiff, wide-legged, arms-out gait — and is starting to kick a stationary ball without falling over. Running requires much more sophisticated balance and coordination than walking. Falls are frequent and normal. This whole-body movement is building proprioception and spatial awareness.',
 'Encourage active play outdoors every day. Roll balls back and forth. Create simple obstacle courses with cushions to climb over and tunnels to crawl through. Avoid limiting movement out of fear of falls — bumps and tumbles are how children learn to calibrate their bodies. Wide, safe spaces are better than playgrounds with too many rules.',
 TRUE, FALSE),

(20, 'Social-Emotional',
 'Shows empathy — notices and responds to others'' distress',
 'Your toddler begins to notice when someone else is upset and may offer comfort — patting a crying friend, bringing you a toy when you seem sad, or looking concerned when another child falls. This budding empathy is remarkable: it requires theory of mind, emotional recognition, and prosocial motivation.',
 'Name emotions frequently, yours and others'': "That baby is crying — she seems sad." "I felt frustrated when I dropped that." Respond warmly when your toddler is upset so they internalise what compassion looks and feels like. Don''t force apologies — they''re not meaningful yet. Model empathy and they''ll grow into it naturally.',
 TRUE, FALSE),

(22, 'Cognitive',
 'Sorts objects by shape and colour',
 'Your toddler begins sorting objects into categories — all the red ones together, all the circles in one pile — showing the ability to identify attributes and group accordingly. This is foundational mathematical thinking: classification, comparison, and the beginning of logical reasoning.',
 'Offer simple sorting activities: coloured cups with matching balls, shape sorters, stacking rings. Don''t worry if they get it "wrong" — exploration is the point. Sort laundry together: "All the socks in this pile." Name shapes and colours consistently in everyday life. Avoid flashcard drilling — playful interaction teaches this naturally.',
 TRUE, TRUE),

(21, 'Sensory',
 'Self-feeds with a spoon with increasing accuracy',
 'Your toddler is mastering the complex skill of scooping food onto a spoon and getting it to their mouth without too much spillage. This requires fine motor control, wrist rotation, proprioception, and persistence. It''s messy, slow, and wonderful. Letting them do it builds independence, fine motor skill, and a healthy relationship with food.',
 'Use a short-handled, weighted spoon designed for toddlers. Thick foods like porridge, mashed potato, and yoghurt stay on the spoon better than soup. Put a mat under the chair and let them practise every meal. Don''t take over — the learning is in the effort, not the outcome. Offer finger foods alongside so they can succeed on their own terms.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 7 — 24–36 months
-- =============================================================================

(30, 'Language',
 '3–4 word sentences and rapid vocabulary growth',
 'Your child is speaking in short sentences and their vocabulary is exploding — adding 5–10 new words a week is normal at this stage. They''re asking questions, narrating their play, and using language to think aloud. By 36 months, strangers should be able to understand about 75% of what your child says.',
 'Have real conversations: ask open questions, listen to the answer, and respond genuinely. Read books with richer language and stop to discuss pictures. Avoid correcting grammar — model the correct form instead: if they say "I goed," you say "Yes, you went!" Audiobooks, songs, and rhymes all build vocabulary.',
 TRUE, FALSE),

(27, 'Motor',
 'Jumps with both feet leaving the ground',
 'Your child masters the jump — both feet leaving the ground simultaneously and landing together. This requires bilateral coordination, core strength, and just enough courage to leave the ground. Jumping, hopping, and dancing at this age are all building the same vestibular and proprioceptive systems that support attention and learning.',
 'Jump together: off a low step, on a mini trampoline, over a line on the floor. Obstacle courses with jumping, crawling, and climbing build whole-body coordination. Dancing to music — fast and slow — is one of the best movement activities for this age. Don''t shy away from rough-and-tumble play: it has documented benefits for emotional regulation.',
 TRUE, FALSE),

(30, 'Social-Emotional',
 'Cooperative play — truly playing with other children',
 'Your child begins to genuinely play with others rather than just alongside them — negotiating roles, taking turns, building together, and resolving simple conflicts. This cooperative play requires theory of mind (understanding others have different perspectives), language, emotional regulation, and social motivation all working in concert.',
 'Facilitate but don''t manage: be nearby for disputes but let children try to resolve conflicts first. Teach simple scripts: "Can I have a turn?" "I''m using it now." Playdates with 1–2 familiar children are more productive than large groups. Name social dynamics: "You shared the truck — that was kind." Narrate what cooperation looks like.',
 TRUE, FALSE),

(30, 'Cognitive',
 'Understands the concepts of "same" and "different"',
 'Your child can identify when two things are alike and when they differ — a sophisticated conceptual understanding that underpins mathematics, reading, scientific reasoning, and social perception. They can match pictures, sort by multiple attributes, and begin to understand comparatives like "bigger" and "smaller".',
 'Play matching games with everyday objects: "Find another one like this." Sort toys by colour, then by size — mix it up. Compare objects during play: "Your block is big — mine is tiny." Simple puzzles, pattern matching, and memory games all develop this skill. Avoid drilling; weave it into play and it sticks.',
 TRUE, TRUE),

(30, 'Sensory',
 'Begins dressing and undressing with minimal assistance',
 'Your child is working toward dressing themselves — pulling off shoes, pushing arms through sleeves, yanking off socks — and with time, putting them back on. This is a complex sensory-motor task requiring body awareness, bilateral coordination, spatial reasoning, and fine motor control.',
 'Build in enough time so dressing isn''t rushed. Offer clothes that are easy to manage: elastic waistbands, loose shirts, velcro shoes. Lay clothes out and let them try before you help. Backward dressing — putting trousers on but leaving the zip and button for you — builds confidence. Name body parts and clothing as you dress together.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 8 — 36–42 months
-- =============================================================================

(38, 'Language',
 'Asks "why" questions and reasons about cause and effect',
 'Your child has entered the wonderful, relentless "why" phase — asking why about everything from gravity to grief. This reflects genuine intellectual curiosity, developing causal reasoning, and the beginning of philosophical thinking. "Why" questions also build sophisticated vocabulary when answered thoughtfully.',
 'Answer why questions genuinely, even when you don''t know: "I''m not sure — what do you think?" Models intellectual humility and curiosity. Use "because" frequently in your own speech: "I''m putting on a coat because it''s cold." Read non-fiction picture books about how things work. The questions will keep coming — so will the learning.',
 TRUE, FALSE),

(39, 'Motor',
 'Pedals a tricycle or balance bike',
 'Your child can coordinate the alternating leg movements needed to pedal a tricycle, or has developed the balance and steering ability to glide on a balance bike. Both require bilateral coordination, lower body strength, spatial awareness, and the courage to move through space at speed.',
 'Start with a balance bike if possible — children who learn on balance bikes typically skip training wheels entirely. Ensure the seat is low enough for both feet to touch the ground. A smooth, safe path works better than grass for learning. Helmet from day one normalises safety equipment. Celebrate progress over perfection.',
 TRUE, FALSE),

(38, 'Social-Emotional',
 'Understands rules and wants to follow them',
 'Your child begins to internalise social rules — not just following them to avoid consequences, but genuinely wanting to be seen as good and kind. They can explain simple rules to others, remind themselves of rules during play, and feel genuine pride when they follow through. Moral development is underway.',
 'State rules as positives when possible: "We walk near the pool" rather than "don''t run." Explain the reason behind rules at a level they can understand. Acknowledge when they follow a rule: "You waited for your turn — that was really mature." Avoid over-praising; specific, genuine acknowledgement is more powerful than general praise.',
 TRUE, FALSE),

(39, 'Cognitive',
 'Counts to 5 or more and understands one-to-one correspondence',
 'Your child can count a small set of objects by touching each one and saying a number — one number per object. This one-to-one correspondence is the conceptual foundation of mathematics. They may also recognise some numerals and understand "more" and "less" in concrete contexts.',
 'Count everyday things together: stairs, grapes, buttons on a coat. Subitising games — "how many?" for small groups of 1–4 — build number sense faster than rote counting. Board games with dice naturally teach counting. Avoid math worksheets: children this age learn number through hands-on, playful interaction with real objects.',
 TRUE, TRUE),

(39, 'Sensory',
 'Uses scissors with one hand to snip paper',
 'Your child is developing the hand dominance and bilateral coordination to hold paper with one hand while snipping with scissors in the other. This is a complex fine motor skill requiring hand strength, wrist stability, finger isolation, and crossing the midline. It''s one of the first true tool-use milestones.',
 'Use spring-loaded or loop scissors designed for children — they''re much easier to manage. Start with snipping straight lines across narrow strips of paper, then move to simple curves. Playdough, tearing paper, and lacing activities build the hand strength scissors require. Supervise closely and acknowledge their concentration.',
 TRUE, TRUE),

-- =============================================================================
-- BAND 9 — 42–48 months
-- =============================================================================

(45, 'Language',
 'Tells stories with a beginning, middle, and end',
 'Your child can now narrate a sequence of events in order, including what happened first, what came next, and how things ended. This narrative ability is one of the strongest predictors of later reading comprehension and academic success. They''re not just using language — they''re structuring thought.',
 'Tell stories together at bedtime: "Tell me one thing that happened today." Share family stories and read books with clear narrative structure. Ask "and then what happened?" to scaffold storytelling. Let them "read" familiar books back to you from memory. Puppet play and imaginative games also build narrative thinking.',
 TRUE, FALSE),

(44, 'Motor',
 'Hops on one foot several times in a row',
 'Your child can now balance on one foot and hop repeatedly — a skill requiring single-leg balance, explosive power, timing, and coordination. Hopping, skipping, and galloping at this age are all signs of a well-developing vestibular system and motor planning ability that will support sport, dance, and physical confidence for life.',
 'Practise hopping games: hop on one foot, then the other. Hopscotch is perfect for this age. Obstacle courses with hopping, jumping, and balancing challenges build motor confidence. Outdoor time every day with free, unstructured physical play is more important than any specific exercise programme.',
 TRUE, FALSE),

(44, 'Social-Emotional',
 'Names and communicates emotions with language',
 'Your child can now label their own emotions and begin to explain what caused them: "I''m sad because she took my toy." "I feel happy when we go to the park." This emotional vocabulary is transformative — naming an emotion activates the prefrontal cortex and literally reduces the intensity of the feeling.',
 'Build an emotion vocabulary: use feeling words naturally and specifically ("I feel frustrated when I can''t open the jar"). Read books with emotionally complex characters. Create a simple feelings chart together. When your child is dysregulated, naming the emotion for them helps: "It looks like you''re really frustrated right now — that makes sense." Validate before you solve.',
 TRUE, FALSE),

(46, 'Cognitive',
 'Recognises letters in their name and some numbers',
 'Your child begins recognising specific letters — usually starting with the letters in their own name — and identifying single-digit numbers. This emergent literacy and numeracy reflects growing phonological awareness and visual discrimination, laying the groundwork for formal reading and mathematics.',
 'Write their name and point to each letter regularly. Magnetic letters on the fridge make language tangible. Read alphabet books and point out letters in the environment: signs, cereal boxes, shop fronts. Avoid drilling or worksheets — curiosity-led letter exploration is far more effective and more enjoyable for everyone.',
 TRUE, TRUE),

(44, 'Sensory',
 'Draws a person with at least 3 body parts',
 'Your child''s drawing has evolved from scribbles to intentional representations — they can now draw a recognisable person with a head, body, arms, or legs. This reflects refined fine motor control, spatial reasoning, visual-motor integration, and the cognitive ability to plan and execute a complex sequence of marks.',
 'Provide a variety of mark-making tools: crayons, chunky markers, chalk on the path, paint. Ask them to tell you about their drawings rather than guessing — their interpretation is what matters. Display their artwork: it builds pride and motivation. Drawing, cutting, and playdough are all developing the same fine motor pathways.',
 TRUE, TRUE);
