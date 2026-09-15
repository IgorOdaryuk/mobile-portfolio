# Publishing — App Store & Google Play

Cross-app notes for shipping any app in this portfolio. Verified 2026-08-15 against Apple and Google
documentation. Store rules change — re-check the linked sources before a submission.

---

## Apple — App Store

### Membership
- Apple Developer Program: **$99/year**, required to use TestFlight or publish. Not required to run
  a build on your own device (see Free provisioning below).
- Individual enrollment needs: Apple Account with **2FA enabled**, legal age of majority, your
  **personal legal name** (no aliases). No D-U-N-S number (that is organization-only).
- Payment: a **major credit/debit card in your own name**. Apple Account balance, gift cards and
  prepaid cards are rejected. Region of the Apple Account, billing address and phone number should
  all be the same country — a mismatch is the most common cause of a declined enrollment payment.
  Debit cards are officially accepted but are declined more often than credit cards.
- Membership auto-renews yearly on the same card. If it lapses, published apps are removed from the
  store. Set a reminder one month ahead.

### Account country is a long-term decision
The country of the developer account determines the seller record, tax forms and store agreements.
Changing it later is not a profile edit — it requires a request to Apple with supporting documents
and can take months. Pick it deliberately at enrollment.

### Free provisioning — test on a real device without paying
Xcode signs builds with a **Personal Team** using any ordinary Apple Account. The app installs on
your own connected device; the signature expires after **7 days**, then rebuild. Enough for real
device testing (background behavior, battery, layout). TestFlight and store distribution still
require the paid membership.

### Paid vs free apps
- **Free app**: no Paid Apps Agreement, no banking details, no tax forms. Nothing to set up.
- **Paid app or IAP**: requires the Paid Apps Agreement, banking details and completed tax forms
  before Apple releases any proceeds. Commission is 30%, or 15% under the Small Business Program.
- **Guideline 3.1.1** — apps may not unlock content or functionality with their own mechanisms:
  license keys, unlock codes, QR codes, crypto. Anything paid must go through In-App Purchase.
  Only exception: content bought on another platform may be accessed in the app **if the same
  content is also purchasable via IAP**. Linking out to free external content (e.g. an unlisted
  video) is fine — the rule is about payment, not about links.

### Banking (only when monetizing)
- **Bank Territory = the country of your bank branch**, not your legal entity's country. The bank
  account does not have to be in the same country as the developer account, which is why third-party
  USD receiving accounts work.
- The bank account holder name does not have to match the legal entity name on the agreement.
- Payments go to a single primary bank account; split payouts are not supported.

### EU Digital Services Act — trader status
Mandatory declaration for App Store distribution in the EU. Apps without a verified trader status
are **removed from the EU App Store**, and updates cannot be submitted. If you declare as a trader,
Apple **publishes your address, phone number and email on the app's product page** for EU customers,
after verifying them. Decide what contact details you are willing to make public before submitting.

### Minimum checklist before review
- App icon (a default framework icon is a rejection).
- Screenshots for the required device sizes.
- Privacy policy URL — required even for free apps that collect nothing.
- App Privacy ("nutrition label") declaration filled in App Store Connect.
- Trader / non-trader status declared.
- No copy promising trials, unlocks or payments that the app does not actually implement.

---

## Google — Play Store

- Play Console: **$25 one-time**, plus identity verification (document + address), so allow a few days.
- **Closed testing gate**: personal developer accounts created after **2023-11-13** must run a closed
  test with **at least 12 testers opted in for 14 consecutive days** before applying for production
  access. "Opted in" means the tester accepted the invite and installed the app under the matching
  Google account — invited-but-not-installed does not count, and Google also looks at whether testers
  actually used the app. Production access review then takes up to ~7 days.
  Organization accounts, and personal accounts created before that date, are exempt.
  → This is the **longest timer in the whole pipeline**. Start recruiting testers first, not last.
- Assets: icon 512×512, feature graphic 1024×500, at least 2 screenshots.
- Build: Expo → `eas build -p android` (.aab); Flutter → `flutter build appbundle`.
- Enable **Play App Signing** and back up the upload key — without it you cannot ship updates.
- Compliance: privacy policy URL, Data Safety form, current target API level, content rating,
  minimum permissions.

---

## Toolchain gotcha — Xcode 26 requires a downloaded iOS platform

Xcode 26 ships without the iOS platform payload. Until it is downloaded, **every** iOS destination is
ineligible — device builds and simulator builds alike — even though `xcodebuild -showsdks` lists an
iOS SDK and older simulator runtimes are installed. The failure looks like:

```
Unable to find a destination matching the provided destination specifier: { generic:1, platform:iOS }
  ... error:iOS 26.5 is not installed. Please download and install the platform from
      Xcode > Settings > Components.
```

Fix:

```bash
xcodebuild -downloadPlatform iOS -architectureVariant arm64   # ~8 GB
xcodebuild -deleteComponent <componenttype>                   # to remove it again
```

Budget roughly **double** the component size in free disk space: the image is downloaded first and
expanded afterwards, so the peak is far above the final footprint.

Related: disk cleaner utilities treat `~/Library/Developer`, `~/Library/Android`, `~/.gradle` and
`~/.pub-cache` as ordinary caches. Losing them costs hours of re-downloading. Verify the toolchain
after any cleanup:

```bash
xcodebuild -showsdks | grep -i ios
du -sh ~/Library/Android ~/.pub-cache
flutter doctor
```

---

## Sources

- [Apple Developer — Enrollment](https://developer.apple.com/support/enrollment/)
- [Apple Developer — Program enrollment help](https://developer.apple.com/help/account/membership/program-enrollment/)
- [App Store Review Guidelines — 3.1.1](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect — Banking information](https://developer.apple.com/help/app-store-connect/reference/reporting/banking-information)
- [DSA trader status required for apps in the EU](https://developer.apple.com/news/upcoming-requirements/?id=02172025a)
- [App testing requirements for new personal developer accounts (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/14151465)
