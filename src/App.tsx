import { useState } from "react"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import Loading from "@/components/loader"
import * as XLSX from "xlsx"

// Utility: Sort rows by column index
const sortByColumn = (data: string[][], index: number, asc = true) => {
  const header = data[0]
  const rows = data.slice(1)
  rows.sort((a, b) => {
    const valA = a[index]?.toLowerCase() ?? ""
    const valB = b[index]?.toLowerCase() ?? ""
    return asc ? valA.localeCompare(valB) : valB.localeCompare(valA)
  })
  return [header, ...rows]
}

function App() {
  const [artistUrl, setArtistUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [artistName, setArtistName] = useState("")
  const [filename, setFilename] = useState("")
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  // Pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil((csvData.length - 1) / itemsPerPage)

  const handleFetch = async () => {
    try {
      setLoading(true)
      const response = await axios.post("https://atolentinocv.site/spotify/fetch.php", {
        artistUrl,
      })

      const { artist, content } = response.data
      const rows = content.trim().split("\n").map((row: string) => row.split(","))

      setArtistName(artist)
      setFilename(artist)
      setCsvData(rows)
      setCurrentPage(1)
    } catch (err) {
      alert("Error fetching artist data")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (type: "txt" | "csv" | "xlsx") => {
    const name = filename.trim() || "spotify_tracks"

    if (type === "txt" || type === "csv") {
      const mime = type === "csv" ? "text/csv" : "text/plain"
      const blob = new Blob([csvData.map(row => row.join(",")).join("\n")], { type: mime })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${name}.${type}`
      link.click()
    }

    if (type === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet(csvData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tracks")
      XLSX.writeFile(workbook, `${name}.xlsx`)
    }
  }

  const handleSort = (colIndex: number) => {
    const asc = sortColumn === colIndex ? !sortAsc : true
    setSortColumn(colIndex)
    setSortAsc(asc)
    const sorted = sortByColumn(csvData, colIndex, asc)
    setCsvData(sorted)
  }

  if (loading) return <Loading />

  const visibleRows = csvData.slice(1).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
console.log(artistName)
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold">Spotify Artist Track Exporter</h2>

      <Input
        type="text"
        placeholder="Paste Spotify artist URL"
        value={artistUrl}
        onChange={(e) => setArtistUrl(e.target.value)}
      />

      <Button onClick={handleFetch} disabled={loading}>
        Fetch Tracks
      </Button>

      {csvData.length > 1 && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Input
              placeholder="Filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full md:w-auto"
            />
            <div className="flex gap-2">
              <Button onClick={() => handleExport("txt")}>.txt</Button>
              <Button onClick={() => handleExport("csv")} variant="secondary">
                .csv
              </Button>
              <Button onClick={() => handleExport("xlsx")} variant="outline">
                .xlsx
              </Button>
            </div>
          </div>

          <div className="overflow-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvData[0].map((header, i) => (
                    <TableHead
                      key={i}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleSort(i)}
                    >
                      {header} {sortColumn === i ? (sortAsc ? "▲" : "▼") : ""}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default App
