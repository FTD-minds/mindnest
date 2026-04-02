-- MindNest — daily_activities seed data
-- 29 activities covering 0–36 months across 5 brain areas
-- Run after migrations: supabase db reset (local) or paste into Supabase SQL editor (remote)
-- Last updated: 2026-04-02

INSERT INTO public.daily_activities
  (title, description, instructions, min_age_months, max_age_months, duration_min, brain_area, materials_needed, is_premium)
VALUES

-- ── 0–3 months ─────────────────────────────────────────────────────────────

(
  'Face-to-Face Gazing',
  'Your face is your baby''s favorite thing in the world right now. This simple exercise builds the emotional foundation for all future relationships.',
  E'1. Hold your baby at arm''s length — about 8–12 inches from your face, which is the distance newborns focus best.\n2. Make soft, steady eye contact and let a gentle smile spread across your face.\n3. Hold the gaze for a few seconds, then slowly look away and look back — watch how your baby tracks you.\n4. Try raising your eyebrows slowly or opening your mouth wide. Give your baby a few seconds to respond — they may try to mimic you.\n5. Talk softly: "I see you. I love you." Repeat for 5–10 minutes or until baby looks away (that''s their signal they need a break).',
  0, 3, 10, 'Social-Emotional', '{}', FALSE
),

(
  'High-Contrast Card Exploration',
  'Newborn eyes are drawn to bold black-and-white patterns. Showing these cards gives their visual cortex a powerful early workout.',
  E'1. Print or purchase 4–6 high-contrast black-and-white cards (stripes, checkerboard, simple faces, spirals).\n2. Lay your baby on their back on a safe, flat surface.\n3. Hold one card about 8–12 inches from their face. Wait — watch their eyes lock on.\n4. Slowly move the card left and right. Notice how their gaze follows it.\n5. Switch to a new card every 30–60 seconds to maintain interest.\n6. Keep the session to 5–10 minutes. End while they''re still engaged, not fussy.',
  0, 3, 10, 'Sensory', ARRAY['High-contrast black-and-white cards (printed or purchased)'], FALSE
),

(
  'Narrate Your Day',
  'A rich verbal environment in the first months wires your baby''s brain for language long before they can speak a single word.',
  E'1. Simply talk to your baby throughout your normal routine — no special setup needed.\n2. Use a warm, slightly higher-pitched tone (this "motherese" is proven to capture infant attention).\n3. Be specific and descriptive: "Now I''m opening the fridge. Ooh, it''s cold! I''m taking out the milk — see? It''s white."\n4. Pause after sentences and look at your baby as if expecting a reply. This teaches the rhythm of conversation.\n5. Name objects, emotions, and actions as they happen: "You look sleepy. Your eyes are getting heavy."\n6. Aim for at least 15–20 minutes of narration throughout the day — it adds up quickly.',
  0, 3, 15, 'Language', '{}', FALSE
),

(
  'Supervised Tummy Time',
  'Just a few minutes of tummy time each day builds the neck, shoulder, and core strength your baby needs to roll, sit, and crawl.',
  E'1. Choose a time when your baby is awake, alert, and has not just eaten (30–45 min after a feed is ideal).\n2. Place baby face-down on a firm, flat surface — a play mat on the floor works perfectly.\n3. Get down on your belly at eye level. Talk, sing, or make faces to encourage them to lift their head.\n4. If baby fusses immediately, try starting on your chest — it''s a gentler introduction.\n5. Aim for 2–3 sessions of 2–5 minutes per day to start. Build up to 20–30 minutes total daily as they grow.\n6. Always stay right beside them. Never leave baby unattended during tummy time.',
  0, 3, 5, 'Motor', ARRAY['Firm play mat or blanket on the floor'], FALSE
),

-- ── 3–6 months ─────────────────────────────────────────────────────────────

(
  'Rattle Reach',
  'Watching something interesting and deciding to grab it is a huge cognitive and motor leap. This activity trains both at once.',
  E'1. Choose a lightweight, easy-grip rattle with a gentle sound.\n2. Hold the rattle about 6 inches above your baby''s chest while they lie on their back.\n3. Shake it gently so they hear and focus on it.\n4. Slowly lower it within arm''s reach. Wait — resist the urge to put it in their hand.\n5. If they reach toward it, let them grab it. Celebrate warmly: "You got it!"\n6. After a few seconds, gently take it back and repeat from a slightly different angle to challenge different arm movements.\n7. Do 5–8 repetitions, then let them hold and explore it freely.',
  3, 6, 10, 'Motor', ARRAY['Lightweight baby rattle'], FALSE
),

