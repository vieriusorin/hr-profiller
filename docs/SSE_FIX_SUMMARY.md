# SSE Role Matching Fix Summary

## Issues Identified

### 1. **Modal Not Closing**
**Problem:** When clicking 'Find Candidates', the modal stayed open and no network activity occurred.

**Root Cause:** The dialog component wasn't programmed to close when the search started.

**Fix:** Added `onOpenChange(false)` immediately after initiating the SSE connection in `find-candidates-dialog-v2.tsx` (line 56).

```typescript
// Close the modal immediately
onOpenChange(false);
```

### 2. **No Network Activity - EventSource Headers Issue**
**Problem:** Browser's EventSource API doesn't support custom headers, which is a fundamental limitation.

**Root Cause:** The SSE service was trying to pass the authentication token via headers:
```typescript
// ❌ This doesn't work in browsers
this.eventSource = new EventSource(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
} as any);
```

**Solution:** Pass the authentication token as a query parameter instead:

#### Frontend Changes (`role-matching-sse.service.ts`):
```typescript
// ✅ Pass token in URL query parameter
const token = encodeURIComponent((session as any).backendToken);
const url = `${API_BASE_URL}/api/v1/role-matching/sse/start?roleId=${roleId}&limit=${limit}&token=${token}`;

this.eventSource = new EventSource(url, {
  withCredentials: true
});
```

#### Backend Changes (`role-matching-sse.ts`):
Added a special middleware to extract the token from query parameters and move it to headers before the JWT middleware processes it:

```typescript
// Special middleware for SSE that accepts token from query param
// EventSource doesn't support custom headers, so we extract token from URL
const authenticateSSE = (req: Request, res: Response, next: NextFunction) => {
  const tokenFromQuery = req.query.token;
  if (tokenFromQuery && typeof tokenFromQuery === 'string') {
    req.headers['authorization'] = `Bearer ${tokenFromQuery}`;
  }
  next();
};

router.get(
  '/start',
  rateLimitByClient,
  authenticateSSE,          // Extract token from query
  authenticateJWT,          // Validate JWT from header
  requirePermissions(['read:employees', 'read:persons']),
  (req, res) => roleMatchingSSEController.startRoleMatching(req, res)
);
```

## How It Works Now

1. **User clicks 'Find Candidates'** → Modal opens with number input
2. **User clicks 'Find Candidates' button** → 
   - Modal closes immediately
   - SSE connection starts with token in URL
   - Progress banner appears in top-right corner
3. **Backend sends SSE events:**
   - `status` events with progress updates (0%, 20%, 80%)
   - `complete` event with candidate results
   - `error` event if something fails
4. **Progress banner shows real-time updates**
5. **On completion:**
   - Success toast shown
   - 'View Results' button appears in banner
   - Results modal can be opened with full candidate details

## Files Modified

### Frontend
1. `/frontend/lib/services/role-matching-sse.service.ts`
   - Changed to pass token as query parameter
   - Removed invalid headers option from EventSource

2. `/frontend/components/opportunities/role-matching/find-candidates-dialog-v2.tsx`
   - Added immediate modal close on button click

### Backend
3. `/backend/src/infrastructure/http/routes/role-matching-sse.ts`
   - Added Express type imports
   - Added `authenticateSSE` middleware to extract token from query params
   - Updated route middleware chain

## Testing Checklist

- [ ] Click 'Find Candidates' on any role
- [ ] Modal should close immediately
- [ ] Progress banner should appear in top-right corner
- [ ] Check browser DevTools Network tab for:
  - EventSource connection to `/api/v1/role-matching/sse/start?roleId=...&token=...`
  - Connection status should be '200' or 'pending'
  - 'eventsource' type in the Type column
- [ ] Progress updates should show: 0% → 20% → 80% → 100%
- [ ] On completion, 'View Results' button should appear
- [ ] Results modal should show matched candidates

## Why EventSource Doesn't Support Headers

This is a **browser security limitation**. The EventSource API was designed before modern authentication patterns became common. Unlike `fetch()` or `XMLHttpRequest`, EventSource:
- Cannot send custom headers
- Cannot send request body
- Can only make GET requests
- Must rely on cookies or query parameters for authentication

### Alternative Solutions (not implemented)
1. **Use WebSockets** - More complex but supports full headers
2. **Use fetch with ReadableStream** - Modern alternative to EventSource
3. **Use HTTP-only cookies** - More secure but requires cookie-based auth

We chose the query parameter approach because:
- ✅ Minimal code changes
- ✅ Works with existing JWT auth
- ✅ Compatible with all browsers
- ⚠️ Token visible in URL (but only during active connection)
- ✅ Connection is HTTPS in production (secure)

## Security Note

While passing tokens in URLs is generally discouraged, for SSE connections it's an acceptable compromise because:
1. The connection is short-lived (only during candidate search)
2. The token is already temporary (24h expiry)
3. The connection is over HTTPS in production
4. Browser history won't capture SSE URLs
5. Server logs should sanitize query params containing 'token'

Consider adding query parameter sanitization to your logging middleware to avoid logging tokens.

