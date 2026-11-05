# Native Evuddy app — support ticket replies

The website and native Android app share the same rider auth (Firebase) and ticket API.

## Poll for replies

```
GET /api/tickets/mine
Authorization: Bearer <Firebase ID token>
```

Returns up to 20 tickets, newest activity first (`updatedAt`).

Each item includes:

| Field | Use in app |
| --- | --- |
| `ticketId` | Stable id for UI |
| `status` | Open / resolved state |
| `description` | Rider message |
| `adminRemarks` | Support desk reply (legacy field name) |
| `supportReply` | Same text as `adminRemarks` when present |
| `hasSupportReply` | `true` when support has replied |
| `supportReplyAt` | `updatedAt` when a reply exists |
| `updatedAt` | Poll this to detect new replies |

## Suggested client behaviour

1. After login, call `/api/tickets/mine` every 15–30 seconds on the support screen (or use push when available).
2. Show `supportReply` (or `adminRemarks`) in the thread when `hasSupportReply` is true.
3. Compare `supportReplyAt` / `updatedAt` to the last seen timestamp to badge unread replies.

Book EV Web uses the same fields in `RiderComplaintTicket.tsx`.