(
  'Mirror Play',
  'Babies are fascinated by faces — and a mirror gives them one to study anytime. This sparks self-awareness and joyful social engagement.',
  E'1. Hold your baby in front of a baby-safe mirror (unbreakable, mounted low on a wall or held safely).\n2. Let them stare — they won''t know it''s them yet, but the face is irresistible.\n3. Make an expression and point to it in the mirror: "Look! Mama is smiling!"\n4. Bring their hand to gently touch the mirror and watch their reaction.\n5. Bring your face into frame next to theirs: "There''s baby! There''s Mama!"\n6. Try making funny faces — big eyes, puffed cheeks, a big surprised "O." Watch for smiles and giggles.',
  3, 6, 10, 'Social-Emotional', ARRAY['Baby-safe unbreakable mirror'], FALSE
),

(
  'Copy That Sound',
  'When you echo your baby''s sounds back to them, you teach them the most important lesson in language: communication is a two-way street.',
  E'1. Wait for your baby to make a sound — any coo, gurgle, or "ah."\n2. Mirror it back immediately with the same pitch and energy. Look delighted when you do it.\n3. Pause and wait. Your baby will often respond with another sound. Echo that one too.\n4. Gradually try introducing a new sound after a few rounds — like "ba" or "ma" — and see if they attempt it.\n5. Keep sessions short, 5–10 minutes. If baby looks away or gets fussy, let them rest.\n6. Do this during diaper changes, feeds, or any quiet alert time throughout the day.',
  3, 6, 10, 'Language', '{}', TRUE
),

(
  'Texture Discovery Basket',
  'Introducing a variety of safe textures now stimulates your baby''s tactile system and builds the sensory foundation for later learning.',
  E'1. Gather 6–8 safe household items with interesting textures: a silky scarf, a rough washcloth, a smooth wooden spoon, a soft pompom, crinkly foil (supervised), a rubber spatula.\n2. Place them in a small basket or on a blanket in front of baby while they''re supported in a sitting position or lying on their tummy.\n3. Pick up one item at a time. Guide baby''s hand to touch it gently. Narrate: "This one is smooth and cool. This one is fluffy and soft."\n4. Watch their face and body — notice which textures get the biggest reactions.\n5. Let them bring items to their mouth (ensure all are clean and large enough to be safe).\n6. Rotate the items weekly to maintain novelty.',
  3, 6, 15, 'Sensory', ARRAY['Silky scarf', 'rough washcloth', 'smooth wooden spoon', 'soft pompom', 'rubber spatula', 'small basket'], TRUE
),

-- ── 6–9 months ─────────────────────────────────────────────────────────────

(
  'Peek-a-Boo with Objects',
  'When a toy disappears under a cloth and your baby looks for it, that''s object permanence clicking into place — a landmark cognitive milestone.',
  E'1. Sit face-to-face with your baby on the floor.\n2. Show them a favorite small toy. Let them touch it and confirm it''s interesting.\n3. Slowly cover the toy with a small cloth or lightweight blanket while they watch.\n4. Wait a beat. Ask: "Where did it go?" Watch their eyes — do they look at the cloth?\n5. If they reach for the cloth or look expectantly, immediately lift it: "There it is!"\n6. Celebrate every attempt enthusiastically, even if they didn''t find it themselves.\n7. Progress: hide the toy faster, or hide it under one of two cloths and see which one they choose.',
  6, 9, 10, 'Cognitive', ARRAY['Small favorite toy', 'lightweight cloth or baby blanket'], FALSE
),

(
  'Name That Object',
  'Pointing to objects and naming them repeatedly is one of the highest-impact language activities you can do at this age.',
  E'1. During your normal day, pause at objects and make them a teaching moment.\n2. Point clearly at the object, make eye contact with baby, then say its name slowly and warmly: "Dog. That''s a dog."\n3. Follow their gaze — if they''re already looking at something, name it. Joint attention like this is a language supercharger.\n4. Use the same words consistently. "Dog" every time, not "doggie" sometimes and "puppy" sometimes.\n5. Ask questions even though they can''t answer yet: "Do you see the tree? That''s a tree. It''s green."\n6. Aim to label 10–15 objects during a normal outing or walk. Make it a habit, not a special session.',
  6, 9, 15, 'Language', '{}', FALSE
),

