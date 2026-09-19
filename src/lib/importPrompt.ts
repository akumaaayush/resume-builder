/**
 * The prompt a user pastes into ChatGPT/Claude along with their existing CV.
 * The model answers with JSON this app can import, so nobody has to retype a
 * resume into empty fields.
 */
export const IMPORT_PROMPT = `You are converting a résumé/CV into JSON for a Typst-based resume builder.

I am attaching my current résumé (PDF, DOCX, or pasted text). Read it and output
a single JSON object matching the schema below.

RULES
- Output ONLY the JSON. No markdown fences, no commentary, no trailing text.
- Use the exact wording from my résumé. Do not invent, embellish, or add facts.
- If something is missing, use an empty string "" or an empty array []. Never null.
- Omit "id" fields entirely; the app generates them.
- Omit "config"; the app supplies page/typography defaults.
- Keep bullet text as one plain string per bullet. No markdown, no leading "-".
- "label" is the short bold lead-in of a bullet (e.g. "API Development"). If a
  bullet has no natural lead-in, use "".

SCHEMA
{
  "header": {
    "name": string,
    "nameUrl": string,          // optional link on the name, e.g. LinkedIn
    "email": string,
    "phone": string,
    "location": string,
    "profiles": [ { "label": string, "url": string } ]   // e.g. LinkedIn, Github
  },
  "sections": [
    // Use the section type that fits. Repeat types as needed. Order matters.

    // 1. Plain bullet list — summary, skills, soft skills, languages.
    { "kind": "bullets", "title": string, "enabled": true,
      "items": [ { "text": string } ] },

    // 2. Timeline — experience, education. Each entry has a two-line heading
    //    (org + location, then role + period) and its own bullets.
    { "kind": "timeline", "title": string, "enabled": true,
      "entries": [ {
        "org": string, "location": string, "role": string, "period": string,
        "bullets": [ { "label": string, "text": string } ]
      } ] },

    // 3. Projects.
    { "kind": "projects", "title": string, "enabled": true,
      "items": [ { "name": string, "summary": string, "stack": string,
                   "repoUrl": string, "liveUrl": string } ] },   // urls optional, "" if absent

    // 4. Labeled list — awards, certifications, publications.
    //    Renders as: **label** text, meta
    { "kind": "labeled", "title": string, "enabled": true,
      "items": [ { "label": string, "text": string, "meta": string } ] }
  ]
}

TYPICAL SECTION ORDER
Professional Summary (bullets), Education (timeline), Technical Skills (bullets),
Experience (timeline), Projects (projects), Accomplishments (labeled),
Languages (bullets). Drop any section I do not have.

Now output the JSON.`
