import type { FeedViewType } from "@follow/constants"
import { PortalProvider } from "@gorhom/portal"
import type { PropsWithChildren } from "react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Share, Text, View } from "react-native"

import {
  EntryContentWebView,
  preloadWebViewEntry,
} from "@/src/components/native/webview/EntryContentWebView"
import { ContextMenu } from "@/src/components/ui/context-menu"
import { useNavigation } from "@/src/lib/navigation/hooks"
import { toast } from "@/src/lib/toast"
import { EntryDetailScreen } from "@/src/screens/(stack)/entries/[entryId]/EntryDetailScreen"
import { useIsEntryStarred } from "@/src/store/collection/hooks"
import { collectionSyncService } from "@/src/store/collection/store"
import { getFetchEntryPayload } from "@/src/store/entry/getter"
import { useEntry } from "@/src/store/entry/hooks"
import { unreadSyncService } from "@/src/store/unread/store"

import { useSelectedFeed, useSelectedView } from "../screen/atoms"

export const EntryItemContextMenu = ({
  id,
  children,
  view,
}: PropsWithChildren<{ id: string; view: FeedViewType }>) => {
  const { t } = useTranslation()
  const selectedView = useSelectedView()
  const selectedFeed = useSelectedFeed()
  const entry = useEntry(id)
  const feedId = entry?.feedId
  const isEntryStarred = useIsEntryStarred(id)

  const navigation = useNavigation()
  const handlePressPreview = useCallback(() => {
    if (entry) {
      preloadWebViewEntry(entry)
      navigation.pushControllerView(EntryDetailScreen, {
        entryId: id,
        view: view!,
      })
    }
  }, [entry, id, navigation, view])

  if (!entry) return null

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Preview size="STRETCH" onPress={handlePressPreview}>
          {() => (
            <PortalProvider>
              <View className="bg-system-background flex-1">
                <Text className="text-label mt-5 p-4 text-2xl font-semibold" numberOfLines={2}>
                  {entry.title?.trim()}
                </Text>
                <EntryContentWebView entry={entry} />
              </View>
            </PortalProvider>
          )}
        </ContextMenu.Preview>

        <ContextMenu.Item
          key="MarkAsReadAbove"
          onSelect={() => {
            const payload = getFetchEntryPayload(selectedFeed, selectedView)
            const { publishedAt } = entry
            unreadSyncService.markViewAsRead({
              view: selectedView,
              filter: payload,
              time: {
                startTime: new Date(publishedAt).getTime() + 1,
                endTime: Date.now(),
              },
            })
          }}
        >
          <ContextMenu.ItemIcon
            ios={{
              name: "arrow.up",
            }}
          />
          <ContextMenu.ItemTitle>
            {t("operation.mark_all_as_read_which", {
              which: t("operation.mark_all_as_read_which_above"),
            })}
          </ContextMenu.ItemTitle>
        </ContextMenu.Item>

        <ContextMenu.Item
          key="MarkAsRead"
          onSelect={() => {
            entry.read
              ? unreadSyncService.markEntryAsUnread(id)
              : unreadSyncService.markEntryAsRead(id)
          }}
        >
          <ContextMenu.ItemTitle>
            {entry.read ? t("operation.mark_as_unread") : t("operation.mark_as_read")}
          </ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: entry.read ? "circle.fill" : "checkmark.circle",
            }}
          />
        </ContextMenu.Item>

        <ContextMenu.Item
          key="MarkAsReadBelow"
          onSelect={() => {
            const payload = getFetchEntryPayload(selectedFeed, selectedView)
            const { publishedAt } = entry
            unreadSyncService.markViewAsRead({
              view: selectedView,
              filter: payload,
              time: {
                startTime: 1,
                endTime: new Date(publishedAt).getTime() - 1,
              },
            })
          }}
        >
          <ContextMenu.ItemIcon
            ios={{
              name: "arrow.down",
            }}
          />
          <ContextMenu.ItemTitle>
            {t("operation.mark_all_as_read_which", {
              which: t("operation.mark_all_as_read_which_below"),
            })}
          </ContextMenu.ItemTitle>
        </ContextMenu.Item>

        {feedId && view !== undefined && (
          <ContextMenu.Item
            key="Star"
            onSelect={() => {
              if (isEntryStarred) {
                collectionSyncService.unstarEntry(id)
                toast.success("Unstarred")
              } else {
                collectionSyncService.starEntry({
                  feedId,
                  entryId: id,
                  view,
                })
                toast.success("Starred")
              }
            }}
          >
            <ContextMenu.ItemIcon
              ios={{
                name: isEntryStarred ? "star.slash" : "star",
              }}
            />
            <ContextMenu.ItemTitle>
              {isEntryStarred ? t("operation.unstar") : t("operation.star")}
            </ContextMenu.ItemTitle>
          </ContextMenu.Item>
        )}

        {entry.url && (
          <ContextMenu.Item
            key="Share"
            onSelect={async () => {
              if (!entry.url) return
              await Share.share({
                message: entry.url,
                url: entry.url,
                title: entry.title || "Shared Link",
              })
            }}
          >
            <ContextMenu.ItemIcon
              ios={{
                name: "square.and.arrow.up",
              }}
            />
            <ContextMenu.ItemTitle>{t("operation.share")}</ContextMenu.ItemTitle>
          </ContextMenu.Item>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
