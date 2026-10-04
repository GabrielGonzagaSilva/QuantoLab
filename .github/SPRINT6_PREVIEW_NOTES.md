# Sprint 6 · preview notes

Use the latest Vercel deployment from branch `sprint-6-polish-observability` for review.

Priority smoke paths:

- `/`
- `/ferramentas`
- `/salario-liquido`
- `/comparador-profissional`
- `/simulador`
- `/meus-numeros`
- `/politica-de-privacidade`

Expected behavior:

- layout and calculation behavior from Sprint 5 remain unchanged;
- interaction polish is subtle and disappears under reduced-motion;
- analytics/speed scripts are not loaded on localhost;
- on Vercel/production hosts they only load after Terms acceptance;
- financial values and search text never enter custom product events;
- privacy policy reflects the new measurement contract.
