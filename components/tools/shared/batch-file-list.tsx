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
}

export function BatchFileList<T>({
  items,
  getKey,
  getTitle,
  getDescription,
}: BatchFileListProps<T>) {
  return (
    <ScrollArea className="max-h-72 rounded-xl border border-border/60 bg-background/35">
      <div className="flex flex-col gap-2 p-2">
        {items.map((item) => {
          const title = getTitle(item)

          return (
            <Card key={getKey(item)} size="sm">
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
