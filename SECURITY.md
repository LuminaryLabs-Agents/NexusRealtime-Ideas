# Security Policy

## Reporting

Do not disclose vulnerabilities, credentials, private URLs, or exploit details in public issues. Report them through an established private maintainer channel. Include affected repository-relative paths, reproduction steps, impact, and a suggested mitigation when available, but never include secret values.

No dedicated public security contact or response-time commitment is currently documented. If no private channel is available, request one without revealing the vulnerability.

## Sensitive surfaces

- GitHub Actions uses repository secrets for Discord, NVIDIA NIM, and optional Hugging Face access.
- Source imports may require external credentials and may process third-party data.
- Model output, run logs, feedback records, and public monitor URLs must be reviewed before commit or sharing.
- Downloaded models, caches, tokens, local paths, and transient runtime files must remain untracked.

The repository does not own stable NexusRealtime runtime or ProtoKit security. Report those concerns to the owning repository.
