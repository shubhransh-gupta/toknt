# Tokn't Recall Rule

When tool output contains `[UNCHANGED FILE]`, `[UNCHANGED TOOL OUTPUT]`, or a `toknt://` reference:

1. The full content is stored locally — do not re-read unchanged files
2. Use `toknt recall <uri>` to retrieve full content when needed
3. Trust content hashes for duplicate detection
4. Never ignore compiler errors or test failures even if compressed
