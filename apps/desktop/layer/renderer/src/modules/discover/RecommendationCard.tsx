import { Card, CardContent, CardHeader, CardTitle } from "@follow/components/ui/card/index.jsx"
import { SiteIcon } from "@follow/components/ui/icon/SiteIcon.js"
import { RSSHubCategories } from "@follow/constants"
import { getHighestWeightColor } from "@follow/utils/color"
import { clsx, cn, getUrlIcon } from "@follow/utils/utils"
import { upperFirst } from "es-toolkit/compat"
import type { FC } from "react"
import { memo, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useModalStack } from "~/components/ui/modal/stacked/hooks"
import { FeedIcon } from "~/modules/feed/feed-icon"

import { RecommendationContent } from "./RecommendationContent"
import type { RSSHubRouteDeclaration } from "./types"

interface RecommendationCardProps {
  data: RSSHubRouteDeclaration
  routePrefix: string
  setCategory: (category: string) => void
}
export const RecommendationCard: FC<RecommendationCardProps> = memo(
  ({ data, routePrefix, setCategory }) => {
    const { t } = useTranslation()
    const { present } = useModalStack()

    const { maintainers, categories } = useMemo(() => {
      const maintainers = new Set<string>()
      const categories = new Set<string>()
      for (const route in data.routes) {
        const routeData = data.routes[route]!
        if (routeData.maintainers) {
          routeData.maintainers.forEach((m) => maintainers.add(m))
        }
        if (routeData.categories) {
          routeData.categories.forEach((c) => categories.add(c))
        }
      }
      categories.delete("popular")
      return {
        maintainers: Array.from(maintainers),
        categories: Array.from(categories) as unknown as typeof RSSHubCategories,
      }
    }, [data])

    return (
      <Card className="shadow-background border-border flex flex-col overflow-hidden rounded-lg border">
        <CardHeader className="@container relative p-5 pb-3">
          <div className="@[280px]:h-[80px] absolute left-0 top-0 h-[50px] w-full overflow-hidden dark:brightness-75">
            <span className="pointer-events-none opacity-50">
              <BackgroundGradient className="size-full" url={data.url} />
            </span>
          </div>

          <CardTitle className="@[280px]:pt-10 relative z-[1] flex items-center pt-[10px] text-base">
            <span className="center bg-background box-content flex aspect-square rounded-full p-1.5">
              <span className="overflow-hidden rounded-full">
                <SiteIcon size={28} siteUrl={`https://${data.url}`} />
              </span>
            </span>
            <a
              href={`https://${data.url}`}
              target="_blank"
              rel="noreferrer"
              className="text-title2 ml-2 line-clamp-1 translate-y-1.5"
            >
              {data.name}
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex grow flex-col p-5 pt-0">
          <ul className="text-text grow gap-2 space-y-1 text-sm">
            {Object.keys(data.routes).map((route) => {
              const routeData = data.routes[route]!
              // some routes have multiple paths, like `huxiu`
              if (Array.isArray(routeData.path)) {
                routeData.path = routeData.path.find((p) => p === route) ?? routeData.path[0]
              }
              return (
                <li
                  key={route}
                  className="hover:text-accent group ml-1"
                  onClick={(e) => {
                    ;(e.target as HTMLElement).querySelector("button")?.click()
                  }}
                  tabIndex={-1}
                >
                  <button
                    type="button"
                    className="before:bg-accent text-headline group-hover:bg-material-medium relative ml-3 rounded p-0.5 px-1 text-left duration-200 before:absolute before:inset-y-0 before:-left-3 before:mb-auto before:mt-2 before:size-1.5 before:rounded-full before:content-['']"
                    onClick={() => {
                      present({
                        id: `recommendation-content-${route}`,
                        content: () => (
                          <RecommendationContent
                            routePrefix={routePrefix}
                            route={data.routes[route]!}
                          />
                        ),
                        icon: (
                          <FeedIcon className="size-4" size={16} siteUrl={`https://${data.url}`} />
                        ),
                        title: `${data.name} - ${data.routes[route]!.name}`,
                      })
                    }}
                  >
                    {data.routes[route]!.name}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="text-text-secondary mt-4 flex flex-col gap-2">
            <div className="flex flex-1 items-center text-sm">
              <i className="i-mingcute-hammer-line mr-1 shrink-0 translate-y-0.5 self-start" />

              <span className="text-body flex flex-wrap gap-1">
                {maintainers.map((m) => (
                  <a
                    key={m}
                    href={`https://github.com/${m}`}
                    className="follow-link--underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{m}
                  </a>
                ))}
              </span>
            </div>
            <div className="flex flex-1 items-center text-sm">
              <i className="i-mingcute-tag-2-line mr-1 shrink-0 translate-y-0.5 self-start" />
              <span className="text-body flex flex-wrap gap-1">
                {categories.map((c) => (
                  <button
                    onClick={() => {
                      if (!RSSHubCategories.includes(c)) return
                      setCategory(c)
                    }}
                    key={c}
                    type="button"
                    className={clsx(
                      "bg-material-medium hover:bg-material-medium cursor-pointer rounded px-1.5 duration-200",
                      !RSSHubCategories.includes(c) && "pointer-events-none opacity-50",
                    )}
                  >
                    {RSSHubCategories.includes(c)
                      ? t(`discover.category.${c}`, { ns: "common" })
                      : upperFirst(c)}
                  </button>
                ))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

const BackgroundGradient = memo(({ url, className }: { url: string; className?: string }) => {
  const [color, setColor] = useState<string>()

  useEffect(() => {
    const { src } = getUrlIcon(`https://${url}`)
    const image = new Image()
    image.src = src
    image.crossOrigin = "anonymous"
    image.onload = () => {
      try {
        const color = getHighestWeightColor(image)
        setColor(color)
      } catch {
        setColor("#333")
      }
    }
  }, [url])
  return (
    <div
      className={cn("pointer-events-none size-[500px]", className)}
      style={{ backgroundColor: color }}
    />
  )
})
