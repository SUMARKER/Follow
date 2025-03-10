import { useTypeScriptHappyCallback } from "@follow/hooks"
import type { MasonryFlashListProps } from "@shopify/flash-list"
import type { ElementRef } from "react"
import { forwardRef } from "react"
import { ActivityIndicator, View } from "react-native"

import { useFetchEntriesControls } from "@/src/modules/screen/atoms"

import { TimelineSelectorMasonryList } from "../screen/TimelineSelectorList"
import { useOnViewableItemsChanged } from "./hooks"
// import type { MasonryItem } from "./templates/EntryGridItem"
import { EntryPictureItem } from "./templates/EntryPictureItem"

export const EntryListContentPicture = forwardRef<
  ElementRef<typeof TimelineSelectorMasonryList>,
  {
    entryIds: string[]
  } & Omit<MasonryFlashListProps<string>, "data" | "renderItem">
>(({ entryIds, ...rest }, ref) => {
  const { fetchNextPage, refetch, isRefetching, hasNextPage } = useFetchEntriesControls()
  const { onViewableItemsChanged, onScroll } = useOnViewableItemsChanged()

  return (
    <TimelineSelectorMasonryList
      ref={ref}
      isRefetching={isRefetching}
      data={entryIds}
      renderItem={useTypeScriptHappyCallback(({ item }: { item: string }) => {
        return <EntryPictureItem id={item} />
      }, [])}
      keyExtractor={defaultKeyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
      onScroll={onScroll}
      onEndReached={fetchNextPage}
      numColumns={2}
      estimatedItemSize={100}
      ListFooterComponent={
        hasNextPage ? (
          <View className="h-20 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : null
      }
      {...rest}
      onRefresh={refetch}
    />
  )
})

const defaultKeyExtractor = (item: string) => {
  return item
}
