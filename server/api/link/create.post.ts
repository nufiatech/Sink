import { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)
  const existingLink = await hubKV().get(`link:${link.slug}`)

  if (existingLink) {
    throw createError({
      status: 409, // Conflict
      statusText: 'Link already exists',
    })
  }

  else {
    const expiration = getExpiration(event, link.expiration)

    await hubKV().set(`link:${link.slug}`, link, {
      ttl: expiration ? Math.floor(expiration - (Date.now() / 1000)) : undefined,
      metadata: {
        expiration,
        url: link.url,
        comment: link.comment,
      },
    })
    setResponseStatus(event, 201)
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
    return { link, shortLink }
  }
})
