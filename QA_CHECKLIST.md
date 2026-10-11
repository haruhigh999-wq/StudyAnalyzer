# Manual regression checklist

Use a separate browser profile or a local preview origin for test data. Never import real student records into public development artifacts.

1. Open `/StudyAnalyzer/`: all counters start at zero, with helpful empty states.
2. Add a calculation mistake. Edit its notes. Refresh and confirm the edit.
3. Search for the question; filter by subject and another category. Check both matching and empty states.
4. Register a paper: score 60, maximum 80, target 64, and detailed Japanese/English reflections. Expect 75%. Refresh and reopen details.
5. Add another paper with another school/subject/year. Check all three filters.
6. In Analytics, filter subject, school and dates. Inspect chart data disclosures and percentage values.
7. Add a second calculation mistake. Study Coach should cite two mistake records and recommend timed accuracy practice. One mistake alone should not imply recurrence.
8. Add, complete and reopen a goal. Verify after refresh.
9. Change language and theme. Refresh; check stored academic text stays unchanged.
10. Export JSON; import it into a separate empty profile. Verify records, reflections, goals and settings. Try a malformed file; existing data must remain unchanged.
11. Test cancel/confirm for record deletion and delete-all, using disposable test records only.
12. Use Cmd/Ctrl+K, keyboard Tab/Escape in dialogs, 390px mobile width, and reduced motion.
13. Run `pnpm test` and `pnpm build`; smoke-test `pnpm preview`. Reload a hash route.
