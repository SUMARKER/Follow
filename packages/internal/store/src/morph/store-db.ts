import type { EntrySchema, ListSchema, SubscriptionSchema } from "@follow/database/schemas/types"

import type { EntryModel } from "../modules/entry/types"
import type { ListModel } from "../modules/list/types"
import type { SubscriptionModel } from "../modules/subscription/types"

class StoreDbMorph {
  toListSchema(list: ListModel): ListSchema {
    return {
      ...list,
      feedIds: JSON.stringify(list.feedIds),
    }
  }
  toSubscriptionSchema(subscription: SubscriptionModel): SubscriptionSchema {
    return {
      ...subscription,
      id: buildSubscriptionDbId(subscription),
    }
  }
  toEntrySchema(entry: EntryModel): EntrySchema {
    return entry
  }
}

export const storeDbMorph = new StoreDbMorph()

export const buildSubscriptionDbId = (subscription: SubscriptionModel) => {
  if (subscription.feedId) return `${subscription.type}/${subscription.feedId}`
  if (subscription.listId) return `${subscription.type}/${subscription.listId}`
  if (subscription.inboxId) return `${subscription.type}/${subscription.inboxId}`
  throw new Error("Invalid subscription")
}
