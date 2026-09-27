# Submission draft — Code for a Billion 2026

Copy each block into the matching field of the GitHub submission form:
https://github.com/karlmehta/code-for-a-billion/issues/new?template=submission.yml

Title: `[Submission] Nishant Singh — Ilaaj Saathi`

Check the two links and the AgentFoundry line before you submit.

---

### Team / Project name
Nishant Singh — Ilaaj Saathi

### Team members (names + GitHub handles)
Nishant Singh (@NishantSingh00001)

### Problem statement
Ayushman Bharat PM-JAY pays for up to ₹5 lakh of hospital treatment per family per year, and since October 2024 every Indian aged 70+ is covered whatever their income. Yet only 1.36 crore of about 6 crore entitled seniors have made their Vay Vandana card, and in a six-state survey 38% of eligible households had never heard of the scheme. The people who need it most are often elderly, have little schooling or read Hindi better than English, and the official portals assume a confident, literate smartphone user. As a result, families keep paying out of pocket, which is still 43.4% of India's health spending, for treatment they are already entitled to get free.

### What you built
Ilaaj Saathi (इलाज साथी) is a Hindi-first, mobile-first website (also in English and Bengali) that tells a family in 2 minutes whether they are likely covered by PM-JAY, and then gets them to the card.

- **2-minute check:** up to 7 tap-to-answer questions built on the official criteria (70+ rule, rural deprivation criteria D1–D7, automatic inclusion, 11 urban occupations, ASHA/anganwadi families, ration cards). It gives a clear result with reasons, numbered next steps, a document checklist and links to the official portals. It never asks for a name, phone number or Aadhaar.
- **Three languages:** Hindi, English and Bengali, switchable in one tap.
- **Ask Saathi, an AI agent:** answers questions in Hindi, English or Bengali, typed or spoken, and reads answers aloud. It is a tool-using agent: every scheme fact must come from a `get_scheme_facts` tool backed by a source-cited knowledge file, and it can run the same `check_eligibility` rules engine as the website. Aadhaar-like and phone numbers are removed on the server before any AI call. If AI is unavailable, a verified built-in answer bank (Hindi, English, Bengali, Hinglish) replies, so it never breaks.
- **One-tap WhatsApp share**, so a grandchild can check for a grandparent and pass it on.
- **Rights and scam warnings:** cashless treatment, "the card is free", never share your OTP, helpline 14555, complaints portal.
- **Public impact dashboard (/impact)** with anonymous counters: checks finished, seniors found, shares, questions answered, and people who report getting their card.
- Open source (MIT) with 29 automated tests and no front-end build step. It is fast on low-end phones.

**How I used AgentFoundry:** I opened the project in the AgentFoundry IDE and used its Smart-Code agent to add Bengali: it translated all 171 interface texts, added Bengali fonts and the three-way language switch. I push to GitHub and deploy from AgentFoundry. (Keep only what is true.)

The first version was built with help from Claude (AI).

### GitHub repository URL
https://github.com/NishantSingh00001/ilaaj-saathi

### Demo URL (live app or video)
https://ilaaj-saathi.vercel.app (use the exact link Vercel gives you)

### Scale & severity of the problem
**Scale**
- PM-JAY covers 55 crore+ people (PIB, Nov 2024), and 48.5 crore Ayushman cards have been created (DD India, 23 Sep 2026).
- About 6 crore senior citizens aged 70+ in 4.5 crore families became entitled regardless of income (PMO, 11 Sep 2024). Only 1.36 crore Vay Vandana cards had been issued by 21 Sep 2026 (DD India). That leaves roughly 4.6 crore entitled seniors without the card.
- 38% of eligible households in a 6-state survey of 11,618 households had never heard of PM-JAY (Parisi et al., Health Policy and Planning, 2023).

**Severity**
- Families still pay 43.4% of India's total health expenditure out of pocket (National Health Accounts 2022-23, released 27 May 2026). Hospitalisation is the costliest event a poor family faces.
- Seniors aged 70+ are the group most likely to need hospital care. Each one who doesn't know about the scheme risks paying for surgery, dialysis or cancer care that is already paid for, up to ₹5 lakh a year.
- The scheme has already funded 13.25 crore hospital admissions worth ₹2.03 lakh crore (DD India, Sep 2026). The gap is not money. It is awareness and the last step of getting the card.

Sources:
- https://www.pmindia.gov.in/en/news_updates/cabinet-approves-health-coverage-to-all-senior-citizens-of-the-age-70-years-and-above-irrespective-of-income-under-ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pm-jay/
- https://ddindia.co.in/2026/09/ayushman-bharat-pm-jay-marks-8-years-covers-over-48-5-crore-people/
- https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=153425&ModuleId=3&reg=3&lang=1
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2265816&lang=1&reg=3
- https://academic.oup.com/heapol/article/38/3/289/6881114

### Deployment & impact data
For now (this field is optional and you can edit the issue later):

Deployed publicly at https://ilaaj-saathi.vercel.app with a live, anonymous impact dashboard at https://ilaaj-saathi.vercel.app/impact (checks finished, seniors aged 70+ found, results shared, questions answered, people who got their card). Next: a field pilot helping families with members aged 70+ make their Vay Vandana cards. I'll update this issue with real field data before 15 November.

Later, replace it with real numbers only (see docs/PILOT_PLAN.md), for example:
- N families finished the check; N had a member aged 70+ who is entitled
- Pilot at PLACE: N people helped in person; N cards made (confirmed by seeing the downloaded card)
- Before/after: N of M people knew seniors 70+ are covered before we spoke to them

### Track / category
Health

### Contact email
The email you registered with (it will be public on the issue)

### Confirmations
Tick these only when each is true:
- [ ] Built using AgentFoundry (AF), the official IDE
- [ ] Our repository is public and includes a README with setup steps
- [ ] The demo link works and is accessible to judges
