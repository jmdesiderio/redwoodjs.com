import { db } from 'src/lib/db'

import type {
  MutationSyncAuthorSocialLinksArgs,
  MutationSyncShowcaseSocialLinksArgs,
  SyncSocialLinkInput,
} from 'types/graphql'

// --

type SortSocialLinksType = 'author' | 'showcase'

const syncLinks = async (
  id: number,
  links: SyncSocialLinkInput[],
  type: SortSocialLinksType
) => {
  // find id's existing social links
  const dbLinks = await db.socialLink.findMany({
    select: { id: true },
    where: { [type]: { id } },
  })

  // delete all links which are stored in the database, but were provided in the request
  const deleteMany = dbLinks.filter((d) => !links.some((r) => d.id === r.id))

  const createMany = { data: [] }
  const updateMany = []

  // upsert the links (upsertMany?)
  links.forEach(({ id, ...data }) =>
    !id ? createMany.data.push(data) : updateMany.push({ data, where: { id } })
  )

  return { createMany, deleteMany, updateMany }
}

// --

export const SyncAuthorSocialLinks = async ({
  id,
  input,
}: MutationSyncAuthorSocialLinksArgs) => {
  return db.author.update({
    data: { socialLinks: await syncLinks(id, input, 'author') },
    where: { id },
  })
}

// --

export const SyncShowcaseSocialLinks = async ({
  id,
  input,
}: MutationSyncShowcaseSocialLinksArgs) => {
  return db.showcase.update({
    data: { socialLinks: await syncLinks(id, input, 'showcase') },
    where: { id },
  })
}
