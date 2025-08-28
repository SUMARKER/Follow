import { persistQueryClient } from "@tanstack/react-query-persist-client"

import { initializeDefaultDataSettings } from "../atoms/settings/data"
import { initializeDefaultGeneralSettings } from "../atoms/settings/general"
import { initializeDefaultUISettings } from "../atoms/settings/ui"
import { kvStoragePersister, queryClient } from "../lib/query-client"

declare module "@tanstack/react-query" {
  interface Meta {
    queryMeta: { persist?: boolean }
  }

  interface Register extends Meta {}
}

export const hydrateSettings = () => {
  initializeDefaultUISettings()
  initializeDefaultGeneralSettings()
  initializeDefaultDataSettings()
}
export const hydrateQueryClient = () => {
  persistQueryClient({
    queryClient,
    persister: kvStoragePersister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        if (!query.meta?.persist) return false
        const queryIsReadyForPersistence = query.state.status === "success"
        if (queryIsReadyForPersistence) {
          return (
            !((query.state?.data as any)?.pages?.length > 1) &&
            query.queryKey?.[0] !== "check-eagle"
          )
        } else {
          return false
        }
      },
      shouldDehydrateMutation() {
        return false
      },
    },
    maxAge: 1000 * 60 * 60 * 24 * 1,
  })
}
