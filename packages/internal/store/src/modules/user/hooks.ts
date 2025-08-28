import { tracker } from "@follow/tracker"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { apiClient, queryClient } from "../../context"
import type { GeneralQueryOptions } from "../../types"
import { isNewUserQueryKey } from "./constants"
import { userSyncService, useUserStore } from "./store"

export const whoamiQueryKey = ["user", "whoami"]

export const invalidateUserSession = () => {
  queryClient().invalidateQueries({
    queryKey: whoamiQueryKey,
  })
}

export const usePrefetchSessionUser = () => {
  const query = useQuery({
    queryKey: whoamiQueryKey,
    queryFn: () => userSyncService.whoami(),
  })

  useEffect(() => {
    if (query.data) {
      const { user } = query.data
      tracker.identify(user)
    }
  }, [query.data])
  return query
}

export const usePrefetchUser = (userId: string | undefined) => {
  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userSyncService.fetchUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
  return query
}

export const useWhoami = () => {
  return useUserStore((state) => state.whoami)
}

export const useUserRole = () => {
  return useUserStore((state) => state.role)
}

export const useRoleEndAt = () => {
  return useUserStore((state) => state.roleEndAt)
}

export const useUserById = (userId: string | undefined) => {
  return useUserStore((state) => (userId ? state.users[userId] : undefined))
}

export const useUserList = (userIds: string[]) => {
  return useUserStore((state) => {
    return userIds.map((id) => state.users[id]).filter((i) => !!i)
  })
}

export function useIsNewUser(options?: GeneralQueryOptions) {
  const { data } = useQuery({
    enabled: options?.enabled,
    queryKey: isNewUserQueryKey,
    queryFn: async () => {
      const subscriptions = await apiClient().subscriptions.$get({ query: {} })
      return subscriptions.data.length < 5
    },
  })
  return !!data
}
