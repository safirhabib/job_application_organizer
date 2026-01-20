const DAYS_LOOKAHEAD = 7;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isWithinDays(value, days) {
  const date = parseDate(value);
  if (!date) return false;
  const today = startOfDay(new Date());
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return date >= today && date <= limit;
}

export default function StatsOverview({ apps }) {
  const statusCounts = apps.reduce((acc, app) => {
    const key = app.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const total = apps.length;
  const applied = statusCounts.Applied || 0;
  const interviews = statusCounts.Interview || 0;
  const offers = statusCounts.Offer || 0;
  const rejections = statusCounts.Rejection || 0;
  const followUps = apps.filter((app) =>
    isWithinDays(app.followUpDate, DAYS_LOOKAHEAD)
  ).length;

  return (
    <div className="statsGrid">
      <div className="statCard">
        <span className="statLabel">Total applications</span>
        <span className="statValue">{total}</span>
        <span className="statSub">All statuses</span>
      </div>
      <div className="statCard">
        <span className="statLabel">Applied</span>
        <span className="statValue">{applied}</span>
        <span className="statSub">Waiting to hear back</span>
      </div>
      <div className="statCard">
        <span className="statLabel">Interview</span>
        <span className="statValue">{interviews}</span>
        <span className="statSub">In progress</span>
      </div>
      <div className="statCard">
        <span className="statLabel">Offers</span>
        <span className="statValue">{offers}</span>
        <span className="statSub">Ready to decide</span>
      </div>
      <div className="statCard">
        <span className="statLabel">Rejections</span>
        <span className="statValue">{rejections}</span>
        <span className="statSub">Closed out</span>
      </div>
      <div className="statCard">
        <span className="statLabel">Follow-ups</span>
        <span className="statValue">{followUps}</span>
        <span className="statSub">Next {DAYS_LOOKAHEAD} days</span>
      </div>
    </div>
  );
}

