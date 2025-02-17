class successResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: any;
    metadata?: any;
  
    constructor(
      data: any,
      message = 'Your function was performed successfully',
      success = true,
      statusCode = 200,
      metadata?: any,
    ) {
      this.statusCode = statusCode;
      this.success = success;
      this.data = data;
      this.message = message;
      this.metadata = metadata;
    }
  }

export default successResponse;