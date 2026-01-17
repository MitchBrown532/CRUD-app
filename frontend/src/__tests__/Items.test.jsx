// src/__tests__/Items.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// --------- MOCK API ---------
vi.mock("../api", () => ({
  api: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

import { api, get, post, put, del } from "../api";
import Items from "../pages/Items";

describe("Items interactions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    cleanup(); 
  });

  it("adds, edits, and saves an item", async () => {
    // Initial load: empty list
    api.mockResolvedValueOnce({
      items: [],
      page: 1,
      pages: 1,
      total: 0,
      limit: 10,
    });
    // Add item
    post.mockResolvedValueOnce({ id: 1, name: "Alpha" });
    // Reload after add
    api.mockResolvedValueOnce({
      items: [{ id: 1, name: "Alpha" }],
      page: 1,
      pages: 1,
      total: 1,
      limit: 10,
    });
    // Edit item
    put.mockResolvedValueOnce({ id: 1, name: "Alpha Edited" });

    render(
      <MemoryRouter initialEntries={["/items"]}>
        <Routes>
          <Route path="/items" element={<Items />} />
        </Routes>
      </MemoryRouter>
    );

    const addInput = screen.getAllByPlaceholderText("New item name")[0];
    const addBtn = screen.getAllByText("Add Item")[0];

    fireEvent.change(addInput, { target: { value: "Alpha" } });
    fireEvent.click(addBtn);

    const list = screen.getByRole("list");
    const rowAlpha = await within(list).findByText(
      (content, el) => el.tagName.toLowerCase() === "span" && content.includes("Alpha")
    );
    expect(rowAlpha).toBeInTheDocument();

    // Start edit
    const editBtn = within(rowAlpha.parentElement).getByText("Edit");
    fireEvent.click(editBtn);

    // Use screen since the span is replaced and detached
    const editInput = screen.getByLabelText("Edit item name");
    fireEvent.change(editInput, { target: { value: "Alpha Edited" } });

    const saveBtn = screen.getByText("Save");
    fireEvent.click(saveBtn);

    const editedRow = await within(list).findByText(
      (content, el) => el.tagName.toLowerCase() === "span" && content.includes("Alpha Edited")
    );
    expect(editedRow).toBeInTheDocument();
  });

  it("cancels edit", async () => {
    api.mockResolvedValueOnce({
      items: [{ id: 2, name: "Beta" }],
      page: 1,
      pages: 1,
      total: 1,
      limit: 10,
    });

    render(
      <MemoryRouter initialEntries={["/items"]}>
        <Routes>
          <Route path="/items" element={<Items />} />
        </Routes>
      </MemoryRouter>
    );

    const list = screen.getByRole("list");
    const rowBeta = await within(list).findByText(
      (content, el) => el.tagName.toLowerCase() === "span" && content.includes("Beta")
    );

    const editBtn = within(rowBeta.parentElement).getByText("Edit");
    fireEvent.click(editBtn);

    // Use screen since only one item
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);

    // Re-find the span after cancel, as the original element is detached
    const rowBetaAfter = await within(list).findByText(
      (content, el) => el.tagName.toLowerCase() === "span" && content.includes("Beta")
    );
    expect(rowBetaAfter).toBeInTheDocument();
  });

  it("deletes an item", async () => {
    // Initial load: one item
    api.mockResolvedValueOnce({
      items: [{ id: 3, name: "Gamma" }],
      page: 1,
      pages: 1,
      total: 1,
      limit: 10,
    });
    // Delete item
    del.mockResolvedValueOnce({});
    // Reload after delete (since it's the only item on page 1)
    api.mockResolvedValueOnce({
      items: [],
      page: 1,
      pages: 1,
      total: 0,
      limit: 10,
    });

    render(
      <MemoryRouter initialEntries={["/items"]}>
        <Routes>
          <Route path="/items" element={<Items />} />
        </Routes>
      </MemoryRouter>
    );

    const list = screen.getByRole("list");
    const rowGamma = await within(list).findByText(
      (content, el) => el.tagName.toLowerCase() === "span" && content.includes("Gamma")
    );

    const deleteBtn = within(rowGamma.parentElement).getByText("Delete");
    fireEvent.click(deleteBtn);

    const confirmBtn = within(rowGamma.parentElement).getByText("Confirm?");
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(rowGamma).not.toBeInTheDocument());
  });
});