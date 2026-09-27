# Ilaaj Saathi · इलाज साथी

**Hindi, English and Bengali helper that tells an Indian family in 2 minutes whether it gets free hospital treatment under Ayushman Bharat PM-JAY. It then walks them through getting the card and using it.**

Built for **Code for a Billion — Bharat Agentic-AI Hackathon 2026** · Impact area: **Health** · License: **MIT**

> Ilaaj Saathi is an independent, open-source project. It is not a government website and does not collect personal data.

---

## The problem

PM-JAY pays for up to **₹5 lakh of hospital treatment per family per year**, cashless, at **38,000+ hospitals**. More than **55 crore people** fall under it. Since October 2024, **every Indian aged 70 or above** is covered whatever their income. The money is there, but people don't claim it:

- About **6 crore seniors** are entitled under the 70+ expansion, but only **1.36 crore** Vay Vandana cards had been made by 21 September 2026. That leaves roughly **4.6 crore seniors** without the card they are entitled to.
- In a six-state survey of eligible households, **38% had never heard of the scheme** (Parisi et al., 2023).
- Families still pay **43.4% of India's total health spending out of pocket** (National Health Accounts 2022-23).

The people who most need the scheme are often elderly, have little schooling, or read Hindi better than English. The official portals assume a confident, literate smartphone user.

## What Ilaaj Saathi does

| Feature | What it does |
|---|---|
| **2-minute check** | Up to 7 tap-to-answer questions based on the official criteria: 70+ rule, rural deprivation criteria D1–D7, automatic inclusion, 11 urban occupations, ASHA/anganwadi families, ration card. No name, number or Aadhaar asked. |
| **Clear result** | "Covered", "Likely", "Check" or "Unlikely", with the reasons, numbered next steps, a document checklist and links to the official portals. |
| **Share on WhatsApp** | One tap sends the result and the link to family, so a grandchild can do it for a grandparent. |
| **Three languages** | Hindi (default), English and Bengali, switchable in one tap. The Bengali interface was added in AgentFoundry with its Smart-Code agent. |
| **Ask Saathi (AI agent)** | Answers questions in Hindi, English or Bengali, typed or **spoken**, and can **read answers aloud**. It is a tool-using agent: it must pull facts from `get_scheme_facts` (official, source-cited) and can run the same `check_eligibility` rules as the website. |
| **Privacy by design** | Aadhaar-like and phone numbers are removed on the server before any AI call. The agent is told never to ask for them. Nothing personal is stored. |
| **Works without AI** | With no API key, or if the network fails, Saathi answers from a built-in, verified answer bank (Hindi, English, Bengali and Hinglish keywords). The demo never breaks. |
| **Rights & helpline** | Cashless rights, scam warnings, the 14555 helpline and the complaints portal. |
| **Impact dashboard** | `/impact` shows anonymous live counters: checks finished, seniors found, shares, questions answered, and people who report they got their card. |

## Architecture

```
index.html, assets/        Static front end (vanilla JS modules, no build step)
lib/eligibility.js         Rules engine — shared by the browser and the agent
lib/knowledge.js           Verified facts + sources (single source of truth)
lib/faq.js                 Offline answer engine (hi / en / bn / Hinglish)
lib/agent.js               Tool-using agent on the Anthropic Messages API
api/chat.js                POST /api/chat   → agent (rate-limited, validated, redacted)
api/event.js               POST /api/event  → anonymous counter (+1)
api/stats.js               GET  /api/stats  → numbers for /impact
impact.html                Public impact dashboard
scripts/dev-server.mjs     Zero-dependency local dev server
tests/                     node:test suites (rules, answers, agent loop, API)
```

The agent loop: the user's message is redacted → Claude (Haiku 4.5 by default) is called with two tools → tool calls are run locally (`get_scheme_facts`, `check_eligibility`) → up to 4 rounds → a short answer in the user's language. If anything fails, the offline answer bank replies instead.

## Run it locally

Requires Node.js 18 or newer. There are no dependencies to install.

```bash
git clone https://github.com/NishantSingh00001/ilaaj-saathi.git
cd ilaaj-saathi
cp .env.example .env        # optional: add keys to turn on AI answers and counters
npm run dev                 # → http://localhost:3000
npm test                    # 29 tests
```

Open `http://localhost:3000/#en` for English or `#bn` for Bengali (the default is Hindi; there is also a toggle in the header).

### Environment variables

| Variable | Needed for | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI answers from Saathi | Built-in answers are used |
| `LLM_MODEL` | Optional model override | `claude-haiku-4-5-20251001` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Impact counters (free Upstash Redis) | Counting is off; `/impact` says so |

## Develop and deploy (free)

This hackathon's official IDE is [AgentFoundry](https://agentfoundry.me). The site runs free on Vercel's Hobby plan.

1. Open this folder as a project in AgentFoundry and connect your GitHub account.
2. Push to a **public** GitHub repository (`NishantSingh00001/ilaaj-saathi`).
3. Deploy with AgentFoundry's one-click **Vercel** deploy, or at [vercel.com/new](https://vercel.com/new) import the repository. Framework preset: **Other**. Leave the build command and output directory empty. The `api/` folder becomes serverless functions automatically.
4. Optional: add the environment variables above under **Settings → Environment Variables**, then **Redeploy**.

Every push to `main` redeploys automatically.

## Keeping facts correct

Every scheme fact lives in `lib/knowledge.js` with its source and a `LAST_VERIFIED` date. The website text (`assets/js/i18n.js`) and the offline answers (`lib/faq.js`) must agree with it. Before each release, re-check the numbers against the sources below and update the date in the footer.

## Sources

- National Health Authority — [About PM-JAY](https://nha.gov.in/PM-JAY)
- PMO — [Cabinet approves coverage for all senior citizens aged 70+](https://www.pmindia.gov.in/en/news_updates/cabinet-approves-health-coverage-to-all-senior-citizens-of-the-age-70-years-and-above-irrespective-of-income-under-ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pm-jay/) (11 Sep 2024)
- PIB — [PM-JAY progress note](https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=153425&ModuleId=3&reg=3&lang=1) (Nov 2024)
- DD India — [Ayushman Bharat PM-JAY marks 8 years](https://ddindia.co.in/2026/09/ayushman-bharat-pm-jay-marks-8-years-covers-over-48-5-crore-people/) (23 Sep 2026)
- PIB — [National Health Accounts Estimates 2022-23](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2265816&lang=1&reg=3) (27 May 2026)
- Parisi et al. — [Awareness of PM-JAY: a cross-sectional study across six states](https://academic.oup.com/heapol/article/38/3/289/6881114), Health Policy and Planning (2023)

## Roadmap

- More languages: Marathi, Tamil, Telugu (the i18n and answer bank are built for it)
- A WhatsApp bot using the same agent and rules
- State-scheme notes (many states cover more families than the central list)
- A printable one-page flyer with a QR code for ASHA workers and CSCs

## Contributors

- Nishant Singh ([@NishantSingh00001](https://github.com/NishantSingh00001))

## License

MIT. See [LICENSE](LICENSE).