(
  'Supported Sit and Reach',
  'Building independent sitting takes practice. This activity strengthens core and balance while keeping things playful and low-pressure.',
  E'1. Sit behind or beside your baby, ready to catch them. Place them in a sitting position on a soft mat.\n2. Place an interesting toy just outside their comfortable reach — to the side or slightly in front.\n3. Let them lean and reach for it. Provide the minimum support needed — a hand lightly on their hip or back.\n4. When they reach the toy, celebrate. Then move it to the other side to encourage reaching in the other direction.\n5. As their sitting improves, reduce your support and increase the distance of the toy.\n6. Keep sessions to 5–10 minutes to avoid frustration. Stop if baby slumps repeatedly — their core is tired.',
  6, 9, 10, 'Motor', ARRAY['Soft play mat', 'small interesting toy'], FALSE
),

(
  'Splash and Discover Water Play',
  'Water play is pure sensory magic — temperature, resistance, sound, and movement all in one. Bath time becomes a rich learning environment.',
  E'1. During bath time, add a few safe bath toys — cups, a small soft rubber duck, a lightweight sponge.\n2. Show baby how to splash by gently moving their hand through the water.\n3. Fill a cup and pour it slowly in front of them. Name it: "Water. Pour. Splash!"\n4. Let them bang the cup on the water surface. Don''t redirect — this is intentional cause-and-effect learning.\n5. Offer the sponge to squeeze. Help them feel the water release. "Squeeze! Water comes out."\n6. Always maintain one hand on baby. Never leave them unattended near water even for a moment.',
  6, 9, 15, 'Sensory', ARRAY['Bath tub or basin', 'small cups', 'soft rubber toys', 'soft sponge'], FALSE
),

-- ── 9–12 months ────────────────────────────────────────────────────────────

(
  'Stack and Knock Down',
  'Stacking blocks and knocking them over teaches cause-and-effect, hand-eye coordination, and the pure joy of making something happen.',
  E'1. Sit on the floor with your baby and 4–6 large, soft, or lightweight blocks.\n2. Start by slowly stacking 2 blocks in front of them. Make it dramatic: "One... two..." then gently knock it over: "Boom!"\n3. Rebuild and invite baby to knock it down. Guide their hand if needed the first time.\n4. Once they get the idea, start building taller towers — 3, 4 blocks — and let them topple it.\n5. Encourage them to try stacking too. Don''t correct or fix it — let them experiment.\n6. Narrate the whole time: colors, numbers, sounds. "Red block on top! Crash!"',
  9, 12, 15, 'Cognitive', ARRAY['Large soft or lightweight blocks (4–6)'], FALSE
),

(
  'Wave and Clap Imitation',
  'Copying gestures like waving and clapping is how babies learn that they can affect their social world — and it''s the on-ramp to language.',
  E'1. At natural moments — hellos, goodbyes, mealtimes — perform clear, exaggerated gestures.\n2. Wave slowly and clearly. Say: "Bye-bye!" Make it warm and fun, not instructional.\n3. Clap your hands in a rhythm and watch baby''s arms. They may bounce or attempt a clap.\n4. Hold baby''s hands and gently clap them together a few times, then release and wait to see if they continue.\n5. Cheer and mirror any attempt back: if they clap, you clap. If they wave one finger, wave one finger back.\n6. Practice at every natural opportunity — don''t set up a "lesson," just use life moments.',
  9, 12, 10, 'Social-Emotional', '{}', FALSE
),

(
  'Pincer Grasp Practice',
  'The pincer grasp — using just the thumb and index finger — is a precision motor skill that directly predicts future writing and tool-use ability.',
  E'1. Ensure baby is seated safely in a high chair or on your lap.\n2. Place 8–10 safe, age-appropriate puffs or small soft pieces of banana on the tray.\n3. Pick one up yourself using an exaggerated pincer grasp (thumb and forefinger), and name it: "Puff!"\n4. Place it on the tray and watch baby attempt to pick it up. Don''t assist unless they get very frustrated.\n5. Observe their technique — at first they may rake with their whole hand. That''s normal.\n6. As the skill develops, make the targets slightly smaller or space them further apart.\n7. Always supervise closely. Only use foods that dissolve quickly and are appropriate for your baby''s eating stage.',
  9, 12, 15, 'Motor', ARRAY['Baby food puffs or soft banana pieces cut small', 'high chair or safe seating'], TRUE
),

