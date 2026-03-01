"use client"

import { useState, useCallback, useRef } from "react"
import { Search, X, MapPin, Loader2 } from "lucide-react"
import { CITY_BOUNDS } from "@/utils/constants"

interface SearchResult {
  id: string
  place_name: string
  center: [number, number]
}

interface SearchBarProps {
  onSelect: (lng: number, lat: number) => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(async (text: string) => {
    if (text.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const bbox = `${CITY_BOUNDS[0][0]},${CITY_BOUNDS[0][1]},${CITY_BOUNDS[1][0]},${CITY_BOUNDS[1][1]}`
      const proximity = `${(CITY_BOUNDS[0][0] + CITY_BOUNDS[1][0]) / 2},${(CITY_BOUNDS[0][1] + CITY_BOUNDS[1][1]) / 2}`
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${token}&bbox=${bbox}&proximity=${proximity}&limit=5&language=pt`

      const res = await fetch(url)
      const data = await res.json()

      if (data.features) {
        setResults(
          data.features.map((f: { id: string; place_name: string; center: [number, number] }) => ({
            id: f.id,
            place_name: f.place_name,
            center: f.center,
          }))
        )
        setIsOpen(true)
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => search(value), 350)
  }

  const handleSelect = (result: SearchResult) => {
    setQuery(result.place_name)
    setIsOpen(false)
    setIsFocused(false)
    inputRef.current?.blur()
    onSelect(result.center[0], result.center[1])
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-10 mx-auto max-w-lg">
      <div
        className={`relative flex items-center rounded-2xl transition-all duration-300 ${
          isFocused
            ? "bg-background shadow-[0_8px_40px_rgba(0,0,0,0.5)] ring-2 ring-primary/40"
            : "bg-background/90 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
        }`}
      >
        <div className="flex items-center justify-center pl-4">
          <Search className="size-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Pesquisar endereco ou local..."
          className="flex-1 bg-transparent px-3 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {isLoading && (
          <div className="pr-2">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar pesquisa"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="mt-2 bg-background border border-border/60 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors text-foreground ${
                i !== results.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div className="flex items-center justify-center size-8 shrink-0 rounded-lg bg-accent/80 mt-0.5">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <span className="text-sm leading-relaxed">{r.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 3 && !isLoading && (
        <div className="mt-2 bg-background border border-border/60 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] p-4">
          <p className="text-sm text-muted-foreground text-center">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  )
}
