import * as baocaoService from "./baocao.service.js";

export const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await baocaoService.getOverviewStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const data = await baocaoService.getRevenueChart(year);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyRate = async (req, res, next) => {
  try {
    const data = await baocaoService.getOccupancyRate();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
