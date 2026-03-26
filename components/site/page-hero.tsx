import { Badge } from "@/components/ui/badge"

type PageHeroProps = {
  badge?: string
  title: string
  description: string
}

export function PageHero({
  badge = "imagetools",
  title,
  description,
}: PageHeroProps) {
  return (
    <header className="space-y-3 px-2">
      <Badge variant="outline">{badge}</Badge>
      <div className="space-y-2">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </header>
  )
}
