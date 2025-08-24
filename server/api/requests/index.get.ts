// get all public paint requests

export default defineEventHandler(async (event) => {
  console.log(event)
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
  })
})
