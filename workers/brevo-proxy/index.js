const ALLOWED_ORIGINS = [
  "https://love-at-first-sign.webflow.io",
  "https://www.loveatfirstsign.co.uk",
];

const BREVO_FOLDER_ID = 1;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status = 200, origin = "") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function brevo(path, method = "GET", body, apiKey) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

async function getOrCreateListId(city, apiKey) {
  const listName = `LAFS - ${city}`;

  const { lists = [] } = await brevo("/contacts/lists?limit=50", "GET", null, apiKey);
  const existing = lists.find((l) => l.name === listName);
  if (existing) return existing.id;

  const created = await brevo(
    "/contacts/lists",
    "POST",
    { name: listName, folderId: BREVO_FOLDER_ID },
    apiKey
  );
  return created.id;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    let name, city, email;
    try {
      ({ name, city, email } = await request.json());
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, origin);
    }

    if (!name || !city || !email) {
      return jsonResponse({ error: "Missing required fields" }, 400, origin);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ error: "Invalid email address" }, 400, origin);
    }

    const apiKey = env.BREVO_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Server misconfiguration" }, 500, origin);
    }

    try {
      const listId = await getOrCreateListId(city, apiKey);

      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: JSON.stringify({
          email,
          attributes: { FIRSTNAME: name, CITY: city },
          listIds: [listId],
          updateEnabled: true,
        }),
      });

      if (res.ok || res.status === 204) {
        return jsonResponse({ success: true }, 200, origin);
      }

      const err = await res.json().catch(() => ({}));
      console.error("Brevo error:", err);
      return jsonResponse({ error: "Brevo API error" }, 502, origin);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: "Internal server error" }, 500, origin);
    }
  },
};
