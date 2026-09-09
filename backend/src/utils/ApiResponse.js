/**
 * Consistent success envelope for every endpoint:
 * { success: true, data: {...}, message: "..." }
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  send(res) {
    const { statusCode, ...body } = this;
    return res.status(statusCode).json(body);
  }
}
