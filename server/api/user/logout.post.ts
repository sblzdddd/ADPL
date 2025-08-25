export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  return { success: true };
});

defineRouteMeta({
  
  openAPI: {
    tags: ["User"],
    description: "Logout from the browser",
    parameters: [],
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '401': {
        description: 'Not authenticated',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '500': {
        description: 'Internal server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
})
