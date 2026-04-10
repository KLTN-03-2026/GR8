import * as service from "./user.service.js";

export const getUsers = async (req, res) => {
  try {
    const data = await service.getAllUsers();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getUsers error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const data = await service.createUser(req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};