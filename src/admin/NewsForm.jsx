export default function NewsForm({ form, setForm, onSubmit, isLoading, isEditing, existingImage }) {
  const MAX_CHARS = 100;

  const handleDescriptionChange = (e) => {
    let raw = e.target.value || "";
    if (raw.length > MAX_CHARS) raw = raw.slice(0, MAX_CHARS);
    setForm((p) => ({ ...p, description: raw }));
  };

  const charCount = (form.description || "").length;

  return (
    <form className="news-form" onSubmit={onSubmit}>
      <h3>{isEditing ? "Update News Item" : "Create News Item"}</h3>
      <input type="text" placeholder="News title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
      
      <div className="news-form-img-row">
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] || null }))} />
        {isEditing && existingImage && !form.image && (
          <div className="news-form-preview">
            <span>Current:</span>
            <a href={existingImage} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
              {existingImage.toLowerCase().endsWith(".pdf") ? (
                <div style={{ height: '40px', width: '40px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '10px', color: '#6b7280' }}>PDF</div>
              ) : (
                <img src={existingImage} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
              )}
            </a>
          </div>
        )}
      </div>

      <textarea rows={4} placeholder="Description (optional)" value={form.description} onChange={handleDescriptionChange} />
      <div className={`news-desc-counter ${charCount >= MAX_CHARS ? 'full' : charCount >= Math.floor(MAX_CHARS * 0.9) ? 'warn' : ''}`}>
        {charCount} / {MAX_CHARS} chars
      </div>

      <button type="submit" disabled={isLoading || charCount > MAX_CHARS}>{isEditing ? "Update News" : "Save News"}</button>
    </form>
  );
}
