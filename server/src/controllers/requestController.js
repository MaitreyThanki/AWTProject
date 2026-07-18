import { BorrowRequest, BorrowRequestItem, sequelize } from "../models/index.js";

export async function createBorrowRequest(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { items = [], ...requestData } = req.body;
    const request = await BorrowRequest.create(
      { ...requestData, studentId: req.user.id },
      { transaction }
    );

    const requestItems = items.map((item) => ({
      BorrowRequestId: request.id,
      InventoryItemId: item.itemId,
      quantityRequested: item.quantityRequested
    }));

    await BorrowRequestItem.bulkCreate(requestItems, { transaction });
    await transaction.commit();

    res.status(201).json(request);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function listRequests(req, res, next) {
  try {
    const where = req.user.role === "student" ? { studentId: req.user.id } : {};
    const requests = await BorrowRequest.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

