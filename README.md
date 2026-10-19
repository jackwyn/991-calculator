# 991 Calculator

**A free, browser-based maths workspace for study and everyday problem-solving.**

[Open the live calculator](https://calculator991-models.astonishing-pew.workers.dev)

Explore 11 calculator-inspired touch profiles, a classic scientific calculator, graphing, and a searchable library of maths and everyday tools. No account or API key is needed to use the web app.

## What you can do

- Switch between 11 learning profiles inspired by Casio, Texas Instruments, and Sharp calculators.
- Work with scientific arithmetic, trigonometry, complex numbers, matrices, equations, statistics, and tables where supported by the selected profile.
- Explore graphs, numerical calculus, vectors, probability, and a limited spreadsheet workspace.
- Find finance, health, conversion, and other practical tools in the searchable 42-entry catalogue.
- Keep calculation history and model preferences locally in your browser.

### Calculator-inspired profiles

Casio fx-991MS (2nd edition); fx-991ES Plus (1st and 2nd editions); fx-991EX; fx-991CW; fx-570EX; fx-570CW; TI-36X Pro; TI-30XS MultiView; Sharp EL-501W; and Sharp EL-506W.

These are independent learning simulators, **not official firmware or exact hardware emulators**. Available functions vary by profile. The app displays model references and implementation limitations.

## Run locally

The web app is plain HTML, CSS, and JavaScript. There is no build step or backend.

With Python 3 installed, run this command from the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory web
```

Open <http://localhost:8080> in a modern browser. Stop the server with `Ctrl+C`.

### Run the regression checks

With Node.js 22 or newer and npm installed:

```sh
npm ci
npm test
```

Tests use jsdom to exercise model arithmetic, keypad interactions, mode restrictions, classic calculator behaviour, catalogue tools, and donation-link integrity. They do not replace real-browser accessibility, layout, or numerical-accuracy testing.

## Project layout

```text
web/                 Static website and bundled maths library
tests/              Model, UI, classic, and library regression checks
web/licenses/        Math.js license and notice
LICENSE              MIT license for original project code
THIRD_PARTY_NOTICES.md  Dependency and trademark attribution
```

Serve only `web/` when deploying to a static host. The included `web/math.js.LICENSE.txt` must remain with the bundled library. Retain the Math.js license and notice when redistributing the source or deploying a redistributed copy. Hosting credentials and account-specific deployment scripts are intentionally not included.

## Privacy and limitations

Calculation history and preferences use browser local storage. They may remain until cleared and should not be treated as encrypted storage. The included app code does not send calculations to a backend. Opening reference links or a payment app takes you to a third-party service; the hosting provider may also keep normal access logs.

This project does not implement every function, menu, precision rule, or key sequence found on the named devices. Spreadsheet and some model workspaces are subsets. Numerical methods may return approximations. Finance and health outputs are informational, not professional advice; independently verify important results.

The interface uses the display branding “991calculator.com”. That domain is not connected to this project; use the live link above.

## Support development

If this calculator is useful to you, consider a voluntary donation to support its development and maintenance. Any amount is appreciated; donating is not required to use the app.

- **Payee name:** Jackwyn Fredrick
- **UPI ID:** `9489558549@ptyes`
- **Currency:** INR
- **Amount:** Your choice — no amount is preset.

Copy the UPI ID into your preferred UPI app. The website also provides a “Donate via UPI” link for compatible devices. Check the recipient shown by your payment app before confirming. This project does not claim charitable or tax-deductible status.

## Contributing

Bug reports, clearer explanations, accessibility improvements, and tested calculator fixes are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). For reproducible numerical issues, include the selected profile, input, expected answer, actual answer, and a reference where possible. Do not include private calculation history or payment details.

## License and attribution

Original project code is licensed under the [MIT License](LICENSE), copyright © 2026 Jackwyn Fredrick. You may use, modify, and redistribute it, including commercially, while retaining the required notices.

The bundled Math.js library and its components retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Casio, Texas Instruments, Sharp, and their model names are trademarks of their respective owners. This project is not affiliated with, endorsed by, or sponsored by those companies. Linked reference manuals are not included in this repository or relicensed under MIT.
