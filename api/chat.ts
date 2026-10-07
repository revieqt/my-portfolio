/* =========================================================
   PORTFOLIO KNOWLEDGE BASE (PLAIN TEXT + TAGS)
   ========================================================= */

type PortfolioEntry = {
  id: string;
  tags: string[];
  text: string;
  weight?: number; // OPTIONAL CATEGORY WEIGHT
};

const PORTFOLIO_DATA: PortfolioEntry[] = [
  {
    id: "about",
    tags: ["about", "who", "yourself", "background"],
    weight: 1.1,
    text:
      "I am Josh Opsima, a student developer based in the Philippines. I focus on building modern web and mobile applications using React, React Native, and full-stack JavaScript technologies."
  },
  {
    id: "projects",
    tags: ["projects", "apps", "work", "tarag"],
    weight: 1.3,
    text:
      "I have worked on several application projects, including TaraG, a travel companion app with maps, route planning, weather forecasts, group trips, itineraries, emergency alerts, and offline support."
  },
  {
    id: "skills",
    tags: ["skills", "tech", "stack", "technologies"],
    weight: 1.2,
    text:
      "My technical skills include React, TypeScript, JavaScript, React Native, Expo, Firebase, Node.js, Tailwind CSS, and UI and UX design."
  },
  {
    id: "architecture",
    tags: ["architecture", "backend", "system", "design"],
    text:
      "I design applications using modular and scalable architectures, including serverless functions, REST APIs, Firebase authentication, and hybrid online and offline data handling."
  },
  {
    id: "experience",
    tags: ["experience", "background", "development"],
    weight: 1.1,
    text:
      "I have experience building mobile applications, admin dashboards, and web portals, including real-time features, authentication systems, and location-based services."
  },
  {
    id: "goals",
    tags: ["goals", "ojt", "intern", "internship", "career"],
    weight: 1.25,
    text:
      "I am currently seeking internship or OJT opportunities where I can gain real-world experience, improve my skills, and contribute to a professional development team."
  },
  {
    id: "contact",
    tags: ["contact", "reach", "connect"],
    text:
      "I am open to collaboration, internship opportunities, and project discussions through my professional contact channels."
  },
  {
    id: "education",
    tags: ["education", "school", "college", "degree", "student"],
    weight: 1.15,
    text:
      "I am currently a student in the Philippines pursuing studies related to software development, with a strong focus on hands-on projects, mobile app development, and modern web technologies."
  }
];

/* =========================================================
   SEMANTIC SEARCH UTILITIES
   ========================================================= */

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function textToVector(text: string): Record<string, number> {
  const vec: Record<string, number> = {};
  for (const w of normalize(text)) {
    vec[w] = (vec[w] || 0) + 1;
  }
  return vec;
}

function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const k in a) {
    magA += a[k] ** 2;
    if (b[k]) dot += a[k] * b[k];
  }

  for (const k in b) {
    magB += b[k] ** 2;
  }

  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/* =========================================================
   OPTIONAL OPEN-SOURCE LLM REWRITE (PLUG-IN)
   ========================================================= */

async function rewriteWithLLM(
  question: string,
  content: string
): Promise<string> {
  try {
    const res = await fetch("https://your-hf-space-url.hf.space/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, content })
    });

    if (!res.ok) return content;

    const data = await res.json();
    return data.text || content;
  } catch {
    return content;
  }
}

/* =========================================================
   API HANDLER
   ========================================================= */

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Invalid message" }), {
      status: 400
    });
  }

  const userVec = textToVector(message);
  const normalizedMessage = normalize(message);

  const scored = PORTFOLIO_DATA.map(entry => {
    const semanticScore = cosineSimilarity(
      userVec,
      textToVector(entry.text)
    );

    // PARTIAL TAG MATCH (intern → internship)
    const tagBoost = entry.tags.some(tag =>
      normalizedMessage.some(word => word.startsWith(tag))
    )
      ? 0.15
      : 0;

    const baseScore = semanticScore + tagBoost;
    const weightedScore = baseScore * (entry.weight ?? 1);

    return {
      ...entry,
      score: weightedScore
    };
  })
    .filter(e => e.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  /* =========================================================
     FALLBACK HANDLING
     ========================================================= */

  let combinedAnswer = "";

  if (scored.length === 0) {
    combinedAnswer =
      "I am a student developer specializing in modern web and mobile applications. You can ask me about my projects, skills, experience, or internship goals.";
  } else {
    combinedAnswer = scored.map(e => e.text).join(" ");
    combinedAnswer = await rewriteWithLLM(message, combinedAnswer);
  }

  const confidence =
    scored.reduce((acc, cur) => acc + cur.score, 0) /
    (scored.length || 1);

  /* =========================================================
     CONFIDENCE-BASED FOLLOW-UP
     ========================================================= */

  let followUp = "";
  if (confidence < 0.25) {
    followUp =
      " You can ask about my projects, technical skills, experience, or career goals.";
  } else if (confidence < 0.45) {
    followUp =
      " You may also want to know more about my development experience or the technologies I use.";
  }

  return new Response(
    JSON.stringify({
      reply: combinedAnswer + followUp,
      confidence: Number(confidence.toFixed(2)),
      matchedTopics: scored.map(s => s.id),
      format: "plain-text"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
