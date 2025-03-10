import { env } from "@follow/shared/env"

export const IMAGE_PROXY_URL = "https://webp.follow.is"

export const selfRefererMatches = [env.VITE_OPENPANEL_API_URL, IMAGE_PROXY_URL].filter(
  Boolean,
) as string[]

export const imageRefererMatches = [
  {
    url: /^https:\/\/\w+\.sinaimg.cn/,
    referer: "https://weibo.com",
  },
  {
    url: /^https:\/\/i\.pximg\.net/,
    referer: "https://www.pixiv.net",
  },
  {
    url: /^https:\/\/cdnfile\.sspai\.com/,
    referer: "https://sspai.com",
  },
  {
    url: /^https:\/\/(?:\w|-)+\.cdninstagram\.com/,
    referer: "https://www.instagram.com",
  },
  {
    url: /^https:\/\/sp1\.piokok\.com/,
    referer: "https://www.piokok.com",
    force: true,
  },
]

export const webpCloudPublicServicesMatches = [
  // https://docs.webp.se/public-services/github-avatar/
  {
    url: /^https:\/\/avatars\.githubusercontent\.com\/u\//,
    target: "https://avatars-githubusercontent-webp.webp.se/u/",
  },
]
