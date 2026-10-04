# Sprint 6 · product event taxonomy

| Event | Purpose | Allowed payload |
| --- | --- | --- |
| `ql_terms_accepted` | Confirm consent gate | version, mode, path |
| `ql_profile_saved` | Measure optional continuity adoption | fields, path |
| `ql_profile_cleared` | Measure continuity reset | path |
| `ql_catalog_filter` | Understand context filtering | context, path |
| `ql_catalog_search` | Understand search usefulness without collecting the query | results, context, path |
| `ql_decision_shortcut_opened` | Measure decision shortcuts | destination, source, path |
| `ql_tool_opened` | Measure catalog-to-tool navigation | tool, source, path |
| `ql_calculator_run` | Measure completed calculator intent | tool, action, path |
| `ql_next_decision_opened` | Measure continuity between calculations | destination, source, path |
| `ql_saved_reference_manage` | Measure management of saved references | source, path |
| `ql_mobile_menu_opened` | Observe mobile navigation use | viewport, path |
| `ql_client_error` | Detect client-side regressions without error contents | source, path |

## Never send

- salary, income, costs, tax rate, reserve values, project values or any form values;
- catalog search text;
- query strings or URL fragments;
- error messages, stack traces, user-entered strings or free-form text.
