# Chat Feature - Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Run `backend/sql/chat_tables.sql` in Supabase SQL editor
- [ ] Verify tables created: connection_requests, conversations, conversation_participants, messages
- [ ] Verify indexes created for performance
- [ ] Verify RLS policies enabled
- [ ] Test RLS by querying non-owned data (should return nothing)

### Backend Configuration
- [ ] Verify Socket.IO server in `backend/server.js`
- [ ] Check CORS configuration includes frontend domain
- [ ] Verify auth middleware in `backend/authMiddleware.js`
- [ ] Test API endpoints with Postman or curl
- [ ] Verify environment variables configured

### Frontend Configuration
- [ ] Verify Chat component imports correctly
- [ ] Check MainDashboard.tsx integration
- [ ] Verify socket URL in Chat.tsx points to correct backend
- [ ] Test theme prop passing
- [ ] Check all icons imported from lucide-react

### Testing
- [ ] [ ] Test locally with two user accounts
- [ ] [ ] Verify real-time messaging works
- [ ] [ ] Test connection requests
- [ ] [ ] Verify read receipts
- [ ] [ ] Check error handling
- [ ] [ ] Test on mobile devices
- [ ] [ ] Test theme switching
- [ ] [ ] Verify search functionality

## Staging Deployment

### Database
- [ ] Create staging database backup
- [ ] Run chat_tables.sql on staging database
- [ ] Verify tables and policies created
- [ ] Seed test data (2-3 test users)

### Backend
- [ ] Deploy backend to staging server
- [ ] Verify environment variables set correctly
- [ ] Test Socket.IO connection from staging frontend
- [ ] Monitor for errors in logs
- [ ] Verify API endpoints respond correctly

### Frontend
- [ ] Build: `npm run build`
- [ ] Deploy dist folder to staging CDN
- [ ] Verify environment variables in build
- [ ] Test Chat component loads
- [ ] Verify Socket.IO connects
- [ ] Test all features work on staging

### Staging Testing (48 hours)
- [ ] Internal team tests messaging
- [ ] Test on multiple browsers/devices
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify database integrity
- [ ] Test under load (if possible)

## Production Deployment

### Pre-Production Verification
- [ ] Backup production database
- [ ] Review all code changes
- [ ] Verify no console errors
- [ ] Check build size is reasonable
- [ ] Verify performance on staging meets targets

### Database Migration
- [ ] Schedule maintenance window
- [ ] Backup production database (CRITICAL!)
- [ ] Run chat_tables.sql on production
- [ ] Verify tables created
- [ ] Verify indexes created
- [ ] Verify RLS policies active
- [ ] Test read/write operations

### Backend Deployment
- [ ] Deploy updated backend code
- [ ] Verify environment variables
- [ ] Restart backend service
- [ ] Monitor logs for errors
- [ ] Verify Socket.IO server running
- [ ] Test API connectivity

### Frontend Deployment
- [ ] Build production bundle: `npm run build`
- [ ] Verify build size acceptable
- [ ] Deploy to CDN/hosting
- [ ] Verify DNS/URL working
- [ ] Clear browser cache if needed
- [ ] Test Chat component loads

### Production Verification (First 24 hours)
- [ ] Monitor error logs closely
- [ ] Watch Socket.IO connection logs
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Verify no user reports of issues
- [ ] Test with real users
- [ ] Monitor system resources

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up performance monitoring
- [ ] Set up database monitoring
- [ ] Set up Socket.IO monitoring
- [ ] Configure alerts for critical errors

### Analytics
- [ ] Track chat usage metrics
- [ ] Monitor message send/receive rates
- [ ] Track connection request volumes
- [ ] Monitor user engagement

### Documentation
- [ ] Update user documentation
- [ ] Create support FAQ
- [ ] Document known issues
- [ ] Create troubleshooting guide

### Maintenance
- [ ] Set up database backups (daily)
- [ ] Monitor database size growth
- [ ] Review and optimize slow queries
- [ ] Update dependencies monthly
- [ ] Monitor Socket.IO version for updates

## Rollback Plan

If critical issues arise:

### Immediate Rollback (< 1 hour)
1. Restore previous backend version
2. Restore previous frontend version
3. Verify service restored
4. Notify users

### Database Rollback
1. Stop all application servers
2. Restore database from backup
3. Verify data integrity
4. Restart application

### Root Cause Analysis
1. Review error logs
2. Identify specific issue
3. Create fix
4. Test thoroughly on staging
5. Re-deploy with fix

## Monitoring Dashboard

Create monitoring dashboard with:
- [ ] Active user count
- [ ] Messages per minute
- [ ] Connection requests per hour
- [ ] Socket.IO connection rate
- [ ] API response times (p50, p95, p99)
- [ ] Error rate
- [ ] Database connection pool usage
- [ ] Memory usage
- [ ] CPU usage
- [ ] Network bandwidth

## Critical Metrics to Watch

### Performance
- API response time: Target < 200ms (p95)
- Socket.IO message delivery: Target < 100ms
- Page load time: Target < 2s
- Search response: Target < 300ms

### Reliability
- Uptime: Target 99.9%
- Error rate: Target < 0.1%
- Database connection failures: Target 0
- Socket.IO reconnection failures: Target < 0.05%

### Usage
- Daily active users
- Message volume per day
- Peak concurrent connections
- Connection request volume

## Support & SOS

### If Chat Goes Down
1. Check backend service status
2. Check Socket.IO connection logs
3. Check database connectivity
4. Check error tracking service
5. Notify team immediately

### Common Production Issues

**Messages not sending:**
- Check backend service status
- Check database connectivity
- Verify RLS policies
- Review error logs

**Socket.IO not connecting:**
- Check CORS configuration
- Verify backend running
- Check firewall rules
- Review network logs

**Database performance issues:**
- Check query performance
- Verify indexes exist
- Check connection pool
- Consider query optimization

### Contact Information
- Engineering lead: [Contact]
- Database admin: [Contact]
- DevOps: [Contact]
- On-call: [Contact]

## Sign-Off

- [ ] Database Admin approved
- [ ] Backend Engineer approved
- [ ] Frontend Engineer approved
- [ ] QA Lead approved
- [ ] Product Manager approved
- [ ] Security review completed

Approved by: _________________ Date: _______

---

## Notes

Use this checklist for every deployment. Copy and date each section completed.

Keep backup of this checklist after each deployment for audit purposes.

Update this checklist based on lessons learned.
