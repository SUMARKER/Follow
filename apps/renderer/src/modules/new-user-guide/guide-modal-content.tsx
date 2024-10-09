import { AnimatePresence, m } from "framer-motion"
import type { ComponentProps } from "react"
import { createElement, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/button"

import { DiscoverImport } from "../discover/import"
import { setIsNewUserGuideFinished } from "./hooks"
import { AppearanceGuide } from "./steps/appearance"
import { BehaviorGuide } from "./steps/behavior"

const variants = {
  enter: {
    x: 1000,
    opacity: 0,
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: {
    zIndex: 0,
    x: -1000,
    opacity: 0,
  },
}

export function GuideModalContent() {
  const { t } = useTranslation("settings")
  const [step, setStep] = useState(0)

  const guideSteps = useMemo(
    () => [
      {
        title: t("appearance.sidebar_title"),
        content: createElement(AppearanceGuide),
      },
      {
        title: "Behavior",
        content: createElement(BehaviorGuide),
      },
      {
        title: "Import Feeds from OPML file",
        content: createElement(DiscoverImport),
      },
    ],
    [t],
  )

  const totalSteps = useMemo(() => guideSteps.length, [guideSteps])

  const status = useMemo(
    () => (step === 0 ? "initial" : step > 0 && step <= totalSteps ? "active" : "complete"),
    [step, totalSteps],
  )

  const title = useMemo(
    () =>
      status === "initial"
        ? "New User Guide"
        : status === "active"
          ? guideSteps[step - 1].title
          : "You're all set!",
    [status, guideSteps, step],
  )

  return (
    <div className="relative flex h-screen w-screen flex-1 flex-col justify-center overflow-hidden bg-background">
      <h1 className="absolute left-10 top-10 text-3xl font-bold">{title}</h1>
      <div className="relative mx-10 flex h-96 w-full max-w-xl items-center">
        <AnimatePresence initial={false}>
          <m.div
            key={step - 1}
            className="absolute inset-x-0"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {status === "initial" ? (
              <div className="text-lg">
                <p>Welcome to Follow! This guide will help you get started with the app.</p>
                <p>Click "Next" to continue.</p>
              </div>
            ) : status === "active" ? (
              guideSteps[step - 1].content
            ) : status === "complete" ? (
              <div className="text-lg">
                <p>That's it! You're all set.</p>
                <p>Click "Finish" to close this guide.</p>
              </div>
            ) : null}
          </m.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 left-10 flex gap-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <Step key={i} step={i} currentStep={step} onClick={() => setStep(i)} />
        ))}
      </div>

      <div className="absolute bottom-10 right-10">
        <Button
          onClick={() => {
            if (step <= totalSteps) {
              setStep((prev) => prev + 1)
            } else {
              setIsNewUserGuideFinished(true)
            }
          }}
        >
          {step <= totalSteps ? "Next" : "Finish"}
        </Button>
      </div>
    </div>
  )
}

function Step({
  step,
  currentStep,
  onClick,
}: { step: number; currentStep: number } & ComponentProps<"button">) {
  const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete"

  return (
    <m.button onClick={onClick} animate={status} className="relative">
      <m.div
        variants={{
          active: {
            scale: 1,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          },
          complete: {
            scale: 1.25,
          },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full bg-theme-accent-200"
      />

      <m.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "var(--fo-background)",
            borderColor: "hsl(var(--border) / 0.5)",
            color: "#a3a3a3",
          },
          active: {
            backgroundColor: "var(--fo-background)",
            borderColor: "#ff760a", // theme-accent-500
            color: "#ff760a",
          },
          complete: {
            backgroundColor: "#ff760a",
            borderColor: "#ff760a",
            color: "#ff760a",
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex size-10 items-center justify-center rounded-full border-2 font-semibold"
      >
        <div className="flex items-center justify-center">
          {status === "complete" ? (
            <AnimatedCheckIcon className="size-6 text-white" />
          ) : (
            <span>{step}</span>
          )}
        </div>
      </m.div>
    </m.button>
  )
}

function AnimatedCheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <m.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeWidth={2}
        d="M3.514 11.83a22.927 22.927 0 0 1 5.657 5.656c2.75-5.025 6.289-8.563 11.314-11.314"
      />
    </svg>
  )
}