import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * Custom hook to sync URL search params with app state
 * This enables shareable URLs for any app state
 */
export function useUrlSync({
  selectedAncestor,
  setSelectedAncestor,
  viewMode,
  setViewMode,
  selectedThreadId,
  setSelectedThreadId,
  selectedBranchId,
  setSelectedBranchId,
  familyData
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL params on mount and update state
  useEffect(() => {
    const personId = searchParams.get('person');
    const view = searchParams.get('view');
    const thread = searchParams.get('thread');
    const branch = searchParams.get('branch');

    // Set person if specified in URL
    if (personId && familyData) {
      const person = familyData.find(p => p.id === personId);
      if (person && (!selectedAncestor || selectedAncestor.id !== personId)) {
        setSelectedAncestor(person);
      }
    }

    // Set view mode if specified
    if (view && view !== viewMode) {
      setViewMode(view);
    }

    // Set thread if specified
    if (thread && thread !== selectedThreadId) {
      setSelectedThreadId(thread);
      if (view !== 'threads') {
        setViewMode('threads');
      }
    }

    // Set branch if specified
    if (branch && branch !== selectedBranchId) {
      setSelectedBranchId(branch);
    }
  }, []); // Only run on mount

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedAncestor) {
      params.set('person', selectedAncestor.id);
    }

    if (viewMode && viewMode !== 'list') {
      params.set('view', viewMode);
    }

    if (selectedThreadId) {
      params.set('thread', selectedThreadId);
    }

    if (selectedBranchId && selectedBranchId !== '1') {
      params.set('branch', selectedBranchId);
    }

    // Update URL without triggering navigation
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();

    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedAncestor, viewMode, selectedThreadId, selectedBranchId]);

  // Helper function to generate shareable URL
  const getShareUrl = (options = {}) => {
    const params = new URLSearchParams();
    const baseUrl = window.location.origin + window.location.pathname;

    if (options.person) {
      params.set('person', options.person.id);
    }

    if (options.view) {
      params.set('view', options.view);
    }

    if (options.thread) {
      params.set('thread', options.thread);
    }

    if (options.branch) {
      params.set('branch', options.branch);
    }

    const hash = params.toString() ? `#/?${params.toString()}` : '#/';
    return `${baseUrl}${hash}`;
  };

  // Helper to copy share URL to clipboard
  const copyShareUrl = async (options = {}) => {
    const url = getShareUrl(options);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error('Failed to copy URL:', err);
      return false;
    }
  };

  return {
    getShareUrl,
    copyShareUrl
  };
}

/**
 * Generate a shareable URL for a specific person
 */
export function getPersonUrl(person) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/?person=${person.id}`;
}

/**
 * Generate a shareable URL for a narrative thread
 */
export function getThreadUrl(threadId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/?view=threads&thread=${threadId}`;
}

/**
 * Generate a shareable URL for a specific view mode
 */
export function getViewUrl(viewMode) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/?view=${viewMode}`;
}