(
  'First Words Song Routine',
  'Singing the same songs every day creates a powerful language scaffold — familiar patterns help babies predict, recognize, and eventually produce words.',
  E'1. Choose 3–5 simple songs with repetitive, clear words: "Twinkle Twinkle," "Wheels on the Bus," "Old MacDonald."\n2. Sing them every day at the same time — morning wake-up, bath time, or before naps.\n3. Slow your tempo down slightly from the original. Exaggerate vowel sounds.\n4. Add gestures: point up on "twinkle," spin hands on "wheels on the bus."\n5. Pause before a familiar word and wait — over time, baby will fill in the blank.\n6. Don''t worry about your voice. Your baby only wants to hear YOU. Sing without apology.',
  9, 12, 10, 'Language', '{}', FALSE
),

-- ── 12–18 months ───────────────────────────────────────────────────────────

(
  'Crayon Scribble Time',
  'Scribbling isn''t just art — it''s your toddler''s first writing experience. Every mark they make builds hand strength and creative confidence.',
  E'1. Tape a large sheet of paper to the floor or low table surface (taping prevents frustrating sliding).\n2. Offer 2–3 chunky crayons — large-grip ones are easier for small hands.\n3. Sit beside your toddler and start scribbling yourself. Narrate: "I''m drawing a big circle. Scrub scrub scrub!"\n4. Let them draw completely freely. Don''t guide their hand or suggest what to draw.\n5. Comment on what they make: "You made a big red line! Look how far it goes!"\n6. When done, display their work — on the fridge, their bedroom wall — and tell them what it''s called. This builds pride and creative identity.',
  12, 18, 15, 'Cognitive', ARRAY['Large paper sheets', 'chunky crayons (washable)', 'tape'], FALSE
),

(
  'Water Pouring Play',
  'Pouring, filling, and dumping builds fine motor control, early math concepts (full/empty, more/less), and deep sensory satisfaction.',
  E'1. Set up in the bathtub or outside to contain the mess.\n2. Provide 4–5 containers of different sizes: a big cup, small cup, pitcher, bowl.\n3. Fill the bathtub with 2–3 inches of warm water, or use a large basin outside.\n4. Demonstrate pouring: slowly fill a small cup from a larger one. Narrate: "I''m filling it up... it''s full!"\n5. Let your toddler take over. Don''t correct — let them explore. Dumping everything at once is a completely valid experiment.\n6. Introduce vocabulary naturally: full, empty, heavy, light, pour, spill, more.',
  12, 18, 20, 'Sensory', ARRAY['Various-sized plastic cups and containers', 'bathtub or large basin'], FALSE
),

(
  'Indoor Obstacle Course',
  'Crawling over, under, and through obstacles builds gross motor strength, spatial awareness, and the confidence to navigate the world.',
  E'1. Clear a safe area and build a simple course using household items: a sofa cushion mountain to climb over, a blanket tunnel to crawl through, a tape line on the floor to walk along.\n2. Walk through it yourself first, narrating dramatically: "I''m climbing OVER the mountain... now I''m going THROUGH the tunnel!"\n3. Invite your toddler to follow you. Do it together the first few times.\n4. Add a "finish line" with a small reward — a hug, a sticker, a favorite toy waiting at the end.\n5. Let them run it repeatedly — toddlers love predictable challenges once they''ve mastered them.\n6. Change the course every few days to keep it novel.',
  12, 18, 20, 'Motor', ARRAY['Sofa cushions', 'blankets', 'masking tape', 'pillows'], TRUE
),

(
  'Feelings Check-In with Faces',
  'Naming emotions is one of the most powerful tools you can give a toddler. It reduces tantrums and builds lifelong emotional intelligence.',
  E'1. Create or print 4–6 simple emotion face cards: happy, sad, angry, surprised, scared, silly.\n2. Sit with your toddler and hold up one card at a time.\n3. Name the emotion and make the face yourself: "This is SAD. See? My face looks like this."\n4. Ask: "Can you make a sad face?" Laugh and celebrate any attempt — even silly ones.\n5. Connect to real moments: "Remember when you cried earlier? You felt SAD."\n6. Use the cards throughout the day when real emotions arise: "You look FRUSTRATED. I feel that way too sometimes."\n7. Over time, ask "How are you feeling?" and let them point to a card instead of words.',
  12, 18, 15, 'Social-Emotional', ARRAY['Printed or purchased emotion face cards'], TRUE
),

