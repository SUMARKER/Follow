import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@follow/components/ui/card/index.js"
import dayjs from "dayjs"

import { FeedIcon } from "~/modules/feed/feed-icon"

import type { AIDisplaySubscriptionsTool } from "../../store/types"
import { DisplayCardWrapper, withDisplayStateHandler } from "./share"
import { AnalyticsMetrics, CategoryTag, EmptyState, StatCard } from "./shared"

type SubscriptionData = AIDisplaySubscriptionsTool["output"]["subscriptions"]

const formatDisplayType = (displayType: string) => {
  const displayTypeMap = {
    list: "List View",
    grid: "Grid View",
    card: "Card View",
    compact: "Compact View",
  }
  return displayTypeMap[displayType as keyof typeof displayTypeMap] || displayType
}

const formatGroupBy = (groupBy: string) => {
  const groupByMap = {
    category: "By Category",
    status: "By Status",
    none: "No Grouping",
  }
  return groupByMap[groupBy as keyof typeof groupByMap] || groupBy
}

const formatFilterBy = (filterBy: string) => {
  const filterByMap = {
    all: "All Subscriptions",
    active: "Active Only",
    inactive: "Inactive Only",
    recent: "Recent (30 days)",
  }
  return filterByMap[filterBy as keyof typeof filterByMap] || filterBy
}

const SubscriptionsGrid = ({
  data,
  showAnalytics,
  showCategories,
}: {
  data: SubscriptionData
  showAnalytics: boolean
  showCategories: boolean
}) => {
  if (!data?.length) {
    return <EmptyState message="No subscriptions found" />
  }

  return (
    <div className="@[600px]:grid-cols-3 @[400px]:grid-cols-2 grid grid-cols-1 gap-4">
      {data.map((sub) => (
        <Card
          key={`${sub.subscription?.userId}-${sub.subscription?.feedId}`}
          className="hover:bg-fill-tertiary cursor-pointer p-4"
        >
          <CardHeader className="h-24 px-2 py-3">
            <div className="flex items-start gap-3">
              <FeedIcon
                feed={sub.feed ? { ...sub.feed, type: "feed" as const } : null}
                size={32}
                className="shrink-0"
                noMargin
              />
              <div className="-mt-1 min-w-0 flex-1">
                <CardTitle className="line-clamp-2 text-base">
                  {sub.feed?.title || sub.subscription?.title || "Unknown Feed"}
                </CardTitle>
                {sub.feed?.description && (
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {sub.feed.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-0 px-2 pb-3">
            {showCategories && sub.subscription?.category && (
              <div>
                <CategoryTag category={sub.subscription.category} />
              </div>
            )}
            <div className="text-text-secondary text-xs">
              <span>
                Subscribed:{" "}
                <span>
                  {sub.subscription?.createdAt
                    ? dayjs(sub.subscription.createdAt).format("MMM DD, YYYY")
                    : "Unknown"}
                </span>
              </span>
            </div>
            {showAnalytics && (
              <AnalyticsMetrics
                metrics={[
                  { label: "Updates/Week", value: sub.analytics?.updatesPerWeek || 0 },
                  { label: "Views", value: sub.analytics?.view || sub.subscription?.view || 0 },
                ]}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const GroupedSubscriptions = ({
  data,
  groupBy,
  showAnalytics,
  showCategories,
}: {
  data: SubscriptionData
  groupBy: string
  showAnalytics: boolean
  showCategories: boolean
}) => {
  if (!data?.length || groupBy === "none") {
    return null
  }

  const groups = data.reduce(
    (acc, sub) => {
      let key: string
      if (groupBy === "category") {
        key = sub.subscription?.category || "No Category"
      } else if (groupBy === "status") {
        // Simple status based on error state
        key = sub.feed?.errorMessage ? "Inactive" : "Active"
      } else {
        key = "All"
      }

      if (!acc[key]) acc[key] = []
      acc[key]?.push(sub)
      return acc
    },
    {} as Record<string, SubscriptionData>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, groupData]) => (
        <div key={groupName}>
          <h3 className="text-text mb-4 text-lg font-semibold">{groupName}</h3>
          <SubscriptionsGrid
            data={groupData}
            showAnalytics={showAnalytics}
            showCategories={showCategories}
          />
        </div>
      ))}
    </div>
  )
}

const AIDisplaySubscriptionsPartBase = ({
  output,
}: {
  output: NonNullable<AIDisplaySubscriptionsTool["output"]>
}) => {
  const {
    subscriptions,
    displayType = "list",
    showAnalytics = true,
    showCategories = true,
    title,
    groupBy = "none",
    filterBy = "all",
  } = output

  // Calculate statistics
  const totalSubscriptions = subscriptions.length
  const categoriesCount = new Set(
    subscriptions.map((s) => s.subscription?.category).filter(Boolean),
  ).size
  const activeSubscriptions = subscriptions.filter((s) => !s.feed?.errorMessage).length
  const totalViews = subscriptions.reduce((acc, s) => acc + (s.subscription?.view || 0), 0)

  const renderSubscriptions = () => {
    if (groupBy !== "none") {
      return (
        <GroupedSubscriptions
          data={subscriptions}
          groupBy={groupBy}
          showAnalytics={showAnalytics}
          showCategories={showCategories}
        />
      )
    }

    return (
      <SubscriptionsGrid
        data={subscriptions}
        showAnalytics={showAnalytics}
        showCategories={showCategories}
      />
    )
  }

  return (
    <DisplayCardWrapper
      title={title || "My Subscriptions"}
      emoji="📋"
      description={`${formatDisplayType(displayType)} • ${formatFilterBy(filterBy)} • ${formatGroupBy(groupBy)}`}
    >
      {/* Statistics Overview */}
      <div className="@[700px]:grid-cols-4 grid grid-cols-2 gap-4">
        <StatCard title="Total Subscriptions" value={totalSubscriptions} emoji="📊" />
        <StatCard
          title="Active Feeds"
          value={activeSubscriptions}
          description={`${totalSubscriptions - activeSubscriptions} inactive`}
          emoji="🟢"
        />
        {showCategories && <StatCard title="Categories" value={categoriesCount} emoji="🏷️" />}
        <StatCard title="Total Views" value={totalViews.toLocaleString()} emoji="👀" />
      </div>

      {/* Subscriptions Display */}
      {renderSubscriptions()}
    </DisplayCardWrapper>
  )
}

export const AIDisplaySubscriptionsPart = withDisplayStateHandler<
  AIDisplaySubscriptionsTool["output"]
>({
  title: "Subscriptions",
  loadingDescription: "Fetching subscription data...",
  errorTitle: "Subscriptions Error",
})(AIDisplaySubscriptionsPartBase)
