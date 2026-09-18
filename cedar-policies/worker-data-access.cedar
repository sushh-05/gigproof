// A worker can only view their own eligibility records.
// This is GigProof's core privacy boundary: financial/work history
// is sensitive, so access is scoped to the record's owner by default.
permit(
    principal,
    action == Action::"ViewEligibilityResult",
    resource
)
when {
    principal.id == resource.owner_id
};

// A compliance reviewer (e.g. an aggregator's internal compliance team)
// may view AGGREGATE statistics only — total qualifying-day counts
// across workers — never an individual worker's raw records.
permit(
    principal in Role::"ComplianceReviewer",
    action == Action::"ViewAggregateStats",
    resource
);

// Explicitly forbid even a compliance reviewer from viewing raw
// uploaded documents or a specific worker's line-item data.
// Forbid always wins over permit in Cedar, so this is a hard boundary.
forbid(
    principal in Role::"ComplianceReviewer",
    action == Action::"ViewRawDocuments",
    resource
);