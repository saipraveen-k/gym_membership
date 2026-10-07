import { useEffect } from 'react';

/** Set the document title for a page. */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Iron Peak Gym` : 'Iron Peak Gym';
  }, [title]);
}
