import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type BatchFileListProps<T> = {
  items: T[]
  getKey: (item: T) => string
  getTitle: (item: T) => string
  getDescription: (item: T) => string
  selectedKey?: string
  onItemSelect?: (item: T) => void
}

export function BatchFileList<T>({
  items,
  getKey,
  getTitle,
  getDescription,
  selectedKey,
  onItemSelect,
}: BatchFileListProps<T>) {
  return (
    <ScrollArea className="max-h-72 rounded-xl border border-border/60 bg-background/35">
      <div className="flex flex-col gap-2 p-2">
        {items.map((item) => {
          const title = getTitle(item)
          const key = getKey(item)
          const isSelected = selectedKey === key

          return (
            <Card
              key={key}
              size="sm"
              role={onItemSelect ? "button" : undefined}
              tabIndex={onItemSelect ? 0 : undefined}
              className={
                onItemSelect
                  ? `cursor-pointer transition-colors hover:bg-muted/60 ${
                      isSelected ? "bg-muted ring-2 ring-primary/25" : ""
                    }`
                  : undefined
              }
              onClick={onItemSelect ? () => onItemSelect(item) : undefined}
              onKeyDown={
                onItemSelect
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onItemSelect(item)
                      }
                    }
                  : undefined
              }
            >
              <CardHeader>
                <CardTitle className="truncate text-base" title={title}>
                  {title}
                </CardTitle>
                <CardDescription>{getDescription(item)}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
