import { useState } from "react";

export default function LocalBgRemoval() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });

      const data = await res.json(); // ✅ this will now be JSON, not HTML
      setResult(data.processedImage);
    } catch (err) {
      console.error("Error removing background:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {image && <img src={image} alt="Original" width={300} />}
      <button onClick={removeBackground} disabled={loading}>
        {loading ? "Processing..." : "Remove Background"}
      </button>
      {result && (
        <div>
          <h3>Result:</h3>
          <img src={result} alt="Result" width={300} />
        </div>
      )}
    </div>
  );
}
