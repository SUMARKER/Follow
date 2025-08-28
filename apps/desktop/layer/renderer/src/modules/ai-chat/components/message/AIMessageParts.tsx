import "@xyflow/react/dist/style.css"

import type { ToolUIPart } from "ai"
import * as React from "react"

import type {
  AIChatContextBlock,
  AIDisplayAnalyticsTool,
  AIDisplayEntriesTool,
  AIDisplayFeedsTool,
  AIDisplayFlowTool,
  AIDisplaySubscriptionsTool,
  BizUIMessage,
} from "~/modules/ai-chat/store/types"

import {
  AIDisplayAnalyticsPart,
  AIDisplayEntriesPart,
  AIDisplayFeedsPart,
  AIDisplaySubscriptionsPart,
} from "../displays"
import { AIDataBlockPart } from "./AIDataBlockPart"
import { AIMarkdownMessage, AIMarkdownStreamingMessage } from "./AIMarkdownMessage"
import { AIRichTextMessage } from "./AIRichTextMessage"
import { ToolInvocationComponent } from "./ToolInvocationComponent"

const LazyAIDisplayFlowPart = React.lazy(() =>
  import("../displays/AIDisplayFlowPart").then((mod) => ({ default: mod.AIDisplayFlowPart })),
)

interface MessagePartsProps {
  message: BizUIMessage
}

export const AIMessageParts: React.FC<MessagePartsProps> = React.memo(({ message }) => {
  return message.parts.map((part, index) => {
    const partKey = `${message.id}-${index}`

    switch (part.type) {
      case "text": {
        if (message.role === "assistant")
          return (
            <AIMarkdownStreamingMessage
              isProcessing={message.metadata?.totalTokens === undefined}
              key={partKey}
              text={part.text}
              className={"text-text"}
            />
          )
        return <AIMarkdownMessage key={partKey} text={part.text} />
      }

      case "data-block": {
        return <AIDataBlockPart key={partKey} blocks={part.data as AIChatContextBlock[]} />
      }

      case "data-rich-text": {
        return (
          <AIRichTextMessage
            key={partKey}
            data={part.data as { state: string; text: string }}
            className="text-text"
          />
        )
      }

      case "tool-displayAnalytics": {
        return <AIDisplayAnalyticsPart key={partKey} part={part as AIDisplayAnalyticsTool} />
      }
      case "tool-displayEntries": {
        return <AIDisplayEntriesPart key={partKey} part={part as AIDisplayEntriesTool} />
      }
      case "tool-displaySubscriptions": {
        return (
          <AIDisplaySubscriptionsPart key={partKey} part={part as AIDisplaySubscriptionsTool} />
        )
      }
      case "tool-displayFeeds": {
        return <AIDisplayFeedsPart key={partKey} part={part as AIDisplayFeedsTool} />
      }

      case "tool-displayFlowChart": {
        const loadingElement = (
          <div className="my-2 flex aspect-[4/3] w-[calc(var(--ai-chat-layout-width,65ch)-120px)] max-w-prose items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <i className="i-mgc-loading-3-cute-re text-text-secondary size-4 animate-spin" />
                <span className="text-text-secondary text-sm font-medium">
                  Generating Flow Chart...
                </span>
              </div>
            </div>
          </div>
        )
        return (
          <React.Suspense fallback={loadingElement} key={partKey}>
            <LazyAIDisplayFlowPart
              part={part as AIDisplayFlowTool}
              loadingElement={loadingElement}
            />
          </React.Suspense>
        )
      }

      default: {
        if (part.type.startsWith("tool-")) {
          if (part.type.startsWith("tool-chunkBreak")) {
            return null
          }
          return <ToolInvocationComponent key={partKey} part={part as ToolUIPart} />
        }
        return null
      }
    }
  })
})

AIMessageParts.displayName = "AIMessageParts"
