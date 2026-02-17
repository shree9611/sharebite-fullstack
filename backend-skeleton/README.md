# ShareBite Backend Skeleton

This is a concrete backend structure for the donor/receiver workflow used by your current frontend.

## Implemented Flow

1. Donor creates donation (`POST /api/donations`)
2. Nearby receivers get notifications (event hook on donation create)
3. Receiver requests donation (`POST /api/requests`)
4. Donor approves/declines (`PATCH /api/approvals/:requestId`, `PATCH /api/approvals/:requestId/decline`)
5. Receiver submits feedback (`POST /api/feedback`) with required `requestId`
6. Donor community reads feedback (`GET /api/feedback`)

## Endpoints (frontend-compatible)

- `POST /api/donations` (multipart/form-data, field `image`)
- `GET /api/donations`
- `POST /api/requests`
- `GET /api/requests`
- `PATCH /api/approvals/:requestId`
- `PATCH /api/approvals/:requestId/decline`
- `POST /api/feedback`
- `GET /api/feedback`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

## Notes

- The `authMiddleware` is intentionally lightweight; replace it with JWT verification.
- Notification delivery is structured for DB + real-time emit; wire socket implementation as needed.
- Proximity matching uses geo query with `2dsphere` index on user location.

