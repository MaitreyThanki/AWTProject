import { Penalty } from "../models/index.js";

export async function listPenalties(req, res, next) {
  try {
    const where = req.user.role === "student" ? { studentId: req.user.id } : {};
    const penalties = await Penalty.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(penalties);
  } catch (error) {
    next(error);
  }
}

export async function createPenalty(req, res, next) {
  try {
    const penalty = await Penalty.create(req.body);
    res.status(201).json(penalty);
  } catch (error) {
    next(error);
  }
}

