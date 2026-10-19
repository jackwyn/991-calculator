# Contributing

Thank you for helping improve 991 Calculator.

## Report a bug

Open an issue with the calculator profile or tool, exact input, expected and actual output, browser version, and steps to reproduce. For numerical behaviour, include an authoritative reference or independent calculation where possible. Remove personal data and payment details from examples and screenshots.

Never post credentials, signing keys, tokens, or a working exploit containing private data in public issues. Report only a redacted description until a private reporting channel is available.

## Propose a change

1. Fork the repository and create a focused branch.
2. Serve `web/` locally as described in the README.
3. Run `npm ci` and `npm test`.
4. Add regression coverage for changed calculations or key flows.
5. Check the interface in a real desktop browser and a narrow mobile viewport.
6. Submit a pull request explaining what changed, why, and how it was tested.

Preserve keyboard access, readable labels, model-specific restrictions, and third-party notices. Do not add tracking, external network dependencies, secrets, or account-specific deployment files. Do not imply that a partial simulator exactly reproduces official hardware.

Contributions are submitted under the project's MIT license; third-party material must retain compatible licensing and attribution. Only submit material you are entitled to contribute.
