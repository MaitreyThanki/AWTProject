export async function getDashboard(req, res) {
  res.json({
    role: req.user.role,
    metrics: {
      pendingRequests: 0,
      approvedRequests: 0,
      borrowedItems: 0,
      overdueItems: 0,
      activePenalties: 0
    }
  });
}

