// server/src/modules/yeucaudichvu/yeucaudichvu.controller.js
import * as service from "./yeucaudichvu.service.js";

export const getYeuCauDichVu = async (req, res, next) => {
  try {
    const result = await service.getYeuCauDichVu(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
