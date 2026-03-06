# ShareBite Smoke Test Checklist

## Auth
- Register new user (Step 1 + Step 2) succeeds.
- Register same email again returns duplicate-email message.
- Login with valid credentials succeeds.
- Login with wrong password returns auth error.

## Donor Flow
- Donor can create donation.
- Donor dashboard/list loads donations.

## Receiver Flow
- Receiver can create food request.
- Receiver can view own requests.

## Volunteer/Admin Flow
- Volunteer/Admin can open approval page.
- Approve/decline action works and list refreshes.

## General
- `GET /health` returns `{"ok":true}`.
- No console errors for API base URL or CORS in browser.