-- ── 18–24 months ───────────────────────────────────────────────────────────

(
  'Simple Shape and Color Sorting',
  'Sorting objects by a rule is one of the earliest signs of logical thinking. This activity makes abstract concepts concrete and hands-on.',
  E'1. Gather 10–12 objects in 2–3 colors (red and blue blocks, yellow and green pompoms).\n2. Place two empty containers or sections of a muffin tin — one for each color.\n3. Pick up a red item. Say clearly: "Red goes here," and place it in the red container.\n4. Hand your toddler an object. Ask: "Where does this one go?" Wait — don''t rush to help.\n5. Celebrate every attempt. If they put it in the wrong section, stay curious not corrective: "Hmm, let''s look — are these the same color?"\n6. Progress: add a third color, or sort by shape instead once colors click.',
  18, 24, 15, 'Cognitive', ARRAY['Blocks or objects in 2–3 colors', 'small containers or muffin tin'], FALSE
),

(
  'Action Songs with Movements',
  'Pairing words with actions is one of the most effective language-learning strategies known to developmental science. Plus, it''s wildly fun.',
  E'1. Choose 3–4 action songs: "Head, Shoulders, Knees and Toes," "If You''re Happy and You Know It," "The Hokey Pokey."\n2. Stand up and do the full actions yourself with big, clear movements.\n3. Invite your toddler to join. Don''t correct wrong movements — just keep modeling.\n4. Slow the song down significantly so actions and words align. Speed up as they get more confident.\n5. Pause at a key word and wait for them to fill it in or do the action.\n6. Do this daily — in the morning, after naps, or as a transition activity before meals. Repetition is the point.',
  18, 24, 15, 'Language', '{}', FALSE
),

(
  'Playdough Squeeze and Create',
  'Playdough builds hand and finger strength essential for writing, while open-ended creation develops imagination with zero wrong answers.',
  E'1. Offer a fist-sized ball of playdough (homemade or store-bought — both work great).\n2. Sit beside your toddler and start exploring it yourself. Poke it, roll it, squeeze it flat.\n3. Narrate what you''re doing: "I''m squeezing it really hard. Now I''m rolling it into a snake!"\n4. Let your toddler lead completely. Don''t demonstrate a final product for them to copy.\n5. Introduce simple tools after a few minutes: a plastic fork to press patterns, a small rolling pin, a cup to press a circle.\n6. Name what they make even if you''re guessing: "Oh wow — is that a pizza? A mountain?" Let them own the narrative.',
  18, 24, 20, 'Motor', ARRAY['Playdough (homemade or store-bought)', 'plastic fork', 'small rolling pin', 'cup'], FALSE
),

(
  'Emotion Story Time',
  'Books about feelings give toddlers the language and framework to understand their big internal experiences at the exact moment they need it most.',
  E'1. Choose a picture book that centers on emotions — "The Feeling Book," "When Sophie Gets Angry," or "In My Heart" all work beautifully.\n2. Sit together in a cozy spot. Read slowly, pausing at each emotion page.\n3. Point to the character''s face: "Look at her face. How do you think she feels?"\n4. Make the emotion face yourself. Invite your toddler to copy it.\n5. Connect to their experience: "You felt angry like Sophie this morning when we had to stop playing. That''s really hard."\n6. Let them dictate the pace — if they want to linger on a page, stay there. If they want to skip ahead, follow them.',
  18, 24, 15, 'Social-Emotional', ARRAY['Picture book focused on emotions (library or purchased)'], TRUE
),

-- ── 24–36 months ───────────────────────────────────────────────────────────

