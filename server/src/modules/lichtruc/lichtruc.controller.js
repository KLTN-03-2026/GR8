// server/src/modules/lichtruc/lichtruc.controller.js
import lichtrucService from './lichtruc.service.js';

class LichTrucController {
  // GET /api/lichtruc - Lấy danh sách lịch trực
  async getAll(req, res) {
    try {
      const schedules = await lichtrucService.getAll(req.query);
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error getting schedules:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/lichtruc/month/:year/:month - Lấy lịch theo tháng
  async getByMonth(req, res) {
    try {
      const { year, month } = req.params;
      const schedules = await lichtrucService.getByMonth(
        parseInt(year),
        parseInt(month)
      );
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error getting monthly schedules:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/lichtruc/today - Lấy người trực hôm nay
  async getTodayDuty(req, res) {
    try {
      const schedules = await lichtrucService.getTodayDuty();
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error getting today duty:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/lichtruc/date/:date - Lấy người trực theo ngày
  async getDutyByDate(req, res) {
    try {
      const { date } = req.params;
      const schedules = await lichtrucService.getDutyByDate(date);
      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error getting duty by date:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/lichtruc - Tạo lịch trực mới
  async create(req, res) {
    try {
      const creatorId = req.user.ID;
      const schedule = await lichtrucService.create(req.body, creatorId);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/lichtruc/bulk - Tạo nhiều lịch trực
  async createBulk(req, res) {
    try {
      const creatorId = req.user.ID;
      const { schedules } = req.body;
      
      if (!Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Danh sách lịch trực không hợp lệ' 
        });
      }

      const result = await lichtrucService.createBulk(schedules, creatorId);
      res.status(201).json({ 
        success: true, 
        data: result,
        message: `Đã tạo ${result.count} lịch trực` 
      });
    } catch (error) {
      console.error('Error creating bulk schedules:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/lichtruc/:id - Cập nhật lịch trực
  async update(req, res) {
    try {
      const { id } = req.params;
      const schedule = await lichtrucService.update(id, req.body);
      res.json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/lichtruc/:id/cancel - Hủy lịch trực
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const schedule = await lichtrucService.cancel(id);
      res.json({ 
        success: true, 
        data: schedule,
        message: 'Đã hủy lịch trực' 
      });
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/lichtruc/:id - Xóa lịch trực
  async delete(req, res) {
    try {
      const { id } = req.params;
      await lichtrucService.delete(id);
      res.json({ success: true, message: 'Đã xóa lịch trực' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/lichtruc/stats - Thống kê lịch trực
  async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await lichtrucService.getStats(startDate, endDate);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new LichTrucController();
