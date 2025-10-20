import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogDetail from '../pages/BlogDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock apiService used by BlogDetail
jest.mock('../services/api', () => ({
  apiService: {
    blog: {
      getBySlug: jest.fn(),
      like: jest.fn(),
      incrementView: jest.fn(),
    }
  }
}));

const { apiService } = require('../services/api');

// Silence jsdom network/CORS noise by mocking global.fetch and navigator APIs
let _originalFetch;
let _originalNavigator;
let _originalAlert;
let _origConsoleError;
let _origConsoleWarn;

beforeAll(() => {
  _originalFetch = global.fetch;
  const fetchMock = jest.fn(() => Promise.resolve({
    ok: true,
    json: async () => ({ success: true, data: [] }),
  }));
  global.fetch = fetchMock;
  // also set on window for compatibility; avoid globalThis in older environments
  if (typeof global.window !== 'undefined') global.window.fetch = fetchMock;
  try {
    // eslint-disable-next-line no-undef
    if (typeof globalThis !== 'undefined') globalThis.fetch = fetchMock;
  } catch (e) {
    // ignore
  }

  // Ensure navigator.share and clipboard exist to avoid errors during tests
  _originalNavigator = global.navigator ? { ...global.navigator } : undefined;
  if (typeof global.navigator !== 'undefined') {
    global.navigator.share = global.navigator.share || jest.fn();
    global.navigator.clipboard = global.navigator.clipboard || { writeText: jest.fn() };
  }

  _originalAlert = global.alert;
  global.alert = global.alert || jest.fn();

  // Silence noisy console messages (CORS/jsdom network noise)
  _origConsoleError = console.error;
  _origConsoleWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
});

afterAll(() => {
  if (_originalFetch === undefined) delete global.fetch; else global.fetch = _originalFetch;
  if (_originalNavigator) global.navigator = _originalNavigator;
  if (_originalAlert === undefined) delete global.alert; else global.alert = _originalAlert;
  console.error = _origConsoleError;
  console.warn = _origConsoleWarn;
});

const sampleBlog = {
  _id: 'blog123',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'An excerpt',
  content: 'Hello world',
  category: 'pet-care',
  likes: 2,
  createdAt: new Date().toISOString(),
};

describe('BlogDetail', () => {
  beforeEach(() => {
    apiService.blog.getBySlug.mockResolvedValue({ data: { success: true, data: sampleBlog } });
    apiService.blog.incrementView.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('disables like button while API request is in-flight and updates likes', async () => {
    // Make the like promise controllable
    let resolveLike;
    const likePromise = new Promise((res) => { resolveLike = res; });
    apiService.blog.like.mockReturnValue(likePromise);

    render(
      <MemoryRouter initialEntries={["/blog/test-post"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for blog to load
    await waitFor(() => expect(apiService.blog.getBySlug).toHaveBeenCalledWith('test-post'));

  // initial likes count rendered (wait for loading to finish)
  // wait for likes number to appear
  // find like button by role and accessible name
  const likeButton = await screen.findByRole('button', { name: /like post/i });
  expect(likeButton).toBeTruthy();

    // Click like — this should trigger the mocked likePromise
    fireEvent.click(likeButton);

    // Button should be disabled while the like request is pending
    expect(likeButton).toBeDisabled();
    expect(likeButton).toHaveAttribute('aria-busy', 'true');

    // Resolve the like promise with server response
    resolveLike({ data: { success: true, likes: 3, added: true } });

    // Wait for UI to update after promise resolves
    await waitFor(() => expect(likeButton).not.toBeDisabled());
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('rolls back optimistic UI when like API fails', async () => {
    // Like promise that rejects
    apiService.blog.like.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={["/blog/test-post"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for blog to load
    await waitFor(() => expect(apiService.blog.getBySlug).toHaveBeenCalledWith('test-post'));

  const likeButton = await screen.findByRole('button', { name: /like post/i });

  // Click like — optimistic update will increase displayed likes
  fireEvent.click(likeButton);
    expect(screen.getByText('3')).toBeInTheDocument();

  // After promise rejection, the UI should rollback to previous state
  await screen.findByText('2');
  });

  test('updates localStorage likedPosts after like and unlike', async () => {
    // Start with no likedPosts
    localStorage.removeItem('likedPosts');

    // Mock like to succeed (add)
    apiService.blog.like.mockResolvedValueOnce({ data: { success: true, likes: 3, added: true } });

    render(
      <MemoryRouter initialEntries={["/blog/test-post"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

  await waitFor(() => expect(apiService.blog.getBySlug).toHaveBeenCalledWith('test-post'));
  const likeButton = await screen.findByRole('button', { name: /like post/i });

  // Click like to add
  fireEvent.click(likeButton);

    // Wait for localStorage to be updated
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      expect(stored).toContain('blog123');
    });

    // Now mock unlike (removed)
    apiService.blog.like.mockResolvedValueOnce({ data: { success: true, likes: 2, removed: true } });

  // Click again to unlike
  fireEvent.click(likeButton);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      expect(stored).not.toContain('blog123');
    });
  });
});
