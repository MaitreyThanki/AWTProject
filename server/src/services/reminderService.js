import cron from "node-cron";
import { BorrowRequest, Penalty } from "../models/index.js";
import { sendEmail } from "./emailService.js";

export function initializeReminderScheduler() {
  console.log("Initializing Automated Return Reminder & Overdue Monitor Job...");

  // Runs every day at 08:00 AM (or can be triggered programmatically)
  cron.schedule("0 8 * * *", async () => {
    try {
      await runReminderCheck();
    } catch (err) {
      console.error("Scheduled reminder check failed:", err.message);
    }
  });

  // Also run an immediate check on startup (deferred by 5 seconds to let DB connect)
  setTimeout(() => {
    runReminderCheck().catch((err) => {
      console.warn("Initial reminder check deferred:", err.message);
    });
  }, 5000);
}

export async function runReminderCheck() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twoDaysAhead = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000);
  const twoDaysAheadEnd = new Date(twoDaysAhead.getTime() + 24 * 60 * 60 * 1000);

  // 1. Check for items due in 2 days
  const dueInTwoDays = await BorrowRequest.find({
    status: "issued",
    expectedReturnDate: { $gte: twoDaysAhead, $lt: twoDaysAheadEnd }
  }).populate("studentId", "name email");

  for (const req of dueInTwoDays) {
    if (req.studentId?.email) {
      await sendEmail({
        to: req.studentId.email,
        subject: "Reminder: Lab Equipment Return Due in 2 Days",
        text: `Dear ${req.studentId.name},\n\nThis is a friendly reminder that equipment borrowed under Request #${req._id} is due for return on ${new Date(req.expectedReturnDate).toLocaleDateString()}.\n\nPlease ensure you return the items on time to avoid penalties.\n\nRegards,\nLab Administration`
      }).catch((e) => console.warn(`Reminder email error for request ${req._id}:`, e.message));
    }
  }

  // 2. Check for items due today
  const dueTodayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const dueToday = await BorrowRequest.find({
    status: "issued",
    expectedReturnDate: { $gte: todayStart, $lt: dueTodayEnd }
  }).populate("studentId", "name email");

  for (const req of dueToday) {
    if (req.studentId?.email) {
      await sendEmail({
        to: req.studentId.email,
        subject: "Important: Lab Equipment Return Due TODAY",
        text: `Dear ${req.studentId.name},\n\nYour borrowed lab items for Request #${req._id} are due for return TODAY (${new Date(req.expectedReturnDate).toLocaleDateString()}).\n\nPlease submit the items to the lab in-charge.\n\nRegards,\nLab Administration`
      }).catch((e) => console.warn(`Due date email error for request ${req._id}:`, e.message));
    }
  }

  // 3. Mark items as Overdue if expectedReturnDate < todayStart and status is issued
  const overdueRequests = await BorrowRequest.find({
    status: "issued",
    expectedReturnDate: { $lt: todayStart }
  }).populate("studentId", "name email");

  for (const req of overdueRequests) {
    req.status = "overdue";
    await req.save();

    if (req.studentId?.email) {
      await sendEmail({
        to: req.studentId.email,
        subject: "OVERDUE Notice: Lab Equipment Return Required",
        text: `Dear ${req.studentId.name},\n\nYour borrowed lab items for Request #${req._id} were due on ${new Date(req.expectedReturnDate).toLocaleDateString()} and are now OVERDUE.\n\nDaily late penalties apply until items are returned. Please return them immediately.\n\nRegards,\nLab Administration`
      }).catch((e) => console.warn(`Overdue email error for request ${req._id}:`, e.message));
    }
  }

  console.log(`[Reminders] Checked: ${dueInTwoDays.length} due in 2 days, ${dueToday.length} due today, ${overdueRequests.length} marked overdue.`);
  return {
    dueInTwoDays: dueInTwoDays.length,
    dueToday: dueToday.length,
    markedOverdue: overdueRequests.length
  };
}
