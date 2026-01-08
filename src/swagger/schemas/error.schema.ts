export const ErrorSchema = {
  type: 'object',
  properties: {
    statusCode: {
      type: 'number',
      description: 'HTTP status code',
    },
    message: {
      type: 'string',
      description: 'Error message',
    },
    error: {
      type: 'string',
      description: 'Error type',
    },
  },
  required: ['statusCode', 'message'],
};
