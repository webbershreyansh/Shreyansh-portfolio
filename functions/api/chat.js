const responseHeaders = { "Content-Type": "application/json; charset=UTF-8" };

const createResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: responseHeaders });

const portfolioContext = `You are the helpful AI assistant for Shreyansh Raj Agrahari's portfolio.

Verified information about Shreyansh:
- He is based in Kathmandu, Nepal.
- He is pursuing Chartered Accountancy through Academy of Commerce CA under the ICAI curriculum.
- His active areas are accounting, finance, audit, business law, economics, business mathematics, HTML, CSS, JavaScript, Git, GitHub, and productivity tools.
- His projects include SolarScope, FinCalc, EventSpark, ClubOS, RobotRoute, and OrbitLab. ClubOS, RobotRoute, and OrbitLab are clearly labelled concept prototypes.
- He has 4+ years of IT club experience, has served as Treasurer, and has organised or volunteered across many student-led technical, academic, and community events. Examples include Astro Fest with NASO, robotics training, and the Horizon Scavenger Hunt.
- Visitors can contact him at ca@shreyanshrajagrahari.com.np.

Rules:
- Answer questions about Shreyansh using only the verified information above. Never invent personal details, achievements, dates, or contact information.
- You may answer general questions briefly and helpfully.
- For requests outside the portfolio, do not claim to speak for Shreyansh. Keep answers concise, warm, and under 110 words.
- Do not provide professional financial, legal, or medical advice. Encourage consulting a qualified professional when appropriate.`;

export async function onRequestPost(context) {
  if (!context.env.AI) return createResponse({ error: "Workers AI binding is not configured." }, 503);

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return createResponse({ error: "Send a valid JSON request." }, 400);
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message || message.length > 240) return createResponse({ error: "Message must be between 1 and 240 characters." }, 400);

  try {
    const result = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      messages: [
        { role: "system", content: portfolioContext },
        { role: "user", content: message }
      ],
      max_tokens: 180,
      temperature: 0.45
    });
    const reply = typeof result.response === "string" ? result.response.trim() : "";
    if (!reply) return createResponse({ error: "The AI assistant did not return a response." }, 502);
    return createResponse({ reply });
  } catch {
    return createResponse({ error: "The AI assistant is temporarily unavailable." }, 502);
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: responseHeaders });
}
