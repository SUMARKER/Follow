import { openInFollowApp } from "@client/lib/helper"
import { RootProviders } from "@client/providers/root-providers"
import { MemoedDangerousHTMLStyle } from "@follow/components/common/MemoedDangerousHTMLStyle.jsx"
import { Button } from "@follow/components/ui/button/index.jsx"
import { useSyncThemeWebApp, useTitle } from "@follow/hooks"
import { m, useAnimationControls } from "motion/react"
import { Fragment, useEffect, useState } from "react"

const NotFoundContent = () => {
  const [glitchText, setGlitchText] = useState("404")
  const [isGlitching, setIsGlitching] = useState(false)

  // Animation controls
  const iconControls = useAnimationControls()
  const messageControls = useAnimationControls()
  const titleControls = useAnimationControls()
  const descriptionControls = useAnimationControls()
  const buttonsControls = useAnimationControls()
  const helpControls = useAnimationControls()

  useTitle("404 - Page Not Found")
  useSyncThemeWebApp()

  useEffect(() => {
    // Start all animations in parallel with their respective delays
    iconControls.start({
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    })

    messageControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.4 },
    })

    titleControls.start({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.6 },
    })

    descriptionControls.start({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.8 },
    })

    buttonsControls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 1 },
    })

    helpControls.start({
      opacity: 1,
      transition: { duration: 0.5, delay: 1.2 },
    })
  }, [
    iconControls,
    messageControls,
    titleControls,
    descriptionControls,
    buttonsControls,
    helpControls,
  ])

  useEffect(() => {
    if (!isGlitching) return

    const glitchTexts = ["404", "40₄", "4Ø4", "404", "4◯4", "4○4", "4𝟘4"]

    const glitchInterval = setInterval(() => {
      const randomText = glitchTexts[Math.floor(Math.random() * glitchTexts.length)]
      setGlitchText(randomText || "404")
    }, 200)
    return () => {
      setGlitchText("404")
      clearInterval(glitchInterval)
    }
  }, [isGlitching])
  const handleGoHome = () => {
    window.location.href = "/"
  }

  const handleOpenInApp = () => {
    openInFollowApp({
      deeplink: "",
      fallbackUrl: "/",
    })
  }

  return (
    <div className="flex h-full flex-col">
      <MemoedDangerousHTMLStyle>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(168, 162, 158, 0.3); }
            50% { box-shadow: 0 0 40px rgba(168, 162, 158, 0.6); }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }

          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }

          .float-animation {
            animation: float 3s ease-in-out infinite;
          }

          .pulse-glow-animation {
            animation: pulse-glow 2s ease-in-out infinite;
          }

          .shake-animation {
            animation: shake 0.5s ease-in-out;
          }

          .glitch-animation {
            animation: glitch 0.1s linear infinite;
          }`}
      </MemoedDangerousHTMLStyle>
      <div className="my-8 flex flex-col items-center justify-center pt-20">
        <Fragment>
          {/* 404 Icon with animations */}
          <m.div
            className="mb-8 flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={iconControls}
          >
            <m.div
              className="float-animation pulse-glow-animation flex size-32 cursor-pointer items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.querySelector(".shake-animation")
                if (element) {
                  element.classList.remove("shake-animation")
                  setTimeout(() => element.classList.add("shake-animation"), 10)
                }
              }}
              onMouseEnter={() => {
                setIsGlitching(true)
              }}
              onMouseLeave={() => {
                setIsGlitching(false)
              }}
            >
              <m.span
                className={`select-none text-4xl font-bold text-zinc-400 dark:text-zinc-600 ${isGlitching ? "glitch-animation" : ""}`}
                key={glitchText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {glitchText}
              </m.span>
            </m.div>
          </m.div>
          {/* Error Message with stagger animation */}
          <m.div
            className="mb-8 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={messageControls}
          >
            <m.h1
              className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100"
              initial={{ opacity: 0, x: -30 }}
              animate={titleControls}
            >
              Page Not Found
            </m.h1>
            <m.p
              className="max-w-md text-base text-zinc-500 dark:text-zinc-400"
              initial={{ opacity: 0, x: 30 }}
              animate={descriptionControls}
            >
              Sorry, the page you are looking for doesn't exist or has been moved. Please check the
              URL or return to the homepage to continue browsing.
            </m.p>
          </m.div>
          {/* Action Buttons with hover effects */}
          <m.div
            className="flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={buttonsControls}
          >
            <m.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleGoHome}
                buttonClassName="px-6 py-2 transition-all duration-200"
              >
                Go Home
              </Button>
            </m.div>

            <m.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleOpenInApp}
                buttonClassName="px-6 py-2 transition-all duration-200"
              >
                Open {APP_NAME}
              </Button>
            </m.div>
          </m.div>
          {/* Additional Help with fade in */}
          <m.div className="mt-12 text-center" initial={{ opacity: 0 }} animate={helpControls}>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              If you believe this is an error, please submit a issue on{" "}
              <m.a
                className="text-accent transition-colors duration-200"
                href="https://github.com/rssnext/folo/issues"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                style={{ display: "inline-block" }}
              >
                GitHub
              </m.a>
            </p>
          </m.div>
          {/* Floating particles effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <m.div
                key={i}
                className="absolute size-1 rounded-full bg-zinc-300 opacity-30 dark:bg-zinc-600"
                initial={{
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>{" "}
        </Fragment>
      </div>
    </div>
  )
}

export const NotFound = () => {
  return (
    <RootProviders>
      <NotFoundContent />
    </RootProviders>
  )
}
