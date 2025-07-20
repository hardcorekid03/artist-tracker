import { useState } from "react";
import axios from "axios";

function App() {
  const [artistUrl, setArtistUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://atolentinocv.site/spotify/fetch.php",
        { artistUrl }
      );
      const blob = new Blob([response.data.content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${response.data.artist}.txt`;
      link.click();
    } catch (err) {
      alert("Error fetching artist data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Spotify Artist Track Exporter (.txt)</h2>
      <input
        type="text"
        placeholder="Paste Spotify artist URL"
        value={artistUrl}
        onChange={(e) => setArtistUrl(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
      />
      <button onClick={handleFetch} disabled={loading}>
        {loading ? "Fetching..." : "Export to .txt"}
      </button>
    </div>
  );
}

export default App;
