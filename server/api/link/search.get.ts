import type { LinkSchema } from '@/schemas/link'
import type { z } from 'zod'

type Link = z.infer<typeof LinkSchema>
type SimpleLink = Pick<Link, 'slug' | 'url' | 'comment'>

export default eventHandler(async () => {
  const list: SimpleLink[] = []
  let finalCursor: string | undefined

  try {
    while (true) {
      const res = await hubKV().keys('link:')
      console.log(res)

      finalCursor = cursor

      if (Array.isArray(keys)) {
        for (const key of keys) {
          try {
            if (key.metadata?.url) {
              list.push({
                slug: key.name.replace('link:', ''),
                url: key.metadata.url,
                comment: key.metadata.comment,
              })
            }
            else {
              // Forward compatible with links without metadata
              const metadata = (await hubKV().getMeta(key.name)) || {}
              const link = (await hubKV().get(key.name)) as Link || {}
              if (link) {
                list.push({
                  slug: key.name.replace('link:', ''),
                  url: link.url,
                  comment: link.comment,
                })
                await hubKV().set(`link:${link.slug}`, link, {
                  ttl: metadata?.ttl,
                  metadata: {
                    ...metadata,
                    url: link.url,
                    comment: link.comment,
                  },
                })
              }
            }
          }
          catch (err) {
            console.error(`Error processing key ${key.name}:`, err)
            continue // Skip this key and continue with the next one
          }
        }
      }

      if (!keys || list_complete) {
        break
      }
    }
    return list
  }
  catch (err) {
    console.error('Error fetching link list:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch link list',
    })
  }
})
