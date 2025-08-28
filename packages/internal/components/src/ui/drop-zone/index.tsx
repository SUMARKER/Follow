import { cn } from "@follow/utils/utils"
import type { DragEvent, ReactNode } from "react"
import { useCallback, useRef, useState } from "react"

// Ported from https://github.com/react-dropzone/react-dropzone/issues/753#issuecomment-774782919
const useDragAndDrop = ({ callback }: { callback: (file: FileList) => void | Promise<void> }) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const onDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        dragCounter.current = 0
        await callback(event.dataTransfer.files)
        event.dataTransfer.clearData()
      }
    },
    [callback],
  )

  const onDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  const onDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault()
    dragCounter.current--
    if (dragCounter.current > 0) return
    setIsDragging(false)
  }, [])

  return {
    isDragging,

    dragHandlers: {
      onDrop,
      onDragOver,
      onDragEnter,
      onDragLeave,
    },
  }
}

export interface DropZoneProps {
  id?: string
  accept?: string
  children?: ReactNode
  className?: string
  onDrop: (files: FileList) => void | Promise<void>
}

export const DropZone = ({ id, accept, children, className, onDrop }: DropZoneProps) => {
  const { isDragging, dragHandlers } = useDragAndDrop({ callback: onDrop })

  return (
    <label
      className={cn(
        "center flex h-[100px] w-full cursor-pointer rounded-md border border-dashed",
        isDragging ? "border-accent bg-accent/10" : "",
        "hover:border-accent/50 duration-200",
        className,
      )}
      htmlFor={id}
      {...dragHandlers}
    >
      {children}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onDrop(e.target.files)}
        className="hidden"
      />
    </label>
  )
}
