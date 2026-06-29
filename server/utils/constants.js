const ROLES = {
    RESIDENT: 'resident',
    WORKER: 'worker',
    ADMIN: 'admin'
};

const STATUS = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    REOPENED: 'reopened'
};

const CATEGORIES = {
    ELECTRICITY: 'electricity',
    WATER: 'water',
    PLUMBING: 'plumbing',
    MAINTENANCE: 'maintenance',
    SECURITY: 'security',
    OTHER: 'other'
};

module.exports = {
    ROLES,
    STATUS,
    CATEGORIES
};
