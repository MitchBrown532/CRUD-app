import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// IMPORTANT: mock the same module your hooks import (prevents real network calls)
vi.mock("../api", () => ({
  api: vi.fn(),
}));

import { api } from "../api";
import Items from "../pages/Items";

describe("Items page", () => {
  // Reset mock call history and behavior before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders a list of items from the API", async () => {
    // Mock a successful API response with two items
    api.mockResolvedValueOnce({
      items: [
        { id: 1, name: "Alpha", created_at: "2025-01-01T12:00:00Z" },
        { id: 2, name: "Beta", created_at: "2025-01-02T12:00:00Z" },
      ],
      page: 1,
      pages: 1,
      total: 2,
      limit: 10,
    });

    // Render the Items page within a minimal router context
    render(
      <MemoryRouter initialEntries={["/items"]}>
        <Routes>
          <Route path="/items" element={<Items />} />
        </Routes>
      </MemoryRouter>
    );

    // Shows loader text while fetching
    expect(screen.getByText(/searching…/i)).toBeInTheDocument();

    // Items appear
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders an error banner when the API fails", async () => {
    // Mock a rejected API call (network or server failure)
    api.mockRejectedValueOnce(new Error("Network down"));

    render(
      <MemoryRouter initialEntries={["/items"]}>
        <Routes>
          <Route path="/items" element={<Items />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert: the error message banner is displayed after the failure
    await waitFor(() =>
      expect(
        screen.getByText(/failed to load items|network down/i)
      ).toBeInTheDocument()
    );
  });
});
