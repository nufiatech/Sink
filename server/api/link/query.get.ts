import type { LinkSchema } from '@/schemas/link'
import type { z } from 'zod'

type Link = z.infer<typeof LinkSchema>

export default eventHandler(async (event) => {
  const slug = getQuery(event).slug
  if (slug) {
    const metadata = (await hubKV().getMeta(`link:${slug}`)) || {}
    const link = (await hubKV().get(`link:${slug}`)) as Link || {}
    if (link) {
      return {
        ...metadata,
        ...link,
      }
    }
  }
  throw createError({
    status: 404,
    statusText: 'Not Found',
  })
})
