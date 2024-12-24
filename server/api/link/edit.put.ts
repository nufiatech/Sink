import type { z } from 'zod'
import { LinkSchema } from '@/schemas/link'

type Link = z.infer<typeof LinkSchema>

export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot edit links.',
    })
  }
  const link = await readValidatedBody(event, LinkSchema.parse)
  const existingLink = (await hubKV().get(`link:${link.slug}`)) as Link | null

  if (existingLink) {
    const newLink = {
      ...existingLink,
      ...link,
      id: existingLink.id, // don't update id
      createdAt: existingLink.createdAt, // don't update createdAt
      updatedAt: Math.floor(Date.now() / 1000),
    }
    const expiration = getExpiration(event, newLink.expiration)
    await hubKV().set(`link:${link.slug}`, link, {
      ttl: expiration ? Math.floor(expiration - (Date.now() / 1000)) : undefined,
      metadata: {
        expiration,
        url: link.url,
        comment: link.comment,
      },
    })
    setResponseStatus(event, 201)
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${newLink.slug}`
    return { link: newLink, shortLink }
  }
})
