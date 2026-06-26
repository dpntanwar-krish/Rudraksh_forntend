import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { FiArrowLeft, FiEdit2, FiPlus, FiSearch, FiTrash2 } from "../../components/Portfolio/PortfolioIcons";
import ConfirmModal from "../../components/Portfolio/ConfirmModal";
import LoadingSpinner from "../../components/Portfolio/LoadingSpinner";
import PortfolioForm from "../../components/Portfolio/PortfolioForm";
import Toast from "../../components/Portfolio/Toast";
import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolioItems,
  reorderPortfolioItems,
  updatePortfolioItem,
} from "../../services/portfolioApi";
import "./Portfolio.css";

function reorderList(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function PortfolioCategory({ category, onBack }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const fetchItems = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const response = await getPortfolioItems({ category, search, page, limit: pagination.limit });
      setItems(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination || { page, limit: 10, total: 0, totalPages: 1 });
    } catch (error) {
      showToast(error?.response?.data?.msg || "Unable to load portfolio items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [category]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchItems(1);
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      if (editingItem?._id) {
        await updatePortfolioItem(editingItem._id, formData);
        showToast("Portfolio item updated");
      } else {
        await createPortfolioItem(formData);
        showToast("Portfolio item created");
      }
      setShowForm(false);
      setEditingItem(null);
      await fetchItems(1);
    } catch (error) {
      showToast(error?.response?.data?.msg || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePortfolioItem(deleteTarget._id);
      showToast("Portfolio item deleted");
      setDeleteTarget(null);
      await fetchItems(pagination.page);
    } catch (error) {
      showToast(error?.response?.data?.msg || "Delete failed");
    }
  };

  const handleToggleStatus = async (item) => {
    const formData = new FormData();
    Object.entries({
      title: item.title,
      category: item.category,
      description: item.description || "",
      videoUrl: item.videoUrl || "",
      clientName: item.clientName || "",
      projectDate: item.projectDate ? item.projectDate.slice(0, 10) : "",
      sequence: item.sequence || "",
      status: String(!item.status),
      existingGalleryImages: JSON.stringify(item.galleryImages || []),
    }).forEach(([key, value]) => formData.append(key, value));

    try {
      await updatePortfolioItem(item._id, formData);
      setItems((current) => current.map((row) => (row._id === item._id ? { ...row, status: !row.status } : row)));
      showToast("Status updated");
    } catch (error) {
      showToast(error?.response?.data?.msg || "Status update failed");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const updated = reorderList(items, result.source.index, result.destination.index);
    setItems(updated);
    try {
      await reorderPortfolioItems({ category, orderedIds: updated.map((item) => item._id) });
      showToast("Sequence updated");
    } catch (error) {
      showToast(error?.response?.data?.msg || "Sequence update failed");
      fetchItems(pagination.page);
    }
  };

  const pageNumbers = useMemo(() => {
    return Array.from({ length: pagination.totalPages || 1 }, (_, index) => index + 1);
  }, [pagination.totalPages]);

  return (
    <div className="portfolio-page">
      <Toast message={toast} />

      <div className="portfolio-list-header">
        <div>
          <button type="button" className="portfolio-back-btn" onClick={onBack}>
            <FiArrowLeft /> Back
          </button>
          <h2>{category}</h2>
          <p>{pagination.total} portfolio projects</p>
        </div>
        <button
          type="button"
          className="portfolio-btn portfolio-btn-primary"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <FiPlus /> Add Portfolio Item
        </button>
      </div>

      {showForm ? (
        <PortfolioForm
          category={category}
          editingItem={editingItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      ) : null}

      <form className="portfolio-toolbar" onSubmit={handleSearchSubmit}>
        <div className="portfolio-search">
          <FiSearch />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, client, description" />
        </div>
        <button type="submit" className="portfolio-btn portfolio-btn-ghost">
          Search
        </button>
      </form>

      {isLoading ? (
        <LoadingSpinner label="Loading portfolio items..." />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="portfolio-items">
            {(provided) => (
              <div className="portfolio-table" ref={provided.innerRef} {...provided.droppableProps}>
                {items.map((item, index) => (
                  <Draggable key={item._id} draggableId={item._id} index={index}>
                    {(dragProvided, snapshot) => (
                      <article
                        className={`portfolio-row ${snapshot.isDragging ? "is-dragging" : ""}`}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <span className="portfolio-sequence">#{item.sequence || index + 1}</span>
                        <img className="portfolio-thumb" src={item.thumbnail} alt={item.title} />
                        <div className="portfolio-row-main">
                          <h3>{item.title}</h3>
                          <p>{item.clientName || "No client"} · {item.projectDate ? item.projectDate.slice(0, 10) : "No date"}</p>
                        </div>
                        <button type="button" className={`portfolio-status ${item.status ? "active" : "inactive"}`} onClick={() => handleToggleStatus(item)}>
                          {item.status ? "Active" : "Inactive"}
                        </button>
                        <div className="portfolio-row-actions">
                          <button type="button" className="portfolio-icon-btn" onClick={() => handleEdit(item)} aria-label="Edit portfolio item">
                            <FiEdit2 />
                          </button>
                          <button type="button" className="portfolio-icon-btn danger" onClick={() => setDeleteTarget(item)} aria-label="Delete portfolio item">
                            <FiTrash2 />
                          </button>
                        </div>
                      </article>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {!items.length ? <div className="portfolio-empty">No portfolio items found.</div> : null}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="portfolio-pagination">
        {pageNumbers.map((page) => (
          <button key={page} type="button" className={pagination.page === page ? "active" : ""} onClick={() => fetchItems(page)}>
            {page}
          </button>
        ))}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Portfolio Item"
        message={`Delete "${deleteTarget?.title || "this item"}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
