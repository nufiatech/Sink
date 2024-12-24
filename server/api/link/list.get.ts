import type { LinkSchema } from '@/schemas/link'
import { z } from 'zod'

type Link = z.infer<typeof LinkSchema>

export default eventHandler(async (event) => {
  const { limit, cursor } = await getValidatedQuery(event, z.object({
    limit: z.coerce.number().max(1024).default(20),
    cursor: z.string().trim().max(1024).optional(),
  }).parse)
  const list = await hubKV().keys('link:', {
    limit,
    cursor: cursor || undefined,
  })
  console.log(list)
  if (Array.isArray(list.keys)) {
    list.links = await Promise.all(list.keys.map(async (key: { name: string }) => {
      const metadata = (await hubKV().getMeta(key.name)) || {}
      const link = (await hubKV().get(key.name)) as Link || {}
      if (link) {
        return {
          ...metadata,
          ...link,
        }
      }
      return link
    }))
  }
  delete list.keys
  return list
})
