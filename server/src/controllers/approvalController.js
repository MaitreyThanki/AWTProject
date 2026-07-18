import { Approval, BorrowRequest } from "../models/index.js";

export async function decideRequest(req, res, next) {
  try {
    const { decision, remarks, expectedReturnDate } = req.body;
    const request = await BorrowRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ message: "Request not found" });

    await request.update({
      status: decision === "approved" ? "approved" : "rejected",
      facultyRemarks: remarks,
      expectedReturnDate: expectedReturnDate || request.expectedReturnDate
    });

    await Approval.create({
      BorrowRequestId: request.id,
      facultyId: req.user.id,
      decision,
      remarks,
      decisionDate: new Date()
    });

    return res.json(request);
  } catch (error) {
    return next(error);
  }
}

