import * as service from "./taisan.service.js";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const getAll = async (req, res) => {
  try {
    const data = await service.getAllTaiSan(req.query);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const getPublicAssetsByCanHoId = async (req, res) => {
  try {
    const data = await service.getAllTaiSan({ CanHoID: req.params.CanHoID });
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getTaiSanById(req.params.id);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const create = async (req, res) => {
  try {
    const data = await service.createTaiSan(req.body);
    res.status(201).json({ success: true, data, message: "Thêm tài sản thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateTaiSan(req.params.id, req.body);
    res.json({ success: true, data, message: "Cập nhật thành công" });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteTaiSan(req.params.id);
    res.json({ success: true, ...data });
  } catch (e) { res.status(e.statusCode || 400).json({ success: false, message: e.message }); }
};

export const thongKe = async (req, res) => {
  try {
    const data = await service.getThongKeTaiSan();
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const getMyApartmentAssets = async (req, res) => {
  try {
    const data = await service.getTaiSanByNguoiThue(req.user.ID || req.user.id);
    res.json({ success: true, data });
  } catch (e) { res.status(e.statusCode || 500).json({ success: false, message: e.message }); }
};

export const importExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Chưa chọn file Excel" });

      const workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) return res.status(400).json({ success: false, message: "File Excel không có dữ liệu" });

      const results = { success: 0, errors: [] };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // +2 vì dòng 1 là header
        try {
          await service.createTaiSan({
            MaTaiSan:    String(row["Mã tài sản"] || row["MaTaiSan"] || "").trim(),
            TenTaiSan:   String(row["Tên tài sản"] || row["TenTaiSan"] || "").trim(),
            CanHoID:     row["Mã căn hộ"] || row["CanHoID"],
            LoaiTaiSan:  row["Loại tài sản"] || row["LoaiTaiSan"] || "ThietBiCanHo",
            ViTri:       row["Vị trí"] || row["ViTri"] || "",
            SoLuong:     row["Số lượng"] || row["SoLuong"] || 1,
            TinhTrang:   row["Tình trạng"] || row["TinhTrang"] || "Tot",
            GiaTri:      row["Giá trị"] || row["GiaTri"] || 0,
            NgayMua:     row["Ngày mua"] || row["NgayMua"] || null,
            NhaCungCap:  row["Nhà cung cấp"] || row["NhaCungCap"] || "",
            GhiChu:      row["Ghi chú"] || row["GhiChu"] || "",
          });
          results.success++;
        } catch (err) {
          results.errors.push({ row: rowNum, message: err.message });
        }
      }

      res.json({
        success: true,
        message: `Import thành công ${results.success}/${rows.length} tài sản`,
        data: results,
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },
];
