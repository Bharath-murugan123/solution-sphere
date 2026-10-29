# Solution Sphere — Product Understanding

This document records the product direction described in the supplied May 2026 Innovative Design Lab Report and October 2026 Phase I Project Report. It is intended to guide future UI and product decisions.

## Product purpose
Solution Sphere is a digital innovation platform that connects students, innovators, professionals, industries, startups, educational institutions, and communities through real-world problem statements. Its core purpose is to help people apply practical skills, collaborate on solutions, and make their contributions visible to potential collaborators and organisations.

## Core product loop
1. Organisations or communities provide a real-world problem statement.
2. Participants discover and evaluate challenges by domain, requirements, and timeline.
3. Individuals or teams work on a proposed solution.
4. Participants submit solutions and document their contributions.
5. Profiles showcase skills, work, and achievements.
6. Organisations and collaborators can discover talent through demonstrated practical ability.

## Main product areas described in the reports
- **Challenge discovery:** Categorised problem statements across AI/ML, IoT, healthcare, agriculture, sustainability, education, and related domains.
- **Solution submission:** A place for participants to submit their proposed solution to a selected problem.
- **Collaboration and networking:** Support for students, innovators, professionals, industries, and communities to connect and work together.
- **Profiles and skills:** User profiles should highlight skills, interests, past work, and achievements rather than relying only on academic credentials.
- **Recognition:** Achievements and verified records can help communicate practical contributions. Verification is a future capability unless implemented.
- **Industry and career opportunities:** Organisations may use demonstrated work to discover potential contributors and candidates.
- **Feeds:** The reports describe feeds for challenges, achievers, and industry innovation; content should be useful and credible, not inflated or promotional.
- **Mobile experience:** The reports identify Flutter for the mobile interface and React for the web interface.

## Intended audiences
- Students looking for real-world experience and ways to demonstrate skills.
- Innovators and professionals looking for problems, collaborators, and visibility.
- Industries and startups looking to publish problems and discover talent.
- Educational institutions and communities encouraging practical innovation.
- Recruiters looking for evidence of practical capability.

## Product principles for the UI
- Keep the existing warm off-white and forest-green palette unchanged.
- Use calm, professional language. Avoid hype, unsupported scale claims, and decorative emoji.
- Never present fabricated user counts, application counts, awards, partner logos, or impact metrics as real.
- If demo content is required, label it clearly as sample content and use plausible examples.
- Distinguish implemented features from proposed or future capabilities.
- Prefer clear actions and meaningful information over decorative dashboard metrics.
- Use accessible typography, predictable navigation, responsive layouts, and empty states that guide the next step.

## Technology direction in the reports
The reports describe React and Flutter interfaces, a Node.js backend, and MongoDB as the intended database. The current local starter included with this archive uses React, Vite, Express, and SQLite for a simple local development setup. That is an implementation difference to resolve deliberately before production deployment; it should not be represented as MongoDB already being implemented.

## Validation and evidence
The reports record positive feedback about the concept (including 90% for usefulness in innovation exposure/practical learning and 80% for potential recognition/career opportunities). These are reported perceptions from MVP feedback, not proof of employment outcomes or platform-wide impact. Do not use them as live homepage counters.

## Future scope stated in the reports
- Challenge recommendations based on skills and interests.
- Stronger industry partnerships and organisation-hosted challenges.
- Team formation, communication, project workspaces, and progress tracking.
- Verified achievements/certifications.
- Improved mobile experience.
- Analytics to measure actual participation and solution outcomes.
- Business model validation for challenge-hosting, subscriptions, recruitment partnerships, certifications, and sponsored events.

## Current starter limitations
The local starter demonstrates account registration/login, challenge browsing and filtering, saving challenges, applying to challenges, a dashboard, and basic achievements. It is not yet a complete implementation of solution submission, team collaboration, a social feed, organisation challenge publishing, recruiter discovery, verified credentials, or the Flutter app. These should be built as deliberate modules rather than implied by marketing copy.