(
  'Pretend Play Kitchen',
  'Make-believe cooking is serious business for a 2-year-old. It builds language, creativity, sequencing skills, and early math all at once.',
  E'1. Set up a "kitchen" with safe household items: pots, wooden spoons, plastic containers, play food or real pantry items like dried pasta.\n2. Start playing yourself. "I''m making soup! First I add water... now I stir... it smells so good!"\n3. Invite your toddler to join and immediately give them a role: "Can you add the vegetables? We need to stir it."\n4. Ask open-ended questions: "What should we make? Who are we cooking for? Is it spicy or sweet?"\n5. Extend the play: set a table, pretend to serve, eat together, wash up after.\n6. Follow their lead completely — if soup becomes a birthday cake, happily go with it.',
  24, 36, 25, 'Cognitive', ARRAY['Small pots and pans (child-safe)', 'wooden spoons', 'plastic containers', 'play food or dried pasta'], TRUE
),

(
  'Nursery Rhyme and Rhyme Hunt',
  'Recognizing that words rhyme is a foundational pre-reading skill. Making it a game at this age means reading will feel natural when school begins.',
  E'1. Start with a classic rhyme your toddler already knows: "Jack and Jill," "Humpty Dumpty," "Little Miss Muffet."\n2. Recite it together. Then pause before a rhyming word and wait for them to fill it in.\n3. Make it silly: "Jack and Jill went up the... HILL. Let''s think of other words that sound like hill — fill, bill, will, SILLY!"\n4. Invent your own silly rhymes together using their name: "Mia, Mia, ate a... PIZZA!"\n5. Play "does this rhyme?" — "Cat and bat — do those rhyme? Cat and dog — do those rhyme?"\n6. Keep it playful. Laugh at the silly sounds. The fun is the point.',
  24, 36, 15, 'Language', '{}', FALSE
),

(
  'Nature Sensory Walk',
  'Taking your toddler outside to touch, smell, and collect things from nature builds sensory vocabulary, curiosity, and a lifelong love of the world.',
  E'1. Head outside to a park, yard, or any green space. Bring a small bag or basket for collecting.\n2. Move slowly — let your toddler set the pace. Resist the urge to have a destination.\n3. Stop whenever they stop. If they''re staring at a bug for 4 minutes, stare with them.\n4. Encourage touching safe natural objects: tree bark, smooth rocks, soft grass, fallen leaves.\n5. Narrate the sensory experience: "That rock is cold and bumpy. That leaf is dry and crinkly."\n6. Let them collect a few treasures to bring home. Lay them out and explore together when you''re back.',
  24, 36, 30, 'Sensory', ARRAY['Small bag or basket for collecting', 'comfortable outdoor clothes'], FALSE
),

(
  'Turn-Taking Building Game',
  'Learning to share attention and take turns is one of the hardest social skills toddlers face. Making it a predictable game makes it feel safe and even fun.',
  E'1. Sit across from your toddler with a pile of 10–15 blocks between you.\n2. Establish the rule clearly: "We''re going to take turns adding one block. I go first, then you go."\n3. Add your block. Say "my turn" as you place it. Then clearly say "your turn" and wait.\n4. When they add their block, celebrate: "Yes! The tower is getting taller!"\n5. If they try to grab extra blocks or knock it down before it''s their turn, stay calm: "One block each. It''s my turn now."\n6. When the tower falls, celebrate the crash and start over together.\n7. Progress: move to turn-taking in other contexts — rolling a ball, drawing on the same paper.',
  24, 36, 15, 'Social-Emotional', ARRAY['Building blocks (10–15)'], FALSE
),

(
  'My Feelings Drawing Journal',
  'Giving your toddler a safe space to draw their feelings each day builds emotional literacy, self-reflection, and early narrative skills.',
  E'1. Set up a dedicated feelings journal — a simple notebook works perfectly. Let your toddler decorate the cover with stickers or crayons.\n2. Make it a daily ritual: after lunch or before bed is ideal. Keep it consistent so it becomes a trusted routine.\n3. Ask: "How are you feeling today?" Don''t prompt an answer — just wait.\n4. Whatever they say, respond: "Let''s draw that feeling. What color does happy/sad/silly feel like to you?"\n5. Draw together — you in your journal, them in theirs. Model that adults have feelings too.\n6. After drawing, ask: "Can you tell me about your picture?" Write their words at the bottom, read it back to them.\n7. Revisit old pages occasionally: "Look — remember when you felt excited about the playground?"',
  24, 36, 20, 'Social-Emotional', ARRAY['Small notebook or journal', 'crayons or markers (washable)', 'stickers (optional)'], TRUE
);
