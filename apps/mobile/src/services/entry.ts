import { eq, inArray, or } from "drizzle-orm"

import { db } from "../database"
import { entriesTable } from "../database/schemas"
import type { EntrySchema } from "../database/schemas/types"
import { dbStoreMorph } from "../morph/db-store"
import { entryActions } from "../store/entry/store"
import type { Hydratable, Resetable } from "./internal/base"
import { conflictUpdateAllExcept } from "./internal/utils"

class EntryServiceStatic implements Hydratable, Resetable {
  async reset() {
    await db.delete(entriesTable).execute()
  }

  async upsertMany(entries: EntrySchema[]) {
    if (entries.length === 0) return
    await db
      .insert(entriesTable)
      .values(entries)
      .onConflictDoUpdate({
        target: [entriesTable.id],
        set: conflictUpdateAllExcept(entriesTable, ["id"]),
      })
  }

  async patch(entry: Partial<EntrySchema> & { id: string }) {
    await db.update(entriesTable).set(entry).where(eq(entriesTable.id, entry.id))
  }

  async patchMany({
    entry,
    entryIds,
    feedIds,
  }: {
    entry: Partial<EntrySchema>
    entryIds?: string[]
    feedIds?: string[]
  }) {
    if (!entryIds && !feedIds) return
    await db
      .update(entriesTable)
      .set(entry)
      .where(
        or(inArray(entriesTable.id, entryIds ?? []), inArray(entriesTable.feedId, feedIds ?? [])),
      )
  }

  getEntryMany(entryId: string[]) {
    return db.query.entriesTable.findMany({ where: inArray(entriesTable.id, entryId) })
  }

  async hydrate() {
    const entries = await db.query.entriesTable.findMany()
    // TODO: Find a way to determine whether entry is archived, and then only hydrate unarchived entries
    entryActions.upsertManyInSession(
      entries.map((e) => dbStoreMorph.toEntryModel(e)),
      "view",
    )
  }
}

export const EntryService = new EntryServiceStatic()
