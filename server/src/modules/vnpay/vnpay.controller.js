import * as vnpayService from "./vnpay.service.js";

export const createPayment = async (req, res, next) => {
  try {
    const checkoutUrl = await vnpayService.getVnpayCheckoutUrl(
      req.params.invoiceId,
      req.ip,
    );

    res.json({
      success: true,
      data: { url: checkoutUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const handleReturn = async (req, res, next) => {
  try {
    const result = await vnpayService.handleVnpayReturn(req.query);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const queryString = new URLSearchParams(req.query).toString();

    // Redirect to React status page
    return res.redirect(
      `${clientUrl}/vnpay-status?${queryString}`
    );
  } catch (error) {
    next(error);
  }
};