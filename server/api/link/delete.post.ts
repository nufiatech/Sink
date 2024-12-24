export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot delete links.',
    })
  }
  const { slug } = await readBody(event)
  if (slug) {
    await hubKV().del(`link:${slug}`)
  }
})
