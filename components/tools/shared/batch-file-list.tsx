import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <div className="flex max-h-72 flex-col gap-2 overflow-auto pr-1">
      {items.map((item) => (
        <Card key={getKey(item)} size="sm">
          <CardHeader>
            <CardTitle className="truncate text-base">
              {getTitle(item)}
            </CardTitle>
            <CardDescription>{getDescription(item)}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
