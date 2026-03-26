// Re-exports analytics — kept separate so we can add admin-only
// mutations (bulk updates, exports) here without touching analytics.js
const router = require('./analytics');
module.exports = router;
