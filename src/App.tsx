import { useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

function App() {
  const [artistUrl, setArtistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [artistName, setArtistName] = useState("");

  const handleFetch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://atolentinocv.site/spotify/fetch.php",
        {
          artistUrl,
        }
      );

      const { artist, content } = response.data;
      const rows = content
        .trim()
        .split("\n")
        .map((row: string) => row.split(","));

      setArtistName(artist);
      setCsvData(rows);
    } catch (err) {
      alert("Error fetching artist data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTxt = () => {
    const blob = new Blob([csvData.map((row) => row.join(",")).join("\n")], {
      type: "text/plain",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${artistName}.txt`;
    link.click();
  };

  const handleExportCSV = () => {
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${artistName}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracks");
    XLSX.writeFile(workbook, `${artistName}.xlsx`);
  };

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold">Spotify Artist Track Exporter</h2>

      <Input
        type="text"
        placeholder="Paste Spotify artist URL"
        value={artistUrl}
        onChange={(e) => setArtistUrl(e.target.value)}
      />

      <div className="flex gap-2">
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching...
            </>
          ) : (
            "Fetch Tracks"
          )}
        </Button>
        <Button onClick={handleExportTxt}>Export to .txt</Button>
        <Button onClick={handleExportCSV} variant="secondary">
          Export to .csv
        </Button>
        <Button onClick={handleExportExcel} variant="outline">
          Export to .xlsx
        </Button>
      </div>

      {csvData.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tracks by {artistName}</h3>
          <div className="overflow-auto rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvData[0].map((header, i) => (
                    <TableHead key={i}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
