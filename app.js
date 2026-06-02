/* ============================================================
   watermellie // workspace  —  app.js
   Vanilla ES6+ SPA · hash routing · localStorage single source.
   Routes:  #dashboard   #work[/lesson/<id>|/journal/<id>]   #personal
   ============================================================ */

(() => {
  'use strict';

  /* ==========================================================
     0 · Constants
     ========================================================== */
  const LS_KEY = 'wsi_intern_workspace';
  const ROLLOVER_HOUR = 3;                 // canvases compile fresh at 3:00 AM
  const PERSONAL_TAGS = ['gym', 'journal', 'breakfast', 'lunch', 'dinner', 'snack'];
  const GYM_CHECKLIST = ['stairmaster', 'treadmill', 'arm workout', 'core', 'glutes', 'legs'];
  const SF = { lat: 37.7749, lon: -122.4194, city: 'san francisco' };
  const WEATHER_TTL = 10 * 60 * 1000;      // refresh weather every 10 min

  const JOURNAL_PROMPTS = [
    'how are you feeling today?',
    'anything on your mind?',
    'any progress on personal projects?',
    'what are you focusing on today?',
    "what's one thing you're grateful for right now?",
    'what drained you today, and what restored you?',
    'what would make today feel meaningful?',
    'where did you grow this week?',
    'what are you avoiding, and why?',
    "what's a small win you can acknowledge?",
    'who or what are you thankful for today?',
    'what does your future self need you to do right now?',
    'what is within your control today, and what isn’t?',
    'what gave you a sense of purpose recently?',
    // ── reflection ──
    'what did today teach you about yourself?',
    'what felt heavy today, and what felt light?',
    'if today had a title, what would it be?',
    'what would you do differently if you could replay today?',
    'what moment from today do you want to remember?',
    'what story are you telling yourself right now — is it true?',
    'what did you need today that you didn’t ask for?',
    // ── self-awareness ──
    'what emotion has been visiting you most lately, and what is it telling you?',
    'where in your body do you feel your stress, and what eases it?',
    'what pattern do you keep repeating, and where did it come from?',
    'when did you feel most like yourself recently?',
    'what do you tend to hide from others, and why?',
    'what boundary do you need to set, or honor?',
    'what are you pretending not to know?',
    'whose approval are you seeking, and do you actually need it?',
    // ── purpose & values ──
    'what kind of person are you becoming?',
    'what matters to you that you’ve been neglecting?',
    'if fear weren’t a factor, what would you start?',
    'what does a meaningful life look like to you this season?',
    'what would you regret not trying?',
    'what work makes you lose track of time?',
    'what legacy do you want today to be a small part of?',
    'what does “enough” look like for you right now?',
    // ── growth & gratitude ──
    'what strength did you use today without noticing?',
    'who do you want to thank, and have you told them?',
    'what challenge is quietly shaping you?',
    'what’s one belief you’ve outgrown?',
    'what would make tomorrow 1% better?',
    'what are you proud of that no one else saw?',
  ];

  const CURRICULUM_BASE = [
    {
      day: 0, week: 1,
      title: 'The WSI Universe: Brands, Buyers & the 2026 AI Landscape',
      coreConcept: `Before you deconstruct a single brand or design a single screen, you need the map of the territory. Williams-Sonoma, Inc. is a "house of brands" competing across price tiers and life stages, ringed by a direct rival (Crate & Barrel) and indirect ones (Muji, IKEA) — each placing a different bet on price, digital value, and 2026 AI/spatial tech. This orientation hands you the strategic context the rest of the curriculum quietly assumes: who each brand serves, where it sits on price and digital-value, and how AI (Olive, Design Services 3.0, AR/3D planners, IKEA Kreativ) is reshaping the category. A designer who can hold this whole landscape in their head designs decisions, not just screens.`,
      objectives: [
        'Explain the positioning of all six brands in the landscape — the WSI core three (Williams Sonoma, Pottery Barn, West Elm) plus Crate & Barrel, Muji, and IKEA — across target demographic, price point, and core digital value proposition.',
        'Plot the brands on a two-axis positioning (perceptual) map and articulate where WSI’s banners cluster, where competitors apply pressure, and where there is whitespace.',
        'Distinguish direct (Crate & Barrel) from indirect (Muji, IKEA) competitors and explain why each still matters to a WSI UX designer.',
        'Summarize each brand’s 2026 AI/tech footprint (Olive, Design Services 3.0 generative planning, mobile/social acquisition, spatial computing/AR, IKEA Kreativ) and what it signals about where the category is heading.',
        'Produce a one-page competitive landscape map + positioning matrix you keep as a reference for the rest of the curriculum.',
      ],
      wsiContext: `Williams-Sonoma, Inc. deliberately runs a "house of brands," not a single label: Williams Sonoma (premium culinary authority, ages 30–65, high-frequency gift + registry buyers), Pottery Barn (premium-mainstream American-casual heritage for affluent suburban families 30–55), and West Elm (accessible-premium mid-century-modern for urban professionals and first-time buyers 25–40). Each banner owns a different life stage and price tier so the portfolio covers the customer's whole lifetime without the brands cannibalizing each other. Around them: Crate & Barrel is the closest DIRECT competitor (overlaps both PB and West Elm, mid-high price, investing hard in proprietary spatial/AR visualization); Muji and IKEA are INDIRECT — different price floors and value props (Muji = low-mid, unbranded functional calm; IKEA = low, mass-market modular self-service with AI room scanning) — but they shape category-wide expectations for what "designing a room online" should feel like. The 2026 throughline is that AI is moving from search to intent and from flat catalogs to spatial: WSI's bet is Olive, an AI culinary companion that leans on category authority to guide intent, while competitors bet on spatial computing. Knowing this map is what lets you argue why a given UX decision fits WSI's strategy rather than a competitor's.`,
      steps: [
        {
          title: 'Internalize the landscape: build your six-brand reference table',
          time: '30 min',
          detail: `Recreate the competitive landscape as your own one-page table with five columns — Brand · Target demographic · Price point · Core digital value proposition · 2026 AI/tech footprint — and six rows: Williams Sonoma, Pottery Barn, West Elm, Crate & Barrel, Muji, IKEA. Fill it from the briefing data and the docs below, but rewrite every cell in your own words (copying teaches nothing). As you go, mark each brand DIRECT or INDIRECT to WSI and jot a one-line "why it matters." Pay attention to the deliberate spread: WSI's three banners ladder up a price/life-stage curve (West Elm → Pottery Barn → Williams Sonoma) while Crate & Barrel sits right on top of the PB/West Elm overlap, and Muji/IKEA anchor the value floor. This table is the backbone of everything you build today.`,
          resources: [
            { title: 'Williams-Sonoma, Inc. — Wikipedia (portfolio, brands, revenue, strategy)', type: 'doc', url: 'https://en.wikipedia.org/wiki/Williams-Sonoma,_Inc.' },
            { title: 'West Elm — Wikipedia (mid-century-modern, Millennial target, sustainability)', type: 'doc', url: 'https://en.wikipedia.org/wiki/West_Elm' },
            { title: 'Pottery Barn Marketing Strategy (positioning, good-better-best, segments)', type: 'doc', url: 'https://www.latterly.org/pottery-barn-marketing-strategy/' },
            { title: 'MUJI — the global strategy behind the Japanese "no-brand brand" (Martin Roll)', type: 'article', url: 'https://martinroll.com/resources/articles/strategy/muji-the-global-strategy-behind-the-japanese-no-brand-brand/' },
          ],
        },
        {
          title: 'Learn the tool: competitive analysis & positioning maps for UX',
          time: '40 min',
          detail: `A landscape table lists facts; a competitive analysis turns them into a point of view. Watch the two videos to learn (1) how UX designers actually run a competitive analysis and (2) how a perceptual/positioning map converts attributes into a picture you can act on. Then skim the NN/g and Baymard pieces for the rigor: pick task-based, comparable dimensions; separate "direct" from "indirect" competitors; look for patterns, gaps, and conventions rather than just screenshotting. Note the core idea of a positioning map: choose two axes that genuinely matter to the buyer, place each brand by where customers perceive it, and read the clusters (crowded = competitive, empty = whitespace or no-demand). Write down the two axes you'll use in the next step.`,
          resources: [
            { title: 'Competitive Analysis Guide for UX Designers (YouTube)', type: 'video', url: 'https://www.youtube.com/watch?v=Vl0m3Y3hg80' },
            { title: 'Perceptual Mapping & Product Positioning Explained (YouTube)', type: 'video', url: 'https://www.youtube.com/watch?v=xJUrBylId7I' },
            { title: 'Competitive Usability Evaluations — Nielsen Norman Group', type: 'doc', url: 'https://www.nngroup.com/articles/competitive-usability-evaluations/' },
            { title: 'The Step-by-Step Guide to UX Competitive Analysis — Baymard', type: 'doc', url: 'https://baymard.com/learn/competitive-analysis-ux' },
          ],
        },
        {
          title: 'Map the territory: plot the positioning matrix',
          time: '45 min',
          detail: `On paper or in Figma, draw two axes and place all six brands as labeled dots. A strong pairing for this category: X = price tier (value → premium) and Y = digital value proposition (functional/utility ↔ experiential/aspirational). Place Williams Sonoma (premium + experiential, anchored by culinary authority and content), Pottery Barn (premium-mainstream, experiential-heritage), West Elm (mid, editorial/trend-forward but more transactional and mobile-social), Crate & Barrel (mid-high, leaning experiential via polished spatial tools), Muji (low-mid, deliberately functional/calm), and IKEA (low, highly functional/self-service). Now read the map like an analyst: Where do WSI's three banners cluster, and is the spacing between them healthy or do any overlap/cannibalize? Where does Crate & Barrel sit relative to PB and West Elm (this is your direct-threat zone)? Is there visible whitespace no one owns? Annotate 2–3 observations directly on the map — these become your insight callouts.`,
          resources: [
            { title: 'How to Use Perceptual Mapping to Assess Your Competition — HBS Online', type: 'doc', url: 'https://online.hbs.edu/blog/post/perceptual-map' },
          ],
        },
        {
          title: 'Decode the 2026 AI / tech footprint',
          time: '40 min',
          detail: `Add an AI lens to your map. For each brand, name its 2026 bet and what it reveals about strategy: Williams Sonoma → Olive, an AI culinary companion that uses category authority to understand intent and guide lifestyle/cooking problems (intent + content, not just visualization); Pottery Barn → Design Services 3.0, where store associates use generative space-planning tools (human + AI hybrid service); West Elm → a rapid, mobile/social-optimized acquisition funnel (speed-to-cart for younger buyers); Crate & Barrel → proprietary spatial-computing / AR visualization apps (own the in-room preview); IKEA → IKEA Kreativ, AI/computer-vision room scanning that erases and re-furnishes your real space (mass-market spatial); Muji → light personalization that leans on the physical store and product calm rather than software. The strategic read: the category is splitting into an intent/authority bet (WSI/Olive) and a spatial/visualization bet (Crate & Barrel, IKEA). Capture, in two sentences, where WSI is differentiated and where it is exposed.`,
          resources: [
            { title: 'Williams-Sonoma aims to infuse product authority into AI experiences (Olive, CTO on "category authority")', type: 'article', url: 'https://www.customerexperiencedive.com/news/williams-sonoma-product-authority-ai-experience/815133/' },
            { title: 'IKEA launches AI-powered IKEA Kreativ — Scene Scanner room design (IKEA newsroom)', type: 'article', url: 'https://www.ikea.com/us/en/newsroom/corporate-news/ikea-launches-new-ai-powered-digital-experience-empowering-customers-to-create-lifelike-room-designs-pub58c94890/' },
            { title: 'View in Your Room — Crate & Barrel augmented reality (the spatial bet, hands-on)', type: 'doc', url: 'https://www.crateandbarrel.com/special-features/augmented-reality/' },
          ],
        },
        {
          title: 'Build the one-page landscape map in Figma',
          time: '45 min',
          detail: `Assemble your work into one reusable reference frame. Compose three regions: (1) the POSITIONING MAP — two labeled axes with all six brands as dots, WSI's three banners visually distinguished (e.g., one accent color) from competitors (a neutral); (2) a compact COMPARISON TABLE — the six rows × five columns from Step 1, tightened to phrases not paragraphs; (3) 2–3 INSIGHT CALLOUTS — short "so what" statements that tie the map to a UX implication for WSI (a strength to protect, a Crate & Barrel threat, or a whitespace opportunity). Keep type and spacing clean and consistent (this is a reference you'll reopen all curriculum long). Export a PNG and grab the Figma share link for your dashboard submission.`,
          resources: [
            { title: 'UX Competitive Analysis — template & example (UXtweak)', type: 'doc', url: 'https://blog.uxtweak.com/competitive-analysis-in-ux-research/' },
          ],
        },
      ],
      figmaExercise: {
        brief: `Build a single-frame "WSI Competitive Landscape" reference in Figma with three parts: (a) a POSITIONING MAP with two clearly-labeled axes (suggested: price tier value→premium on X, functional↔experiential digital value on Y) and all six brands plotted as labeled dots, with WSI's three banners visually distinct from the three competitors; (b) a COMPARISON TABLE of six rows (Williams Sonoma, Pottery Barn, West Elm, Crate & Barrel, Muji, IKEA) × five columns (target demographic, price point, core digital value proposition, direct/indirect, 2026 AI/tech bet); and (c) 2–3 INSIGHT CALLOUTS that each connect the map to a concrete UX implication for WSI (a strength to protect, a competitor threat, or a whitespace opportunity). Keep it clean, consistent, and reference-grade — you'll reopen this throughout the curriculum.`,
        deliverable: 'A one-frame Figma "WSI Competitive Landscape" (positioning map + comparison table + 2–3 insight callouts). Upload a screenshot (PNG) AND the Figma share link to your dashboard.',
      },
      output: 'A one-page WSI competitive landscape reference (Figma): a two-axis positioning map of all six brands, a six-row comparison table, and 2–3 strategic insight callouts — kept as a reference for the rest of the curriculum.',
      feedbackCriteria: [
        'All six brands are plotted on a positioning map with two clearly-labeled axes, and WSI’s three banners are visually distinguishable from the three competitors.',
        'The comparison table accurately captures each brand’s target demographic, price point, and core digital value proposition — matching the landscape data, with no invented facts.',
        'Direct vs. indirect competitors are correctly identified (Crate & Barrel = direct; Muji + IKEA = indirect) with a one-line rationale for each.',
        'Each brand’s 2026 AI/tech bet is named correctly (Olive; Design Services 3.0 generative planning; West Elm mobile/social acquisition; Crate & Barrel spatial/AR; IKEA Kreativ AI room scan; Muji minimal personalization + physical store).',
        'At least two "so what" insight callouts connect the map to a specific UX implication for WSI (a strength, a threat, or a whitespace opportunity) — not generic observations.',
      ],
    },
    { day:1, week:1, title:'Brand Deconstruction & The Phygital Experience',
      coreConcept:'Understand the distinct brand identities and spatial footprints of WSI vs its competitors.',
      output:'A 3-slide comparative teardown deck mapping store atmosphere to web UI tone for WSI’s core three brands.' },
    { day:2, week:1, title:'Advanced AI Prompt Engineering & WSI Context',
      coreConcept:'Move from AI as a search tool to AI as a collaborative design co-pilot.',
      output:'A personalized Prompt Library markdown file with 5 specialized prompts for retail UX ideation & synthesis.' },
    { day:3, week:1, title:'Conversational UI & Deconstructing “Olive”',
      coreConcept:'Map user experience within conversational agents.',
      output:'A user-flow diagram of ideal vs failed conversation loops for an AI culinary assistant.' },
    { day:4, week:1, title:'High-Ticket Checkout & Cart Mechanics',
      coreConcept:'Audit the multi-brand unified cart (buy West Elm + Williams Sonoma in one checkout).',
      output:'2 clear UX micro-frictions in the multi-brand checkout flow + wireframe alternatives.' },
    { day:5, week:1, title:'Figma Component Systems & Design System Operations',
      coreConcept:'Design for scale using rigid, tokenized design systems.',
      output:'A Figma file demonstrating auto-layout 5.0 and component variables (a tokenized product card).' },
    { day:6, week:2, title:'Cross-Brand Navigation Systems',
      coreConcept:'Design a global header that anchors multiple distinct retail brands under one umbrella.',
      output:'A hi-fi UI redesign of the WSI cross-brand navigation bar optimized for mobile web.' },
    { day:7, week:2, title:'Design Services 3.0 & AR Space Planning',
      coreConcept:'Design interfaces that bridge the physical home with digital spatial-planning tools.',
      output:'A wireframed dashboard where a customer’s style profile is pre-synthesized by an AI agent.' },
    { day:8, week:2, title:'Data-Driven Design & The Metrics Workshop',
      coreConcept:'Translate user pain points into quantifiable business problems.',
      output:'A reusable performance-focused design brief template (ties changes to CR / AOV / abandonment).' },
    {
      day: 9, week: 2,
      title: 'User Research & Usability Testing',
      exerciseLabel: 'research deliverable',
      coreConcept: `So far you’ve researched the market and designed solutions — but a designer’s most trusted skill is learning directly from real users. This lesson is primary research: you’ll write a usability test, recruit ~5 people, run a think-aloud session on a flow YOU designed earlier this week (your Day 4 checkout fix or Day 6 navigation), and synthesize what you see into severity-ranked issues and concrete fixes. You’ll also pick up user-interview craft (open-ended questions, probing for the “why”). On a premium, design-led team like WSI, this is how opinions lose to evidence: you prove a change reduces friction before engineering builds it. (In real projects research also happens up front — here it lands after the build days so you have something real to test.)`,
      objectives: [
        'Distinguish usability testing from interviews and surveys, and know when each is the right tool.',
        'Write a usability test plan: a clear goal, 3–5 realistic unbiased tasks, and a facilitator script.',
        'Recruit ~5 representative users and run a think-aloud session without leading them.',
        'Use open-ended interview technique (how/what questions, probing) to uncover the “why” behind behavior.',
        'Synthesize findings into severity-ranked issues, each mapped to a concrete design fix.',
      ],
      wsiContext: `Williams-Sonoma, Inc. is premium, design-led, and digital-first (~65% of revenue is e-commerce), so small funnel frictions cost real money — the home/furniture category sees ~80% cart abandonment, and WSI’s most-cited complaint is late-revealed shipping cost. On a team like this, design reviews are won with evidence, not taste: usability testing is how you’d demonstrate that a checkout or Olive change actually reduces friction before it’s engineered. Crucially, Jakob Nielsen’s research shows just five users surface the large majority of usability problems — so even a scrappy, five-person think-aloud on one of your own designs gives you a quantified, user-grounded story that strengthens both the work and your return-offer case.`,
      steps: [
        { title: 'Why primary research — and why only 5 users', time: '30 min',
          detail: `Ground yourself in the method. Read NN/g’s Usability Testing 101 and the classic “why you only need to test with 5 users,” and learn the think-aloud technique (ask participants to narrate their thoughts while doing tasks). Key mindset: you are testing the DESIGN, not the person; you watch what they DO, not just what they say; and five representative users reveal ~85% of the issues, so you don’t need a huge study to get real signal.`,
          resources: [
            { title: 'Usability (User) Testing 101 (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/usability-testing-101/' },
            { title: 'Why You Only Need to Test with 5 Users (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/' },
            { title: 'Thinking Aloud: the #1 usability tool (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/' },
          ] },
        { title: 'Pick a flow to test + write your test plan', time: '35 min',
          detail: `Choose ONE flow you already designed this week — your Day 4 multi-brand checkout fix or your Day 6 cross-brand navigation. Write a one-line GOAL (“can a first-time shopper add a West Elm sofa and a Williams Sonoma item and reach checkout without confusion about total cost?”) and 3–5 realistic, UNBIASED TASKS phrased as goals not instructions (say “buy a sofa and a gift for a friend,” not “click the cart icon”). Skim the 12-step guide for the full plan→run→analyze loop.`,
          resources: [
            { title: '12 Steps for Usability Testing: plan, run, analyze, report (UX Tigers)', type: 'doc', url: 'https://www.uxtigers.com/post/user-testing' },
          ] },
        { title: 'Write your facilitator script', time: '30 min',
          detail: `A script keeps every session consistent and bias-free. Draft: a warm welcome (“there are no wrong answers; we’re testing the design, not you — please think aloud”), the tasks one at a time, think-aloud nudges (“what are you expecting here?”, “what would you do next?”), and short post-task questions. Avoid leading (“was that easy?”) and closed yes/no questions. Use NN/g’s interview-guide guidance to structure it.`,
          resources: [
            { title: 'Writing an Effective Guide for a UX Interview (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/interview-guide/' },
          ] },
        { title: 'Learn interview craft: open-ended + probing', time: '25 min',
          detail: `Usability tasks tell you WHAT breaks; interview questions tell you WHY. Learn to favor “how” and “what” over “do/did,” use prompts like “tell me about the last time you bought furniture online,” and PROBE on what they say (“why do you think that?”, “tell me more”). These keep you from leading the witness and surface mental models you didn’t expect — gold for your synthesis.`,
          resources: [
            { title: 'User Interviews 101 (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/user-interviews/' },
            { title: 'Open-Ended vs. Closed Questions in User Research (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/open-ended-questions/' },
          ] },
        { title: 'Run a 5-user think-aloud test', time: '60 min',
          detail: `Recruit ~5 people who fit the shopper profile (classmates/friends who shop online are fine for practice). Run each session the same way using your script: set them at ease, give one task at a time, stay quiet and let them struggle a little (silence is data), and take timestamped notes on where they hesitate, backtrack, or misread. In person or remote both work — for remote, a free tool or a screen-share call is plenty. Watch the step-by-step walkthrough first if you’ve never facilitated.`,
          resources: [
            { title: 'How to Conduct Usability Testing — step by step (YouTube)', type: 'video', url: 'https://www.youtube.com/watch?v=xuq4mTh50p4' },
            { title: 'Usability testing guide (remote tools) — Maze', type: 'doc', url: 'https://maze.co/guides/usability-testing/' },
          ] },
        { title: 'Synthesize: severity-rank issues → fixes', time: '35 min',
          detail: `Turn observations into action. Cluster what you saw into distinct issues (e.g., “3/5 didn’t notice shipping cost until the final step”). Rank each by SEVERITY using Nielsen’s 0–4 scale (0 = not a problem, 4 = usability catastrophe), weighing frequency × impact. Then map each high-severity issue to a CONCRETE design fix in the flow you tested. This severity-ranked findings → fixes table is exactly what you’d present in a WSI design review — and a perfect artifact for your Day 10/11 case study.`,
          resources: [
            { title: 'Severity Ratings for Usability Problems (NN/g)', type: 'doc', url: 'https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/' },
          ] },
      ],
      figmaExercise: {
        brief: 'Produce a usability test report (FigJam, Figma, or a doc) for one flow you designed this week (Day 4 checkout or Day 6 nav). It must include: the GOAL, 3–5 realistic unbiased TASKS, your facilitator SCRIPT, the key findings from ~5 sessions, a SEVERITY-RANKED issues table (Nielsen 0–4), and 2–3 prioritized DESIGN FIXES tied to specific findings. Bonus: one annotated before/after of a fix you’d make.',
        deliverable: 'Upload a screenshot of your usability test report (script + severity-ranked findings + fixes) and a share link to your dashboard.',
      },
      output: 'A usability test plan + report on a flow you designed: goal, tasks, facilitator script, ~5-session findings, a severity-ranked issues table, and 2–3 prioritized design fixes.',
      feedbackCriteria: [
        'The test plan has a clear goal and 3–5 realistic, unbiased tasks (phrased as goals, not click-by-click instructions).',
        'The facilitator script uses the think-aloud method and avoids leading or closed yes/no questions.',
        'There is evidence of ~5 sessions (notes or recordings) on a flow you actually designed earlier in the curriculum.',
        'Findings are severity-ranked (Nielsen 0–4), not a flat list, and each high-severity issue maps to a concrete design fix.',
        'At least two questions used are genuinely open-ended (how/what, “tell me about a time…”).',
      ],
    },
    { day:10, week:2, title:'The Final Pitch Prep & Portfolio Scaffolding',
      coreConcept:'Set up your documentation framework before day one.',
      output:'An empty, ready-to-fill case-study layout (Problem, Research, Constraints, Iterations, Metrics).' },
    { day:11, week:2, title:'Capstone: Your Portfolio Story & Return-Offer Pitch',
      coreConcept:'Synthesize the week into a told story: a 3-artifact portfolio walkthrough, X-Y-Z impact bullets, a mock critique, and a return-offer game plan.',
      output:'A rehearsed portfolio walkthrough deck + three X-Y-Z impact bullets + a one-page return-offer plan.' },
  ];

  /* ===== Financial-literacy track — a separate, self-paced starter curriculum ===== */
  const FINANCE_BASE = [
    {
      slug: 'budgeting', n: 1,
      title: 'Money Foundations: Budgeting & Cash Flow',
      exerciseLabel: 'this week’s exercise',
      coreConcept: `The whole of personal finance starts with one honest question: what comes in, and where does it go? Before investing or paying down debt, you build a budget — a plan that gives every dollar a job. Today you’ll see your real spending, learn the simple 50/30/20 framework (50% needs, 30% wants, 20% savings/debt), and build a monthly budget you’ll actually keep. This isn’t about restriction; it’s about telling your money where to go instead of wondering where it went.`,
      objectives: [
        'Track one to two months of real income and spending and sort it into needs, wants, and savings/debt.',
        'Explain the 50/30/20 framework and why it flexes to your situation (e.g., high rent, aggressive saving).',
        'Build a monthly budget from your actual take-home (net) pay.',
        'Set up one automatic transfer to savings and identify one recurring “want” to trim.',
      ],
      steps: [
        { title: 'See where your money actually goes', time: '30 min',
          detail: `Open your bank and credit-card statements for the last one to two months and list every expense. Sort each into three buckets: NEEDS (rent, groceries, transit, phone, insurance), WANTS (eating out, subscriptions, shopping), and SAVINGS/DEBT. Total each bucket. Most people are surprised by the “wants” number — that’s the point. Don’t judge it yet; just get an honest baseline. Use NerdWallet’s free worksheet to structure it.`,
          resources: [
            { title: 'How to Budget Money: a step-by-step guide (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/article/finance/how-to-budget' },
            { title: 'Free budget worksheet template (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/article/finance/budget-worksheet' },
          ] },
        { title: 'Learn the 50/30/20 framework', time: '25 min',
          detail: `Read how 50/30/20 works: aim ~50% of take-home pay at needs, ~30% at wants, ~20% at savings and debt paydown. It’s a starting guide, not a rule — if you live somewhere expensive or want to save hard, shift the percentages. Compare the framework to the baseline you just totaled: which bucket is over, which is under?`,
          resources: [
            { title: 'What is the 50/30/20 rule? (Experian)', type: 'doc', url: 'https://www.experian.com/blogs/ask-experian/what-is-the-50-30-20-rule/' },
            { title: '50/30/20 budget calculator (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/finance/learn/nerdwallet-budget-calculator' },
          ] },
        { title: 'Build your budget', time: '40 min',
          detail: `Take your monthly net (after-tax) income and assign it across the three buckets using the calculator and a simple sheet. Give every dollar a job until income minus the plan equals zero. Set a concrete target for each category (e.g., “eating out: $120/mo”). A budget you can keep beats a perfect one you abandon — start loose and tighten next month.`,
          resources: [] },
        { title: 'Automate one save + trim one want', time: '20 min',
          detail: `Make it run without willpower: set up an automatic transfer to savings the day after payday (even $25 counts), and pick ONE recurring “want” to cut or pause this month. Note both on your budget. Automation is the single highest-leverage habit in personal finance — you save first, then spend what’s left.`,
          resources: [] },
      ],
      figmaExercise: {
        brief: 'Build a one-page monthly budget (a spreadsheet, Notion, or Figma frame) with your real take-home income split into needs / wants / savings & debt using 50/30/20 as a starting point. Include a per-category target, the single automatic transfer you set up, and the one “want” you’re trimming this month. It should balance to zero (every dollar assigned).',
        deliverable: 'Upload a screenshot of your monthly budget showing the three buckets, your targets, and your automation + cut.',
      },
      output: 'A working, balanced monthly budget with needs/wants/savings targets, one automated save, and one trimmed expense.',
      feedbackCriteria: [
        'The budget uses your real take-home pay and assigns every dollar (balances to ~zero).',
        'Spending is sorted into needs / wants / savings & debt with a concrete target per category.',
        'At least one automatic transfer to savings is set up and noted.',
        'One specific recurring “want” is identified to trim or pause.',
      ],
    },
    {
      slug: 'banking', n: 2,
      title: 'Banking & Your Emergency Fund',
      exerciseLabel: 'this week’s exercise',
      coreConcept: `An emergency fund is the foundation everything else stands on — it’s what keeps a surprise (car repair, medical bill, lost income) from becoming credit-card debt. Today you’ll learn the difference between checking, savings, and a high-yield savings account (HYSA), why your emergency cash belongs in a HYSA earning ~4% instead of a checking account earning ~0%, and how much to save. You’ll set a starter target and automate it.`,
      objectives: [
        'Distinguish checking vs. savings vs. high-yield savings (HYSA) and when to use each.',
        'Explain why an emergency fund comes before investing, and how big it should be (3–6 months of essentials).',
        'Compare HYSA options and understand FDIC/NCUA insurance.',
        'Set a starter emergency-fund target and an automatic monthly contribution.',
      ],
      steps: [
        { title: 'Checking vs. savings vs. HYSA', time: '25 min',
          detail: `Learn the three core accounts. Checking = daily spending. Savings = short-term goals. A HYSA = a savings account that pays far more interest (often 3.5–5% APY vs ~0.01% at big banks). On a $10,000 fund that’s roughly $400/yr vs $1/yr. HYSAs are FDIC/NCUA-insured (up to $250k) and let you withdraw within a day or two — ideal for emergencies.`,
          resources: [
            { title: 'Using a HYSA as an emergency fund (Broadview)', type: 'doc', url: 'https://www.broadviewfcu.com/blogs/high-yield-savings-account-emergency-fund-guide/' },
          ] },
        { title: 'Why the emergency fund comes first', time: '25 min',
          detail: `Understand the “why”: without a cash cushion, any shock goes on a credit card at ~25% interest and snowballs. Planners suggest 3–6 months of ESSENTIAL expenses (rent, utilities, groceries, insurance, transit, minimum debt payments). As a student/intern, start smaller: a $1,000 starter fund, then build to one month, then three.`,
          resources: [
            { title: 'Emergency fund: what it is and how to start one (Bankrate)', type: 'doc', url: 'https://www.bankrate.com/banking/savings/starting-an-emergency-fund/' },
          ] },
        { title: 'Compare and pick a HYSA', time: '30 min',
          detail: `Skim a current best-of list and compare on: APY, minimum balance, fees (avoid them), and whether it’s FDIC/NCUA insured. Many top HYSAs are online banks. You do NOT need to leave your main bank — you can open a HYSA elsewhere and link it. Pick one you’d realistically open.`,
          resources: [
            { title: 'Best high-yield savings accounts (CNBC Select)', type: 'doc', url: 'https://www.cnbc.com/select/best-high-yield-savings-accounts/' },
          ] },
        { title: 'Set your target + automate it', time: '20 min',
          detail: `Calculate your number: total monthly essentials × your target months (start with $1,000). Then set an automatic transfer into the HYSA each payday so it grows without thought. Name the account something motivating (“safety net”). This account is for emergencies only — not vacations.`,
          resources: [] },
      ],
      figmaExercise: {
        brief: 'Create a one-page emergency-fund plan: your total monthly ESSENTIAL expenses, your target (starter $1,000 → 3 months of essentials), the HYSA you’d open (name + APY), and the automatic monthly transfer amount + date. Show the math for your 3-month number.',
        deliverable: 'Upload a screenshot of your emergency-fund plan with the target math, chosen HYSA, and automation.',
      },
      output: 'An emergency-fund plan with a target amount, a chosen HYSA, and an automated monthly contribution.',
      feedbackCriteria: [
        'Essential monthly expenses are totaled and a 3-month target is calculated.',
        'A starter target ($1,000 or similar) is set as the first milestone.',
        'A specific HYSA is chosen with its APY and insurance noted.',
        'An automatic recurring transfer (amount + cadence) is defined.',
      ],
    },
    {
      slug: 'credit', n: 3,
      title: 'Credit Scores & Using Credit Cards Wisely',
      exerciseLabel: 'this week’s exercise',
      coreConcept: `Your credit score (300–850) quietly shapes your adult life — apartment approvals, loan rates, sometimes even jobs. The good news: it’s built from a few factors you control, and a credit card used responsibly is the simplest way to build it. Today you’ll learn what a score is, the factors that move it, how to build credit from scratch, and how to use a card as a tool without ever carrying debt.`,
      objectives: [
        'Explain what a credit score is and why it matters for rates and approvals.',
        'Identify the main scoring factors — payment history and credit utilization above all.',
        'Choose a realistic path to build credit from scratch (student/secured card or becoming an authorized user).',
        'Use a credit card with autopay-in-full and low utilization so it builds credit, never debt.',
      ],
      steps: [
        { title: 'What a credit score is and why it matters', time: '25 min',
          detail: `A credit score is a 300–850 number lenders use to judge how risky it is to lend to you. Higher = better rates on cards, car loans, and mortgages, and easier apartment approvals. Read the CFPB and NerdWallet basics so you understand what lenders actually see on your reports.`,
          resources: [
            { title: 'How do I get and keep a good credit score? (CFPB)', type: 'doc', url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-and-keep-a-good-credit-score-en-318/' },
            { title: 'The ultimate credit score guide (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/finance/hubs/the-ultimate-credit-score-guide' },
          ] },
        { title: 'The factors you actually control', time: '25 min',
          detail: `Two factors dominate: PAYMENT HISTORY (pay on time, every time — automate it) and CREDIT UTILIZATION (keep balances under ~30% of your limit, ideally under 10%). Length of history, credit mix, and new applications matter less. The takeaway: never miss a payment, and don’t max out cards.`,
          resources: [
            { title: 'Understand, get, and improve your credit score (USAGov)', type: 'doc', url: 'https://www.usa.gov/credit-score' },
          ] },
        { title: 'Build credit from scratch', time: '30 min',
          detail: `With little/no history, start with one of: a STUDENT credit card, a SECURED card (you put down a deposit that becomes your limit), a credit-builder loan, or becoming an AUTHORIZED USER on a trusted family member’s card. Pick the route that fits you and note the steps to open it.`,
          resources: [
            { title: 'How to build credit from scratch at any age (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/finance/learn/how-to-build-credit' },
          ] },
        { title: 'Use a card without ever carrying debt', time: '20 min',
          detail: `A card is a tool, not free money. Rules: set AUTOPAY for the full statement balance (so you never pay interest or miss a due date), keep utilization low, and treat the card like a debit card — only spend what’s already in your budget. Done this way, the card silently builds your score while costing you nothing.`,
          resources: [] },
      ],
      figmaExercise: {
        brief: 'Write a one-page credit action plan: your current credit situation (no history / thin / established), the specific build route you’ll take (student/secured/authorized user/credit-builder loan), how you’ll guarantee on-time payments (autopay setup), and your target utilization (<30%, ideally <10%).',
        deliverable: 'Upload a screenshot of your credit action plan.',
      },
      output: 'A credit action plan: your starting point, a build route, an autopay-in-full setup, and a utilization target.',
      feedbackCriteria: [
        'Correctly explains payment history and utilization as the top two factors.',
        'Selects a realistic, specific path to build or strengthen credit.',
        'Includes an autopay-in-full plan so payments are never missed.',
        'States a concrete utilization target (≤30%).',
      ],
    },
    {
      slug: 'investing', n: 4,
      title: 'Investing 101: Compounding, Index Funds & the Roth IRA',
      exerciseLabel: 'this week’s exercise',
      coreConcept: `Investing is how money grows faster than inflation — and your single biggest advantage is TIME, through compound interest (your returns earning returns). Today you’ll feel the power of compounding, learn why low-cost index funds beat trying to pick stocks, and meet the Roth IRA: an account that lets your investments grow and be withdrawn TAX-FREE in retirement — ideal when you’re young and in a low tax bracket. Starting small in your 20s beats starting big later.`,
      objectives: [
        'Explain compound interest and why starting early matters more than starting big.',
        'Describe what an index fund is and why low cost + diversification wins long-term.',
        'Explain why a Roth IRA is especially powerful for a young, lower-income earner.',
        'Draft a starter investing plan: account type, a broad index fund, and an automatic contribution.',
      ],
      steps: [
        { title: 'Feel the magic of compound interest', time: '25 min',
          detail: `Open the SEC’s free compound-interest calculator and run a scenario: e.g., $100/month at a 7% average annual return for 40 years. Watch how most of the final number is GROWTH, not your contributions. Try moving the start date 10 years later — the drop is the cost of waiting. This is why “time in the market” is the whole game.`,
          resources: [
            { title: 'Compound interest calculator (Investor.gov / SEC)', type: 'doc', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
          ] },
        { title: 'Index funds, explained', time: '30 min',
          detail: `An index fund holds a tiny slice of hundreds/thousands of companies (e.g., an S&P 500 or total-market fund), so you get instant diversification at very low cost — and historically it beats most stock-pickers. Learn the basics, then note one or two broad, low-fee funds (look for low “expense ratio”).`,
          resources: [
            { title: 'Index fund — definition & how it works (Investopedia)', type: 'doc', url: 'https://www.investopedia.com/terms/i/indexfund.asp' },
            { title: 'How to Invest for Beginners (YouTube)', type: 'video', url: 'https://www.youtube.com/watch?v=NQRtpKHAv6o' },
          ] },
        { title: 'Why a Roth IRA is your best friend right now', time: '30 min',
          detail: `A Roth IRA is a retirement account you fund with already-taxed money; in exchange, all growth and withdrawals in retirement are TAX-FREE. Because you’re young and likely in a low tax bracket, paying tax now and never again is a great deal. You can open one at a major brokerage and hold index funds inside it. Note the annual contribution limit and that you need earned income.`,
          resources: [
            { title: 'Roth IRA Made Easy for Beginners (YouTube)', type: 'video', url: 'https://www.youtube.com/watch?v=JYmWRCOV5vU' },
          ] },
        { title: 'Draft your starter plan', time: '20 min',
          detail: `Write a simple plan you could act on: which account (a Roth IRA at a major low-cost brokerage is a great default once you have earned income + an emergency fund), one broad index fund to hold, and a small automatic monthly contribution (even $25–$50). The habit matters more than the amount. Never invest your emergency fund or money you need within ~5 years.`,
          resources: [] },
      ],
      figmaExercise: {
        brief: 'Create a one-page investing starter plan: a screenshot from the compound-interest calculator showing a scenario you ran (contribution, rate, years, final value), the account type you’d open (e.g., Roth IRA), one broad low-cost index fund you’d hold, and the automatic monthly amount you’d contribute. Add a one-line note on why you’re starting now.',
        deliverable: 'Upload a screenshot of your investing starter plan (including the compounding projection).',
      },
      output: 'An investing starter plan: a compounding projection, a chosen account type, a broad index fund, and an automated contribution.',
      feedbackCriteria: [
        'Demonstrates compound interest with a real projection from the calculator.',
        'Explains index funds (diversification + low cost) and names a broad fund.',
        'Correctly explains the Roth IRA’s tax-free growth and why it suits a young earner.',
        'States a specific (even tiny) automatic monthly contribution and respects “emergency fund first.”',
      ],
    },
    {
      slug: 'taxes', n: 5,
      title: 'Taxes & Your Paycheck',
      exerciseLabel: 'this week’s exercise',
      coreConcept: `Your first “real” paycheck is smaller than you expect — because of taxes and withholding. Understanding your paycheck (gross vs. net), the W-4 you fill out when hired, and the W-2 you get in January means no surprises at tax time. This is directly relevant to your WSI internship pay: you’ll know what to expect, what to set aside, and how to avoid both a shock bill and a needlessly tiny paycheck.`,
      objectives: [
        'Read a paycheck: gross pay, taxes/withholding (federal, Social Security, Medicare, state), and net (take-home) pay.',
        'Explain what the W-4 does and how withholding works.',
        'Explain what a W-2 is and its role in filing a tax return.',
        'Estimate your internship take-home pay and what to set aside.',
      ],
      steps: [
        { title: 'Read your paycheck', time: '25 min',
          detail: `Learn the anatomy of a pay stub: GROSS pay (before deductions), the taxes withheld (federal income tax, Social Security, Medicare, and state tax where applicable), and NET pay (what hits your account). The IRS “Your First Job” page is a clean primer on why money is withheld.`,
          resources: [
            { title: 'Your first job (IRS)', type: 'doc', url: 'https://www.irs.gov/individuals/your-first-job' },
          ] },
        { title: 'The W-4 and withholding', time: '25 min',
          detail: `When you start a job you fill out a W-4, which tells your employer how much tax to withhold. Too little withheld → a surprise bill (and maybe a penalty); too much → a smaller paycheck and a refund later. Use the IRS Tax Withholding Estimator to sanity-check your W-4 once you know your internship pay.`,
          resources: [
            { title: 'What new workers should know about withholding (IRS)', type: 'doc', url: 'https://www.irs.gov/newsroom/what-people-new-to-the-workforce-need-to-know-about-income-tax-withholding' },
            { title: 'Tax Withholding Estimator (IRS)', type: 'doc', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
          ] },
        { title: 'The W-2 and filing', time: '25 min',
          detail: `In January, each employer sends a W-2 summarizing your year’s wages and the tax withheld. You use it to file a tax return — often you’ll get a refund if too much was withheld. Learn how to read the key W-2 boxes so the form isn’t intimidating.`,
          resources: [
            { title: 'W-2 form: what it is and how to read it (NerdWallet)', type: 'doc', url: 'https://www.nerdwallet.com/article/taxes/what-is-w-2-form' },
          ] },
        { title: 'Plan for your internship pay', time: '20 min',
          detail: `Estimate it: take your expected hourly or salary rate, compute monthly GROSS, then subtract a rough ~15–25% for taxes to approximate NET (use the estimator for a better number). Decide ahead of time how each paycheck splits — e.g., into your budget buckets and an automatic transfer to savings. Knowing your real take-home prevents lifestyle creep before it starts.`,
          resources: [] },
      ],
      figmaExercise: {
        brief: 'Create a one-page paycheck breakdown for your internship: estimated monthly GROSS pay, an estimate of taxes/withholding, your approximate NET (take-home) pay, and how you’ll split each paycheck (budget buckets + automatic savings). Note one thing you’ll check on your W-4.',
        deliverable: 'Upload a screenshot of your paycheck breakdown and split plan.',
      },
      output: 'A paycheck breakdown estimating gross → withholding → net for your internship, plus a per-paycheck split plan.',
      feedbackCriteria: [
        'Correctly labels gross pay, withholding (federal/SS/Medicare/state), and net pay.',
        'Explains the role of the W-4 (withholding) and the W-2 (year-end summary for filing).',
        'Produces a realistic take-home estimate from a gross figure.',
        'Defines how each paycheck is split, including an automatic save.',
      ],
    },
  ];

  /* ==========================================================
     1 · Helpers
     ========================================================== */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
    }
    (Array.isArray(kids) ? kids : [kids]).forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function logicalDate(d = new Date()) {
    const x = new Date(d);
    if (x.getHours() < ROLLOVER_HOUR) x.setDate(x.getDate() - 1);
    return x;
  }
  const dKey = (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };
  const todayKey = () => dKey(logicalDate());
  const DAY_MS = 86400000;
  const parseKey = (k) => new Date(k + 'T12:00:00');            // local noon — avoids tz drift
  const addDays = (k, n) => dKey(new Date(parseKey(k).getTime() + n * DAY_MS));
  const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / DAY_MS);

  const ORD = (n) => { const s=['th','st','nd','rd'], v=n%100; return n + (s[(v-20)%10] || s[v] || s[0]); };
  const DOW  = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const DOWS = ['s','m','t','w','t','f','s'];
  const MON  = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const prettyDate = (d = logicalDate()) => `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${ORD(d.getDate())}, ${d.getFullYear()}`;
  const prettyTime = (d = new Date()) => {
    let h = d.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    const p = (x) => String(x).padStart(2, '0');
    return `${h}:${p(d.getMinutes())}:${p(d.getSeconds())} ${ap}`;
  };

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1900);
  }

  /* small popover anchored under a button */
  function popover(anchor, items) {
    $('.popover')?.remove();
    const r = anchor.getBoundingClientRect();
    const pop = el('div', { class:'popover', style:`top:${r.bottom + window.scrollY + 6}px; left:${Math.max(8, r.right + window.scrollX - 172)}px` });
    items.forEach(it => pop.append(el('button', { html: svg(it.icon) + esc(it.label), onclick: () => { pop.remove(); it.onClick(); } })));
    document.body.append(pop);
    const off = (e) => { if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener('mousedown', off); } };
    setTimeout(() => document.addEventListener('mousedown', off), 0);
  }

  /* ==========================================================
     2 · Store (single source of truth + debounced persistence)
     ========================================================== */
  const Store = (() => {
    const blank = {
      version: 2,
      canvas: { dashboard: {}, personal: {} },     // { [dateKey]: [note] }
      doodles: { dashboard: {}, personal: {} },    // { [dateKey]: [stroke] }
      stickers: { dashboard: {}, personal: {} },   // { [dateKey]: [sticker] }
      work: { lessons: {}, customLessons: [], entries: [] },
      meta: {
        catImage: '', focusPos: { x: 26, y: 20 }, weather: null, coords: null,
        recurring: ['gym', 'breakfast', 'lunch', 'dinner'], mealsSeeded: true, lessonIdsMigrated: true,
        startDate: '2026-06-10', lessonDates: {},
        mood: {}, delight: true, collected: [], digestPos: null,
        calPos: null, calUrl: '',
        name: 'neli', nicknames: ['dani', 'dania', 'neli', 'nellie'],
        theme: 'cream', accent: '',
        pets: [
          { id: 'cat', emoji: '🐱', name: 'mochi', on: true },
          { id: 'bun', emoji: '🐰', name: 'pancake', on: false },
          { id: 'mel', emoji: '🍉', name: 'melly', on: false },
          { id: 'duck', emoji: '🐥', name: 'pip', on: false },
        ],
        affirmations: [], affirmVibe: ['gentle', 'hype'],
      },
    };

    /* shape-guard ANY payload (fresh / localStorage / synced / imported) so older
       or partial data never crashes newer code. Run on load AND in replaceAll(). */
    function guard(d) {
      d = d || structuredClone(blank);
      d.canvas ||= {}; d.canvas.dashboard ||= {}; d.canvas.personal ||= {};
      d.doodles ||= {}; d.doodles.dashboard ||= {}; d.doodles.personal ||= {};
      d.stickers ||= {}; d.stickers.dashboard ||= {}; d.stickers.personal ||= {};
      d.work ||= {}; d.work.lessons ||= {}; d.work.customLessons ||= []; d.work.entries ||= [];
      d.work.customLessons.forEach(L => { if (!L.track) L.track = 'curriculum'; });
      d.meta ||= {}; d.meta.focusPos ||= { x: 26, y: 20 };
      if (!('catImage' in d.meta)) d.meta.catImage = '';
      if (!Array.isArray(d.meta.recurring)) d.meta.recurring = ['gym', 'breakfast', 'lunch', 'dinner'];
      // one-time: fold breakfast/lunch/dinner into existing users' recurring set
      if (!d.meta.mealsSeeded) { d.meta.recurring = [...new Set([...d.meta.recurring, 'breakfast', 'lunch', 'dinner'])]; d.meta.mealsSeeded = true; }
      // one-time: lesson state moved from array-index ids (c{i}, where c0 was Day 1) to
      // stable day-based ids (d{day}) after a Day 0 orientation lesson was prepended.
      if (!d.meta.lessonIdsMigrated) {
        const src = d.work.lessons || {}, out = {};
        for (const k of Object.keys(src)) {
          const m = /^c(\d+)$/.exec(k);
          if (m) out['d' + (parseInt(m[1], 10) + 1)] = src[k];   // old c{i} == Day i+1 → d{i+1}
          else out[k] = src[k];                                   // custom/other keys untouched
        }
        d.work.lessons = out;
        d.meta.lessonIdsMigrated = true;
      }
      d.meta.mood ||= {};
      if (d.meta.delight === undefined) d.meta.delight = true;
      if (!Array.isArray(d.meta.collected)) d.meta.collected = [];
      d.meta.digestPos ||= null;
      d.meta.startDate ||= '2026-06-10';
      d.meta.lessonDates ||= {};
      d.meta.calPos ||= null;
      if (typeof d.meta.calUrl !== 'string') d.meta.calUrl = '';
      // personalization
      d.meta.name ||= 'neli';
      if (!Array.isArray(d.meta.nicknames) || !d.meta.nicknames.length) d.meta.nicknames = ['dani', 'dania', 'neli', 'nellie'];
      d.meta.theme ||= 'cream';
      if (typeof d.meta.accent !== 'string') d.meta.accent = '';
      if (!Array.isArray(d.meta.pets) || !d.meta.pets.length) d.meta.pets = structuredClone(blank.meta.pets);
      if (!Array.isArray(d.meta.affirmations)) d.meta.affirmations = [];
      if (!Array.isArray(d.meta.affirmVibe)) d.meta.affirmVibe = ['gentle', 'hype'];
      for (const view of ['dashboard', 'personal']) {
        for (const k of Object.keys(d.canvas[view])) {
          d.canvas[view][k] = (d.canvas[view][k] || []).map(normalizeNote);
        }
      }
      // dashboard notes now live under a fixed 'board' key (no daily reset);
      // fold any older date-keyed dashboard notes into it once.
      const board = d.canvas.dashboard;
      board.board ||= [];
      for (const k of Object.keys(board)) {
        if (k === 'board' || !/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
        board.board.push(...board[k]);
        delete board[k];
      }
      // same fold for dashboard doodles + stickers
      for (const bucket of [d.doodles.dashboard, d.stickers.dashboard]) {
        bucket.board ||= [];
        for (const k of Object.keys(bucket)) {
          if (k === 'board' || !/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
          bucket.board.push(...bucket[k]); delete bucket[k];
        }
      }
      return d;
    }

    let data;
    try { data = JSON.parse(localStorage.getItem(LS_KEY)) || structuredClone(blank); }
    catch { data = structuredClone(blank); }
    data = guard(data);

    function normalizeNote(n) {
      return {
        id: n.id || uid(),
        html: n.html != null ? n.html : (n.text ? esc(n.text).replace(/\n/g, '<br>') : ''),
        checklist: Array.isArray(n.checklist) ? n.checklist : null,
        images: Array.isArray(n.images) ? n.images : [],
        doodle: Array.isArray(n.doodle) ? n.doodle : [],   // pen strokes drawn on this note
        x: n.x ?? 40, y: n.y ?? 40,
        w: n.w ?? null, h: n.h ?? null,        // null = auto-size
        tag: n.tag ?? null,
        timestamp: n.timestamp || Date.now(),
        archived: !!n.archived,
      };
    }

    let timer, afterSave = null;
    const flush = () => {
      data.meta.updatedAt = Date.now();
      try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); toast('storage full — export a backup, then delete some photos (Settings → storage)'); }
      try { afterSave && afterSave(); } catch (e) { console.error(e); }
    };
    const save = (immediate = false) => {
      if (immediate) { clearTimeout(timer); flush(); return; }
      clearTimeout(timer); timer = setTimeout(flush, 300);
    };

    return {
      get: () => data, save, normalizeNote,
      onSave(fn) { afterSave = fn; },
      replaceAll(next) { data = guard(next); localStorage.setItem(LS_KEY, JSON.stringify(data)); },
      notes(view, key) { return (data.canvas[view][key] ||= []); },
      doodles(view, key) { return (data.doodles[view][key] ||= []); },
      stickers(view, key) { return (data.stickers[view][key] ||= []); },
      datesWithNotes(view) {
        return Object.keys(data.canvas[view]).filter(k => (data.canvas[view][k] || []).length).sort((a,b) => b.localeCompare(a));
      },
      lesson(id) { return (data.work.lessons[id] ||= { stepsDone:{}, notes:'', shots:[], figmaLink:'', reflect:'', criteria:{}, submitted:false, complete:false, completedAt:null }); },
    };
  })();

  /* ==========================================================
     2c · Plan — prep schedule + countdown to the start date
     ========================================================== */
  const Plan = (() => {
    const startDate = () => Store.get().meta.startDate || '2026-06-10';
    const lessonDates = () => (Store.get().meta.lessonDates ||= {});
    const dateOf = (id) => lessonDates()[id] || '';
    const setDate = (id, k) => { const ld = lessonDates(); if (k) ld[id] = k; else delete ld[id]; Store.save(true); };
    const daysUntilStart = () => daysBetween(todayKey(), startDate());     // >0 before, 0 on, <0 after
    function prepDays() {                                                  // today … day-before-start
      const start = startDate(); let k = todayKey(); const out = [];
      while (k < start) { out.push(k); k = addDays(k, 1); }
      return out;
    }
    /* spread incomplete lessons evenly across the remaining prep days */
    function assign(lessons) {
      const days = prepDays(), incomplete = lessons.filter(L => !L.complete);
      if (!days.length || !incomplete.length) return false;
      const ld = lessonDates();
      incomplete.forEach((L, i) => { ld[L.id] = days[Math.min(Math.floor(i * days.length / incomplete.length), days.length - 1)]; });
      Store.save(true);
      return true;
    }
    function clearAll() { Store.get().meta.lessonDates = {}; Store.save(true); }
    return { startDate, lessonDates, dateOf, setDate, daysUntilStart, prepDays, assign, clearAll };
  })();

  /* ==========================================================
     2b · Cloud sync (optional, bring-your-own Supabase)
     ---------------------------------------------------------
     Credentials live ONLY in this browser's localStorage —
     never in the repo. Every device that enters the same
     url + key + code shares one workspace row. Last write wins.
     ========================================================== */
  const Sync = (() => {
    const CFG_KEY = 'wsi_sync_config';
    let cfg = (() => { try { return JSON.parse(localStorage.getItem(CFG_KEY)) || null; } catch { return null; } })();
    let pushTimer = null, status = 'idle', lastError = '', dirty = false, autopush = (cfg ? cfg.autopush !== false : true);

    const enabled = () => !!(cfg && cfg.url && cfg.key && cfg.code);
    const get = () => cfg;
    const isAuto = () => autopush;
    function set(next) {
      cfg = next && next.url ? { url: next.url.replace(/\/+$/, ''), key: next.key.trim(), code: next.code.trim(), autopush } : null;
      if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      else localStorage.removeItem(CFG_KEY);
    }
    function setAuto(on) { autopush = !!on; if (cfg) { cfg.autopush = autopush; localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } updateBtn(); }
    const endpoint = () => `${cfg.url}/rest/v1/workspaces`;
    const headers = () => ({ 'apikey': cfg.key, 'Authorization': `Bearer ${cfg.key}`, 'Content-Type': 'application/json' });

    async function push() {
      if (!enabled()) return;
      status = 'syncing'; updateBtn();
      try {
        const body = [{ code: cfg.code, data: Store.get(), updated_at: new Date(Store.get().meta.updatedAt || Date.now()).toISOString() }];
        const r = await fetch(`${endpoint()}?on_conflict=code`, {
          method: 'POST',
          headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(`push ${r.status}: ${(await r.text()).slice(0,120)}`);
        status = 'ok'; lastError = ''; dirty = false;
      } catch (e) { status = 'error'; lastError = e.message; console.error('sync push', e); }
      updateBtn();
    }
    async function pull() {
      if (!enabled()) return null;
      status = 'syncing'; updateBtn();
      try {
        const r = await fetch(`${endpoint()}?code=eq.${encodeURIComponent(cfg.code)}&select=data,updated_at`, { headers: headers() });
        if (!r.ok) throw new Error(`pull ${r.status}: ${(await r.text()).slice(0,120)}`);
        const rows = await r.json();
        status = 'ok'; lastError = ''; updateBtn();
        return rows && rows[0] ? rows[0] : null;
      } catch (e) { status = 'error'; lastError = e.message; console.error('sync pull', e); updateBtn(); return null; }
    }

    /* manual "save to cloud" — what the corner button does */
    async function pushNow() {
      if (!enabled()) { toast('cloud sync is off — set it up in settings'); return; }
      await push();
      toast(status === 'ok' ? 'saved to cloud ✓' : `save failed: ${lastError}`);
    }

    /* on load: if another device saved newer changes while this one was idle,
       WARN once and let the user choose — don't silently overwrite either side. */
    async function syncOnLoad() {
      if (!enabled()) return;
      const remote = await pull();
      if (!remote || !remote.data) { push(); return; }              // cloud empty → seed it
      const localTs = Store.get().meta.updatedAt || 0;
      const remoteTs = remote.data.meta?.updatedAt || Date.parse(remote.updated_at) || 0;
      if (remoteTs > localTs + 1500) {
        if (dirty) warnStale(remote, remoteTs, localTs);          // unsaved local edits → let the user choose
        else { Store.replaceAll(remote.data); render(); }          // clean device → just adopt the latest, no popup
      }
      else if (localTs > remoteTs + 1500) { if (autopush) push(); else { dirty = true; updateBtn(); } }
    }

    function warnStale(remote, remoteTs, localTs) {
      $('#sync-warn')?.remove();
      const ago = (ts) => { const m = Math.round((Date.now()-ts)/60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m/60)} hr ago`; };
      const bar = el('div', { id:'sync-warn' });
      const close = () => bar.remove();                  // always dismiss FIRST so it never gets stuck
      bar.append(
        el('span', { html: `☁️ <b>Another device has newer changes</b> (cloud saved ${ago(remoteTs)}; this device ${localTs?('last edited '+ago(localTs)):'has no local edits'}).` }),
        el('div', { class:'sw-actions' }, [
          el('button', { class:'btn primary sm', text:'load latest', onclick: () => { close(); Store.replaceAll(remote.data); toast('loaded latest from cloud'); render(); } }),
          el('button', { class:'btn ghost sm', text:'keep this device', onclick: () => { close(); push(); toast('kept this device — uploaded to cloud'); } }),
        ]),
        el('button', { class:'sw-x', title:'dismiss', text:'✕', onclick: close }),
      );
      document.body.append(bar);
    }

    function markDirty() {
      if (!enabled()) return;
      dirty = true; updateBtn();
      if (autopush) { clearTimeout(pushTimer); pushTimer = setTimeout(push, 2500); }
    }

    /* the corner cloud button reflects state: synced / unsaved / syncing / error */
    function updateBtn() {
      const b = $('#sync-btn'); if (!b) return;
      b.hidden = !enabled();
      const state = !enabled() ? 'off' : status === 'syncing' ? 'syncing' : status === 'error' ? 'error' : dirty ? 'dirty' : 'ok';
      b.dataset.status = state;
      b.title = state === 'error' ? `sync error: ${lastError} — tap to retry`
        : state === 'syncing' ? 'syncing…'
        : state === 'dirty' ? 'unsaved changes — tap to save to cloud'
        : 'up to date — tap to pull the latest from your other device';
      b.innerHTML = svg('cloud') + '<span class="sync-dot"></span>';
    }

    /* pull the cloud's latest onto THIS device — for live multi-device viewing
       (edit on laptop, keep iPad open as a reference). Never clobbers unsaved
       local edits unless forced. Returns true if it actually loaded newer data. */
    async function refresh(force) {
      if (!enabled() || (dirty && !force)) return false;
      const remote = await pull();
      if (!remote || !remote.data) return false;
      const localTs = Store.get().meta.updatedAt || 0;
      const remoteTs = remote.data.meta?.updatedAt || Date.parse(remote.updated_at) || 0;
      if (force || remoteTs > localTs + 1500) { Store.replaceAll(remote.data); render(); return true; }
      return false;
    }

    /* the corner cloud button: SAVE if this device has unsaved edits, else PULL latest */
    async function syncTap() {
      if (!enabled()) { toast('cloud sync is off — set it up in settings'); return; }
      if (dirty) { await push(); toast(status === 'ok' ? 'saved to cloud ✓' : `save failed: ${lastError}`); return; }
      const got = await refresh(false);
      toast(got ? 'loaded latest from cloud ↻' : (status === 'error' ? `sync failed: ${lastError}` : 'already up to date ✓'));
    }

    return { enabled, get, set, isAuto, setAuto, push, pull, pushNow, syncOnLoad, markDirty, updateBtn, refresh, syncTap,
      get status() { return status; }, get lastError() { return lastError; }, get dirty() { return dirty; } };
  })();

  /* ==========================================================
     3 · Icons
     ========================================================== */
  function svg(name) {
    const P = {
      archive:'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
      x:'<path d="M18 6 6 18M6 6l12 12"/>',
      restore:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/>',
      check:'<path d="M20 6 9 17l-5-5"/>',
      checklist:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
      chevL:'<path d="m15 18-6-6 6-6"/>', chevR:'<path d="m9 6 6 6-6 6"/>',
      panel:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M15 3v18"/>',
      upload:'<path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
      trash:'<path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/>',
      shuffle:'<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
      gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      cloud:'<path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z"/>',
      rain:'<path d="M17.5 16a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 16M8 19v2M12 19v2M16 19v2"/>',
      snow:'<path d="M17.5 16a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 16M8 20h.01M12 20h.01M16 20h.01"/>',
      fog:'<path d="M17.5 14a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 14M4 18h16M7 22h13"/>',
      thunder:'<path d="M17.5 14a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 14M13 12l-3 5h4l-3 5"/>',
      ext:'<path d="M7 17 17 7M7 7h10v10"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M14 20v-4h4"/>',
      book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      sticker:'<path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l6-6V5a2 2 0 0 0-2-2z"/><path d="M15 21v-4a2 2 0 0 1 2-2h4"/>',
      pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      eraser:'<path d="M20 20H7L3 16a2 2 0 0 1 0-3L13 3a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-9 9"/>',
      undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12H8"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[name]||''}</svg>`;
  }
  const iconBtn = (name, label, onClick, cls = '') =>
    el('button', { class:'icon-btn' + (cls ? ' ' + cls : ''), title:label, 'aria-label':label, html:svg(name), onclick:onClick });

  /* floating + add-note button */
  const addFab = (onClick) => el('button', { class:'add-fab', title:'add note', 'aria-label':'add note', html: svg('plus'), onclick: onClick });
  const penFab = () => { const b = el('button', { class:'fab-mini', title:'draw', 'aria-label':'draw', html: svg('pen'), onclick: () => b.classList.toggle('on', Draw.toggle()) }); return b; };
  const stickerFab = () => { const b = el('button', { class:'fab-mini', title:'stickers', 'aria-label':'stickers', html: svg('sticker'), onclick: () => b.classList.toggle('on', Stickers.toggle()) }); return b; };

  /* ==========================================================
     4 · Weather (Open-Meteo + reverse geocode, cached & auto-refresh)
     ========================================================== */
  const Weather = (() => {
    const codeIcon = (c) => {
      if (c === 0) return 'sun';
      if (c <= 3) return 'cloud';
      if (c === 45 || c === 48) return 'fog';
      if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
      if (c >= 71 && c <= 77) return 'snow';
      if (c >= 95) return 'thunder';
      return 'cloud';
    };
    const codeLabel = (c) => {
      if (c === 0) return 'clear'; if (c <= 3) return 'cloudy';
      if (c === 45 || c === 48) return 'fog';
      if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
      if (c >= 71 && c <= 77) return 'snow'; if (c >= 95) return 'storm'; return 'cloudy';
    };
    async function coords() {
      const cached = Store.get().meta.coords;
      if (cached) return cached;
      const got = await new Promise((res) => {
        if (!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition(
          p => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
          () => res(null), { timeout: 6000, maximumAge: 3.6e6 }
        );
      });
      const c = got || { lat: SF.lat, lon: SF.lon };
      Store.get().meta.coords = c; Store.save(true);
      return c;
    }
    async function cityName(lat, lon) {
      try {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const j = await r.json();
        return (j.city || j.locality || j.principalSubdivision || SF.city).toLowerCase();
      } catch { return SF.city; }
    }
    async function fetch7(force = false) {
      const meta = Store.get().meta;
      if (!force && meta.weather && (Date.now() - meta.weather.ts) < WEATHER_TTL) return meta.weather;
      try {
        const c = await coords();
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}`
          + `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min`
          + `&temperature_unit=fahrenheit&timezone=auto`;
        const r = await fetch(url); const j = await r.json();
        const city = meta.weather?.city && !force ? meta.weather.city : await cityName(c.lat, c.lon);
        const w = {
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          hi: Math.round(j.daily.temperature_2m_max[0]),
          lo: Math.round(j.daily.temperature_2m_min[0]),
          city, ts: Date.now(),
        };
        meta.weather = w; Store.save(true);
        return w;
      } catch (e) { console.error('weather', e); return meta.weather; }
    }
    function renderInto(elm, w) {
      if (!w) { elm.innerHTML = `<span class="loc">${SF.city}</span> · loading…`; return; }
      elm.innerHTML =
        `<span class="loc">${esc(w.city)}</span> <span class="temp">${w.temp}°</span> ${svg(codeIcon(w.code))} `
        + `<span>${codeLabel(w.code)}</span> <span>H: ${w.hi}</span> <span class="lo">L: ${w.lo}</span>`;
    }
    async function mount(elm) {
      renderInto(elm, Store.get().meta.weather);
      renderInto(elm, await fetch7());
    }
    return { mount, fetch7, renderInto };
  })();

  /* ==========================================================
     5 · Format toolbar (bold / italic / underline / highlight / color)
     ========================================================== */
  const Fmt = (() => {
    let bar, currentEditable = null;
    function ensure() {
      if (bar) return bar;
      bar = el('div', { id:'fmt-bar' });
      const exec = (cmd, val) => (e) => {
        e.preventDefault();
        document.execCommand(cmd, false, val);
        currentEditable?.dispatchEvent(new Event('input', { bubbles: true }));
      };
      bar.append(
        el('button', { title:'Bold', onmousedown: exec('bold'), html:'<b>B</b>' }),
        el('button', { title:'Italic', onmousedown: exec('italic'), html:'<i>I</i>' }),
        el('button', { title:'Underline', onmousedown: exec('underline'), html:'<u>U</u>' }),
        el('button', { title:'Highlight', onmousedown: exec('hiliteColor', '#ffd84d'), html:'<span style="background:#ffd84d;color:#1c1c1e;padding:0 2px;border-radius:2px">H</span>' }),
        el('button', { title:'Red', onmousedown: exec('foreColor', '#d6453d'), html:'<span class="swatch" style="background:#d6453d"></span>' }),
        el('button', { title:'Blue', onmousedown: exec('foreColor', '#2f6df0'), html:'<span class="swatch" style="background:#2f6df0"></span>' }),
        el('button', { title:'Green', onmousedown: exec('foreColor', '#1f9d57'), html:'<span class="swatch" style="background:#1f9d57"></span>' }),
        el('button', { title:'Ink', onmousedown: exec('foreColor', '#1c1c1e'), html:'<span class="swatch" style="background:#1c1c1e"></span>' }),
        el('button', { title:'Clear', onmousedown: exec('removeFormat'), html:'✕' }),
      );
      document.body.append(bar);
      return bar;
    }
    function place() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { hide(); return; }
      const anchor = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
      const editable = anchor?.closest?.('[contenteditable="true"]');
      if (!editable) { hide(); return; }
      currentEditable = editable;
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const b = ensure(); b.classList.add('show');
      b.style.left = clamp(r.left + r.width/2 - b.offsetWidth/2, 6, window.innerWidth - b.offsetWidth - 6) + 'px';
      b.style.top = Math.max(6, r.top - b.offsetHeight - 8) + 'px';
    }
    function hide() { bar?.classList.remove('show'); }
    document.addEventListener('selectionchange', () => { if (bar?.classList.contains('show') || window.getSelection()?.toString()) place(); });
    document.addEventListener('mouseup', () => setTimeout(place, 0));
    document.addEventListener('scroll', hide, true);
    return { hide };
  })();

  /* ==========================================================
     6 · Note rendering (rich, shared by canvas)
     ========================================================== */
  function makeChecklistItem(item, ctx, readonly, listEl, note) {
    const row = el('div', { class:'chk-row' + (item.done ? ' done' : '') });
    const cb = el('input', { type:'checkbox' });
    cb.checked = item.done; cb.disabled = readonly;
    cb.addEventListener('change', () => { item.done = cb.checked; row.classList.toggle('done', cb.checked); Store.save(true); });
    const txt = el('div', { class:'chk-text', contenteditable: readonly ? 'false' : 'true', html: item.html || '' });
    if (!readonly) {
      txt.addEventListener('input', () => { item.html = txt.innerHTML; Store.save(); });
      txt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault();
          const ni = { id: uid(), html:'', done:false };
          note.checklist.splice(note.checklist.indexOf(item) + 1, 0, ni);
          const nr = makeChecklistItem(ni, ctx, readonly, listEl, note);
          row.after(nr); nr.querySelector('.chk-text').focus(); Store.save();
        }
        if (e.key === 'Backspace' && txt.textContent === '' && note.checklist.length > 1) {
          e.preventDefault();
          note.checklist.splice(note.checklist.indexOf(item), 1); row.remove(); Store.save();
        }
      });
    }
    row.append(cb, txt);
    if (!readonly) row.append(iconBtn('x', 'remove', () => {
      note.checklist.splice(note.checklist.indexOf(item), 1); row.remove();
      if (!note.checklist.length) note.checklist = null;
      Store.save();
    }, 'chk-del'));
    return row;
  }

  function renderChecklist(note, node, ctx) {
    const wrap = el('div', { class:'note-checklist' });
    note.checklist.forEach(item => wrap.append(makeChecklistItem(item, ctx, ctx.readonly, wrap, note)));
    if (!ctx.readonly) wrap.append(el('button', { class:'chk-add', text:'+ add item', onclick: () => {
      const ni = { id: uid(), html:'', done:false }; note.checklist.push(ni);
      const nr = makeChecklistItem(ni, ctx, false, wrap, note);
      wrap.querySelector('.chk-add').before(nr); nr.querySelector('.chk-text').focus(); Store.save();
    } }));
    return wrap;
  }
  function addChecklist(note, node) {
    if (!note.checklist) note.checklist = [{ id: uid(), html:'', done:false }];
    node.querySelector('.note-checklist')?.remove();
    node.querySelector('.note-rich').after(renderChecklist(note, node, node._ctx));
    node.querySelector('.note-checklist .chk-text')?.focus();
    Store.save(true);
  }

  function renderImages(note, node, readonly) {
    const wrap = el('div', { class:'note-images' });
    note.images.forEach((img, i) => {
      const box = el('div', { class:'note-img' }, [ el('img', { src: img.src, alt: img.caption || `image ${i+1}` }) ]);
      const cap = el('div', { class:'cap', contenteditable: readonly ? 'false' : 'true', text: img.caption || '' });
      if (!readonly) cap.addEventListener('input', () => { img.caption = cap.textContent; Store.save(); });
      box.append(cap);
      if (!readonly) box.append(el('div', { class:'img-bar' }, iconBtn('trash', 'remove image', () => {
        note.images.splice(i, 1); Store.save(true);
        const repl = note.images.length ? renderImages(note, node, readonly) : document.createComment('no-img');
        wrap.replaceWith(repl);
      })));
      wrap.append(box);
    });
    return wrap;
  }

  /* downscale + recompress images so months of photos don't blow the storage budget.
     iOS Safari caps localStorage at ~5MB, so keep images small (base64 lives in that blob). */
  function compressImage(dataURL, done, maxEdge = 1000, quality = 0.7) {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      w = Math.round(w * scale); h = Math.round(h * scale);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      try { done(c.toDataURL('image/jpeg', quality)); } catch { done(dataURL); }
    };
    img.onerror = () => done(dataURL);
    img.src = dataURL;
  }
  function fileToImage(file, done) {
    const rd = new FileReader();
    rd.onload = () => compressImage(rd.result, done);
    rd.readAsDataURL(file);
  }

  function handlePaste(e, note, node) {
    const items = [...(e.clipboardData?.items || [])].filter(it => it.type.startsWith('image/'));
    if (!items.length) return;                 // let text paste through
    e.preventDefault();
    items.forEach(it => {
      const file = it.getAsFile(); if (!file) return;
      fileToImage(file, (src) => {
        note.images.push({ src, caption: '' });
        const body = node.querySelector('.note-body-scroll');
        const existing = body.querySelector('.note-images');
        if (existing) existing.replaceWith(renderImages(note, node, false));
        else (body.querySelector('.note-checklist') || body.querySelector('.note-rich')).after(renderImages(note, node, false));
        Store.save(true); toast('image pasted');
      });
    });
  }

  function placeCaret(elm) {
    elm.focus();
    const r = document.createRange(); r.selectNodeContents(elm); r.collapse(false);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  function buildNote(note, ctx) {
    const { readonly, tags } = ctx;
    const stamp = new Date(note.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const sizeStyle = (note.w ? `width:${note.w}px;` : '') + (note.h ? `height:${note.h}px;` : '');
    const node = el('div', { class:'note', dataset:{ id: note.id, readonly:String(readonly), tag: note.tag || '' }, style:`left:${note.x}px; top:${note.y}px; ${sizeStyle}` });

    /* head */
    const head = el('div', { class:'note-head' }, [ el('span', { class:'stamp', text: stamp }) ]);
    if (!readonly) {
      const tools = el('div', { class:'tools' });
      if (note.tag === 'journal') tools.append(iconBtn('shuffle', 'new prompt', () => {
        const rich = node.querySelector('.note-rich');
        rich.innerHTML = `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`;
        note.html = rich.innerHTML; Store.save(true); placeCaret(rich);
      }));
      tools.append(iconBtn('checklist', 'add checklist', () => addChecklist(note, node)));
      tools.append(iconBtn('archive', 'archive', () => ctx.onArchive(note.id)));
      tools.append(iconBtn('x', 'delete', () => ctx.onDelete(note.id), 'danger'));
      head.append(tools);
      head.addEventListener('pointerdown', (e) => ctx.onDragStart(e, node, note));
    }
    node.append(head);

    /* scrollable body wrapper (so a fixed height clips/scrolls gracefully) */
    const body = el('div', { class:'note-body-scroll' });

    const rich = el('div', { class:'note-rich', contenteditable: readonly ? 'false' : 'true',
      'data-placeholder':'type…  (try /todo)', html: note.html || '' });
    if (!readonly) {
      rich.addEventListener('input', () => {
        if (rich.textContent.trim() === '/todo') {
          rich.innerHTML = ''; note.html = '';
          addChecklist(note, node); Store.save(true); return;
        }
        note.html = rich.innerHTML; Store.save();
      });
      rich.addEventListener('paste', (e) => handlePaste(e, note, node));
    }
    body.append(rich);

    if (note.checklist) body.append(renderChecklist(note, node, ctx));
    if (note.images?.length) body.append(renderImages(note, node, readonly));

    if (tags) {
      const foot = el('div', { class:'note-foot' });
      if (readonly) foot.append(el('span', { class:'tagchip', text: note.tag ? `#${note.tag}` : 'untagged' }));
      else {
        const sel = el('select');
        sel.append(el('option', { value:'', text:'+ tag' }));
        PERSONAL_TAGS.forEach(t => sel.append(el('option', { value:t, text:`#${t}`, selected: note.tag === t ? 'selected' : null })));
        sel.value = note.tag || '';
        sel.addEventListener('change', () => {
          note.tag = sel.value || null;
          node.dataset.tag = note.tag || '';
          if (note.tag === 'gym' && !note.checklist) {
            note.checklist = GYM_CHECKLIST.map(t => ({ id: uid(), html: esc(t), done: false }));
            node.querySelector('.note-checklist')?.remove();
            node.querySelector('.note-rich').after(renderChecklist(note, node, ctx));
            toast('gym checklist added');
          }
          Store.save(true);
        });
        foot.append(sel);
      }
      body.append(foot);
    }
    node.append(body);

    /* resize handle */
    if (!readonly) {
      const rz = el('div', { class:'note-resize', title:'resize' });
      rz.addEventListener('pointerdown', (e) => startResize(e, node, note));
      node.append(rz);
    }
    node.append(Draw.layerFor(note, readonly));   // pen overlay — inert until pen mode
    return node;
  }

  function startResize(e, node, note) {
    e.preventDefault(); e.stopPropagation();
    node.classList.add('resizing'); node.setPointerCapture?.(e.pointerId);
    const startX = e.clientX, startY = e.clientY, startW = node.offsetWidth, startH = node.offsetHeight;
    const move = (ev) => {
      note.w = Math.round(clamp(startW + (ev.clientX - startX), 150, 720));
      note.h = Math.round(clamp(startH + (ev.clientY - startY), 90, 900));
      node.style.width = note.w + 'px'; node.style.height = note.h + 'px';
    };
    const up = () => {
      node.classList.remove('resizing');
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      Store.save(true);
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  }

  /* ==========================================================
     7 · Canvas engine (shared by Dashboard + Personal)
     ========================================================== */
  const Canvas = (() => {
    let active = null;
    function teardown() { active = null; Draw.teardown(); Stickers.teardown(); }

    function build({ view, dateKey, readonly, tags = false, onChange = () => {}, tall = false }) {
      const surface = el('div', { class:'canvas-surface dotgrid' + (tall ? ' tall' : ''), role:'application', 'aria-label':`${view} canvas` });
      const ctx = { view, dateKey, readonly, tags, onChange, onArchive: archive, onDelete: remove, onDragStart: startDrag };
      active = { surface, ctx };
      paint();
      Stickers.attach(surface, view, dateKey, readonly); // emoji decorations behind notes
      return surface;
    }

    function paint() {
      if (!active) return;
      const { surface, ctx } = active;
      [...surface.querySelectorAll('.note')].forEach(n => n.remove());
      surface.querySelector('.empty-line')?.remove();
      const list = Store.notes(ctx.view, ctx.dateKey).filter(n => !n.archived);
      if (!list.length && ctx.readonly && !surface.querySelector('.focus-widget'))
        surface.append(el('div', { class:'empty-line', style:'position:absolute;left:22px;top:18px', text:'empty page — nothing was logged on this date.' }));
      list.forEach(n => { const node = buildNote(n, ctx); node._ctx = ctx; surface.append(node); });
    }

    function spawn(x, y, preset = {}) {
      const { ctx, surface } = active;
      const note = Store.normalizeNote({ id: uid(), x: Math.round(x), y: Math.round(y), tag: ctx.tags ? (preset.tag || '') : null, timestamp: Date.now(), ...preset });
      Store.notes(ctx.view, ctx.dateKey).push(note);
      Store.save(true);
      const node = buildNote(note, ctx); node._ctx = ctx; surface.append(node);
      node.querySelector('.note-rich').focus();
      ctx.onChange();
      return note;
    }

    /* spawn from the + button — cascade near the visible top-left */
    function addNote(preset = {}) {
      if (!active || active.ctx.readonly) { toast('switch to today to add'); return; }
      const r = active.surface.getBoundingClientRect();
      const n = Store.notes(active.ctx.view, active.ctx.dateKey).filter(x => !x.archived).length;
      const x = clamp(40 + (n % 6) * 26, 0, Math.max(0, r.width - 240));
      const y = 40 + (n % 6) * 26 + window.scrollY;
      return spawn(x, y, preset);
    }

    function startDrag(e, node, n) {
      if (e.target.closest('.icon-btn') || e.target.closest('[contenteditable="true"]')) return;
      e.preventDefault();
      const surface = active.surface, r = surface.getBoundingClientRect();
      const offX = e.clientX - r.left - n.x, offY = e.clientY - r.top - n.y;
      node.classList.add('dragging'); node.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        n.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 30));
        n.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        node.style.left = n.x + 'px'; node.style.top = n.y + 'px';
      };
      const up = () => {
        node.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    const findNote = (id) => Store.notes(active.ctx.view, active.ctx.dateKey).find(x => x.id === id);
    function archive(id) { const n = findNote(id); if (!n) return; n.archived = true; Store.save(true); paint(); active.ctx.onChange(); toast('archived'); }
    function noteHasContent(n) {
      if (n.images && n.images.length) return true;
      if (n.checklist && n.checklist.some(c => stripHtml(c.html).trim())) return true;
      // ignore an auto-filled journal prompt (just a bold question) as "empty"
      const t = stripHtml(n.html).replace(/\?.*$/, '').trim();
      return t.length > 0 && !(n.tag === 'journal' && stripHtml(n.html).trim().endsWith('?'));
    }
    function remove(id) {
      const list = Store.notes(active.ctx.view, active.ctx.dateKey);
      const i = list.findIndex(x => x.id === id);
      if (i < 0) return;
      if (noteHasContent(list[i]) && !confirm('Delete this note? This can’t be undone. (Tip: archive it instead to keep it.)')) return;
      list.splice(i, 1); Store.save(true); paint(); active.ctx.onChange();
    }
    function restore(id) { const n = findNote(id); if (!n) return; n.archived = false; Store.save(true); paint(); active.ctx.onChange(); toast('restored'); }

    return { build, paint, teardown, restore, spawn, addNote, get current() { return active; } };
  })();

  /* ==========================================================
     7b · Draw — pen strokes drawn ON individual sticky notes
       Each note carries its own `doodle` array; a transparent SVG
       overlay sits on the note, inert until pen mode is toggled on.
     ========================================================== */
  const Draw = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const COLORS = ['#1c1c1e', '#d6453d', '#2f6df0', '#1f9d57', '#ffd84d'];
    let enabled = false, color = '#1c1c1e', tool = 'pen';
    const history = [];                       // [{ note, id }] — per-session undo stack

    const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const toD = (p) => p.length ? 'M' + p.map(q => q[0] + ',' + q[1]).join(' L') : '';
    const rel = (layer, e) => { const r = layer.getBoundingClientRect(); return [Math.round(e.clientX - r.left), Math.round(e.clientY - r.top)]; };

    /* build a note's drawing overlay (called from buildNote); always shows
       existing strokes, only captures input when not read-only */
    function layerFor(note, readonly) {
      const layer = mk('svg', { class: 'note-doodle' });
      render(layer, note);
      if (!readonly) wire(layer, note);
      return layer;
    }
    function render(layer, note) {
      layer.innerHTML = '';
      (note.doodle || []).forEach(s => {
        const p = mk('path', { d: toD(s.points), stroke: s.color, 'stroke-width': s.width || 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        p.dataset.id = s.id; layer.appendChild(p);
      });
    }
    function rerenderNote(note) {
      document.querySelectorAll(`.note[data-id="${note.id}"] .note-doodle`).forEach(l => render(l, note));
    }

    function wire(layer, note) {
      let pts = null, strokeEl = null;
      const move = (e) => { pts.push(rel(layer, e)); strokeEl.setAttribute('d', toD(pts)); };
      const up = () => {
        layer.removeEventListener('pointermove', move); layer.removeEventListener('pointerup', up);
        if (pts && pts.length > 1) {
          const s = { id: uid(), color, width: 3, points: pts };
          (note.doodle ||= []).push(s); history.push({ note, id: s.id }); Store.save(true);
          strokeEl.dataset.id = s.id;
        } else strokeEl?.remove();
        pts = null; strokeEl = null;
      };
      const erMove = (e) => eraseAt(layer, note, e);
      const erUp = () => { layer.removeEventListener('pointermove', erMove); layer.removeEventListener('pointerup', erUp); };
      layer.addEventListener('pointerdown', (e) => {
        if (!enabled) return;
        e.preventDefault(); e.stopPropagation(); layer.setPointerCapture?.(e.pointerId);
        if (tool === 'eraser') { eraseAt(layer, note, e); layer.addEventListener('pointermove', erMove); layer.addEventListener('pointerup', erUp); return; }
        pts = [rel(layer, e)];
        strokeEl = mk('path', { stroke: color, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: '' });
        layer.appendChild(strokeEl);
        layer.addEventListener('pointermove', move); layer.addEventListener('pointerup', up);
      });
    }
    function eraseAt(layer, note, e) {
      const [x, y] = rel(layer, e); const list = note.doodle || [];
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].points.some(p => Math.hypot(p[0] - x, p[1] - y) < 16)) {
          const id = list[i].id; list.splice(i, 1);
          layer.querySelector(`[data-id="${id}"]`)?.remove(); Store.save(true); break;
        }
      }
    }
    function undo() {
      const last = history.pop();
      if (!last) { toast('nothing to undo'); return; }
      const list = last.note.doodle || [];
      const i = list.findIndex(s => s.id === last.id);
      if (i >= 0) { list.splice(i, 1); Store.save(true); rerenderNote(last.note); }
    }
    function clearAll() {
      const c = Canvas.current; if (!c) return;
      if (!confirm('Clear all pen drawings on this page?')) return;
      Store.notes(c.ctx.view, c.ctx.dateKey).forEach(n => { n.doodle = []; });
      Store.save(true); history.length = 0;
      document.querySelectorAll('.note-doodle').forEach(l => { l.innerHTML = ''; });
    }

    /* toggle pen mode (page-wide) + floating toolbar */
    function toggle() {
      enabled = !enabled;
      document.body.classList.toggle('pen-mode', enabled);
      if (enabled) showBar(); else $('#draw-bar')?.remove();
      return enabled;
    }
    function showBar() {
      $('#draw-bar')?.remove();
      const bar = el('div', { id: 'draw-bar' });
      const swEls = COLORS.map(c => el('button', { class: 'draw-sw', style: `background:${c}`, dataset: { c }, title: 'pen' }));
      const eraser = el('button', { class: 'draw-tool', html: svg('eraser'), title: 'eraser' });
      const undoBtn = el('button', { class: 'draw-tool', html: svg('undo'), title: 'undo last stroke', onclick: () => undo() });
      const clear = el('button', { class: 'draw-tool', html: svg('trash'), title: 'clear page drawings', onclick: () => clearAll() });
      const done = el('button', { class: 'btn primary sm', text: 'done', onclick: () => toggle() });
      const mark = () => {
        swEls.forEach(b => b.classList.toggle('on', tool === 'pen' && b.dataset.c === color));
        eraser.classList.toggle('on', tool === 'eraser');
      };
      swEls.forEach(b => b.addEventListener('click', () => { color = b.dataset.c; tool = 'pen'; mark(); }));
      eraser.addEventListener('click', () => { tool = 'eraser'; mark(); });
      bar.append(el('span', { class: 'draw-hint', text: '✏️ draw on notes' }), el('div', { class: 'draw-swatches' }, swEls), eraser, undoBtn, clear, done);
      document.body.append(bar);
      mark();
    }

    function teardown() { enabled = false; document.body.classList.remove('pen-mode'); $('#draw-bar')?.remove(); history.length = 0; }

    return { layerFor, toggle, teardown, get enabled() { return enabled; } };
  })();

  /* ==========================================================
     7c · Stickers — placeable emoji decorations on a canvas
     ========================================================== */
  const Stickers = (() => {
    const PALETTE = ['🍉','🍓','🌸','🌷','🌿','⭐','✨','🩷','💛','☀️','🌙','☁️','🦋','🐾','🧸','🎀','☕','📌','🌈','🍄'];
    let layer = null, view = null, key = null;

    function attach(surf, v, k, readonly) {
      view = v; key = k;
      layer = el('div', { class:'sticker-layer' });
      surf.appendChild(layer);
      renderAll(readonly);
    }
    function renderAll(readonly) {
      if (!layer) return;
      layer.innerHTML = '';
      Store.stickers(view, key).forEach(s => layer.appendChild(makeEl(s, readonly)));
    }
    function makeEl(s, readonly) {
      const w = el('button', { class:'sticker', style:`left:${s.x}px; top:${s.y}px; font-size:${(s.scale || 1) * 38}px`, text: s.emoji });
      if (!readonly) {
        w.addEventListener('pointerdown', (e) => drag(e, w, s));
        w.appendChild(el('span', { class:'sticker-x', text:'✕', title:'remove',
          onclick: (e) => { e.stopPropagation(); removeOne(s.id, readonly); } }));
      }
      return w;
    }
    function drag(e, w, s) {
      if (e.target.classList?.contains('sticker-x')) return;
      e.preventDefault(); e.stopPropagation();
      const r = layer.getBoundingClientRect();
      const offX = e.clientX - r.left - s.x, offY = e.clientY - r.top - s.y;
      w.setPointerCapture?.(e.pointerId); w.classList.add('grab');
      const move = (ev) => {
        s.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 20));
        s.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = s.x + 'px'; w.style.top = s.y + 'px';
      };
      const up = () => { w.classList.remove('grab'); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); Store.save(true); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }
    function add(emoji) {
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      const s = { id: uid(), emoji, x: Math.round(clamp(r.width / 2 - 20 + (Math.random() * 80 - 40), 0, r.width - 40)), y: Math.round(110 + Math.random() * 90), scale: 1 };
      Store.stickers(view, key).push(s); Store.save(true);
      layer.appendChild(makeEl(s, false));
    }
    function removeOne(id) {
      const list = Store.stickers(view, key);
      const i = list.findIndex(x => x.id === id);
      if (i >= 0) { list.splice(i, 1); Store.save(true); renderAll(false); layer.classList.add('editing'); }
    }
    function openTray() {
      if (!layer) return false;
      $('#sticker-bar')?.remove();
      layer.classList.add('editing');
      const grid = el('div', { class:'sticker-grid' }, PALETTE.map(em =>
        el('button', { class:'sticker-pick', text: em, onclick: () => add(em) })));
      const done = el('button', { class:'btn primary sm', text:'done', onclick: () => closeTray() });
      document.body.append(el('div', { id:'sticker-bar' }, [
        el('div', { class:'sticker-bar-hint', text:'tap to place · drag to move · ✕ to remove' }), grid, done ]));
      return true;
    }
    function closeTray() { $('#sticker-bar')?.remove(); layer?.classList.remove('editing'); return false; }
    function toggle() { return $('#sticker-bar') ? closeTray() : openTray(); }
    function teardown() { $('#sticker-bar')?.remove(); layer = null; }

    return { attach, toggle, teardown };
  })();

  /* ==========================================================
     8 · Dashboard
     ========================================================== */
  const Dashboard = (() => {
    let panelOpen = false;
    const KEY = 'board';                 // fixed key — dashboard notes persist (no 3am reset)
    function reset() {}

    function mount(root) {
      const wrap = el('div', { class:'dash-wrap' });

      const body = el('div', { class:'dash-body' });
      const canvasCol = el('div', { class:'dash-canvas' });
      const surface = Canvas.build({ view:'dashboard', dateKey: KEY, readonly: false, onChange: refreshPanel, tall: true });
      surface.prepend(focusWidget()); surface.prepend(digestCard()); surface.prepend(calendarWidget());
      Pets.mount(surface);
      canvasCol.append(surface);

      const panel = el('aside', { class:'side-panel' + (panelOpen ? ' open':''), id:'dash-panel' });
      body.append(canvasCol, panel);
      wrap.append(body);
      root.append(wrap);

      // floating cluster: draw · archive · + note  (dashboard notes persist; no daily reset)
      wrap.append(el('div', { class:'fab-cluster' }, [
        stickerFab(),
        penFab(),
        el('button', { class:'fab-mini', title:'archived notes', 'aria-label':'archived notes', html: svg('archive'), onclick: () => togglePanel() }),
        addFab(() => Canvas.addNote()),
      ]));
      refreshPanel();
    }

    /* auto-pinned "today" digest: curriculum next-up, gym, journal, mood — draggable */
    function greeting() {
      const h = new Date().getHours();
      const part = h < 5 ? 'still up' : h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : h < 21 ? 'good evening' : 'good night';
      const m = Store.get().meta;
      const who = m.name || (m.nicknames && pick(m.nicknames)) || '';
      return `${part}, ${who} ✨`;
    }
    function digestCard() {
      const d = Store.get();
      const tk = todayKey();
      const pos = d.meta.digestPos;
      const card = el('div', { class:'digest-card' + (pos ? ' pinned' : ''), style: pos ? `left:${pos.x}px; top:${pos.y}px` : '' });
      const head = el('div', { class:'digest-head' }, [
        el('span', { class:'kicker', text: `today · ${prettyDate()}` }),
        el('span', { class:'digest-grip', title:'drag', text:'⠿' }),
      ]);
      head.addEventListener('pointerdown', (e) => dragDigest(e, card));
      card.append(el('div', { class:'digest-greet', text: greeting() }));
      card.append(head);
      const rows = el('div', { class:'digest-rows' });

      const cd = Plan.daysUntilStart();
      rows.append(digestRow('⏳', cd > 0 ? `${cd} day${cd>1?'s':''} until your internship` : cd === 0 ? 'internship starts today 🎉' : 'internship in progress 💪', '', '#work'));

      const lessons = Work.allLessons().filter(L => L.track === 'curriculum');
      const done = lessons.reduce((a, L) => a + (Store.lesson(L.id).complete ? 1 : 0), 0);
      const next = lessons.find(L => !Store.lesson(L.id).complete);
      rows.append(digestRow('📘', next ? `next: ${next.builtin ? 'day '+next.day+' — ' : ''}${next.title}` : 'curriculum complete 🎉',
        `${done}/${lessons.length}`, next ? `#work/lesson/${next.id}` : '#work'));

      const todayNotes = ((d.canvas.personal || {})[tk] || []).filter(n => !n.archived);
      const gym = todayNotes.find(n => n.tag === 'gym');
      if (gym && gym.checklist) {
        const leftN = gym.checklist.filter(c => !c.done).length;
        rows.append(digestRow('🏋️', leftN ? `gym: ${leftN} left` : 'gym: done ✓', `${gym.checklist.length-leftN}/${gym.checklist.length}`, '#personal'));
      }
      const jr = todayNotes.find(n => n.tag === 'journal');
      const journaled = jr && stripHtml(jr.html).replace(/^.*?\?/, '').trim().length > 0;
      rows.append(digestRow('✍️', journaled ? 'journal: written ✓' : 'journal: not yet', '', '#personal'));

      const mood = (d.meta.mood || {})[tk];
      rows.append(digestRow('🌤️', mood ? `mood: ${['','low','meh','ok','good','great'][mood]}` : 'mood: not logged', '', '#personal'));

      card.append(rows);
      return card;
    }
    function digestRow(icon, label, badge, hash) {
      return el('a', { class:'digest-row', href: hash }, [
        el('span', { class:'dg-ico', text: icon }),
        el('span', { class:'dg-label', text: label }),
        badge ? el('span', { class:'dg-badge', text: badge }) : el('span'),
      ]);
    }
    function dragDigest(e, card) {
      e.preventDefault();
      const surface = card.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const start = card.getBoundingClientRect();
      let px = start.left - r.left, py = start.top - r.top;
      const offX = e.clientX - r.left - px, offY = e.clientY - r.top - py;
      card.classList.add('pinned', 'dragging'); card.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        px = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 60));
        py = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        card.style.left = px + 'px'; card.style.top = py + 'px';
      };
      const up = () => {
        card.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        meta.digestPos = { x: px, y: py }; Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    function focusWidget() {
      const meta = Store.get().meta;
      const w = el('div', { class:'focus-widget', style:`left:${meta.focusPos.x}px; top:${meta.focusPos.y}px` });
      const head = el('div', { class:'fw-head' }, [ el('span', { class:'stamp', text:'focus' }), el('span', { class:'stamp', text:'drag' }) ]);
      head.addEventListener('pointerdown', (e) => dragWidget(e, w));
      w.append(head);

      const frame = el('div', { class:'media-frame', title:'click to set a local photo' });
      const repaint = () => {
        frame.innerHTML = '';
        if (meta.catImage) frame.append(el('img', { src: meta.catImage, alt:'focus photo' }));
        else frame.append(el('div', { class:'media-placeholder' }, [ el('div', { class:'cat', text:'🐱' }), el('div', { text:'click to load a local photo' }) ]));
        frame.append(el('div', { class:'media-overlay', text:'better days ahead twin' }));
      };
      repaint();
      frame.addEventListener('click', () => { if (w._dragged) { w._dragged = false; return; } pickImage((src) => { meta.catImage = src; Store.save(true); repaint(); toast('photo set'); }); });
      w.append(frame);

      const weather = el('div', { class:'weather-badge' });
      Weather.mount(weather);
      w.append(weather);
      return w;
    }
    function dragWidget(e, w) {
      if (e.target.closest('.icon-btn')) return;
      e.preventDefault();
      const surface = w.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const offX = e.clientX - r.left - meta.focusPos.x, offY = e.clientY - r.top - meta.focusPos.y;
      w.classList.add('dragging'); w.setPointerCapture?.(e.pointerId); let moved = false;
      const move = (ev) => {
        moved = true;
        meta.focusPos.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 40));
        meta.focusPos.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = meta.focusPos.x + 'px'; w.style.top = meta.focusPos.y + 'px';
      };
      const up = () => { w.classList.remove('dragging'); if (moved) w._dragged = true;
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); Store.save(true); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    /* ── Google Calendar embed (draggable widget) — plain agenda, white bg ── */
    function buildCalEmbedUrl(raw) {
      raw = (raw || '').trim();
      if (!raw) return '';
      const tag = raw.match(/src="([^"]+)"/i);                 // pasted a full <iframe …> tag
      if (tag) return tag[1];
      if (/^https?:\/\//i.test(raw)) return raw;               // already an embed URL
      const ymd = (d) => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      const today = new Date();
      const week = `${ymd(today)}/${ymd(new Date(Date.now() + 7 * 864e5))}`;   // next 7 days only
      return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(raw)}` +
             `&ctz=America/Los_Angeles&mode=AGENDA&dates=${week}` +
             `&showTitle=0&showPrint=0&showCalendars=0&showTz=0&showTabs=0&showNav=1&showDate=1`;
    }
    function calendarWidget() {
      const meta = Store.get().meta;
      const pos = meta.calPos || { x: 26, y: 372 };
      const w = el('div', { class:'cal-widget', style:`left:${pos.x}px; top:${pos.y}px` });
      const body = el('div', { class:'cal-body' });
      const head = el('div', { class:'cal-head' }, [
        el('span', { class:'stamp', text:'📅 calendar' }),
        el('div', { class:'cal-head-tools' }, [
          el('button', { class:'cal-edit', title:'calendar settings', html: svg('gear'), onclick: () => calSetup(body) }),
          el('span', { class:'stamp cal-grip', text:'drag' }),
        ]),
      ]);
      head.addEventListener('pointerdown', (e) => dragCal(e, w));
      w.append(head, body);
      renderCal(body);
      return w;
    }
    function renderCal(body) {
      const meta = Store.get().meta;
      body.innerHTML = '';
      const url = buildCalEmbedUrl(meta.calUrl);
      if (url) body.append(el('iframe', { class:'cal-frame', src: url, loading:'lazy', title:'Google Calendar' }));
      else calSetup(body);
    }
    function calSetup(body) {
      const meta = Store.get().meta;
      body.innerHTML = '';
      const inp = el('input', { class:'field cal-input', value: meta.calUrl || '', placeholder:'you@gmail.com  or  embed URL' });
      const save = () => { meta.calUrl = inp.value.trim(); Store.save(true); renderCal(body); };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
      body.append(el('div', { class:'cal-setup' }, [
        el('div', { class:'cal-setup-title', text:'connect Google Calendar' }),
        el('div', { class:'cal-setup-hint', html:
          'paste your calendar address (e.g. <b>you@gmail.com</b>) or a full embed URL from Google Calendar → Settings → “Integrate calendar”. it shows whenever you’re signed in to that account in this browser.' }),
        inp,
        el('div', { style:'display:flex; gap:6px; flex-wrap:wrap' }, [
          el('button', { class:'btn primary sm', text:'show calendar', onclick: save }),
          meta.calUrl ? el('button', { class:'btn ghost sm', text:'clear', onclick: () => { meta.calUrl=''; Store.save(true); renderCal(body); } }) : el('span'),
        ]),
      ]));
    }
    function dragCal(e, w) {
      if (e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault();
      const surface = w.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const start = w.getBoundingClientRect();
      let px = start.left - r.left, py = start.top - r.top;
      const offX = e.clientX - r.left - px, offY = e.clientY - r.top - py;
      w.classList.add('dragging'); w.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        px = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 80));
        py = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = px + 'px'; w.style.top = py + 'px';
      };
      const up = () => {
        w.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        meta.calPos = { x: px, y: py }; Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    function togglePanel() {
      const p = $('#dash-panel');
      if (panelOpen) { panelOpen = false; p.classList.remove('open'); return; }
      panelOpen = true; p.classList.add('open'); refreshPanel();
    }
    function refreshPanel() {
      const p = $('#dash-panel'); if (!p) return;
      const inner = el('div', { class:'side-inner' });
      inner.append(el('div', { class:'side-phead' }, [
        el('span', { class:'kicker', text:'archived notes' }),
        iconBtn('x', 'close panel', () => { panelOpen = false; p.classList.remove('open'); }),
      ]));
      inner.append(archiveList());
      p.innerHTML = ''; p.append(inner);
    }
    function archiveList() {
      const box = el('div');
      const arch = Store.notes('dashboard', KEY).filter(n => n.archived);
      if (!arch.length) { box.append(el('div', { class:'empty-line', text:'no archived notes.' })); return box; }
      arch.forEach(n => box.append(el('div', { class:'arch-item' }, [
        el('div', { class:'arch-text', html: n.html || '(empty)' }),
        el('div', { class:'arch-row' }, [ el('span', { text:new Date(n.timestamp).toLocaleDateString() }), iconBtn('restore','restore',() => Canvas.restore(n.id)) ]),
      ])));
      return box;
    }
    return { mount, reset };
  })();

  function pickImage(done) {
    const input = el('input', { type:'file', accept:'image/*', style:'display:none' });
    document.body.append(input);
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (f) fileToImage(f, (src) => { done(src); input.remove(); });
      else input.remove();
    });
    input.click();
  }

  /* ==========================================================
     9 · Work hub  (curriculum + journal feed, sort, detail, feedback)
     ========================================================== */
  const Work = (() => {
    let sort = 'all';
    const lessonId = (L) => `d${L.day}`;        // stable, day-based — survives reordering
    const allLessons = () => [
      ...CURRICULUM_BASE.map((L) => ({ ...L, id: lessonId(L), builtin: true, track: 'curriculum' })),
      ...FINANCE_BASE.map((L) => ({ ...L, id: `f-${L.slug}`, builtin: true, track: 'finance' })),
      ...Store.get().work.customLessons.map(L => ({ ...L, builtin: false, track: L.track || 'curriculum' })),
    ];
    const findLesson = (id) => allLessons().find(L => L.id === id);

    function mount(root, sub = []) {
      if (sub[0] === 'lesson' && sub[1]) return mountLesson(root, sub[1]);
      if (sub[0] === 'journal' && sub[1]) return mountJournal(root, sub[1]);
      mountFeed(root);
    }

    /* ---------- feed ---------- */
    function mountFeed(root) {
      const wrap = el('div', { class:'work-wrap' });
      const lessons = allLessons();
      const curric = lessons.filter(L => L.track === 'curriculum');
      const done = curric.reduce((a, L) => a + (Store.lesson(L.id).complete ? 1 : 0), 0);

      wrap.append(el('div', { class:'work-head' }, [
        el('div', { class:'kicker', text:'curriculum // williams-sonoma internship prep' }),
        el('h1', { text:'work hub' }),
        progressTrack(done, curric.length),
      ]));
      wrap.append(prepBar(curric));

      const addBtn = el('button', { class:'btn primary icon-only', html: svg('plus'), title:'add lesson or journal entry', 'aria-label':'add lesson or journal entry' });
      addBtn.addEventListener('click', () => popover(addBtn, [
        { icon:'book', label:'curriculum lesson', onClick: addLesson },
        { icon:'note', label:'journal entry', onClick: addEntry },
      ]));
      wrap.append(el('div', { class:'work-toolbar' }, [
        el('div', { class:'sortseg' }, [ segBtn('all','all'), segBtn('curriculum','curriculum'), segBtn('finance','finance'), segBtn('journal','journal') ]),
        addBtn,
      ]));

      const feed = el('div', { class:'feed' });
      const items = [];
      const showLessons = sort === 'all' || sort === 'curriculum' || sort === 'finance';
      if (showLessons) lessons.filter(L => sort === 'all' || L.track === sort).forEach(L => items.push({ kind:'lesson', L }));
      if (sort === 'all' || sort === 'journal') Store.get().work.entries.slice().sort((a,b)=>b.ts-a.ts).forEach(e => items.push({ kind:'journal', e }));
      if (!items.length) feed.append(el('div', { class:'empty-line', text:'nothing here yet.' }));
      items.forEach(it => feed.append(it.kind === 'lesson' ? lessonCard(it.L) : journalCard(it.e)));
      wrap.append(feed);
      root.append(wrap);
    }

    /* countdown + pace + one-tap prep scheduler */
    function prepBar(lessons) {
      const total = lessons.length;
      const done = lessons.filter(L => Store.lesson(L.id).complete).length;
      const today = todayKey();
      const dueNow = lessons.filter(L => { const dt = Plan.dateOf(L.id); return dt && dt <= today && !Store.lesson(L.id).complete; }).length;
      const days = Plan.daysUntilStart();
      const countdown = days > 0 ? `${days} day${days>1?'s':''} until day 1 (${prettyKey(Plan.startDate())})`
        : days === 0 ? 'internship starts today 🎉' : 'internship in progress 💪';
      const scheduled = Object.keys(Plan.lessonDates()).length > 0;
      const sub = `${done}/${total} done · ` + (!scheduled ? 'tap “plan my prep” to schedule' : dueNow ? `${dueNow} due now — keep going` : 'on pace ✓');
      return el('div', { class:'prep-bar' }, [
        el('div', { class:'prep-left' }, [
          el('div', { class:'prep-count', text: countdown }),
          el('div', { class:'prep-sub', text: sub }),
        ]),
        el('button', { class:'btn ghost sm', text: scheduled ? 'replan' : 'plan my prep', onclick: () => {
          const ok = Plan.assign(lessons.map(L => ({ id:L.id, complete: Store.lesson(L.id).complete })));
          toast(ok ? 'prep plan spread across your days ✓' : 'set a later start date to leave prep days');
          const r=$('#view'); r.innerHTML=''; mountFeed(r);
        } }),
      ]);
    }
    const prettyKey = (k) => { const d = parseKey(k); return `${MON[d.getMonth()].slice(0,3)} ${d.getDate()}`; };

    /* per-lesson schedule date + a quick focus-timer launcher */
    function scheduleRow(L) {
      const wrap = el('div', { class:'sched-row' });
      const inp = el('input', { class:'sched-date', type:'date', value: Plan.dateOf(L.id) || '' });
      inp.addEventListener('change', () => { Plan.setDate(L.id, inp.value); toast(inp.value ? 'scheduled' : 'unscheduled'); });
      wrap.append(el('span', { class:'sched-label', text:'📅 do this on' }), inp,
        el('button', { class:'btn ghost sm', text:'▶ 25-min focus', onclick: () => Timer.start(25, 'focus') }));
      return wrap;
    }
    const segBtn = (id,label) => el('button', { class: sort===id?'active':'', text:label, onclick:() => { sort=id; const r=$('#view'); r.innerHTML=''; mountFeed(r); } });

    function progressTrack(done, total) {
      const pct = total ? Math.round(done/total*100) : 0;
      return el('div', { class:'progress-track' }, [
        el('div', { class:'progress-rail' }, el('div', { class:'progress-fill', style:`width:${pct}%` })),
        el('div', { class:'progress-label', text:`${done}/${total} complete · ${pct}%` }),
      ]);
    }

    /* ---- lesson time estimate (summed from step.time strings) ---- */
    function stepMinutes(t) {
      if (!t) return 0;
      let m = 0;
      const hr = String(t).match(/(\d+(?:\.\d+)?)\s*h/i); if (hr) m += parseFloat(hr[1]) * 60;
      const mn = String(t).match(/(\d+)\s*m/i); if (mn) m += parseInt(mn[1], 10);
      return m;
    }
    const lessonMinutes = (L) => (L.steps || []).reduce((a, s) => a + stepMinutes(s.time), 0);
    function fmtMins(m) { if (!m) return ''; const h = Math.floor(m/60), mm = m%60; return h ? (mm ? `${h}h ${mm}m` : `${h}h`) : `${mm}m`; }

    function lessonCard(L) {
      const st = Store.lesson(L.id);
      const mins = lessonMinutes(L), n = (L.steps||[]).length;
      const lmeta = `${n} step${n>1?'s':''}${mins?` · ~${fmtMins(mins)}`:''}`;
      const metaRow = el('div', { class:'lmeta' }, [ n ? el('span', { text: lmeta }) : el('span'), planChip(L.id, st.complete) ].filter(Boolean));
      const isFin = L.track === 'finance';
      const thumb = isFin ? '$' : (L.builtin ? String(L.day).padStart(2,'0') : '✎');
      const lnum = isFin ? `finance · ${L.n}` : (L.builtin ? `day ${L.day}` : 'custom') + (L.week?` · week ${L.week}`:'');
      return el('a', { class:'feed-card' + (st.complete?' done':'') + (isFin?' finance':''), href:`#work/lesson/${L.id}` }, [
        el('div', { class:'feed-thumb', text: thumb }, el('span', { class:'feed-badge', text: isFin?'finance':'lesson' })),
        el('div', { class:'feed-meta' }, [
          el('div', { class:'lnum', text: lnum }),
          el('h3', { text: L.title }),
          metaRow,
          el('div', { class:'lstatus' + (st.complete?' ok':'') }, [ el('span', { class:'dot-mark'+(st.complete?' fill':'') }), el('span', { text: st.complete?'complete':(st.submitted?'submitted':'not started') }) ]),
        ]),
      ]);
    }
    /* a small scheduled-date chip (today / overdue / done / date) */
    function planChip(id, complete) {
      const dt = Plan.dateOf(id);
      if (!dt) return null;
      const today = todayKey();
      const d = parseKey(dt), lbl = `${MON[d.getMonth()].slice(0,3)} ${d.getDate()}`;
      let cls = 'plan-chip', txt = lbl;
      if (complete) txt = `✓ ${lbl}`;
      else if (dt < today) { cls += ' overdue'; txt = `overdue · ${lbl}`; }
      else if (dt === today) { cls += ' today'; txt = 'today'; }
      else if (dt === addDays(today, 1)) txt = `tomorrow`;
      return el('span', { class: cls, text: txt });
    }
    function journalCard(e) {
      return el('a', { class:'feed-card journal', href:`#work/journal/${e.id}` }, [
        el('div', { class:'feed-thumb', text:'✍' }, el('span', { class:'feed-badge', text:'journal' })),
        el('div', { class:'feed-meta' }, [
          el('div', { class:'lnum', text:new Date(e.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'}) }),
          el('h3', { text: e.title || 'untitled entry' }),
          el('div', { class:'lstatus', text:(e.body||'').slice(0,60) || '—' }),
        ]),
      ]);
    }

    /* ---------- add entry / lesson (modal) ---------- */
    const row = (label, ctrl) => el('div', { class:'modal-row' }, [ el('label', { text:label }), ctrl ]);
    function addEntry() {
      Modal.open('New journal entry', (body, close) => {
        const title = el('input', { class:'field', placeholder:'title (e.g. Friday Intern Log — Week 1)' });
        const ta = el('textarea', { class:'field', style:'min-height:200px', placeholder:'raw brain-dump — wins, blockers, iterations, feedback…' });
        body.append(row('Title', title), row('Entry', ta),
          el('div', { class:'modal-actions' }, [
            el('button', { class:'btn ghost', text:'cancel', onclick: close }),
            el('button', { class:'btn primary', text:'save entry', onclick: () => {
              Store.get().work.entries.push({ id: uid(), title: title.value.trim(), body: ta.value, ts: Date.now() });
              Store.save(true); close(); const r=$('#view'); r.innerHTML=''; mountFeed(r); toast('entry saved');
            } }),
          ]));
        setTimeout(() => title.focus(), 50);
      });
    }
    function addLesson() {
      Modal.open('New custom lesson', (body, close) => {
        const title = el('input', { class:'field', placeholder:'lesson title' });
        const concept = el('textarea', { class:'field', placeholder:'core concept', style:'min-height:70px' });
        const output = el('input', { class:'field', placeholder:'target output / deliverable' });
        const trackSel = el('select', { class:'field' }, [
          el('option', { value:'curriculum', text:'Curriculum (internship prep)' }),
          el('option', { value:'finance', text:'Finance (financial literacy)' }),
        ]);
        trackSel.value = (sort === 'finance') ? 'finance' : 'curriculum';
        body.append(row('Title', title), row('Track', trackSel), row('Core concept', concept), row('Output', output),
          el('div', { class:'modal-actions' }, [
            el('button', { class:'btn ghost', text:'cancel', onclick: close }),
            el('button', { class:'btn primary', text:'create', onclick: () => {
              const id = 'x'+uid();
              Store.get().work.customLessons.push({ id, track: trackSel.value, title:title.value.trim()||'Untitled lesson', coreConcept:concept.value.trim(), output:output.value.trim(), steps:[], objectives:[], feedbackCriteria:[], figmaExercise:null, week:null, day:null });
              Store.save(true); close(); toast('lesson created — now add the details'); editLesson(id);
            } }),
          ]));
        setTimeout(() => title.focus(), 50);
      });
    }

    /* full structured editor for a custom lesson — objectives, time-boxed
       steps with resources, figma exercise, and a self-review rubric, so
       your own lessons match the built-in structure */
    function editLesson(id) {
      const L = Store.get().work.customLessons.find(x => x.id === id);
      if (!L) { toast('lesson not found'); return; }
      Modal.open('Edit lesson', (body, close) => {
        const title = el('input', { class:'field', value: L.title || '' });
        const concept = el('textarea', { class:'field', style:'min-height:60px', value: L.coreConcept || '' });
        const output = el('input', { class:'field', value: L.output || '' });
        const objectives = el('textarea', { class:'field', style:'min-height:60px', placeholder:'one objective per line', value:(L.objectives||[]).join('\n') });

        const stepsWrap = el('div', { class:'steps-editor' });
        const stepRecs = [];
        function addStepRow(s) {
          s = s || { title:'', time:'', detail:'', resources:[] };
          const t  = el('input', { class:'field', placeholder:'step title', value: s.title||'' });
          const tm = el('input', { class:'field', placeholder:'time (e.g. 30 min)', value: s.time||'' });
          const dt = el('textarea', { class:'field', style:'min-height:54px', placeholder:'what to do in this step', value: s.detail||'' });
          const rs = el('textarea', { class:'field', style:'min-height:40px', placeholder:'resources — one per line:  Title | https://url', value:(s.resources||[]).map(r => `${r.title} | ${r.url}`).join('\n') });
          const rec = { t, tm, dt, rs };
          const wrap = el('div', { class:'step-edit' }, [
            t, tm, dt, rs,
            el('button', { class:'btn ghost sm', text:'remove step', onclick: () => { wrap.remove(); const i = stepRecs.indexOf(rec); if (i>=0) stepRecs.splice(i,1); } }),
          ]);
          stepRecs.push(rec); stepsWrap.append(wrap);
        }
        (L.steps && L.steps.length ? L.steps : [null]).forEach(addStepRow);
        const addStepBtn = el('button', { class:'btn ghost sm', text:'+ add step', onclick: () => addStepRow() });

        const figBrief = el('textarea', { class:'field', style:'min-height:54px', placeholder:'figma / activity brief', value: L.figmaExercise?.brief || '' });
        const figDeliv = el('input', { class:'field', placeholder:'deliverable (what you submit)', value: L.figmaExercise?.deliverable || '' });
        const feedback = el('textarea', { class:'field', style:'min-height:60px', placeholder:'one self-review criterion per line', value:(L.feedbackCriteria||[]).join('\n') });

        const lines = (v) => v.split('\n').map(s => s.trim()).filter(Boolean);
        const save = () => {
          L.title = title.value.trim() || 'Untitled lesson';
          L.coreConcept = concept.value.trim();
          L.output = output.value.trim();
          L.objectives = lines(objectives.value);
          L.steps = stepRecs.map(r => ({
            title: r.t.value.trim(), time: r.tm.value.trim(), detail: r.dt.value.trim(),
            resources: lines(r.rs.value).map(line => {
              const bar = line.indexOf('|');
              const ti = bar >= 0 ? line.slice(0, bar).trim() : '';
              const u  = bar >= 0 ? line.slice(bar + 1).trim() : line.trim();
              if (!/^https?:\/\//i.test(u)) return null;
              return { title: ti || u, url: u, type: /youtu\.?be/i.test(u) ? 'video' : 'doc' };
            }).filter(Boolean),
          })).filter(s => s.title || s.detail);
          const fb = figBrief.value.trim(), fd = figDeliv.value.trim();
          L.figmaExercise = (fb || fd) ? { brief: fb, deliverable: fd } : null;
          L.feedbackCriteria = lines(feedback.value);
          Store.save(true); close();
          const r = $('#view'); r.innerHTML=''; mountLesson(r, id); toast('lesson saved');
        };

        body.append(
          row('Title', title), row('Core concept', concept), row('Output / deliverable', output),
          row('Objectives (one per line)', objectives),
          el('div', { class:'modal-row' }, [ el('label', { text:'Steps' }), stepsWrap, addStepBtn ]),
          row('Figma / activity brief', figBrief), row('Deliverable', figDeliv),
          row('Self-review criteria (one per line)', feedback),
          el('div', { class:'modal-actions' }, [
            el('button', { class:'btn ghost', text:'done', onclick: close }),
            el('button', { class:'btn primary', text:'save lesson', onclick: save }),
          ]),
        );
        setTimeout(() => title.focus(), 50);
      });
    }

    /* ---------- journal detail ---------- */
    function mountJournal(root, id) {
      const e = Store.get().work.entries.find(x => x.id === id);
      if (!e) { location.hash = '#work'; return; }
      const wrap = el('div', { class:'work-wrap' });
      wrap.append(el('div', { style:'margin-bottom:12px' }, el('a', { class:'btn ghost sm', href:'#work', text:'← all' })));
      const card = el('div', { class:'journal-detail' });
      const title = el('input', { class:'field', value:e.title, placeholder:'title' });
      title.addEventListener('input', () => { e.title = title.value; Store.save(); });
      const ta = el('textarea', { class:'field' }); ta.value = e.body;
      ta.addEventListener('input', () => { e.body = ta.value; Store.save(); });
      card.append(el('div', { class:'kicker', text:`journal · ${new Date(e.ts).toLocaleString()}` }),
        el('div', { style:'height:8px' }), title, el('div', { style:'height:10px' }), ta,
        el('div', { class:'complete-bar' }, el('button', { class:'btn red sm', text:'delete entry', onclick: () => {
          if (!confirm('Delete this entry?')) return;
          const arr = Store.get().work.entries; arr.splice(arr.findIndex(x=>x.id===id),1); Store.save(true); location.hash='#work';
        } })));
      wrap.append(card); root.append(wrap);
    }

    /* ---------- lesson detail ---------- */
    function mountLesson(root, id) {
      const L = findLesson(id);
      if (!L) { location.hash = '#work'; return; }
      const wrap = el('div', { class:'work-wrap' });
      wrap.append(el('div', { style:'margin-bottom:12px' }, el('a', { class:'btn ghost sm', href:'#work', text:'← all lessons' })));

      const index = el('aside', { class:'lesson-index' }, el('div', { class:'ix-title', text:'quick jump' }));
      allLessons().forEach(item => {
        const s = Store.lesson(item.id);
        index.append(el('a', { class:'ix-link' + (item.id===id?' active':'') + (s.complete?' complete':''), href:`#work/lesson/${item.id}` },
          [ el('span', { class:'ix-n', text: item.track==='finance' ? '$' : (item.builtin ? String(item.day).padStart(2,'0') : '✎') }), el('span', { text:item.title }) ]));
      });

      const pane = el('div', { class:'lesson-pane' });
      pane.append(lessonBody(L, Store.lesson(L.id), pane));
      wrap.append(el('div', { class:'lesson-split' }, [ index, pane ]));
      root.append(wrap);
    }

    /* lesson body: carousel while in-progress, full scroll once complete */
    function lessonBody(L, st, pane) {
      if (st.complete) return archiveCard(L, st, pane);
      const box = el('div');
      box.append(el('div', { class:'kicker', text: L.track==='finance' ? `financial literacy · ${L.n}` : (L.builtin ? `day ${L.day} · week ${L.week}` : 'custom lesson') }));
      box.append(el('h2', { text: L.title }));
      box.append(scheduleRow(L));
      box.append(el('p', { class:'concept', text: L.coreConcept }));
      if (L.wsiContext) box.append(el('div', { class:'wsi-context', text: L.wsiContext }));

      if (L.objectives?.length) {
        box.append(el('div', { class:'section-label', text:'objectives' }));
        box.append(el('ul', { class:'obj-list' }, L.objectives.map(o => el('li', { text:o }))));
      }

      /* steps — one at a time via carousel */
      if (L.steps?.length) {
        box.append(el('div', { class:'section-label', text:'step-by-step' + (lessonMinutes(L) ? `  ·  ~${fmtMins(lessonMinutes(L))}` : '  ·  ~3–4 hrs') }));
        box.append(stepCarousel(L, st));
      } else {
        box.append(el('div', { class:'section-label', text:'plan' }));
        box.append(el('div', { class:'empty-line', text:'detailed steps are being compiled — or add your own with “new” on the work page.' }));
      }

      /* exercise + submission */
      box.append(el('div', { class:'section-label', text: L.exerciseLabel || 'figma exercise' }));
      if (L.figmaExercise) box.append(el('div', { class:'exercise-box' }, [
        el('div', { class:'ex-brief', text: L.figmaExercise.brief }),
        el('div', { class:'ex-deliv', text: '→ ' + L.figmaExercise.deliverable }),
      ]));
      else box.append(el('div', { class:'exercise-box' }, el('div', { class:'ex-brief', text: 'Produce: ' + (L.output || 'the lesson deliverable') })));
      box.append(submitZone(L, st, pane));

      /* notes */
      box.append(el('div', { class:'section-label', text:'your notes' }));
      const notes = el('textarea', { class:'lesson-notes', placeholder:'takeaways, questions, decisions…' });
      notes.value = st.notes; notes.addEventListener('input', () => { st.notes = notes.value; Store.save(); });
      box.append(notes);

      /* feedback */
      box.append(el('div', { class:'section-label', text:'feedback & self-review' }));
      box.append(feedbackCard(L, st, pane));

      /* complete */
      const bar = el('div', { class:'complete-bar' });
      const toggle = el('label', { class:'complete-toggle' });
      const cb = el('input', { type:'checkbox' });
      cb.addEventListener('change', () => {
        const done = cb.checked, r = cb.getBoundingClientRect();
        st.complete = done; st.completedAt = done ? Date.now() : null; Store.save(true);
        pane.innerHTML=''; pane.append(lessonBody(L, st, pane)); pane.scrollTop = 0;
        $$('.ix-link').forEach(a => { if (a.getAttribute('href')===`#work/lesson/${L.id}`) a.classList.toggle('complete', done); });
        toast(done ? 'lesson complete ✓' : 'reopened');
        if (done) { Pets.celebrate(); Confetti.burst(r.left + r.width/2, r.top); }
      });
      toggle.append(cb, el('span', { text:'mark “Lesson Complete” → lock as read-only reference' }));
      bar.append(toggle);
      if (!L.builtin) {
        bar.append(el('button', { class:'btn ghost sm', text:'edit lesson', onclick: () => editLesson(L.id) }));
        bar.append(el('button', { class:'btn red sm', text:'delete lesson', onclick: () => {
          if (!confirm('Delete this custom lesson?')) return;
          const arr = Store.get().work.customLessons; arr.splice(arr.findIndex(x=>x.id===L.id),1); Store.save(true); location.hash='#work';
        } }));
      }
      box.append(bar);
      box.append(lessonNav(L));
      return box;
    }

    /* one-step-at-a-time carousel with dot progress */
    function stepCarousel(L, st) {
      let idx = 0;
      // start on first not-done step
      for (let i = 0; i < L.steps.length; i++) { if (!st.stepsDone[i]) { idx = i; break; } }
      const carousel = el('div', { class:'carousel' });
      const stage = el('div', { class:'carousel-stage' });
      const dotsWrap = el('div', { class:'carousel-dots' });
      const count = el('div', { class:'carousel-count' });
      const prevBtn = iconBtn('chevL', 'previous step', () => go(idx - 1));
      const nextBtn = iconBtn('chevR', 'next step', () => go(idx + 1));

      function renderDots() {
        dotsWrap.innerHTML = '';
        L.steps.forEach((_, i) => {
          const d = el('button', { class:'cdot' + (i===idx?' active':'') + (st.stepsDone[i]?' done':''), title:`step ${i+1}`, onclick:() => go(i) });
          dotsWrap.append(d);
        });
      }
      function render() {
        stage.innerHTML = ''; stage.append(stepCard(L, st, idx, renderDots));
        count.textContent = `${idx+1} / ${L.steps.length}`;
        prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
        nextBtn.style.visibility = idx === L.steps.length - 1 ? 'hidden' : 'visible';
        renderDots();
      }
      function go(i) { idx = clamp(i, 0, L.steps.length - 1); render(); }

      carousel.append(stage, el('div', { class:'carousel-nav' }, [ prevBtn, dotsWrap, count, nextBtn ]));
      render();
      return carousel;
    }

    function stepCard(L, st, i, onToggle) {
      const s = L.steps[i];
      const wrap = el('div', { class:'step' + (st.stepsDone[i] ? ' done':'') });
      const main = el('div', { class:'step-main' }, [
        el('div', { class:'st-head-row' }, [
          el('span', { class:'st-title', text: s.title }),
          el('span', { class:'st-time', text: s.time }),
          stepMinutes(s.time) ? el('button', { class:'st-timer', title:'start a focus timer for this step', text:'▶', onclick: (e) => { e.preventDefault(); Timer.start(stepMinutes(s.time), `step ${i+1}`); } }) : el('span'),
        ]),
        el('div', { class:'st-detail', text: s.detail }),
      ]);
      if (s.resources?.length) {
        const res = el('div', { class:'step-res' });
        s.resources.forEach(r => {
          const isYt = /youtu/.test(r.url || '');
          res.append(el('a', { class:'res-link' + (isYt?' yt':''), href:r.url, target:'_blank', rel:'noopener', title:r.title },
            [ el('span', { class:'res-icon', html: svg(isYt ? 'ext' : 'ext') }), el('span', { class:'res-t', text: r.title }) ]));
        });
        main.append(res);
      }
      wrap.append(el('div', { class:'step-head' }, [ el('span', { class:'step-num', text:String(i+1) }), main ]));

      const doneRow = el('label', { class:'step-done-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!st.stepsDone[i];
      cb.addEventListener('change', () => { st.stepsDone[i] = cb.checked; wrap.classList.toggle('done', cb.checked); Store.save(true); onToggle && onToggle(); });
      doneRow.append(cb, el('span', { text:'mark this step done' }));
      wrap.append(doneRow);
      return wrap;
    }

    /* compact submit zone: small dropzone, full-width screenshots, figma link */
    function submitZone(L, st, pane) {
      const zone = el('div', { class:'submit-zone' });
      const dz = el('div', { class:'dropzone', html: svg('upload') + '<div>paste a screenshot (Ctrl/Cmd+V) of your Figma work · or click to browse</div>', tabindex:'0' });
      const grid = el('div', { class:'shot-grid' });
      const renderShots = () => {
        grid.innerHTML='';
        (st.shots||[]).forEach((s,i) => {
          const box = el('div', { class:'shot' }, el('img', { src:s.src||s, alt:`shot ${i+1}` }));
          const cap = el('div', { class:'cap', contenteditable:'true', text:(s.caption||'') });
          cap.addEventListener('input', () => { if (typeof st.shots[i]==='string') st.shots[i]={src:st.shots[i],caption:''}; st.shots[i].caption=cap.textContent; Store.save(); });
          box.append(cap, iconBtn('trash','remove',() => { st.shots.splice(i,1); Store.save(true); renderShots(); }, 'danger'));
          grid.append(box);
        });
      };
      const ingest = (files) => [...files].filter(f=>f.type.startsWith('image/')).forEach(f => fileToImage(f, (src) => { (st.shots||=[]).push({src,caption:''}); Store.save(true); renderShots(); }));
      dz.addEventListener('click', () => pickImage((src) => { (st.shots||=[]).push({src,caption:''}); Store.save(true); renderShots(); }));
      dz.addEventListener('paste', (e) => { const imgs=[...(e.clipboardData?.items||[])].filter(i=>i.type.startsWith('image/')); if(imgs.length){e.preventDefault(); ingest(imgs.map(i=>i.getAsFile()));}});
      ['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('over');}));
      ['dragleave','dragend'].forEach(ev=>dz.addEventListener(ev,()=>dz.classList.remove('over')));
      dz.addEventListener('drop', e=>{e.preventDefault();dz.classList.remove('over');ingest(e.dataTransfer.files);});
      zone.append(dz, grid);

      const linkRow = el('div', { class:'figma-link-row' });
      const link = el('input', { class:'field', placeholder:'paste your Figma share link…', value: st.figmaLink||'' });
      link.addEventListener('input', () => { st.figmaLink = link.value; Store.save(); });
      linkRow.append(link);
      if (st.figmaLink) linkRow.append(el('a', { class:'btn ghost sm', href:st.figmaLink, target:'_blank', rel:'noopener', html: svg('ext') + ' open' }));
      zone.append(linkRow);

      const submitBtn = el('button', { class:'btn primary', style:'margin-top:12px', text: st.submitted ? '✓ submitted — refresh feedback' : 'submit activity', onclick: () => {
        st.submitted = true; Store.save(true);
        pane.innerHTML=''; pane.append(lessonBody(L, st, pane));
        pane.querySelector('.feedback-card')?.scrollIntoView({ behavior:'smooth', block:'center' });
        toast('submitted — see feedback below');
      } });
      zone.append(submitBtn);
      renderShots();
      return zone;
    }

    /* AI-assisted feedback: a copy-pasteable prompt + a self-review rubric */
    function aiPrompt(L, st) {
      const crit = (L.feedbackCriteria?.length ? L.feedbackCriteria : ['matches the deliverable','grounded in WSI/user context','clear & presentation-ready']);
      return [
        `You are a senior UX design mentor at Williams-Sonoma, Inc. reviewing an intern's prep work.`,
        ``,
        `LESSON: ${L.title}`,
        `GOAL: ${L.coreConcept}`,
        `DELIVERABLE: ${L.figmaExercise?.deliverable || L.output || '(see lesson)'}`,
        ``,
        `I'm attaching a screenshot of my work${st.figmaLink ? ` (Figma: ${st.figmaLink})` : ''}.`,
        `Please give me specific, honest feedback:`,
        `1. Score my work against each criterion and explain why:`,
        ...crit.map(c => `   - ${c}`),
        `2. The 3 highest-impact things to improve, most important first.`,
        `3. One thing I did well that I should keep doing.`,
        `4. A sharper version of my design rationale I could tell my manager.`,
      ].join('\n');
    }

    function feedbackCard(L, st, pane) {
      if (!st.submitted) return el('div', { class:'feedback-card locked' }, el('div', { class:'empty-line', text:'submit your activity above to unlock AI feedback + the self-review rubric.' }));
      const card = el('div', { class:'feedback-card' });

      /* copy-pasteable AI prompt */
      const promptText = aiPrompt(L, st);
      const apBox = el('div', { class:'ai-prompt-box' });
      const copyBtn = iconBtn('copy', 'copy prompt', () => {
        navigator.clipboard?.writeText(promptText).then(() => toast('prompt copied — paste into Claude/ChatGPT with your screenshot'), () => toast('copy failed'));
      });
      apBox.append(
        el('div', { class:'ap-head' }, [ el('span', { class:'kicker', text:'ask an AI for feedback' }), copyBtn ]),
        el('pre', { text: promptText }),
        el('div', { style:'font-size:12px;color:var(--ink-soft);margin-top:8px', text:'copy this and paste it into Claude or ChatGPT with the screenshot you uploaded above.' }),
      );
      card.append(apBox);

      /* self-review rubric */
      const crit = L.feedbackCriteria?.length ? L.feedbackCriteria : ['Output matches the stated deliverable', 'Decisions are grounded in WSI / user context', 'Work is clear and presentation-ready'];
      card.append(el('div', { class:'section-label', style:'margin-top:4px', text:'self-review rubric' }));
      let scoreEl;
      const recompute = () => { const d = crit.filter((_,i)=>st.criteria[i]).length; scoreEl.innerHTML = `<b>${d}/${crit.length}</b> criteria met`; };
      crit.forEach((c,i) => {
        const rowEl = el('label', { class:'fc-crit' });
        const cb = el('input', { type:'checkbox' }); cb.checked = !!st.criteria[i];
        cb.addEventListener('change', () => { st.criteria[i]=cb.checked; Store.save(true); recompute(); });
        rowEl.append(cb, el('span', { text:c })); card.append(rowEl);
      });
      scoreEl = el('div', { class:'fc-score' }); card.append(scoreEl); recompute();

      const reflect = el('textarea', { class:'reflect', placeholder:'reflection: what worked, what you’d iterate, what to ask your mentor…' });
      reflect.value = st.reflect; reflect.addEventListener('input', () => { st.reflect = reflect.value; Store.save(); });
      card.append(el('div', { class:'section-label', style:'margin-top:14px', text:'reflection' }), reflect);
      return card;
    }

    /* read-only reference: keep a summary of the key info + the user's own work */
    function archiveCard(L, st, pane) {
      const when = st.completedAt ? new Date(st.completedAt).toLocaleString() : '—';
      const crit = L.feedbackCriteria?.length ? L.feedbackCriteria : [];
      const card = el('div', { class:'archive-card' });
      card.append(el('div', { class:'ac-head' }, [
        el('div', {}, [ el('div', { class:'kicker', text:(L.track==='finance'?'finance · ':(L.builtin?`day ${L.day} · `:''))+'complete' }), el('h2', { style:'margin:4px 0 0', text:L.title }) ]),
        el('span', { class:'read-only-flag', text:'● read-only reference' }),
      ]));
      card.append(el('div', { class:'ac-stamp', text:`completed ${when}` }));

      /* summary of the most important information from the lesson */
      const summary = el('div', { class:'summary-block' });
      summary.append(el('div', {}, [ el('b', { text:'Goal. ' }), document.createTextNode(L.coreConcept) ]));
      if (L.figmaExercise?.deliverable || L.output)
        summary.append(el('div', { style:'margin-top:6px' }, [ el('b', { text:'Deliverable. ' }), document.createTextNode(L.figmaExercise?.deliverable || L.output) ]));
      if (L.objectives?.length) summary.append(el('ul', {}, L.objectives.map(o => el('li', { text:o }))));
      card.append(el('div', { class:'section-label', text:'summary' }), summary);

      if (crit.length) {
        card.append(el('div', { class:'section-label', text:'self-review' }));
        card.append(el('pre', { class:'ac-notes', text: crit.map((c,i)=>`${st.criteria[i]?'☑':'☐'} ${c}`).join('\n') }));
      }
      card.append(el('div', { class:'section-label', text:'your notes' }), el('pre', { class:'ac-notes', text: st.notes || '(none)' }));
      if (st.reflect) card.append(el('div', { class:'section-label', text:'reflection' }), el('pre', { class:'ac-notes', text: st.reflect }));

      if ((st.shots||[]).length) {
        card.append(el('div', { class:'section-label', text:'submission' }));
        const grid = el('div', { class:'shot-grid' });
        st.shots.forEach((s,i)=>{ const src=s.src||s; const b=el('div',{class:'shot'},el('img',{src,alt:`shot ${i+1}`})); if(s.caption)b.append(el('div',{class:'cap',text:s.caption})); grid.append(b); });
        card.append(grid);
      }
      if (st.figmaLink) card.append(el('div', { style:'margin-top:10px' }, el('a', { class:'res-link yt', href:st.figmaLink, target:'_blank', rel:'noopener' }, [ el('span', { html: svg('ext') }), el('span', { class:'res-t', text:'figma file' }) ])));

      card.append(el('div', { class:'complete-bar' }, el('button', { class:'btn ghost sm', text:'reopen lesson', onclick: () => {
        st.complete=false; st.completedAt=null; Store.save(true); pane.innerHTML=''; pane.append(lessonBody(L, st, pane)); pane.scrollTop = 0;
        $$('.ix-link').forEach(a => { if (a.getAttribute('href')===`#work/lesson/${L.id}`) a.classList.remove('complete'); });
      } })));
      card.append(lessonNav(L));
      return card;
    }

    /* prev / next lesson footer — makes the curriculum read as one arc */
    function lessonNav(L) {
      const all = allLessons().filter(x => x.track === L.track);   // navigate within the same track
      const i = all.findIndex(x => x.id === L.id);
      if (i < 0) return el('span');
      const tag = (x) => x.track === 'finance' ? `finance ${x.n}` : x.builtin ? (x.day === 0 ? 'orientation' : 'day ' + x.day) : 'custom';
      const link = (x, dir) => el('a', { class:'lnav ' + dir, href:`#work/lesson/${x.id}` }, [
        el('span', { class:'lnav-dir', text: dir === 'prev' ? '← previous' : 'next →' }),
        el('span', { class:'lnav-t', text: `${tag(x)} · ${x.title}` }),
      ]);
      return el('div', { class:'lesson-nav' }, [
        i > 0 ? link(all[i-1], 'prev') : el('span'),
        i < all.length - 1 ? link(all[i+1], 'next') : el('span'),
      ]);
    }

    return { mount, allLessons };
  })();

  /* ==========================================================
     10 · Personal
     ========================================================== */
  const Personal = (() => {
    let viewDate = todayKey();
    let calCursor = logicalDate();
    function reset() { viewDate = todayKey(); calCursor = logicalDate(); }
    function remount(root) { root.innerHTML=''; Canvas.teardown(); mount(root); }

    function mount(root, sub = []) {
      if (sub[0] && DATE_RE.test(sub[0]) && sub[0] <= todayKey()) { viewDate = sub[0]; calCursor = new Date(sub[0] + 'T12:00:00'); }
      const readonly = viewDate !== todayKey();
      if (!readonly) ensureDailyNotes();

      const body = el('div', { class:'personal-body' });
      const drawer = el('aside', { class:'cal-drawer' }, [
        el('h2', { text:'history' }),
        el('div', { class:'sub', text:'pages auto-file at 3:00 am' }),
      ]);
      if (!readonly) drawer.append(moodStrip());
      drawer.append(quickTags());
      drawer.append(calendar());
      drawer.append(el('button', { class:'btn ghost sm', style:'width:100%;margin-top:6px', text:'→ jump to today',
        onclick:() => { viewDate = todayKey(); calCursor = logicalDate(); remount(root); } }));

      const right = el('div', { class:'personal-canvas' });
      right.append(el('div', { class:'canvas-bar' }, [
        readonly ? el('span', { class:'read-only-flag', text:`● ${viewDate} · read-only` }) : el('span', { class:'spacer' }),
      ]));
      right.append(Canvas.build({ view:'personal', dateKey: viewDate, readonly, tags:true, onChange: refreshCal, tall:true }));
      body.append(drawer, right);
      root.append(body);
      if (!readonly) body.append(el('div', { class:'fab-cluster' }, [
        stickerFab(),
        penFab(),
        addFab(() => { Canvas.addNote(); refreshCal(); }),
      ]));
    }

    /* mood / energy quick-log — one tap, trends stored in meta.mood */
    const MOODS = [['😞',1],['😕',2],['😐',3],['🙂',4],['😄',5]];
    function moodStrip() {
      const wrap = el('div', { class:'mood-strip' });
      wrap.append(el('div', { class:'kicker', style:'margin-bottom:6px', text:'today’s mood' }));
      const row = el('div', { class:'mood-row' });
      const cur = Store.get().meta.mood[todayKey()];
      MOODS.forEach(([emoji, val]) => {
        row.append(el('button', { class:'mood-btn' + (cur===val?' on':''), text:emoji, title:`mood ${val}/5`, onclick: () => {
          Store.get().meta.mood[todayKey()] = val; Store.save(true);
          [...row.children].forEach((c,i) => c.classList.toggle('on', MOODS[i][1]===val));
          toast('mood logged');
        } }));
      });
      wrap.append(row);
      return wrap;
    }

    const MEAL_LABELS = { breakfast: '🍳 breakfast', lunch: '🥗 lunch', dinner: '🍝 dinner' };
    const presetFor = (t) => {
      const preset = { tag: t };
      if (t === 'gym') preset.checklist = GYM_CHECKLIST.map(x => ({ id: uid(), html: esc(x), done:false }));
      if (t === 'journal') preset.html = `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`;
      if (MEAL_LABELS[t]) preset.html = `<b>${MEAL_LABELS[t]}</b><br>`;
      return preset;
    };

    function quickTags() {
      const wrap = el('div', {});
      wrap.append(el('div', { class:'kicker', style:'margin-bottom:6px', text:'quick log' }));
      const tags = el('div', { class:'quick-tags' });
      PERSONAL_TAGS.forEach(t => tags.append(el('button', { dataset:{ t }, text:`+ ${t}`, onclick: () => {
        if (viewDate !== todayKey()) { toast('switch to today to add'); return; }
        Canvas.addNote(presetFor(t)); refreshCal();
      } })));
      wrap.append(tags);
      const recWrap = el('div', { class:'recurring-wrap' });
      recWrap.append(el('div', { class:'kicker', style:'margin:10px 0 5px', text:'auto-add each day' }));
      ['gym', 'breakfast', 'lunch', 'dinner'].forEach(tag => {
        const row = el('label', { class:'recurring-row' });
        const cb = el('input', { type:'checkbox' }); cb.checked = (Store.get().meta.recurring || []).includes(tag);
        cb.addEventListener('change', () => {
          const m = Store.get().meta;
          m.recurring = cb.checked ? [...new Set([...(m.recurring||[]), tag])] : (m.recurring||[]).filter(x => x!==tag);
          Store.save(true);
          if (cb.checked && viewDate === todayKey()) { ensureDailyNotes(); Canvas.paint(); refreshCal(); }
          toast(cb.checked ? `${tag} auto-adds each day` : `${tag} auto-add off`);
        });
        row.append(cb, el('span', { text:`#${tag}` }));
        recWrap.append(row);
      });
      wrap.append(recWrap);
      return wrap;
    }

    /* always-on journal + any recurring checklists (e.g. gym), once per day */
    function ensureDailyNotes() {
      const tk = todayKey();
      const list = Store.notes('personal', tk);
      let changed = false;
      if (!list.some(n => n.tag === 'journal' && !n.archived)) {
        list.push(Store.normalizeNote({ id: uid(), x: 30, y: 30, tag:'journal',
          html: `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`, timestamp: Date.now() }));
        changed = true;
      }
      (Store.get().meta.recurring || []).forEach((t, i) => {
        if (!PERSONAL_TAGS.includes(t)) return;
        if (!list.some(n => n.tag === t && !n.archived)) {
          list.push(Store.normalizeNote({ id: uid(), x: 30 + (i+1)*30, y: 30 + (i+1)*30, ...presetFor(t), timestamp: Date.now() }));
          changed = true;
        }
      });
      if (changed) Store.save(true);
    }

    function refreshCal() { const old = $('.cal-drawer .cal-wrap'); if (old) old.replaceWith(calendar()); }

    function calendar() {
      const wrap = el('div', { class:'cal-wrap' });
      const y = calCursor.getFullYear(), m = calCursor.getMonth();
      wrap.append(el('div', { class:'cal-month' }, [
        iconBtn('chevL','prev',() => { calCursor=new Date(y,m-1,1); refreshCal(); }),
        el('span', { class:'mlabel', text:`${MON[m]} ${y}` }),
        iconBtn('chevR','next',() => { calCursor=new Date(y,m+1,1); refreshCal(); }),
      ]));
      const grid = el('div', { class:'cal-grid' });
      DOWS.forEach(d => grid.append(el('div', { class:'cal-dow', text:d })));
      const first = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate(), tk = todayKey();
      for (let i=0;i<first;i++) grid.append(el('div', { class:'cal-cell pad' }));
      for (let d=1; d<=days; d++) {
        const key = dKey(new Date(y,m,d));
        const has = (Store.get().canvas.personal[key]||[]).some(n=>!n.archived);
        const cls=['cal-cell']; if(has)cls.push('has'); if(key===tk)cls.push('today'); if(key===viewDate)cls.push('active');
        grid.append(el('button', { class:cls.join(' '), text:String(d), disabled: key>tk?'true':null, title: has?`${key} · has notes`:key,
          onclick:() => { viewDate=key; remount($('#view')); } }));
      }
      wrap.append(grid);
      wrap.append(el('div', { class:'empty-line', text: viewDate===tk?'editing today':'read-only · select today to edit' }));
      return wrap;
    }
    return { mount, reset };
  })();

  /* ==========================================================
     11 · Modal
     ========================================================== */
  const Modal = (() => {
    const root = $('#modal');
    function open(title, build) {
      $('#modal-title').textContent = title;
      const bodyEl = $('#modal-body'); bodyEl.innerHTML = '';
      build(bodyEl, close);
      root.hidden = false;
    }
    function close() { root.hidden = true; $('#modal-body').innerHTML = ''; }
    root.addEventListener('click', (e) => { if (e.target.matches('[data-close]') || e.target.classList.contains('modal-scrim')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !root.hidden) close(); });
    return { open, close };
  })();

  /* ==========================================================
     12 · Friday Intern-Log banner
     ========================================================== */
  function fridayBanner() {
    const now = new Date();
    const isFriAfternoon = now.getDay() === 5 && now.getHours() >= 12 && now.getHours() < 18;
    if (!isFriAfternoon || sessionStorage.getItem('friday-dismissed') === dKey(now)) return null;
    return el('div', { class:'friday-banner' }, [
      el('span', { html:'🗓 <b>Friday afternoon — Intern Log time.</b> Brain-dump this week’s wins & blockers, then synthesize with X-Y-Z.' }),
      el('div', { style:'display:flex;gap:8px' }, [
        el('button', { class:'btn primary sm', text:'write log', onclick: () => { location.hash = '#work'; setTimeout(() => $('.work-toolbar .btn.primary')?.click(), 80); } }),
        el('button', { class:'btn ghost sm', text:'dismiss', onclick: (e) => { sessionStorage.setItem('friday-dismissed', dKey(new Date())); e.target.closest('.friday-banner').remove(); } }),
      ]),
    ]);
  }

  /* ==========================================================
     12b · Search (notes · journal · lessons)
     ========================================================== */
  const stripHtml = (h) => { const d = el('div', { html: h || '' }); return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const Search = (() => {
    function buildIndex() {
      const items = [];
      const d = Store.get();
      for (const view of ['dashboard', 'personal']) {
        for (const [date, notes] of Object.entries(d.canvas[view])) {
          (notes || []).forEach(n => {
            if (n.archived) return;
            const txt = [stripHtml(n.html), ...(n.checklist || []).map(c => stripHtml(c.html)), ...(n.images || []).map(im => im.caption)].filter(Boolean).join(' · ');
            if (txt) items.push({ kind: view === 'dashboard' ? 'dashboard note' : `#${n.tag || 'note'}`, text: txt, hash: `#${view}/${date}`, date });
          });
        }
      }
      (d.work.entries || []).forEach(e => items.push({ kind: 'journal', text: `${e.title || 'untitled'} — ${e.body || ''}`, hash: `#work/journal/${e.id}`, date: dKey(e.ts) }));
      Work.allLessons().forEach(L => {
        const st = Store.lesson(L.id);
        items.push({ kind: 'lesson', text: [L.title, L.coreConcept, st.notes, st.reflect].filter(Boolean).join(' — '), hash: `#work/lesson/${L.id}` });
      });
      return items;
    }
    function open() {
      Modal.open('Search', (body, close) => {
        const input = el('input', { class:'field', placeholder:'search notes, journal, lessons…', autocomplete:'off' });
        const results = el('div', { class:'search-results' });
        body.append(input, results);
        const index = buildIndex();
        const run = () => {
          const q = input.value.trim().toLowerCase();
          results.innerHTML = '';
          if (!q) { results.append(el('div', { class:'empty-line', text:`type to search ${index.length} items` })); return; }
          const hits = index.filter(it => it.text.toLowerCase().includes(q)).slice(0, 40);
          if (!hits.length) { results.append(el('div', { class:'empty-line', text:'no matches' })); return; }
          hits.forEach(it => {
            const i = it.text.toLowerCase().indexOf(q);
            const start = Math.max(0, i - 30);
            const snip = (start > 0 ? '…' : '') + it.text.slice(start, start + 90) + (it.text.length > start + 90 ? '…' : '');
            results.append(el('button', { class:'search-hit', onclick: () => { close(); location.hash = it.hash; } }, [
              el('span', { class:'sh-kind', text: it.kind + (it.date ? ` · ${it.date}` : '') }),
              el('span', { class:'sh-text', text: snip }),
            ]));
          });
        };
        input.addEventListener('input', run); run();
        setTimeout(() => input.focus(), 60);
      });
    }
    return { open };
  })();

  /* ==========================================================
     13 · Router + boot
     ========================================================== */
  const ROUTES = ['dashboard','work','personal'];
  function parseHash() {
    const seg = location.hash.replace(/^#/,'').split('/').filter(Boolean);
    const route = ROUTES.includes(seg[0]) ? seg[0] : 'dashboard';
    return { route, sub: seg.slice(1) };
  }

  function render() {
    const { route, sub } = parseHash();
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === route));
    const view = $('#view'); view.innerHTML = '';
    Canvas.teardown(); Pets.teardown(); Fmt.hide(); $('.popover')?.remove();
    Dashboard.reset(); Personal.reset();

    const fb = fridayBanner();
    if (fb) view.append(el('div', { style:'padding:16px 0 0' }, fb));

    if (route === 'dashboard') Dashboard.mount(view);
    else if (route === 'work') Work.mount(view, sub);
    else Personal.mount(view);
  }

  function startClock() {
    const tick = () => { $('#topdate').innerHTML = `${prettyDate()} <span class="clock">· ${prettyTime()}</span>`; };
    tick(); setInterval(tick, 1000);
  }

  /* personalization: name, theme, pets */
  function personalizeSettings() {
    const meta = Store.get().meta;
    const wrap = el('div', { class:'modal-row' });
    wrap.append(el('label', { text:'Make it yours' }));

    // name
    const nameRow = el('div', { style:'display:flex;align-items:center;gap:8px;margin-bottom:10px' });
    const nameInput = el('input', { class:'field', value: meta.name || '', placeholder:'your name (for greetings)' });
    nameInput.addEventListener('input', () => { meta.name = nameInput.value.trim(); Store.save(); });
    nameRow.append(el('span', { style:'font-size:13px;color:var(--ink-soft);white-space:nowrap', text:'call me' }), nameInput);
    wrap.append(nameRow);

    // theme
    wrap.append(el('div', { class:'kicker', style:'margin:4px 0 6px', text:'theme' }));
    const themes = [['cream','🍦 cream'],['pink','🌸 pink'],['mint','🌿 mint'],['lavender','💜 lavender'],['dark','🌙 dark']];
    const tRow = el('div', { class:'theme-row' });
    themes.forEach(([id,label]) => {
      const b = el('button', { class:'theme-chip' + (meta.theme===id?' on':''), dataset:{ id }, text: label, onclick: () => {
        meta.theme = id; Store.save(true); applyTheme();
        [...tRow.children].forEach(c => c.classList.toggle('on', c.dataset.id===id));
      } });
      tRow.append(b);
    });
    wrap.append(tRow);

    // pets
    wrap.append(el('div', { class:'kicker', style:'margin:12px 0 6px', text:'pet pals' }));
    const petWrap = el('div', { class:'pet-settings' });
    (meta.pets || []).forEach(p => {
      const row = el('label', { class:'pet-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!p.on;
      cb.addEventListener('change', () => { p.on = cb.checked; Store.save(true); });
      const name = el('input', { class:'field pet-name', value: p.name, maxlength:'14' });
      name.addEventListener('input', () => { p.name = name.value.trim() || p.id; Store.save(); });
      row.append(cb, el('span', { class:'pet-emoji', text: p.emoji }), name);
      petWrap.append(row);
    });
    wrap.append(petWrap);
    wrap.append(el('div', { style:'font-size:11.5px;color:var(--ink-faint);margin-top:6px', text:'pets wander your dashboard — tap one to pet it ♡ (refresh dashboard after toggling)' }));
    return wrap;
  }

  /* backup / restore — the no-backend way to move data across devices */
  function exportData() {
    const blob = new Blob([JSON.stringify(Store.get(), null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `watermellie-backup-${todayKey()}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('backup downloaded');
  }
  function importData(close) {
    const input = el('input', { type:'file', accept:'application/json,.json', style:'display:none' });
    document.body.append(input);
    input.addEventListener('change', () => {
      const f = input.files[0]; if (!f) { input.remove(); return; }
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const data = JSON.parse(rd.result);
          if (!data || !data.canvas || !data.work) throw new Error('not a workspace backup');
          if (!confirm('Replace ALL current data with this backup? (export first if unsure)')) { input.remove(); return; }
          localStorage.setItem(LS_KEY, JSON.stringify(data));
          toast('backup restored — reloading'); setTimeout(() => location.reload(), 600);
        } catch (e) { console.error(e); toast('invalid backup file'); }
        input.remove();
      };
      rd.readAsText(f);
    });
    input.click();
  }

  /* ---- cloud-sync settings block (bring-your-own Supabase) ---- */
  function syncSettings() {
    const cfg = Sync.get() || { url:'', key:'', code:'' };
    const wrap = el('div', { class:'modal-row sync-block' });
    wrap.append(el('label', { text:'Cloud sync (optional — auto-sync across devices)' }));

    const on = Sync.enabled();
    const statusLine = el('div', { class:'sync-status ' + (on ? Sync.status : 'off'), text:
      on ? `● sync on · ${Sync.status}${Sync.lastError ? ' · ' + Sync.lastError : ''}` : '○ sync off — data stays on this device only' });
    wrap.append(statusLine);

    const url = el('input', { class:'field', placeholder:'Supabase Project URL (https://xxxx.supabase.co)', value: cfg.url || '' });
    const key = el('input', { class:'field', placeholder:'Supabase anon public key', value: cfg.key || '' });
    const code = el('input', { class:'field', placeholder:'sync code (a long secret you reuse on every device)', value: cfg.code || '' });
    [url, key, code].forEach(i => { i.style.marginTop = '6px'; });
    wrap.append(url, key, code);

    const actions = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:8px' }, [
      el('button', { class:'btn primary sm', text: on ? 'save & sync now' : 'enable sync', onclick: async () => {
        if (!url.value.trim() || !key.value.trim() || !code.value.trim()) { toast('fill url, key, and code'); return; }
        Sync.set({ url: url.value, key: key.value, code: code.value });
        toast('checking cloud…');
        const remote = await Sync.pull();
        if (Sync.status === 'error') { statusLine.textContent = '● error · ' + Sync.lastError; statusLine.className = 'sync-status error'; return; }
        if (remote && remote.data && confirm('Found existing cloud data. Load it onto THIS device? (Cancel = upload this device’s data instead)')) {
          Store.replaceAll(remote.data); toast('synced from cloud'); location.reload();
        } else { await Sync.push(); toast('this device uploaded to cloud'); statusLine.textContent = '● sync on · ok'; statusLine.className = 'sync-status ok'; }
      } }),
      on ? el('button', { class:'btn ghost sm', text:'pull now', onclick: async () => {
        const remote = await Sync.pull();
        if (remote?.data && confirm('Replace this device’s data with the cloud copy?')) { Store.replaceAll(remote.data); location.reload(); }
        else toast(remote ? 'kept local' : 'nothing in cloud yet');
      } }) : null,
      on ? el('button', { class:'btn ghost sm', text:'turn off', onclick: () => { Sync.set(null); toast('sync turned off'); statusLine.textContent='○ sync off'; statusLine.className='sync-status off'; Sync.updateBtn(); } }) : null,
    ]);
    wrap.append(actions);

    if (on) {
      const auto = el('label', { class:'sync-auto' });
      const cb = el('input', { type:'checkbox' }); cb.checked = Sync.isAuto();
      cb.addEventListener('change', () => { Sync.setAuto(cb.checked); toast(cb.checked ? 'auto-save on' : 'manual save — tap the cloud button'); });
      auto.append(cb, el('span', { text:'auto-save to cloud as I work (off = save only when I tap the cloud button)' }));
      wrap.append(auto);
    }

    wrap.append(el('div', { style:'font-size:11.5px;color:var(--ink-faint);margin-top:8px', html:
      'one-time setup (~5 min): create a free <b>Supabase</b> project → SQL editor → run the snippet in <b>README</b> → paste your Project URL + anon key here, and make up a long sync code. use the same three on every device. ' +
      'the <b>☁ cloud button</b> in the top-right saves on tap and shows status. <b>last edit wins</b>, so if you switch devices, load the latest before editing. keep your key + code private.' }));
    return wrap;
  }

  /* keyboard shortcuts (laptop): n = new note · 1/2/3 = pages · / = search */
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '/' && !typing) { e.preventDefault(); Search.open(); return; }
      if (typing || !$('#modal').hidden) return;
      if (e.key === '1') location.hash = '#dashboard';
      else if (e.key === '2') location.hash = '#work';
      else if (e.key === '3') location.hash = '#personal';
      else if (e.key === 'n' || e.key === 'N') {
        const r = parseHash().route;
        if (r === 'dashboard' || r === 'personal') Canvas.addNote();
      }
    });
  }

  /* PWA: register the service worker so it installs + works offline.
     Auto-reload once when a new version takes control, so updates land
     without manual cache-clearing on any device. */
  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener?.('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) nw.postMessage?.('skip-waiting');
        });
      });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);  // hourly update check
    }).catch(e => console.warn('sw', e));
  }

  /* ==========================================================
     14 · Delight — click sparkles + collectible floating phrases
     ========================================================== */
  const Delight = (() => {
    const BASE_PHRASES = [
      // gentle
      'better days ahead','you are growing','you’re doing enough','be proud of you','rest is productive',
      'breathe','bloom slowly','good things take time',
      // hype
      'you’ve got this','make it happen','keep going','create boldly','shine',
      // mindful
      'one day at a time','stay present','small steps count','trust the process',
      // career / design
      'design with heart','progress over perfection','ship it, then refine','your taste is leveling up',
      'great designers were once beginners','your portfolio is growing','future you says thanks',
      'curiosity is your edge','你可以的',
    ];
    const PHRASES = () => [...BASE_PHRASES, ...(Store.get().meta.affirmations || [])];
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let phraseTimer = null;
    const on = () => Store.get().meta.delight && !reduced;

    /* sparkles on click/tap */
    function sparkle(x, y) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const s = el('div', { class:'spark' });
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const dist = 18 + Math.random() * 26;
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        s.style.setProperty('--delay', (Math.random() * 60) + 'ms');
        document.body.append(s);
        setTimeout(() => s.remove(), 700);
      }
    }
    function onPointer(e) {
      if (!on()) return;
      // skip while dragging notes/widgets to avoid clutter
      if (e.target.closest?.('.dragging')) return;
      sparkle(e.clientX, e.clientY);
    }

    /* a phrase drifts across; tap to collect it */
    function floatOne() {
      if (!on()) { schedule(); return; }
      // one at a time; never drift over a lesson you're concentrating on
      if (document.hidden || $('.floatie') || /^#work\/lesson\//.test(location.hash)) { schedule(); return; }
      const txt = pick(PHRASES());
      const fromLeft = Math.random() < 0.5;
      const top = window.innerHeight - 104;   // glide low along the bottom, clear of content
      const f = el('button', { class:'floatie', text: '✦ ' + txt, title:'tap to collect' });
      f.style.top = top + 'px';
      f.style.setProperty('--from', fromLeft ? '-30vw' : '110vw');
      f.style.setProperty('--to', fromLeft ? '110vw' : '-30vw');
      f.addEventListener('click', (e) => {
        e.stopPropagation();
        const r = f.getBoundingClientRect();
        sparkle(r.left + r.width/2, r.top + r.height/2);
        const col = Store.get().meta.collected;
        if (!col.includes(txt)) { col.push(txt); Store.save(); }
        toast(`collected “${txt}” ✨  (${col.length})`);
        f.remove();
      });
      f.addEventListener('animationend', () => f.remove());
      document.body.append(f);
      schedule();
    }
    function schedule() {
      clearTimeout(phraseTimer);
      phraseTimer = setTimeout(floatOne, 32000 + Math.random() * 28000);  // calmer: every ~32–60s
    }

    function init() {
      document.addEventListener('pointerdown', onPointer);
      schedule();
    }

    /* little collection viewer for Settings */
    function collectionView() {
      const col = Store.get().meta.collected || [];
      const wrap = el('div', { class:'modal-row' });
      wrap.append(el('label', { text:`Collected phrases (${col.length})` }));
      if (!col.length) wrap.append(el('div', { class:'empty-line', text:'none yet — catch the floating ✦ phrases as they drift by' }));
      else wrap.append(el('div', { class:'collected-wrap' }, col.map(p => el('span', { class:'collected-chip', text: p }))));
      const toggle = el('label', { class:'recurring-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!Store.get().meta.delight;
      cb.addEventListener('change', () => { Store.get().meta.delight = cb.checked; Store.save(true); toast(cb.checked ? 'delight on ✨' : 'delight off'); });
      toggle.append(cb, el('span', { text:'sparkles & floating phrases' }));
      wrap.append(toggle);

      // your own affirmations
      const af = Store.get().meta.affirmations;
      wrap.append(el('div', { class:'kicker', style:'margin:12px 0 6px', text:'your own affirmations' }));
      const inp = el('input', { class:'field', placeholder:'add a phrase to float around…', maxlength:'60' });
      const mine = el('div', { class:'collected-wrap', style:'margin-top:8px' });
      const renderMine = () => { mine.innerHTML = ''; af.forEach((p, i) => mine.append(el('span', { class:'collected-chip mine', text: p }, iconBtn('x', 'remove', () => { af.splice(i,1); Store.save(true); renderMine(); })))); };
      const addIt = () => { const v = inp.value.trim(); if (!v) return; af.push(v); Store.save(true); inp.value=''; renderMine(); };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addIt(); } });
      wrap.append(el('div', { style:'display:flex;gap:6px' }, [ inp, el('button', { class:'btn primary sm', text:'add', onclick: addIt }) ]));
      renderMine(); wrap.append(mine);
      return wrap;
    }

    return { init, collectionView };
  })();

  /* ==========================================================
     Confetti — a little celebration burst (lesson complete!)
     ========================================================== */
  const Confetti = (() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const COLORS = ['#d6453d', '#2f6df0', '#1f9d57', '#ffd84d', '#e0577a', '#7a5fe0'];
    const EMOJI = ['✨', '🎉', '⭐', '🍉', '🌸', '🎀'];
    function burst(x, y) {
      if (reduced) return;
      const cx = x == null ? window.innerWidth / 2 : x;
      const cy = y == null ? window.innerHeight / 3 : y;
      const layer = el('div', { class: 'confetti-layer' });
      document.body.appendChild(layer);
      const N = 34;
      for (let i = 0; i < N; i++) {
        const ang = (Math.PI * 2 * i) / N + Math.random() * 0.5;
        const dist = 80 + Math.random() * 180;
        const useEmoji = i % 5 === 0;
        const p = el('div', { class: 'confetti' + (useEmoji ? ' emoji' : ''),
          text: useEmoji ? pick(EMOJI) : '' });
        if (!useEmoji) {
          p.style.background = pick(COLORS);
          p.style.width = p.style.height = (6 + Math.random() * 7) + 'px';
          if (Math.random() < 0.5) p.style.borderRadius = '50%';
        }
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        p.style.animationDelay = Math.round(Math.random() * 70) + 'ms';
        layer.appendChild(p);
      }
      setTimeout(() => layer.remove(), 1400);
    }
    return { burst };
  })();

  /* ==========================================================
     Pets — cozy companions that wander a canvas surface
     ========================================================== */
  const Pets = (() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let layer = null, walkers = [], timer = null;
    const active = () => (Store.get().meta.pets || []).filter(p => p.on);

    function mount(surface) {
      teardown();
      const list = active();
      if (!list.length) return;
      layer = el('div', { class:'pets-layer' });
      surface.appendChild(layer);
      walkers = list.map(spawn);
      if (!reduced) { setTimeout(wander, 800); timer = setInterval(wander, 4200); }
    }
    function teardown() { clearInterval(timer); timer = null; layer?.remove(); layer = null; walkers = []; }

    function spawn(pet) {
      const r = layer.getBoundingClientRect();
      const x = 40 + Math.random() * Math.max(60, r.width - 120);
      const y = 90 + Math.random() * 220;
      const w = el('button', { class:'pet', title: pet.name, style:`left:${x}px; top:${y}px`, text: pet.emoji });
      w._pet = pet;
      w.addEventListener('click', (e) => { e.stopPropagation(); petIt(w); });
      layer.appendChild(w);
      return w;
    }
    function wander() {
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      walkers.forEach(w => {
        if (Math.random() < 0.25) return;
        const nx = 20 + Math.random() * Math.max(60, r.width - 100);
        const ny = 80 + Math.random() * Math.max(120, Math.min(r.height, 600) - 160);
        w.style.setProperty('--face', nx < parseFloat(w.style.left) ? -1 : 1);
        w.style.left = Math.round(nx) + 'px';
        w.style.top = Math.round(ny) + 'px';
      });
    }
    function petIt(w) { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); heart(w); toast(`${w._pet.name} ♡`); }
    function heart(w) {
      const r = w.getBoundingClientRect();
      const h = el('div', { class:'pet-heart', text:'♡', style:`left:${r.left + r.width/2}px; top:${r.top}px` });
      document.body.appendChild(h); setTimeout(() => h.remove(), 900);
    }
    function celebrate() { walkers.forEach((w, i) => setTimeout(() => { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); heart(w); }, i * 120)); }

    return { mount, teardown, celebrate };
  })();

  /* ==========================================================
     Timer — a floating focus / pomodoro countdown
     ========================================================== */
  const Timer = (() => {
    let total = 0, left = 0, iv = null, label = '', running = false, pill = null;
    const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    function ensure() {
      if (pill) return;
      pill = el('div', { id:'focus-timer', class:'hidden' });
      document.body.appendChild(pill);
    }
    function render() {
      ensure(); pill.classList.remove('hidden', 'done'); pill.innerHTML = '';
      pill.append(
        el('span', { class:'ft-label', text: label }),
        el('span', { class:'ft-time', text: fmt(left) }),
        el('button', { class:'ft-btn', title: running?'pause':'resume', text: running?'❚❚':'▶', onclick: () => running ? pause() : resume() }),
        el('button', { class:'ft-btn', title:'reset', text:'↺', onclick: reset }),
        el('button', { class:'ft-btn', title:'close', text:'✕', onclick: stop }),
      );
    }
    function run() { clearInterval(iv); iv = setInterval(() => {
      if (left <= 0) return finish();
      left--; const t = pill?.querySelector('.ft-time'); if (t) t.textContent = fmt(left);
    }, 1000); }
    function start(mins, lbl) { total = left = Math.max(1, Math.round(mins)) * 60; label = lbl || 'focus'; running = true; render(); run(); toast(`focus timer · ${Math.round(mins)} min`); }
    function pause() { running = false; clearInterval(iv); render(); }
    function resume() { if (left <= 0) return; running = true; render(); run(); }
    function reset() { left = total; running = true; render(); run(); }
    function stop() { clearInterval(iv); running = false; pill?.classList.add('hidden'); }
    function finish() {
      clearInterval(iv); running = false; left = 0;
      const t = pill?.querySelector('.ft-time'); if (t) t.textContent = '0:00';
      pill?.classList.add('done'); toast(`⏰ ${label} — time’s up!`);
      try { Pets.celebrate(); } catch {}
    }
    return { start, stop };
  })();

  function applyTheme() {
    document.body.dataset.theme = Store.get().meta.theme || 'cream';
  }

  function boot() {
    applyTheme();
    $('#settings-btn').innerHTML = svg('gear');
    $('#search-btn').innerHTML = svg('search');
    $('#search-btn').addEventListener('click', () => Search.open());
    // corner cloud button → save if this device has edits, else pull the latest
    $('#sync-btn').addEventListener('click', () => Sync.syncTap());
    $('#settings-btn').addEventListener('click', () => Modal.open('Settings', (body, close) => {
      const meta = Store.get().meta;
      body.append(
        el('div', { class:'modal-row' }, el('div', { style:'font-size:13px;color:var(--ink-soft)', html:
          'data is stored locally in this browser. use <b>backup/restore</b> or turn on <b>cloud sync</b> below to move it to your iPad or phone.' })),

        personalizeSettings(),

        (() => {
          const r = el('div', { class:'modal-row' });
          const d = el('input', { class:'field', type:'date', value: Store.get().meta.startDate || '2026-06-10', style:'max-width:200px' });
          d.addEventListener('change', () => { Store.get().meta.startDate = d.value || '2026-06-10'; Store.save(true); toast('start date set'); });
          r.append(
            el('label', { text:'Internship start date & prep plan' }),
            el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;align-items:center' }, [
              d,
              el('button', { class:'btn blue sm', text:'plan my prep', onclick: () => {
                const ok = Plan.assign(Work.allLessons().filter(L => L.track === 'curriculum').map(L => ({ id:L.id, complete: Store.lesson(L.id).complete })));
                toast(ok ? 'prep plan spread across your days ✓' : 'pick a later start date to leave prep days');
              } }),
              el('button', { class:'btn ghost sm', text:'clear plan', onclick: () => { Plan.clearAll(); toast('plan cleared'); } }),
            ]),
            el('div', { style:'font-size:11px;color:var(--ink-soft);margin-top:4px', text:'spreads your unfinished lessons evenly across the days between today and your start date.' }),
          );
          return r;
        })(),

        el('div', { class:'modal-row' }, [ el('label', { text:'Backup & restore (move data between devices)' }),
          el('div', { style:'display:flex;gap:8px;flex-wrap:wrap' }, [
            el('button', { class:'btn blue sm', text:'export backup (.json)', onclick: exportData }),
            el('button', { class:'btn ghost sm', text:'import backup', onclick: () => importData(close) }),
          ]) ]),

        (() => {
          const used = ((localStorage.getItem(LS_KEY) || '').length) / 1024;   // ~KB (chars≈bytes)
          const pct = Math.min(100, Math.round(used / 5120 * 100));            // iOS Safari ≈ 5 MB cap
          const r = el('div', { class:'modal-row' });
          r.append(
            el('label', { text:'Storage' }),
            el('div', { style:'font-size:12px;color:var(--ink-soft)', html:
              `using <b>${used > 1024 ? (used/1024).toFixed(1)+' MB' : Math.round(used)+' KB'}</b> of your browser’s ~5&nbsp;MB limit (~${pct}%). ` +
              'pasted photos &amp; lesson screenshots take the most space — if you hit "storage full," <b>export a backup</b> first, then delete a few images from notes/lessons.' }),
          );
          return r;
        })(),

        syncSettings(),

        Delight.collectionView(),

        el('div', { class:'modal-row' }, [ el('label', { text:'Weather location' }),
          el('div', { style:'display:flex;gap:8px;flex-wrap:wrap' }, [
            el('button', { class:'btn ghost sm', text:'use my location', onclick: async () => { meta.coords=null; meta.weather=null; Store.save(true); await Weather.fetch7(true); toast('weather refreshed'); close(); render(); } }),
            el('button', { class:'btn ghost sm', text:'reset to SF', onclick: async () => { meta.coords={lat:SF.lat,lon:SF.lon}; meta.weather=null; Store.save(true); await Weather.fetch7(true); close(); render(); } }),
          ]) ]),

        el('div', { class:'modal-actions' }, [
          el('button', { class:'btn red', text:'erase all data', onclick: () => { if (confirm('Erase ALL workspace data? This cannot be undone.')) { localStorage.removeItem(LS_KEY); location.reload(); } } }),
          el('button', { class:'btn primary', text:'close', onclick: close }),
        ]),
      );
    }));

    if (!location.hash) location.replace('#dashboard');
    window.addEventListener('hashchange', render);
    startClock();
    initShortcuts();
    initPWA();
    Delight.init();
    render();

    // cloud sync: mark unsaved on change (auto-pushes if enabled), warn-on-load if behind
    Store.onSave(() => Sync.markDirty());
    Sync.updateBtn();
    Sync.syncOnLoad();

    // live multi-device: auto-pull the latest when you return to this device + on a light timer,
    // so an iPad kept open beside your laptop stays current (skips if this device has unsaved edits)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) Sync.refresh(false); });
    window.addEventListener('focus', () => Sync.refresh(false));
    setInterval(() => { if (!document.hidden) Sync.refresh(false); }, 25000);

    let lastDay = todayKey();
    setInterval(async () => {
      await Weather.fetch7();
      const w = $('.weather-badge'); if (w) Weather.renderInto(w, Store.get().meta.weather);
      const now = todayKey();
      if (now !== lastDay) { lastDay = now; render(); toast('new page compiled'); }
    }, WEATHER_TTL);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ==========================================================
     CURRICULUM_RICH override — injected by curriculum.js
     ========================================================== */
  window.__applyCurriculum = (rich) => {
    if (!Array.isArray(rich)) return;
    rich.forEach(r => { const L = CURRICULUM_BASE.find(x => x.day === r.day); if (L) Object.assign(L, r); });
    window.__curriculumApplied = true;
    if (parseHash().route === 'work') render();
  };
  if (Array.isArray(window.__pendingCurriculum)) window.__applyCurriculum(window.__pendingCurriculum);
})();
